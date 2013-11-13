/****************************************************************************************
 * service for making Facebook graph calls
 ****************************************************************************************/
fbt.factory('facebookGraphFactory', ['$http', '$q', function($http, $q) {

    return {

        getAppAccessToken: function(id, secret) {

            var deferred = $q.defer();
            var url = 'https://graph.facebook.com/oauth/access_token?client_id=' + id + '&client_secret=' + secret + '&grant_type=client_credentials';

            $http.get(url).
                success(function(data, status, headers, config) {
                    if (data.indexOf("access_token=") !== -1) {
                        var token = data.split("=")[1];                        
                        deferred.resolve(token);
                    } else {
                        deferred.reject("Could not retreive app access token");
                    }
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                });

            return deferred.promise;
        },

        getTestUsers: function(appid, token) {

            if ((typeof(appid) === "string") && (typeof(token) === "string")) {

                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + appid + "/accounts/test-users?access_token=" + token;

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                    });

                return deferred.promise;
            }
        },

        getUserById: function(id, token) {

            if ((typeof(id) === "string") && (typeof(token) === "string")) {
                var deferred = $q.defer();
                var url = "https://graph.facebook.com/" + id + "/?access_token=" + token;

                $http.get(url).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                    });

                return deferred.promise;

            }
        }, 

        getLocaleList: function() {
            //from https://www.facebook.com/translations/FacebookLocales.xml
            var deferred = $q.defer();            
            var locales = ["af_ZA","ar_AR","az_AZ","be_BY","bg_BG","bn_IN","bs_BA","ca_ES","cs_CZ","cy_GB","da_DK","de_DE","el_GR","en_GB","en_PI","en_UD","en_US","eo_EO","es_ES","es_LA","et_EE","eu_ES","fa_IR","fb_LT","fi_FI","fo_FO","fr_CA","fr_FR","fy_NL","ga_IE","gl_ES","he_IL","hi_IN","hr_HR","hu_HU","hy_AM","id_ID","is_IS","it_IT","ja_JP","ka_GE","km_KH","ko_KR","ku_TR","la_VA","lt_LT","lv_LV","mk_MK","ml_IN","ms_MY","nb_NO","ne_NP","nl_NL","nn_NO","pa_IN","pl_PL","ps_AF","pt_BR","pt_PT","ro_RO","ru_RU","sk_SK","sl_SI","sq_AL","sr_RS","sv_SE","sw_KE","ta_IN","te_IN","th_TH","tl_PH","tr_TR","uk_UA","vi_VN","zh_CN","zh_HK","zh_TW"];
            deferred.resolve(locales);
            return deferred.promise;
        },

        testUserCreate: function(id, user) {

            //todo check for valid params

            var deferred = $q.defer();
            var url = "https://graph.facebook.com/" + id + "/accounts/test-users";
            var params = "?";

            for (var param in user) {
                params += param + "=" + user[param] + "&";
            }
            url = url + params;

            $http({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'                    
                }
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
            });

            return deferred.promise;

        },

        deleteTestUser: function(userID, appToken) {

            var deferred = $q.defer();
            var url = "https://graph.facebook.com/" + userID + "?method=delete&access_token=" + appToken;

            $http.get(url).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(data.error.type + ": " + data.error.message + " (" + data.error.code + ")");
                });

            return deferred.promise;
        }
    }
}]);
