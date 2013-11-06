/****************************************************************************************
 *
 ****************************************************************************************/
fbt.controller('facebookAppController', ['$scope', '$location', 'fbtAppService', 'facebookAppsFactory', function($scope, $location, fbtAppService, facebookAppsFactory) {

    // $scope.currentApp = "";
    $scope.selectedIndex;

    $scope.editFBApp = function() {
        $location.path("/facebookapp/" + $scope.selectedIndex);
    }

    $scope.deleteFBApp = function() {
        var confirmMsg = confirm("Do you really want to delete this?");
        if (confirmMsg) {
            facebookAppsFactory.deleteAppByIndex($scope.selectedIndex).
                then(function(result) {
                    fbtAppService.resetCurrentApp();
                    $location.path("/");
                }, function(error) {
                    //todo handle this
                    //todo remove two different location references
                    alert("delete app by index error");
                    $location.path("/");
                });
        }
    }

    $scope.visitFBApp = function() {
        var url = "https://developers.facebook.com/apps/" + $scope.currentApp.appID + "/summary";
        fbtUtilities.openBlankWindowToURL(url);
    }


    $scope.createTestUser = function() {
        $location.path("/testusercreate/").search({ appID: $scope.currentApp.appID });
    }

    //watch for changes to the fbtAppService to know if a new app has been selected
    $scope.$watch(
        function() {
            return fbtAppService.getCurrentApp().app.appID;
        }, 
        function(newValue, oldValue) {
            var selectedApp = fbtAppService.getCurrentApp();
            $scope.currentApp = selectedApp.app;
            $scope.selectedIndex = selectedApp.index;
        }, true);

}]);
