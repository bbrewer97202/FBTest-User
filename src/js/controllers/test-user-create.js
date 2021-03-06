/****************************************************************************************
 *
 ****************************************************************************************/
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
