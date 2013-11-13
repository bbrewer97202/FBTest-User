/****************************************************************************************
 * display a list of facebook apps as received from facebookAppsFactory service
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
