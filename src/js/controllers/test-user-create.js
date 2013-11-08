/****************************************************************************************
 *
 ****************************************************************************************/
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
                    $scope.appDetails = result
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
