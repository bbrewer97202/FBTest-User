/****************************************************************************************
 *
 ****************************************************************************************/
 fbt.factory('fbtAppService', [function() {

    var currentFacebookApp = {};
    var currentFacebookAppIndex;

    return {
        getCurrentApp: function() {
            return {
                app: currentFacebookApp,
                index: currentFacebookAppIndex
            }
        },
        setCurrentApp: function(value, index) {
            currentFacebookApp = value;
            currentFacebookAppIndex = index;
        },
        resetCurrentApp: function() {
            this.setCurrentApp({});
        }     
    }

 }]);
