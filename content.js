var fbt = {
	debug: function(s) {
		var d = $('#debug');
		d.val(s + "\n" + d.val());
		console.log("debug: " + s);
	},

	init: function() {

		fbt.debug("init()");

		$('.btnAction').on('click', function(e) {
			e.preventDefault();
			fbt.view.update($(this).attr('data-view'));
		});

		$('.btnCancel').on('click', function(e) {
			//todo: confirmation
			e.preventDefault();
			fbt.view.update($(this).attr('data-view'));
		});		

		$('form').on('submit', function(e) {
			e.preventDefault();
			fbt[$(this).attr('id')]();
		});

		$('#log a').on('click', function(e) {
			e.preventDefault();
			var $debug = $('#debug');
			if ($debug.css('display') == 'none') {
				$(this).text('Hide Log');
			} else {
				$(this).text('Show Log');
			}
			$debug.toggle();
		});

		$('#appAddFormGenerateToken').on('click', function(e) {
			
			e.preventDefault();

			//todo: add loader
			//todo: add more robust error handling
			var appid = $('#appAddFormID').val();
			var secret = $('#appAddFormSecret').val();			
			if ((! appid) || (appid === "") || (! secret) || (secret === "")) {
				alert("Please enter your app id and app secret before requesting the access token.");
			} else {
				fbt.facebook.getAppAccessToken(appid, secret, function(token) {
					if (token) {
						$('#appAddFormToken').val(token);	
					} else {
						alert("Unable to retrieve token.  Please check app id and app secret and try again.");
					}
				});
			}
		});

		$('#selectApp').on('change', function(e) {
			fbt.view.update('usersList');
		});

		fbt.view.update('home');
	},

	appDataGetById: function(id) {
		var apps = JSON.parse(localStorage.getItem('apps'));
		var len = apps.apps.length;
		var data = {};
		for (var i=0; i < len; i++) {
			if (apps.apps[i]["appid"] == id) {
				data = apps.apps[i];			
				break;
			} 			
		}		
		return data;
	},

	appListGet: function() {
		if (localStorage.getItem('apps')) {
			return JSON.parse(localStorage.getItem('apps'));
		} else {
			var apps = { apps: [] };
			localStorage.setItem('apps', JSON.stringify(apps));
			return apps;
		}
	},

	appAddForm: function() {
		//todo: validation
		var name = $('#appAddFormName').val();
		var appid = $('#appAddFormID').val();
		var secret = $('#appAddFormSecret').val();
		var token = $('#appAddFormToken').val();

		fbt.appAddItem({ name:name, appid:appid, secret:secret, token:token });	
		fbt.view.update('home');
		fbt.message('App added');					
	},

	appAddItem: function(item) {
		//todo: validation
		if (item) {
			var apps = JSON.parse(localStorage.getItem('apps'));
			apps.apps.push(item);
			localStorage.setItem('apps', JSON.stringify(apps));			
		}
	},

	message: function(s) {
		$('#message').html(s).show();
	},

	facebook: {
		getTestUsersByAppId: function(appid, token, callback) {
			var url = "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token;
	  		fbt.debug(url);
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					fbt.debug("getTestUsersByAppId: response: " + data);
					callback(data);
				},
				error: function() {
					fbt.debug("getTestUsersByAppId: request error");
					callback();
				}
			});	  		
		},

		getAppAccessToken: function(appid, appsecret, callback) {
			var url = "https://graph.facebook.com/oauth/access_token?client_id=" + appid + "&client_secret=" + appsecret + "&grant_type=client_credentials";
			fbt.debug("getAppAccessToken: " + url);
			$.ajax({
				url: url,
				success: function(data) {
					fbt.debug("getAppAccessToken: response: " + data);
					var token = data.split("=")[1];
					callback(token);
				},
				error: function() {
					fbt.debug("getAppAccessToken: request error");
					callback();
				}
			});
		},

		getUserById: function(id, token, callback) {
			var url = "https://graph.facebook.com/" + id + "/?access_token=" + token;
	  		fbt.debug("getUserById: " + url);
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					fbt.debug("getUserById: response: " + data);
					callback(data);
				},
				error: function() {
					fbt.debug("getUserById: request error");
					callback();
				}
			});	 
		}
	},

	view: {

		appAdd: function() {
			document.getElementById('appAddForm').reset();
		},

		home: function() {
			var apps = fbt.appListGet();	
			var select = $('#selectApp');
			select.empty();
			console.log(apps);
			select.append('<option value="">Select an App</option>');

			$.each(apps.apps, function(index, value) {
				select.append('<option value="' + value.appid + '">' + value.name + '</option>');
			});
		},

		update: function(id) {
			$('.userForm').hide();
			fbt.view[id]();
			$('#' + id).show();
		},

		usersList: function() {
			//todo: lame, do this with parameter passing
			var id = $('#selectApp').find(":selected").val();
			var appData = fbt.appDataGetById(id);
			var list = $('#usersListListing');

			list.empty();

			$('#usersList h3').text("Test Users for " + appData.name);

			fbt.facebook.getTestUsersByAppId(appData.appid, appData.token, function(data) {
				if (data) {
					console.log(data);
					//id, access_token, login_url
					$.each(data.data, function(index, value) {
						fbt.facebook.getUserById(value.id, value.access_token, function(user) {

							var html = '<div class="userListingHead"><span>' + user.name + '</span>';
							html += '<button class="btnEditUser" data-id="' + user.id + '">Edit</button>';
							html += '<button class="btnDeleteUser" data-id="' + user.id + '">Delete</button>';
							html += '</div>';
							html += '<table class="userListing"><tbody>';						
							html += '<tr><td class="key">ID:</td><td><a href="https://www.facebook.com/profile.php?id=' + user.id + '" target="_blank">' + user.id + '</a></td></tr>';
							html += '<tr><td class="key">Gender:</td><td>' + user.gender + '</td></tr>';
							html += '<tr><td class="key">Login:</td><td><a href="' + value.login_url + '" target="_blank">Login Link</a></td></tr>';		
							html += '<tr><td class="key">Access Token:</td><td>' + value.access_token + '</td></tr></tbody>';
							html += '</table>';
							list.append(html);
						});
					});
				} else {
					//todo: better error handling
					alert("An error occurred with this request.");
				}
			});
		}
	}
}