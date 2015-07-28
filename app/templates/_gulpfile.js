var gulp = require('gulp');
var athenaMate = require('athena-mate');

var moduleConfig = require('./module-conf');

gulp.task('athena_mate', function() {
  var stream = gulp.src('page/*.html')
    .pipe(athenaMate.scan(moduleConfig))
    .pipe(gulp.dest('dist/'));
  stream.on('end', function () {
    athenaMate.concat({
      map: 'map.json',
      dest: 'dist',
      conf: moduleConfig
    })
  });
});

gulp.task('default', ['athena_mate'],function () {

});
