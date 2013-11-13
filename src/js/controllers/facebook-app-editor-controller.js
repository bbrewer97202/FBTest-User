/****************************************************************************************
 * controller for facebook add edit app view
 ****************************************************************************************/
fbt.controller('facebookAppEditorController', 
    ['$scope', '$location', 'facebookGraphFactory', 'facebookAppsFactory', 'notificationService', 
    function($scope, $location, facebookGraphFactory, facebookAppsFactory, notificationService) {
    
    $scope.isEditMode = true;
    $scope.appDetails = {};

    //$scope.fbAppID is present due to parent scope
    facebookAppsFactory.getAppByFacebookID($scope.fbAppID).
        then(function(result) {
            $scope.appDetails = result.app;
            $scope.reset();
        }, function(result) {
            notificationService.error('Could not access app with id "' + $scope.fbAppID + '": ' + error);
        });

    $scope.cancel = function() {
        $location.path("/").search({ appid: $scope.fbAppID });
    }

    $scope.submit = function(updates) {        

        $scope.appDetails = angular.copy(updates); 

        facebookAppsFactory.updateApp($scope.fbAppID, $scope.appDetails).
            then(function(result) {
                notificationService.confirm(result.appName + ' successfully updated');
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                notificationService.error("Error when updating app: " + error);
            });
    }    

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);        
    }

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                $scope.appUpdates.appToken = result;
            }, function(error) {
                notificationService.error("Error accessing app access token: " + error);
            });
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);
