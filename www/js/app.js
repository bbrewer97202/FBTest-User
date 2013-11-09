/*! fbt - v0.0.6 - 2013-11-08 */var fbt = angular.module('fbt', ['ngRoute', 'LocalStorageModule']);

fbt.config(['$routeProvider', function($routeProvider) {

    //local storage service prefix
    //angular.module('LocalStorageModule').value('prefix', 'fbt');

    //comment

    //routing
    $routeProvider.
        when('/facebookapp/:id', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppEditorController'
        }).
        when('/facebookapp', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppAddNewController'
        }).  
        when('/testusercreate', {
            templateUrl: 'test-user-create.html',
            controller: 'testUserCreateController'
        }).                
        otherwise({
            templateUrl: 'facebook-app.html',
            controller: 'facebookAppController'
        });   

    // //events
    // $rootScope.$on('deleteFacebookApp', function(e) {
    //     alert("deleted app event");
    // });

}]);

/****************************************************************************************
 * helper methods
 ****************************************************************************************/
var fbtUtilities = (function() {

    return {
        openBlankWindowToURL: function openBlankWindowToURL(url) {
            var fbWindow = window.open(url, "_blank", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");                
        }
    };
})();


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

        deleteAppByID: function(id) {

            var deferred = $q.defer();
            var service = this;

            this.getAppByFacebookID(id).
                then(
                    function(result) {
                        
                        var index = result.index;

                        service.getAllApps().then(
                            function(result) {
                                if ((result.length > 0) && (typeof(result[index]) === "object")) {
                                    result.splice(index, 1);
                                    if (writeData(result)) {
                                        deferred.resolve(index);
                                    } else {
                                        //todo
                                        deferred.reject("");
                                    }                                    
                                } else {
                                    //todo
                                    deferred.reject("");
                                }
                            },
                            function(result) {
                                //todo: error getting all apps
                            }
                        );     

                    },
                    function(result) {
                        //todo
                        deferred.reject("could not delete app by id: " + result);
                    }
                );
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


fbt.factory('facebookGraphFactory', ['$http', '$q', function($http, $q) {

    //https://graph.facebook.com/oauth/access_token?client_id=115039128524812&client_secret=ec1b767dda4c07a238f26d118ef11cd6&grant_type=client_credentials

    //public methods
    return {

        getAppAccessToken: function(id, secret) {

            var deferred = $q.defer();
            var url = 'https://graph.facebook.com/oauth/access_token?client_id=' + id + '&client_secret=' + secret + '&grant_type=client_credentials';

            // console.log(url);

            //todo : mucho error handling

            $http.get(url).
                success(function(data, status, headers, config) {
                    if (data.indexOf("access_token=") !== -1) {
                        var token = data.split("=")[1];                        
                        deferred.resolve(token);
                    } else {
                        deferred.reject("");
                    }
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data);
                });

            return deferred.promise;
        },

        getTestUsers: function(appid, token) {

            if ((typeof(appid) === "string") && (typeof(token) === "string")) {

                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token;
                // console.log(url);

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        //todo: determine what to send back to reject
                        deferred.reject(data);
                    });

                return deferred.promise;
            }
        },

        getUserById: function(id, token) {

            if ((typeof(id) === "string") && (typeof(token) === "string")) {
                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + id + "/?access_token=" + token;
                // console.log(url);

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        //todo: determine what to send back to reject
                        deferred.reject(data);
                    });

                return deferred.promise;

            }
        }, 

        getLocaleList: function() {
            //from https://www.facebook.com/translations/FacebookLocales.xml
            var deferred = $q.defer();            
            var locales = ["af_ZA","ar_AR","az_AZ","be_BY","bg_BG","bn_IN","bs_BA","ca_ES","cs_CZ","cy_GB","da_DK","de_DE","el_GR","en_GB","en_PI","en_UD","en_US","eo_EO","es_ES","es_LA","et_EE","eu_ES","fa_IR","fb_LT","fi_FI","fo_FO","fr_CA","fr_FR","fy_NL","ga_IE","gl_ES","he_IL","hi_IN","hr_HR","hu_HU","hy_AM","id_ID","is_IS","it_IT","ja_JP","ka_GE","km_KH","ko_KR","ku_TR","la_VA","lt_LT","lv_LV","mk_MK","ml_IN","ms_MY","nb_NO","ne_NP","nl_NL","nn_NO","pa_IN","pl_PL","ps_AF","pt_BR","pt_PT","ro_RO","ru_RU","sk_SK","sl_SI","sq_AL","sr_RS","sv_SE","sw_KE","ta_IN","te_IN","th_TH","tl_PH","tr_TR","uk_UA","vi_VN","zh_CN","zh_HK","zh_TW"];
            deferred.resolve(locales);
            return deferred.promise;
        },

        testUserCreate: function(id, user) {

            //todo check for valid params

            var deferred = $q.defer();
            var url = "https://graph.facebook.com/" + id + "/accounts/test-users";
            var params = "?";

            for (var param in user) {
                params += param + "=" + user[param] + "&";
            }
            url = url + params;

            $http({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'                    
                }
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                //todo
                deferred.reject(data);
            });

            return deferred.promise;

        },

        deleteTestUser: function(userID, appToken) {

            var deferred = $q.defer();
            var url = "https://graph.facebook.com/" + userID + "?method=delete&access_token=" + appToken;

            $http.get(url).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    //todo
                    deferred.reject(data);
                });

            return deferred.promise;
        }
    }
}]);

fbt.controller('appController', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {

    //watch for location changes and assign a scope variable if present
    $rootScope.$on('$locationChangeSuccess', function(event, newLocation, currentLocation) {         

        $scope.fbAppID = $location.search()['appid'];
    });

}]);

fbt.controller('facebookAppAddNewController', [
    '$scope', '$location', 'facebookAppsFactory', 'facebookGraphFactory', 
    function($scope, $location, facebookAppsFactory, facebookGraphFactory) {

    $scope.isEditMode = false;
    $scope.isValidID = true;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/").search({ appid: "" });
    }

    $scope.submit = function(updates) {        
        $scope.appDetails = angular.copy(updates);        
        facebookAppsFactory.saveApp($scope.appDetails).
            then(function(result) {                
                $location.path("/").search({ appid: result.app.appID });
            }, function(error) {
                //todo: how to handle
                alert("save App error: ", error);
            });
    }    

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                console.log("got result: '" + result + "'");
                $scope.appUpdates.appToken = result;
            }, function(error) {
                //todo: something better than this
                alert("Error accessing app access token: " + error);
            });
    }

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);

fbt.controller('facebookAppController', ['$scope', '$location', 'facebookAppsFactory', function($scope, $location, facebookAppsFactory) {

    $scope.currentApp = {};

    //$scope.fbAppID is present due to parent scope
    facebookAppsFactory.getAppByFacebookID($scope.fbAppID).
        then(function(result) {
            $scope.currentApp = result.app
        }, function(result) {
            //invalid id or no id
        });

    $scope.editFBApp = function() {
        $location.path("/facebookapp/" + $scope.selectedIndex);
    }

    $scope.deleteFBApp = function() {
        var confirmMsg = confirm("Do you really want to delete this?");
        if (confirmMsg) {
            facebookAppsFactory.deleteAppByID($scope.currentApp.appID).
                then(function(result) {
                    $location.path("/").search({ appid: "" });
                }, function(error) {
                    //todo handle this
                    //todo remove two different location references
                    alert("delete app by index error");
                    $location.path("/").search({ appid: "" });
                });
        }
    }

    $scope.visitFBApp = function() {
        var url = "https://developers.facebook.com/apps/" + $scope.currentApp.appID + "/summary";
        fbtUtilities.openBlankWindowToURL(url);
    }


    $scope.createTestUser = function() {
        $location.path("/testusercreate/").search({ appid: $scope.currentApp.appID });
    }
}]);

fbt.controller('facebookAppEditorController', 
    ['$scope', '$location', 'facebookGraphFactory', 'facebookAppsFactory', 
    function($scope, $location, facebookGraphFactory, facebookAppsFactory) {
    
    //get the index parameter
    //todo: must be a better way to do this ($routeprovider not to be trusted?)
    var path = $location.path();
    var id = path.split("/")[2];


    //do we have a valid id?
    $scope.isValidID = ((parseInt(id) >= 0) && (parseInt(id) < 10000)) ? true : false;

    $scope.isEditMode = true;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/");
    }

    $scope.submit = function(updates) {        

        $scope.appDetails = angular.copy(updates); 

        facebookAppsFactory.updateAppByIndex(id, $scope.appDetails).
            then(function(result) {
                $location.path("/").search({ appid: result.app.appID });
            }, function(error) {
                //todo handle this like the others
                console.log("error: ", error);
            });
    }    

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);        
    }

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                $scope.appUpdates.appToken = result;
            }, function(error) {
                //todo: something better than this
                alert("Error accessing app access token: " + error);
            });
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

    if ($scope.isValidID) {

        facebookAppsFactory.getAppByIndex(id).
            then(function(result) {
                $scope.appDetails = result;
            }, function(error) {
                //todo
                console.log("get error");
            }).
            finally(function() {
                $scope.reset();
            });            
    }

}]);

fbt.controller('testUserCreateController', [
    '$scope', '$location', '$routeParams', 'facebookAppsFactory', 'facebookGraphFactory', 
    function($scope, $location, $routeParams, facebookAppsFactory, facebookGraphFactory) {

        $scope.appDetails = {};
        $scope.testUser = {
            locale: 'en_US',
            installed: 'true',
            permissions: ''
        }

        //facebook appid is required to get stored app details
        if (typeof($routeParams.appID) === "string") {
            facebookAppsFactory.getAppByFacebookID($routeParams.appID).
                then(function(result) {
                    $scope.appDetails = result.app;
                }, function(result) {
                    //todo: handle
                    console.log("error: ", result);
                });
        }


        facebookGraphFactory.getLocaleList().then(function(result) {
            $scope.localesList = result;
        });

    $scope.cancel = function() {
        $location.path("/");
    }

    $scope.submit = function(updates) {        

        //app access token required for submit
        $scope.testUser.access_token = $scope.appDetails.appToken;
 
        facebookGraphFactory.testUserCreate($scope.appDetails.appID, $scope.testUser).
            then(function(result) {                
                //todo: how to message success
                $location.path("/");
            }, function(error) {
                //todo: how to handle
                console.log("test user create error: ", error);
                //$location.path("/");
            });
    }    
}]);

fbt.directive('facebookAppList', function() {
    return {
        restrict: 'A',
        templateUrl: 'facebook-app-list.html',

        link: function (scope, element, attrs) {

            //the current appid is passed into directive as attribute
            scope.$watch(function() {
                return {
                    appid: attrs.appid
                }
            }, function (newValue, oldValue, scope) {

                if ((typeof(newValue.appid) === "string") && (newValue.appid.length > 0)) {
                    scope.appID = newValue.appid;                  
                } else {
                    delete scope.selectedIndex;
                    delete scope.appID;                    
                }

                scope.getAppList();

            }, true);
        },

        controller: ['$scope', '$location', 'facebookAppsFactory', function($scope, $location, facebookAppsFactory) {

            $scope.fbApps = [];
            $scope.selectedIndex;            

            $scope.getAppList = function() {                
                facebookAppsFactory.getAllApps().
                    then(function(result) {                        
                        $scope.fbApps = result;
                        $scope.selectedIndexUpdate();
                    }, function(error) {
                        //todo: handle this 
                        console.log("getAllApps: ERROR: " + error);
                    });
            }

            $scope.addNewFBApp = function() {
                $location.path("/facebookapp").search({ app: "" });
            }

            $scope.selectedIndexUpdate = function() {

                var appsLength = $scope.fbApps.length;

                for (var i=0; i < appsLength; i++) {
                    if ($scope.appID === $scope.fbApps[i].appID) {
                        $scope.selectedIndex = i;
                        break;
                    }
                }  
            }

            $scope.selectApp = function(index) {

                $scope.selectedIndex = index;

                $location.path("/").search({ 
                    appid: $scope.fbApps[index].appID 
                });
            }

            $scope.getAppList(); 

        }]
    }
});

fbt.directive('testUserList', function() {
    return {
        restrict: 'A',
        templateUrl: 'test-user-list.html',

        link: function (scope, element, attrs) {

            //required interpolated attributes: app ID and app token
            scope.$watch(function() {
                return {
                    appId: attrs.appId,
                    appToken: attrs.appToken
                }
            }, function (newValue, oldValue, scope) {
                scope.appID = newValue.appId;
                scope.appToken = newValue.appToken;
                scope.getTestUserList();
            }, true);
        },
        controller: ['$scope', 'facebookGraphFactory', function($scope, facebookGraphFactory) {

            $scope.testUsers = [];            

            $scope.getTestUserList = function() {

                if ($scope.currentApp) {
                    if ((typeof($scope.currentApp.appID) === "string") && (typeof($scope.currentApp.appToken) === "string")) {
                        facebookGraphFactory.getTestUsers($scope.currentApp.appID, $scope.currentApp.appToken).
                            then(function(result) {                        
                                $scope.testUsers = result.data;
                                $scope.getTestUserDetails();
                            }, function(error) {
                                //todo: handle this 
                                // console.log("getTestUsers: ERROR: " + error);
                            });
                    }
                }
            }

            $scope.getTestUserDetails = function() {

                var testUsersLength = $scope.testUsers.length;

                for (var i=0; i < testUsersLength; i++) {
                    (function() {
                        var index = i;
                        facebookGraphFactory.getUserById($scope.testUsers[i].id, $scope.currentApp.appToken).
                            then(function(result) {                        
                                $scope.testUsers[index].user = result;
                            }, function(error) {
                                //todo: handle this 
                                console.log("getTestUserDetails: ERROR: " + error);
                            });                    
                    })(i);  
                }
            }

            $scope.loginAsUser = function(url) {
                fbtUtilities.openBlankWindowToURL(url);
            }

            $scope.openProfilePage = function(url) {
                fbtUtilities.openBlankWindowToURL(url);
            }

            $scope.deleteTestUser = function(userId, appToken) {

                var confirmMsg = confirm("Are you sure you want to delete this user?");
                if (confirmMsg) {
                    facebookGraphFactory.deleteTestUser(userId, appToken).
                        then(function(result) {
                            $scope.getTestUserList();
                        }, function(error) {
                            //todo: handle this
                            alert("delete user error" + error);
                        });
                }
            }
        }]
    }
});
