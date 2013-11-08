/****************************************************************************************
 * //todo: remove location/routing
 ****************************************************************************************/
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

                var appsLength = scope.fbApps.length;
                scope.appID = newValue.appid;

                //use passed appid value to highlight current item
                for (var i=0; i < appsLength; i++) {
                    if (newValue.appid === scope.fbApps[i].appID) {
                        scope.selectedIndex = i;
                        break;
                    }
                }
            }, true);
        },

        controller: ['$scope', '$location', 'facebookAppsFactory', function($scope, $location, facebookAppsFactory) {

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

                $location.path("/").search({ 
                    appid: $scope.fbApps[index].appID 
                });
            }

            $scope.getAppList(); 

        }]
    }
});
