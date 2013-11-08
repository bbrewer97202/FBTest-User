/****************************************************************************************
 * primary app controller
 ****************************************************************************************/
fbt.controller('appController', ['$scope', '$location', function($scope, $location) {

    //watch for location changes and assign a scope variable if present
    $scope.$on('$routeChangeSuccess', function(next, current) { 
        $scope.fbAppID = $location.search()['appid'];
    });

}]);
