/*! fbt - v0.0.6 - 2013-11-13 */var fbt = angular.module('fbt', ['ngRoute', 'ngAnimate', 'LocalStorageModule']);

fbt.config(['$routeProvider', function($routeProvider) {

    //local storage service prefix
    //angular.module('LocalStorageModule').value('prefix', 'fbt');

    //routing
    $routeProvider.
        when('/app/new', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppAddNewController'
        }).
        when('/app/edit', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppEditorController'
        }).  
        when('/testusercreate', {
            templateUrl: 'test-user-create.html',
            controller: 'testUserCreateController'
        }).                
        otherwise({
            templateUrl: 'facebook-app.html',
            controller: 'facebookAppController'
        });   

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
    var writeAppData = function(data) {

        var deferred = $q.defer();

        if ((localStorageService.remove('localStorageKey')) && (localStorageService.add(localStorageKey, JSON.stringify(data)))) {
            deferred.resolve(data);
        } else {
            deferred.reject("Could not write data to local storage.");
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
                    return writeAppData(allApps);
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


fbt.factory('facebookGraphFactory', ['$http', '$q', function($http, $q) {

    return {

        getAppAccessToken: function(id, secret) {

            var deferred = $q.defer();
            var url = 'https://graph.facebook.com/oauth/access_token?client_id=' + id + '&client_secret=' + secret + '&grant_type=client_credentials';

            $http.get(url).
                success(function(data, status, headers, config) {
                    if (data.indexOf("access_token=") !== -1) {
                        var token = data.split("=")[1];                        
                        deferred.resolve(token);
                    } else {
                        deferred.reject("Could not retreive app access token");
                    }
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                });

            return deferred.promise;
        },

        getTestUsers: function(appid, token) {

            if ((typeof(appid) === "string") && (typeof(token) === "string")) {

                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token;

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                    });

                return deferred.promise;
            }
        },

        getUserById: function(id, token) {

            if ((typeof(id) === "string") && (typeof(token) === "string")) {
                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + id + "/?access_token=" + token;

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
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
                deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
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
                    deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                });

            return deferred.promise;
        }
    }
}]);

fbt.service('notificationService', [function() {

    var messageID = 0;
    var messages = [];

    var logMessage = function(text, type) {
        messageID++;
        messages.push({
            type: type,
            text: text,
            id: messageID
        }); 

        //limit messages count
        if (messages.length > 10) {
            messages.pop();
        }
    }

    return {
        
        confirm: function(text) {
            logMessage(text, 'confirm');
        },

        error: function(text) {
            logMessage(text, 'error');
        },

        getMessages: function() {
            return messages;
        },

        id: function() {
            return messageID;
        },

        clear: function() {
            messages = [];
        }
    }
}]);

fbt.controller('appController', ['$scope', '$location', '$timeout', 'notificationService', 
    function($scope, $location, $timeout, notificationService) {

        $scope.messages = [];
        $scope.scopedService = notificationService;

        //watch for location changes and assign a scope variable if present
        $scope.$on('$locationChangeSuccess', function(event, newLocation, currentLocation) {         
        
            $scope.fbAppID = $location.search()['appid'];                                    
            $scope.messages = notificationService.getMessages();

            //short delay here allows multiple notifications to appear before clearing
            $timeout(function() {
                notificationService.clear();   
            }, 500);
        });

        //watch for updates to the message in notification service
        $scope.$watch('scopedService.id()', function(newValue, oldValue) {
            $scope.messages = notificationService.getMessages();
        });

}]);

fbt.controller('facebookAppAddNewController', [
    '$scope', '$location', 'facebookAppsFactory', 'facebookGraphFactory', 'notificationService', 
    function($scope, $location, facebookAppsFactory, facebookGraphFactory, notificationService) {

    $scope.isEditMode = false;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/").search({ appid: "" });
    }

    $scope.submit = function(updates) {        
        $scope.appDetails = angular.copy(updates);        
        facebookAppsFactory.saveApp($scope.appDetails).
            then(function(result) {
                notificationService.confirm('Successfully create new app \"' + result.appName + '"');
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                notificationService.error("Error saving app: " + error);
            });
    }    

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                $scope.appUpdates.appToken = result;
            }, function(error) {
                notificationService.error("Error accessing app access token: " + error);
            });
    }

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);

fbt.controller('facebookAppController', ['$scope', '$location', 'facebookAppsFactory', 'notificationService', 
    function($scope, $location, facebookAppsFactory, notificationService) {

    $scope.currentApp = {};

    //$scope.fbAppID is present due to parent scope
    facebookAppsFactory.getAppByFacebookID($scope.fbAppID).
        then(function(result) {
            $scope.currentApp = result.app
        });

    $scope.editFBApp = function() {
        $location.path("/app/edit").search({ appid: $scope.currentApp.appID });
    }

    $scope.deleteFBApp = function() {
        var confirmMsg = confirm("Do you really want to delete this?");
        if (confirmMsg) {
            facebookAppsFactory.deleteAppByID($scope.currentApp.appID).
                then(function(result) {
                    notificationService.confirm("Successfully removed app");
                    $location.path("/").search({ appid: "" });
                }, function(error) {
                    notificationService.error("Could not remove app: " + error);
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
    ['$scope', '$location', 'facebookGraphFactory', 'facebookAppsFactory', 'notificationService', 
    function($scope, $location, facebookGraphFactory, facebookAppsFactory, notificationService) {
    
    $scope.isEditMode = true;
    $scope.appDetails = {};

    //$scope.fbAppID is present due to parent scope
    facebookAppsFactory.getAppByFacebookID($scope.fbAppID).
        then(function(result) {
            $scope.appDetails = result.app;
            $scope.reset();
        }, function(result) {
            notificationService.error('Could not access app with id "' + $scope.fbAppID + '": ' + error);
        });

    $scope.cancel = function() {
        $location.path("/").search({ appid: $scope.fbAppID });
    }

    $scope.submit = function(updates) {        

        $scope.appDetails = angular.copy(updates); 

        facebookAppsFactory.updateApp($scope.fbAppID, $scope.appDetails).
            then(function(result) {
                notificationService.confirm(result.appName + ' successfully updated');
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                notificationService.error("Error when updating app: " + error);
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
                notificationService.error("Error accessing app access token: " + error);
            });
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);

fbt.controller('testUserCreateController', [
    '$scope', '$location', '$routeParams', 'facebookAppsFactory', 'facebookGraphFactory', 'notificationService', 
    function($scope, $location, $routeParams, facebookAppsFactory, facebookGraphFactory, notificationService) {

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
                }, function(error) {
                    notificationService.error("Error retrieving Facebook app: " + error);
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
                notificationService.confirm("Successfully created test user");
                $location.path("/");
            }, function(error) {
                notificationService.error("Error creating test user: " + error);
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

        controller: ['$scope', '$location', 'facebookAppsFactory', 'notificationService', function($scope, $location, facebookAppsFactory, notificationService) {

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
                $location.path("/app/new").search({ app: "" });
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

            $scope.refreshHomeState = function() {
                $location.path("/").search({ appid: "" });
            }

            $scope.getAppList(); 

        }]
    }
});

fbt.directive('message', function() {

    return {
        restrict: 'A',
        templateUrl: 'message.html',
        replace: true,
        link: function(scope, element, attrs) {
            // attrs.$observe('message', function(val) {
            //     console.log("observe message: " + val);
            // });
        },
        controller: function($scope) {

        }
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
        controller: ['$scope', 'facebookGraphFactory', 'notificationService', function($scope, facebookGraphFactory, notificationService) {

            $scope.testUsers = [];            

            $scope.getTestUserList = function() {

                if ($scope.currentApp) {
                    if ((typeof($scope.currentApp.appID) === "string") && (typeof($scope.currentApp.appToken) === "string")) {
                        facebookGraphFactory.getTestUsers($scope.currentApp.appID, $scope.currentApp.appToken).
                            then(function(result) {                        
                                $scope.testUsers = result.data;
                                $scope.getTestUserDetails();
                            }, function(error) {
                                notificationService.error('Could not retrieve test user list for ' + $scope.currentApp.appName + ': ' + error);
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
                                notificationService.error("Could not get test user details: " + error);
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
                            notificationService.confirm('Successfully deleted test user "' + userId + '"');
                        }, function(error) {
                            notificationService.error("Could not delete test user: " + error);
                        });
                }
            }
        }]
    }
});
