/****************************************************************************************
 * message notification service
 ****************************************************************************************/
fbt.service('notificationService', [function() {

    var messageID = 0;
    var messages = [];

    var logMessage = function(text, type) {
        messageID++;
        messages.push({
            type: type,
            text: text,
            id: messageID
        }); 

        //limit messages count
        if (messages.length > 10) {
            messages.pop();
        }
    }

    return {
        
        confirm: function(text) {
            logMessage(text, 'confirm');
        },

        error: function(text) {
            logMessage(text, 'error');
        },

        getMessages: function() {
            return messages;
        },

        id: function() {
            return messageID;
        },

        clear: function() {
            messages = [];
        }
    }
}]);
