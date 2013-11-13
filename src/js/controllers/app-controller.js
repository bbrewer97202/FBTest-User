/****************************************************************************************
 * primary app controller
 ****************************************************************************************/
fbt.controller('appController', ['$scope', '$location', '$timeout', 'notificationService', 
    function($scope, $location, $timeout, notificationService) {

        $scope.messages = [];
        $scope.scopedService = notificationService;

        //watch for location changes and assign a scope variable if present
        $scope.$on('$locationChangeSuccess', function(event, newLocation, currentLocation) {         
        
            $scope.fbAppID = $location.search()['appid'];                                    
            $scope.messages = notificationService.getMessages();

            //short delay here allows multiple notifications to appear before clearing
            $timeout(function() {
                notificationService.clear();   
            }, 500);
        });

        //watch for updates to the message in notification service
        $scope.$watch('scopedService.id()', function(newValue, oldValue) {
            $scope.messages = notificationService.getMessages();
        });

}]);
