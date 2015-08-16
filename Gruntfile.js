'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-git');

  grunt.initConfig({
    jshint: {
        all: ['code/*.js', 'Gruntfile.js']
      },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git{,*/}*'
          ]
        }]
      }
    },

    copy: {
      dist: {
        files: [
          {src: ['index.html'], dest: 'dist/'},
          {src: [
              'common/**/*.js',
              'code/**/*.js',
              'code/**/*.html',
              'code/css/**/*.css',
              'tools/webgl-debug.js',
              'README.md'
            ],
            dest: 'dist/',
            expand: true
          }
        ]
      }
    },

    'gh-pages': {
      dist: {
        options: {
          base: 'dist',
          message: 'Deployed by grunt gh-pages'
        },
        src: '**/*'
      }
    },

  gitadd: {
    task: {
      options: {
        force: true
      },
      files: {
        src: ['**.*', '.gitignore', '	code/**.*', 'common/*', 'package.json']
      }
    }
  }

  });

  grunt.registerTask('dist', ['clean:dist', 'copy:dist']);
  grunt.registerTask('deploy', ['dist', 'gh-pages:dist']);

};
