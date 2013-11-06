/****************************************************************************************
 * //todo: remove location/routing
 ****************************************************************************************/
fbt.directive('facebookAppList', function() {
    return {
        restrict: 'A',
        templateUrl: 'views/facebook-app-list.html',
        replace: true,
        scope: {
            fbApps: '&'
        },
        controller: ['$scope', '$location', 'fbtAppService', 'facebookAppsFactory', 
            function($scope, $location, fbtAppService, facebookAppsFactory) {

            $scope.fbApps = [];
            $scope.selectedIndex;

            $scope.getAppList = function() {                
                facebookAppsFactory.getAllApps().
                    then(function(result) {                        
                        $scope.fbApps = result;
                    }, function(error) {
                        //todo: handle this 
                        console.log("getAllApps: ERROR: " + error);
                    });
            }

            $scope.addNewFBApp = function() {
                $location.path("/facebookapp");
            }

            $scope.selectApp = function(index) {

                $scope.selectedIndex = index;
                
                //save to service the data of the current app and the index of the selected item             
                fbtAppService.setCurrentApp($scope.fbApps[index], index);
                

                $location.path("/");
            }

            //watch for changes to the fbtAppService to know if a new app has been selected
            $scope.$watch(
                function() {
                    return fbtAppService.getCurrentApp().index;
                }, 
                function(newValue, oldValue) {
                    $scope.selectedIndex = fbtAppService.getCurrentApp().index;                   
                    $scope.getAppList();
                }, true);            

        }],
        link: function(scope, element, attrs, ctrl) {
            scope.getAppList();
        }
    }
});
