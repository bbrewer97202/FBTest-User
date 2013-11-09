/****************************************************************************************
 * primary app controller
 ****************************************************************************************/
fbt.controller('appController', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {

    //watch for location changes and assign a scope variable if present
    $rootScope.$on('$locationChangeSuccess', function(event, newLocation, currentLocation) {         

        $scope.fbAppID = $location.search()['appid'];
    });

}]);
