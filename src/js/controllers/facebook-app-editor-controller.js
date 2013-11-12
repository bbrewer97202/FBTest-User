/****************************************************************************************
 * controller for facebook add edit app view
 ****************************************************************************************/
fbt.controller('facebookAppEditorController', 
    ['$scope', '$location', 'facebookGraphFactory', 'facebookAppsFactory', 
    function($scope, $location, facebookGraphFactory, facebookAppsFactory) {
    
    $scope.isEditMode = true;
    $scope.appDetails = {};

    //$scope.fbAppID is present due to parent scope
    facebookAppsFactory.getAppByFacebookID($scope.fbAppID).
        then(function(result) {
            $scope.appDetails = result.app;
            $scope.reset();
        }, function(result) {
            //todo
            //invalid id or no id
        });

    $scope.cancel = function() {
        $location.path("/").search({ appid: $scope.fbAppID });
    }

    $scope.submit = function(updates) {        

        $scope.appDetails = angular.copy(updates); 

        facebookAppsFactory.updateApp($scope.fbAppID, $scope.appDetails).
            then(function(result) {
                $location.path("/").search({ appid: result.appID });
            }, function(error) {
                //todo handle this like the others
                console.log("error: ", error);
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
                //todo: something better than this
                alert("Error accessing app access token: " + error);
            });
    }

    $scope.isUnchanged = function(updates) {
        return angular.equals(updates, $scope.appDetails);
    }

    // if ($scope.isValidID) {

    //     facebookAppsFactory.getAppByFacebookID(id).
    //         then(function(result) {
    //             $scope.appDetails = result;
    //         }, function(error) {
    //             //todo
    //             console.log("get error");
    //         }).
    //         finally(function() {
    //             $scope.reset();
    //         });            
    // }

}]);
