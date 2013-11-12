/****************************************************************************************
 * controller for facebook add new app view
 ****************************************************************************************/
fbt.controller('facebookAppAddNewController', [
    '$scope', '$location', 'facebookAppsFactory', 'facebookGraphFactory', 
    function($scope, $location, facebookAppsFactory, facebookGraphFactory) {

    $scope.isEditMode = false;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/").search({ appid: "" });
    }

    $scope.submit = function(updates) {        
        $scope.appDetails = angular.copy(updates);        
        facebookAppsFactory.saveApp($scope.appDetails).
            then(function(result) {                
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                //todo: how to handle
                alert("save App error: ", error);
            });
    }    

    $scope.getAppAccessToken = function(id, secret) {

        facebookGraphFactory.getAppAccessToken(id, secret).
            then(function(result) {
                $scope.appUpdates.appToken = result;
            }, function(error) {
                //todo: something better than this
                alert("Error accessing app access token: " + error);
            });
    }

    $scope.reset = function() {
        $scope.appUpdates = angular.copy($scope.appDetails);
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

}]);
