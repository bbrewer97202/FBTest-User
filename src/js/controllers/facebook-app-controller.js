/****************************************************************************************
 *
 ****************************************************************************************/
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
        $location.path("/app/edit").search({ appid: $scope.currentApp.appID });
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
