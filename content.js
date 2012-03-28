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

		fbt.view.update('home');

		//fbt.FBGetAppAccessToken('245959388810540', 'c67c664d4fc79d5840dcedb0725a2fde');
		//fbt.FBTestUsersGetByApp('245959388810540', '');
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

		fbt.appAddItem({ name:name, appid:appid, secret:secret });	
	},

	appAddItem: function(item) {
		//todo: validation
		if (item) {
			var apps = JSON.parse(localStorage.getItem('apps'));
			apps.apps.push(item);
			localStorage.setItem('apps', JSON.stringify(apps));			
			fbt.view.update('home');
			fbt.message('App added');			
		}
	},

	FBTestUsersGetByApp: function(appid, token) {
		var url = "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token;
  		fbt.debug(url);
	},

	FBGetAppAccessToken: function(appid, appsecret, callback) {
		var url = "https://graph.facebook.com/oauth/access_token?client_id=" + appid + "&client_secret=" + appsecret + "&grant_type=client_credentials";
		fbt.debug("FBGetAppAccessToken: " + url);
		$.ajax({
			url: url,
			success: function(data) {
				fbt.debug("FBGetAppAccessToken: response: " + data);
				var token = data.split("=")[1];
				callback(token);
			},
			error: function() {
				fbt.debug("FBGetAppAccessToken: request error");
				callback();
			}
		});
	},

	message: function(s) {
		$('#message').html(s).show();
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
		}
	}
}