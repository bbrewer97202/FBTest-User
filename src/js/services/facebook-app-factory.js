

/****************************************************************************************
 *
 ****************************************************************************************/
fbt.factory('facebookAppsFactory', ['$q', '$rootScope', 'localStorageService', function($q, $rootScope, localStorageService) {

    var localStorageKey = "localStorageKey";

    //shared utility method for wrting passed data to destination
    //@returns boolean success
    var writeData = function(data) {

        var success = false;

        if (localStorageService.remove('localStorageKey')) {
            if (localStorageService.add(localStorageKey, JSON.stringify(data))) {
                success = true;
            }
        } 

        return success;
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
                                console.log("winner: " + i + "== ", result[i]);
                                deferred.resolve(result[i]);
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

        getAppByIndex: function(index) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(result) {
                    if ((result.length > 0) && (typeof(result[index]) === "object")) {
                        deferred.resolve(result[index]);
                    } else {
                        deferred.reject("");
                    }
                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        deleteAppByIndex: function(index) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(result) {
                    if ((result.length > 0) && (typeof(result[index]) === "object")) {
                        result.splice(index, 1);
                        if (writeData(result)) {
                            deferred.resolve(index);
                        } else {
                            deferred.reject("");
                        }
                    } else {
                        deferred.reject("");
                    }
                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        saveApp: function(appDetails) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(result) {
                    result.push(appDetails);

                    if (writeData(result)) {
                        deferred.resolve({
                            app: appDetails,
                            index: (result.length-1)
                        });
                    } else {
                        deferred.reject("");
                    }
                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        },

        updateAppByIndex: function(index, appDetails) {

            var deferred = $q.defer();
            this.getAllApps().
                then(function(result) {
                    result[index] = appDetails;

                    if (writeData(result)) {
                        deferred.resolve({
                            app: appDetails,
                            index: index
                        });
                    } else {
                        deferred.reject("");
                    }
                }, function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    }
}]);

