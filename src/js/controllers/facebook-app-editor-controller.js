/****************************************************************************************
 * controller for facebook add edit app view
 ****************************************************************************************/
fbt.controller('facebookAppEditorController', 
    ['$scope', '$location', 'facebookGraphFactory', 'facebookAppsFactory', 
    function($scope, $location, facebookGraphFactory, facebookAppsFactory) {
    
    //get the index parameter
    //todo: must be a better way to do this ($routeprovider not to be trusted?)
    var path = $location.path();
    var id = path.split("/")[2];


    //do we have a valid id?
    $scope.isValidID = ((parseInt(id) >= 0) && (parseInt(id) < 10000)) ? true : false;

    $scope.isEditMode = true;
    $scope.appDetails = {};

    $scope.cancel = function() {
        $location.path("/");
    }

    $scope.submit = function(updates) {        

        $scope.appDetails = angular.copy(updates); 

        facebookAppsFactory.updateAppByIndex(id, $scope.appDetails).
            then(function(result) {
                $location.path("/").search({ appid: result.app.appID });
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

    if ($scope.isValidID) {

        facebookAppsFactory.getAppByIndex(id).
            then(function(result) {
                $scope.appDetails = result;
            }, function(error) {
                //todo
                console.log("get error");
            }).
            finally(function() {
                $scope.reset();
            });            
    }

}]);
