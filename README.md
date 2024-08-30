in original code, uglify does not support es6, when i try to upgrade ,
i faced some error.

so: instead of using uglify,  use terser.

 > npm install grunt-terser --save-dev
 > npm install grunt-banner --save-dev

 and modify Gruntfile.js correspondingly.