/****************************************************************************************
 *
 ****************************************************************************************/
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
