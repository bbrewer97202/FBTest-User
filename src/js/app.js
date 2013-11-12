/****************************************************************************************
 * facebook test user primary module + routing configulation
 ****************************************************************************************/
var fbt = angular.module('fbt', ['ngRoute', 'LocalStorageModule']);

fbt.config(['$routeProvider', function($routeProvider) {

    //local storage service prefix
    //angular.module('LocalStorageModule').value('prefix', 'fbt');

    //routing
    $routeProvider.
        when('/app/new', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppAddNewController'
        }).
        when('/app/edit', {
            templateUrl: 'facebook-app-form.html',
            controller: 'facebookAppEditorController'
        }).  
        when('/testusercreate', {
            templateUrl: 'test-user-create.html',
            controller: 'testUserCreateController'
        }).                
        otherwise({
            templateUrl: 'facebook-app.html',
            controller: 'facebookAppController'
        });   

}]);

/****************************************************************************************
 * helper methods
 ****************************************************************************************/
var fbtUtilities = (function() {

    return {
        openBlankWindowToURL: function openBlankWindowToURL(url) {
            var fbWindow = window.open(url, "_blank", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");                
        }
    };
})();

