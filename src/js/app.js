/****************************************************************************************
 *
 ****************************************************************************************/
var fbt = angular.module('fbt', ['ngRoute', 'LocalStorageModule']);

fbt.config(['$routeProvider', function($routeProvider) {

    //local storage service prefix
    //angular.module('LocalStorageModule').value('prefix', 'fbt');

    //comment

    //routing
    $routeProvider.
        when('/facebookapp/:id', {
            templateUrl: 'views/facebook-app-form.html',
            controller: 'facebookAppEditorController'
        }).
        when('/facebookapp', {
            templateUrl: 'views/facebook-app-form.html',
            controller: 'facebookAppAddNewController'
        }).  
        when('/testusercreate', {
            templateUrl: 'views/test-user-create.html',
            controller: 'testUserCreateController'
        }).                
        otherwise({
            templateUrl: 'views/facebook-app.html',
            controller: 'facebookAppController'
        });   

    // //events
    // $rootScope.$on('deleteFacebookApp', function(e) {
    //     alert("deleted app event");
    // });

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

