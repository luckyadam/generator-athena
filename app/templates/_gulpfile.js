'use strict';

var gulp = require('gulp');
var athenaMate = require('athena-mate');
var $ = require('gulp-load-plugins')();
var scp = require('gulp-scp2');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var minimist = require('minimist');
var pngquant = require('imagemin-pngquant');
var autoprefixer = require('autoprefixer-core');
var moduleConf = require('./module-conf');

gulp.task('athena_mate', function(cb) {
  var stream = gulp.src('page/**/*.html')
    .pipe($.flatten())
    .pipe(athenaMate.scan())
    .pipe(gulp.dest('dist'));
  stream.on('end', function () {
    athenaMate.concat({
      map: 'map.json',
      dest: 'dist',
      end: function () {
        cb();
      }
    });
  });
});

gulp.task('images', ['athena_mate'], function () {
  return gulp.src(['widget/*/images/*', 'page/*/images/*', 'static/images/*'])
    .pipe($.flatten())
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('styles', ['athena_mate'], function () {
  var processors = [
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}),
  ];

  return gulp.src('dist/css/*')
    .pipe($.postcss(processors))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('temp', ['images', 'styles'], function () {
  return gulp.src('dist/**')
    .pipe(gulp.dest('../.temp/' + moduleConf.module));
});

gulp.task('simpletemp', ['styles'], function () {
  return gulp.src('dist/**')
    .pipe(gulp.dest('../.temp/' + moduleConf.module)).on('end', reload);
});

gulp.task('serve', ['temp'], function () {
  var argv = minimist(process.argv.slice(2));

  var serverParam = {
    baseDir: '../.temp'
  };

  if (argv.page) {
    serverParam.index = moduleConf.module + '/' + argv.page + '.html'
  }
  browserSync({
    notify: false,
    port: 3001,
    server: serverParam
  });

  // watch for changes
  gulp.watch([
    'page/**/*.html',
    'widget/**/*.*'
  ], ['simpletemp']);

});

gulp.task('build', ['styles', 'images']);

gulp.task('deploy', ['build'], function () {
  var knownOptions = {
    string: 'remote',
    default: { remote: 'qiang' }
  };
  var argv = minimist(process.argv.slice(2), knownOptions);
  var deploy = moduleConf.deploy;
  var qiang = deploy.qiang;
  var jdTest = deploy.jdTest;
  return gulp.src('dist/**')
    .pipe($.if(argv.remote === 'qiang', $.ftp({
      host: qiang.host,
      user: qiang.user,
      pass: qiang.pass,
      port: qiang.port,
      remotePath: qiang.remotePath
    })))
    .pipe($.if(argv.remote === 'jdtest', $.sftp({
      host: jdTest.host,
      user: jdTest.user,
      pass: jdTest.pass,
      port: jdTest.port,
      remotePath: jdTest.remotePath
    })))
    .pipe($.util.noop())
    .on('readable', function () {
      $.util.log('Deploy:', $.util.colors.bgYellow('Start deploy to ' + argv.remote));;
    });
});

gulp.task('default', function () {
  gulp.start('build');
});
