/****************************************************************************************
 * display messages (error or confirm) directive
 ****************************************************************************************/
fbt.directive('message', function() {

    return {
        restrict: 'A',
        templateUrl: 'message.html',
        replace: true,
        link: function(scope, element, attrs) {
            // attrs.$observe('message', function(val) {
            //     console.log("observe message: " + val);
            // });
        },
        controller: function($scope) {

        }
    }
});
