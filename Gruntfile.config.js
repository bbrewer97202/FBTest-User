/****************************************************************************************
 * configuration file for GruntFile
 ****************************************************************************************/
module.exports = {

  //targets
  dev: {
    css: 'www/css/screen.css',
    html: 'www/index.html',
    js: {
      vendor: 'www/js/vendor.js',
      app: 'www/js/app.js',
      templates: 'www/js/templates.js'
    }
  },
  chrome: {
    css: 'chrome-extension/css/screen.css',
    html: 'chrome-extension/index.html',
    js: {
      vendor: 'chrome-extension/js/vendor.js',
      app: 'chrome-extension/js/app.js'
    }
  },  

  //source files
  src: {
    css: 'src/css/*.css',
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
      ],
      templates: 'src/html/partials/*'
    }
  }
};
