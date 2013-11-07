module.exports = function(grunt) {

  var configFile = require('./Gruntfile.config.js');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    config: configFile,

    connect: {
      server: {
        options: {
          port: 8888,
          base: 'www',
          keepalive: true
        }
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      dev: {
        files: {
          '<%= config.dev.js.vendor %>': '<%= config.src.js.vendor %>',
          '<%= config.dev.js.app %>': '<%= config.src.js.app %>',
        }
      },
      chrome: {
        files: {
          '<%= config.chrome.js.vendor %>': '<%= config.src.js.vendor %>',
          '<%= config.chrome.js.app %>': '<%= config.src.js.app %>',
        }
      }      
    },

    cssmin: {
      combine: {
        files: {
          '<%= config.dev.css %>': ['<%= config.src.css %>']
        }
      }
      // minify: {
      //   cwd: '<%= config.src.css %>',
      //   expand: true,
      //   src: ['*.css'],
      //   dest: '<%= config.dev.css %>',
      //   ext: '.css'
      // }
    },

    ngtemplates: {
      options: {
        module: 'fbt',
        url: function(url) { 
          return url.replace('src/html/partials/', ''); 
        },
        htmlmin: {
          collapseWhitespace: true,
          removeComments: true
        }
      },      
      app: {
        src: '<%= config.src.js.templates %>',
        dest: '<%= config.dev.js.templates %>'
      }
    },

    preprocess : {
      dev : {
        options: {
          context : {
            ENV: "dev"
          }
        },        
        src : '<%= config.src.html %>',
        dest : '<%= config.dev.html %>'
      },
      chrome : {
        options: {
          context : {
            ENV: "dev"
          }
        },        
        src : '<%= config.src.html %>',
        dest : '<%= config.chrome.html %>'
      }      
    },

    watch: {
      css: {
        files: ['<%= config.src.css %>'],
        tasks: ['cssmin:combine']
      },      
      js: {
        files: ['<%= config.src.js.app %>'],
        tasks: ['concat:dev']
      },
      html: {
        files: ['<%= config.src.html %>'],
        tasks: ['preprocess:dev']
      },
      templates: {
        files: ['<%= config.src.js.templates %>'],
        tasks: ['ngtemplates']
      }
    }

  });

  //lib
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //tasks
  grunt.registerTask('default', ['concat:dev', 'ngtemplates', 'preprocess:dev', 'cssmin:combine']);
  grunt.registerTask('chrome', ['concat:chrome', 'ngtemplates', 'preprocess:chrome']);
  grunt.registerTask('server', ['connect']);

}
