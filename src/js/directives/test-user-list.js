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
        controller: ['$scope', 'facebookGraphFactory', function($scope, facebookGraphFactory) {

            $scope.testUsers = [];            

            $scope.getTestUserList = function() {

                if ((typeof($scope.currentApp.appID) === "string") && (typeof($scope.currentApp.appToken) === "string")) {
                    facebookGraphFactory.getTestUsers($scope.currentApp.appID, $scope.currentApp.appToken).
                        then(function(result) {                        
                            $scope.testUsers = result.data;
                            $scope.getTestUserDetails();
                        }, function(error) {
                            //todo: handle this 
                            console.log("getTestUsers: ERROR: " + error);
                        });
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

            $scope.deleteTestUser = function(userid, appToken) {
                alert("Delete: " + appToken);
                //todo, make this real
                //https://graph.facebook.com/TEST_USER_ID?method=delete&access_token=TEST_USER_ACCESS_TOKEN (OR) APP_ACCESS_TOKEN

                /*
                    Response
                    true on success, false otherwise

                    Error Codes
                    API_EC_TEST_ACCOUNTS_CANT_DELETE (2903) : Test user is associated with multiple apps.
                    API_EC_TEST_ACCOUNTS_CANT_REMOVE_APP (2902) : Test user must be associated with at least one app.
                    API_EC_TEST_ACCOUNTS_INVALID_ID (2901): Test user is not associated with this app.
                */                
            }



        }]
    }
});
