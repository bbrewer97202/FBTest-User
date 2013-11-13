/****************************************************************************************
 * 
 ****************************************************************************************/
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
