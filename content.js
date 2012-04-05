var fbt = {

	debug: function(s) {
		var d = $('#debug');
		d.prepend('<div>' + s + "</div>");
		//console.log("debug: " + s);
	},

	init: function() {

		$(document).on('click', '.btnAction', function(e) {
			e.preventDefault();
			fbt.view.update($(this).attr('data-view'));
		});

		$(document).on('click', '.btnCancel', function(e) {
			//todo: confirmation
			e.preventDefault();
			var $this = $(this);
			var options = {};
			if ($this.attr('data-appid')) {
				options.id = $this.attr('data-appid');
			}						
			fbt.view.update($this.attr('data-view'), options);
		});		

		$(document).on('click', '.btnEditLogin', function(e) {
			var url = $(this).attr('data-href');
			window.open(url, "fbLogin","status=yes,menubar=yes,resizable=yes,scrollbars=yes,toolbar=yes");
		});

		$(document).on('click', '.btnCreateTestUser', function(e) {
			var $this = $(this);
			fbt.view.update("userCreate", { appid: $this.attr('data-appid'), token: $this.attr('data-token') });
		});

		$(document).on('click', '.btnEditUserName', function(e) {
			var $this = $(this);
			fbt.view.update("userEditName", { id: $this.attr('data-id'), appid: $this.attr('data-appid'), token: $this.attr('data-token') });
		});

		$(document).on('click', '.btnEditUserPassword', function(e) {
			var $this = $(this);
			fbt.view.update("userEditPassword", { id: $this.attr('data-id'), appid: $this.attr('data-appid'), token: $this.attr('data-token') });
		});		

		$(document).on('click', '.btnDeleteUser', function(e) {
			var $this = $(this);			
			var bool = confirm("Are you sure you want to delete this user?");
			if (bool) {
				var appid = $this.attr('data-appid');
				fbt.facebook.deleteUser($this.attr('data-id'), $this.attr('data-token'), appid, function(data) {
					if (data) {
						if (data == "true") {
							fbt.view.update('usersList', { id: appid });
							fbt.message("User deleted.");
						} else {
							if (data.error) {
								console.log("data error: ", data);
								if (data.error.message) {
									alert(data.error.message);
								}
							}
							fbt.view.update('usersList', { id: appid });
						}	

						alert("User deleted");
					} else {
						alert("An error occurred when attempting to delete this user.");
					}
				});
			} 
		})

		$(document).on('click', '.btnSubmit', function(e) {
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
			//todo: add error handling
			var appid = $('#appAddFormID').val();
			var secret = $('#appAddFormSecret').val();			
			if ((! appid) || (appid === "") || (! secret) || (secret === "")) {
				alert("Please enter your app id and app secret before requesting the access token.");
			} else {
				fbt.facebook.getAppAccessToken(appid, secret, function(data) {
					var token = data.split("=")[1];
					if (token) {
						$('#appAddFormToken').val(token);	
					} else {
						alert("Unable to retrieve token.  Please check app id and app secret and try again.");
					}
				});
			}
		});

		$('#selectApp').on('change', function(e) {
			fbt.view.update('usersList', { id: $(this).find(":selected").val() });
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

	appAddFormSubmit: function() {
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
		$('#message').show().html(s);
	},

	resetForm: function(f, options) {

		document.getElementById(f).reset();

		//enable cancel button to return to previous view with this app id, if present
		if (options) {
			if (options.appid) {
				$('#' + f + 'Cancel').attr('data-appid', options.appid);
				$('#' + f + 'AppId').val(options.appid);
			}

			//add token to hidden field if present
			if (options.token) {
				$('#' + f + 'Token').val(options.token);
			}
		}
	},

	//handle submit of the user create form
	userCreateFormSubmit: function() {
		//todo: validation
		//todo: handle installed parameter
		var name = $('#userCreateName').val();
		var appid = $('#userCreateFormAppId').val();		
		var token = $('#userCreateFormToken').val();
		var locale = $('#userCreateLocale').val();
		var permissions = $('#userCreatePermissions').val();

		fbt.facebook.createUser(appid, name, locale, permissions, token, function(data) {
			if (data && (data.id)) {
				fbt.view.update('usersList', { id: appid });
				var message = "User created.<br />ID: " + data.id + "<br />";
				message += "Email: " + data.email + "<br />Password: " + data.password;
				message += "<br />Please save this email and password as you will not be able to access them with this tool again."
				fbt.message(message);
			} else {
				//todo: error handling
				alert("An error occurred making a test user.");
			}
		});
	},

	userEditNameFormSubmit: function() {
		//todo: validation
		var name = $('#userEditNameFormName').val();
		var id = $('#userEditNameFormUserId').val();
		var appid = $('#userEditNameFormAppId').val();
		var token = $('#userEditNameFormToken').val();

		fbt.facebook.updateUserName(id, name, token, function(data) {
			if (data && (data == "true")) {
				fbt.view.update('usersList', { id: appid });
				fbt.message("User name updated");
			} else {
				alert("Error, could not update user name. Facebook does not accept all values as valid.");
			}
		});
	},

	userEditPasswordFormSubmit: function() {
		//todo: validation
		var password = $('#userEditPasswordFormPassword').val();
		var id = $('#userEditPasswordFormUserId').val();
		var appid = $('#userEditPasswordFormAppId').val();
		var token = $('#userEditPasswordFormToken').val();

		fbt.facebook.updateUserPassword(id, password, token, function(data) {
			if (data && (data == "true")) {
				fbt.view.update('usersList', { id: appid });
				fbt.message("User password updated");
			} else {
				alert("Error, could not update user password.");
			}
		});
	},

	facebook: {

		graphCall: function(options) {
		
			var url = options.url || ''; //?
			var datatype = options.dataType || "text";
			var type = options.type || 'GET';
			var callback = options.callback || function(data) { };
			var caller = (options.caller) ? "<span class='logLabel'>" + options.caller + "</span>: " : '';

			fbt.debug(caller + url);

			$.ajax({
				url: url,
				type: type,
				dataType: datatype,
				success: function(data) {
					callback(data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					//todo: completely revisit this and flesh out error handling
					callback();
				}
			});	
		},

		createUser: function(appid, name, locale, permissions, token, callback) {
			fbt.facebook.graphCall({
				url: 'https://graph.facebook.com/' + appid + '/accounts/test-users?installed=true&name=' + name + '&locale=' + locale + '&permissions=' + permissions + '&method=post&access_token=' + token,
				type: "POST",
				dataType: "json",
				callback: callback,
				caller: "createUser"
			});  			
		},

		deleteUser: function(userid, token, appid, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/" + userid + "?method=delete&access_token=" + token,
				dataType: "json",
				callback: callback,
				caller: "deleteUser"
			});  			
		},

		getTestUsersByAppId: function(appid, token, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token,
				dataType: "json",
				callback: callback,
				caller: "getTestUsersByAppId"
			});
		},

		getAppAccessToken: function(appid, appsecret, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/oauth/access_token?client_id=" + appid + "&client_secret=" + appsecret + "&grant_type=client_credentials",
				callback: callback,
				caller: "getAppAccessToken"
			});
		},

		getUserById: function(id, token, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/" + id + "/?access_token=" + token,
				dataType: "json",
				callback: callback,
				caller: "getUserById"
			});
		}, 

		updateUserName: function(id, name, token, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/" + id + "?&name=" + name + "&method=post&access_token=" + token,
				callback: callback,
				caller: "updateUserName"
			});
		},

		updateUserPassword: function(id, password, token, callback) {
			fbt.facebook.graphCall({
				url: "https://graph.facebook.com/" + id + "?&password=" + password + "&method=post&access_token=" + token,
				callback: callback,
				caller: "updateUserPassword"
			});
		}
	},

	view: {

		appAdd: function() {
			fbt.resetForm('appAddForm');
		},

		home: function() {
			var apps = fbt.appListGet();	
			var select = $('#selectApp');
			select.empty();
			select.append('<option value="">Select an App</option>');

			$.each(apps.apps, function(index, value) {
				select.append('<option value="' + value.appid + '">' + value.name + '</option>');
			});
		},

		update: function(id, options) {
			options = (options) ? options : {};
			$('.userForm').hide();
			fbt.view[id](options);
			$('#' + id).show();
		},

		userCreate: function(options) {

			fbt.resetForm('userCreateForm', options);
		},

		userEditName: function(options) {

			var appData = fbt.appDataGetById(options.appid);		
			fbt.resetForm('userEditNameForm', options);		
			$('#userEditNameFormUserId').val(options.id);

			//get data on requested user
			fbt.facebook.getUserById(options.id, appData.token, function(user) {
				$("#userEditNameFormName").val(user.name);
			});
		},

		userEditPassword: function(options) {

			var appData = fbt.appDataGetById(options.appid);
			fbt.resetForm('userEditPasswordForm', options);
			$('#userEditPasswordFormUserId').val(options.id);
		},

		usersList: function(options) {

			var appData = fbt.appDataGetById(options.id);
			var list = $('#usersListListing .userListing');

			list.empty();

			$('#usersList h3').text(appData.name);
			$('#usersList h5').text("Existing Test Users for " + appData.name);

			//associate app with create button
			$('#userListCreateUser').attr({
				"data-appid": appData.appid,
				"data-token": appData.token
			});

			fbt.facebook.getTestUsersByAppId(appData.appid, appData.token, function(data) {
				if (data) {
					$.each(data.data, function(index, value) {
						fbt.facebook.getUserById(value.id, value.access_token, function(user) {

							var html = "<li>";
							html += '<span class="userHead"><a href="https://www.facebook.com/profile.php?id=' + user.id + '" target="_blank"><strong>' + user.name + '</strong></a>';
							html += ' <small>(' + user.id + ')</small></span>';
							html += '<button class="btnEditLogin" data-id="' + user.id + '" data-href="' + value.login_url + '">Login as this user</button> ';
							html += '<button class="btnEditUserName" data-id="' + user.id + '" data-appid="' + options.id + '" data-token="' + appData.token + '">Change Name</button> ';
							html += '<button class="btnEditUserPassword" data-id="' + user.id + '" data-appid="' + options.id + '" data-token="' + appData.token + '">Change Password</button> ';
							html += '<button class="btnDeleteUser" data-id="' + user.id + '" data-appid="' + appData.appid + '" data-token="' + appData.token + '">Delete User</button> ';
							html += "</li>";
							list.append(html);

						});
					});
				} else {
					//todo: better error handling
					list.append('<li>Could not retrieve users</li>');
				}
			});
		}
	}
}