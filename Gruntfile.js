module.exports = function(grunt) {
  var sourceFiles = [
    //Core Util
    "pagebus.js",
    // components
    "objs/R9Balloon.js",
    "objs/R9Checkbox.js",
    "objs/R9Dialog.js",
    "objs/R9Ellipse.js",
    "objs/R9Highlighter.js",
    "objs/R9Polygon.js",
    "objs/R9Menu.js",
    "objs/R9Rect.js",
    "objs/R9Scratch.js",
    "objs/R9Sprite.js",
    "objs/R9LineTip.js",
    "objs/R9Text.js",
    "objs/SImage.js",
    "objs/SShapeText.js",
    "objs/STextInput.js",
    "objs/R9VScrollView.js",
    "objs/R9Medicion.js",
    "objs/R9Speedometer.js",

    // core
    "utils/core_util.js",
    "utils/latex.js",
    "utils/parse_util.js",
    "utils/anim_util.js",
    "utils/media_util.js",
    "utils/image_util.js",
    "utils/indicate_util.js",
    "utils/r9inpagetimer.js",
    "utils/r9player.js",
    "utils/r9studio.js",
  ];

  // Project configuration.
  var hintConf = grunt.file.readJSON(".jshintrc");
  var config = {
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        separator: ";",
      },
      dev: {
        src: sourceFiles,
        dest: "dist/r9-dev.js",
      },
      beta: {
        src: sourceFiles,
        dest: "dist/r9-v<%= pkg.version %>-beta.js",
      },
      prod: {
        src: sourceFiles,
        dest: "dist/r9-v<%= pkg.version %>.js",
      },
    },
    replace: {
      dev: {
        options: {
          variables: {
            version: "dev",
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams:
              '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams:
              '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>',
          },
          prefix: "@@",
        },

        files: [
          {
            src: ["dist/r9-dev.js"],
            dest: "dist/r9-dev.js",
          },
        ],
      },
      beta: {
        options: {
          variables: {
            version: "<%= pkg.version %>-beta",
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams:
              '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams:
              '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>',
          },
          prefix: "@@",
        },

        files: [
          {
            src: ["dist/r9-v<%= pkg.version %>-beta.js"],
            dest: "dist/r9-v<%= pkg.version %>-beta.js",
          },
        ],
      },
      prod1: {
        options: {
          variables: {
            version: "<%= pkg.version %>",
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams:
              '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams:
              '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>',
          },
          prefix: "@@",
        },

        files: [
          {
            src: ["dist/r9-v<%= pkg.version %>.js"],
            dest: "dist/r9-v<%= pkg.version %>.js",
          },
        ],
      },
      prod2: {
        options: {
          variables: {
            version: "<%= pkg.version %>",
          },
          prefix: "@@",
        },
        files: [
          {
            src: ["dist/r9-Global-v<%= pkg.version %>.min.js"],
            dest: "dist/r9-Global-v<%= pkg.version %>.min.js",
          },
        ],
      },
      prod3: {
        options: {
          variables: {
            version: "<%= pkg.version %>",
          },
          prefix: "@@",
        },
        files: [
          {
            src: ["dist/r9-v<%= pkg.version %>.min.js"],
            dest: "dist/r9-v<%= pkg.version %>.min.js",
          },
        ],
      },
      prod4: {
        options: {
          variables: {
            version: "<%= pkg.version %>",
          },
          prefix: "@@",
        },
        files: [
          {
            src: ["bower-template.json"],
            dest: "bower.json",
          },
        ],
      },
    },
    terser: {
      options: {
        mangle: true,
        compress: true,
        ecma: 6, // Ensure ES6 compatibility
      },
      build: {
        files: {
          "dist/r9-v<%= pkg.version %>.min.js":
            "dist/r9-v<%= pkg.version %>.js",
        },
      },
    },
     // Add a banner to the minified file
    banner: {
      options: {
        banner: '/*! r9JS v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> - */\n',
      },
      dist: {
        files: {
          src: ['dist/r9-v<%= pkg.version %>.min.js']
        }
      }
    },
    clean: {
      build: ["dist/*"],
    },
    jshint: {
      options: hintConf,
      all: ["objs/**/*.js", "utils/**/*.js"],
    },
    copy: {
      prod1: {
        nonull: true,
        src: "dist/r9-v<%= pkg.version %>.min.js",
        dest: "C:/Users/nihan/.R9Studio4/script/r9-v<%= pkg.version %>.min.js",
      },
      prod2: {
        nonull: true,
        src: "dist/r9-v<%= pkg.version %>.js",
        dest: "C:/Users/nihan/.R9Studio4/script/r9-v<%= pkg.version %>.js",
      },
    },
    shell: {
      jsdoc: {
        options: {
          stdout: true,
          stderr: true,
          failOnError: true,
        },
        command:
          "./node_modules/.bin/jsdoc ./dist/r9-v<%= pkg.version %>.js -d ./docs",
      },
    },

    watch: {
      dev: {
        files: ["objs/**/*.js", "utils/**/*.js"],
        tasks: ["dev"],
        options: {
          spawn: false,
        },
      },
    },
  };

  for (var n = 0; n < sourceFiles.length; n++) {
    var inputFile = sourceFiles[n];
    var className = inputFile.match(/[-_\w]+[.][\w]+$/i)[0].replace(".js", "");
    var outputFile = "dist/r9-" + className + "-v<%= pkg.version %>.min.js";

    // config.uglify.build.files[outputFile] = [inputFile];
    config.terser.build.files[outputFile] = [inputFile];
  }

  grunt.initConfig(config);

  // Tasks
  grunt.registerTask("dev", "Create dev version", [
    "clean",
    "concat:dev",
    "replace:dev",
  ]);
  grunt.registerTask("beta", "Create beta version", [
    "clean",
    "concat:beta",
    "replace:beta",
  ]);
  grunt.registerTask("full", "Build full version and create min files", [
    "clean",
    "concat:prod",
   // "uglify",
    "terser",
    "replace:prod1",
    "replace:prod2",
    "replace:prod3",
    "replace:prod4",
    "copy:prod1",
    "copy:prod2",
  ]);

  grunt.registerTask("docs", "Generate docs", ["full", "shell:jsdoc"]);

  grunt.registerTask("hint", "Check hint errors", ["jshint"]);

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-replace");
 // grunt.loadNpmTasks("grunt-contrib-uglify");
 // grunt.loadNpmTasks("uglify-es"); // Load uglify-es
  grunt.loadNpmTasks("grunt-terser"); 
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-shell");
  // grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks("grunt-contrib-watch");
};
