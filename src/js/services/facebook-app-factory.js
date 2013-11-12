

/****************************************************************************************
 *
 ****************************************************************************************/
fbt.factory('facebookAppsFactory', ['$q', '$rootScope', 'localStorageService', function($q, $rootScope, localStorageService) {

    var localStorageKey = "localStorageKey";

    //shared utility method for wrting passed data to destination
    var writeAppData = function(data) {

        var deferred = $q.defer();

        if ((localStorageService.remove('localStorageKey')) && (localStorageService.add(localStorageKey, JSON.stringify(data)))) {
            deferred.resolve(data);
        } else {
            deferred.reject("Could not write data");
        }

        return deferred.promise;

    };

    //public methods
    return {

        //TODO: need to use angular.toJson and angular.fromJson ?

        getAllApps: function() {

            var deferred = $q.defer();

            try {
                var apps = localStorageService.get('localStorageKey') || [];
                deferred.resolve(apps);
            } catch (e) {
                deferred.reject(e);
            }

            return deferred.promise;
        },

        getAppByFacebookID: function(id) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(result) {
                    var resultsLength = result.length;
                    if (resultsLength > 0) {
                        
                        var isFound = false;

                        for (var i=0; i < resultsLength; i++) {
                            if (result[i].appID === id) {
                                deferred.resolve({
                                    app: result[i],
                                    index: i
                                });
                                break;
                            }
                        }
                        deferred.reject("No app ID matched");
                    } else {
                        deferred.reject("No saved Facebook apps found");
                    }
                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        /**
         * add the passed app object as a new Facebook app 
         * @param appDetails is an app object with FB app details
         *
         */
        saveApp: function(appDetails) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(allApps) {
                    allApps.push(appDetails);
                    return writeAppData(allApps);
                }).
                then(function(appList) {
                    deferred.resolve(appDetails);
                }, function(error) {
                    deferred.reject("Could not save new app: " + error);
                });

            return deferred.promise;
        },

        /**
         * delete an app based on the passed Facebook ID
         * @param id is the FB app ID of the app to delete
         *
         */
        deleteAppByID: function(id) {

            var index;
            var deferred = $q.defer();
            var service = this;

            this.getAppByFacebookID(id).
                then(function(result) {
                    index = result.index;
                    return service.getAllApps();
                }).
                then(function(allApps) {
                    if ((allApps.length > 0) && (typeof(allApps[index]) === "object")) {
                        allApps.splice(index, 1);
                        return writeAppData(allApps);
                    } else {
                        deferred.reject("Could not delete app by id: invalid index");
                    }
                }).
                then(function(success) {
                    deferred.resolve(success);
                }, function(error) {
                    deferred.reject("Could not delete app by id: " + error);
                });

            return deferred.promise;
        },

        /**
         * update an existing app with new details/
         * @param existingAppID is the key of the app to update
         * @param appDetails is an app object with FB app details
         *
         */
        updateApp: function(existingAppID, appDetails) {

            var index;
            var service = this;
            var deferred = $q.defer();

            this.getAppByFacebookID(existingAppID).
                then(function(results) {
                    index = results.index;
                    return service.getAllApps();
                }).
                then(function(allApps) {
                    allApps[index] = appDetails;
                    return allApps;
                }).
                then(function(updatedApps) {
                    return writeAppData(updatedApps);
                }).
                then(function(success) {
                    deferred.resolve(appDetails);
                }, function(error) {
                    deferred.reject("Could not update saved app: " + error);
                });

            return deferred.promise;
        }
    }
}]);

