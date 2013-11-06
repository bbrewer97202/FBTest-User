/****************************************************************************************
 * configuration file for GruntFile
 ****************************************************************************************/
module.exports = {

  //targets
  dev: {
    html: 'www/index.html',
    js: {
      vendor: 'www/js/vendor.js',
      app: 'www/js/app.js'
    }
  },
  chrome: {
    html: 'chrome-extension/index.html',
    js: {
      vendor: 'chrome-extension/js/vendor.js',
      app: 'chrome-extension/js/app.js'
    }
  },  

  //source files
  src: {
    html: 'src/html/index.html',
    js: {
      app: [
        'src/js/app.js',
        'src/js/services/*.js',
        'src/js/controllers/*.js',
        'src/js/directives/*.js'
      ],
      vendor: [
        'src/js/vendor/bower_components/angular/angular.min.js',
        'src/js/vendor/bower_components/angular-route/angular-route.min.js',
        'src/js/vendor/angular-local-storage.js'
      ]
    }
  }
};
