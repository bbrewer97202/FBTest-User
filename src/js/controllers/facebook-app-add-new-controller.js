/****************************************************************************************
 * controller for facebook add new app view
 ****************************************************************************************/
fbt.controller('facebookAppAddNewController', [
    '$scope', '$location', 'facebookAppsFactory', 'facebookGraphFactory', 'notificationService', 
    function($scope, $location, facebookAppsFactory, facebookGraphFactory, notificationService) {

    $scope.isEditMode = false;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/").search({ appid: "" });
    }

    $scope.submit = function(updates) {        
        $scope.appDetails = angular.copy(updates);        
        facebookAppsFactory.saveApp($scope.appDetails).
            then(function(result) {
                notificationService.confirm('Successfully create new app \"' + result.appName + '"');
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                notificationService.error("Error saving app: " + error);
            });
    }    

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                $scope.appUpdates.appToken = result;
            }, function(error) {
                notificationService.error("Error accessing app access token: " + error);
            });
    }

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);
