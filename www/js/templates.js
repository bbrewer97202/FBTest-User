angular.module('fbt').run(['$templateCache', function($templateCache) {

  $templateCache.put('facebook-app-form.html',
    "<h2 ng-show=\"isEditMode\">Edit Facebook app</h2><h2 ng-show=\"! isEditMode\">Add Facebook app</h2><div class=\"fbtComponent\"><form name=\"facebookAppEditorForm\" novalidate=\"\" ng-show=\"isValidID\"><div class=\"formRow\"><label>Name:</label><input type=\"text\" name=\"appName\" ng-model=\"appUpdates.appName\" required=\"\" class=\"input-large\"><span class=\"error\" ng-show=\"facebookAppEditorForm.appName.$dirty && facebookAppEditorForm.appName.$invalid\">Please enter a name used to refer to your app.</span></div><div class=\"formRow\"><label>App ID:</label><input type=\"text\" name=\"appID\" ng-model=\"appUpdates.appID\" required=\"\" class=\"input-large\"><span class=\"error\" ng-show=\"facebookAppEditorForm.appID.$dirty && facebookAppEditorForm.appID.$invalid\">Please enter the Facebook app ID.</span></div><div class=\"formRow\"><label>App Secret:</label><input type=\"text\" name=\"appSecret\" ng-model=\"appUpdates.appSecret\" required=\"\" class=\"input-large\"><span class=\"error\" ng-show=\"facebookAppEditorForm.appSecret.$dirty && facebookAppEditorForm.appSecret.$invalid\">Please enter the Facebook app secret.</span></div><div class=\"formRow\"><label>App Access Token:</label><input type=\"text\" name=\"appToken\" ng-model=\"appUpdates.appToken\" required=\"\" class=\"input-large\"><span class=\"error\" ng-show=\"facebookAppEditorForm.appToken.$dirty && facebookAppEditorForm.appToken.$invalid\">Please enter the Facebook app access token.</span><div><button ng-click=\"getAppAccessToken(appUpdates.appID, appUpdates.appSecret)\" ng-disabled=\"facebookAppEditorForm.appID.$invalid || facebookAppEditorForm.appSecret.$invalid\">Retrieve app access token</button></div></div><div class=\"formRow formCTARow\"><button ng-click=\"submit(appUpdates)\" ng-disabled=\"(isEditMode && isUnchanged(appUpdates)) || (facebookAppEditorForm.$invalid || isUnchanged(appUpdates))\">Save</button> <button ng-click=\"cancel()\">Cancel</button></div></form><span class=\"error\" ng-show=\"!isValidID\">Invalid ID.</span></div>"
  );


  $templateCache.put('facebook-app-list.html',
    "<div class=\"fbtSidebar\"><h2>Facebook Apps</h2><div class=\"fbAppList\"><ul><li ng-repeat=\"fbApp in fbApps\"><a ng-click=\"selectApp($index)\" ng-class=\"{ 'selected': $index == selectedIndex }\">{{fbApp.appName}}</a></li></ul></div><div class=\"fbtCTAContainer\"><button class=\"fbtCTAButton\" ng-click=\"addNewFBApp()\">Add New App</button></div></div>"
  );


  $templateCache.put('facebook-app.html',
    "<div ng-show=\"currentApp.appID\"><div class=\"fbtComponent\"><h2>{{currentApp.appName}}</h2><h6>ID: {{currentApp.appID}}</h6><button class=\"fbtCTAButton\" ng-click=\"editFBApp()\">Edit</button> <button class=\"fbtCTAButton\" ng-click=\"deleteFBApp()\">Remove</button> <button class=\"fbtCTAButton\" ng-click=\"visitFBApp()\">View on Facebook</button></div><div test-user-list=\"\" app-token=\"{{currentApp.appToken}}\" app-id=\"{{currentApp.appID}}\"></div><button ng-click=\"createTestUser()\">Create New Test User</button></div>"
  );


  $templateCache.put('test-user-create.html',
    "<div class=\"fbtComponent\"><h2>Create Test User for {{appDetails.appName}}</h2><form name=\"facebookTestUserCreateForm\" novalidate=\"\" ng-hide=\"! appDetails.appID\"><div class=\"formRow\"><label>Name: <small>(leave blank to accept auto-generated name)</small></label><input type=\"text\" name=\"name\" ng-model=\"testUser.name\" required=\"\" class=\"input-large\"></div><div class=\"formRow\"><label>Permissions List:</label><input type=\"text\" name=\"name\" ng-model=\"testUser.permissions\" class=\"input-large\"></div><div class=\"formRow\"><label>Locale:</label><select name=\"locale\" ng-model=\"testUser.locale\" ng-options=\"v for v in localesList\" required=\"\"></select></div><div class=\"formRow\"><label>App installed:</label><input type=\"radio\" ng-model=\"testUser.installed\" value=\"true\">True<br><input type=\"radio\" ng-model=\"testUser.installed\" value=\"false\">False</div><div class=\"formRow formCTARow\"><button ng-click=\"cancel()\">Cancel</button> <button ng-click=\"submit()\">Submit</button></div></form><div class=\"error\" ng-show=\"! appDetails.appID\">Missing Facebook app ID</div></div>"
  );


  $templateCache.put('test-user-list.html',
    "<div class=\"fbtComponent\"><h3>Test Users</h3><div ng-repeat=\"testUser in testUsers\" class=\"testUserListing\"><div><strong>{{testUser.user.name}}</strong> ({{testUser.id}})</div><button ng-click=\"openProfilePage('https://www.facebook.com/profile.php?id=' + testUser.user.id)\">Profile Page</button> <button ng-click=\"loginAsUser(testUser.login_url)\">Login as {{testUser.user.first_name}}</button> <button ng-click=\"deleteTestUser(testUser.id, currentApp.appToken)\">Delete</button></div><div class=\"fbtNotice\" ng-show=\"testUsers.length < 1\">No test users.</div></div>"
  );

}]);
