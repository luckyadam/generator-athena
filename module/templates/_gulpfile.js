'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var minimist = require('minimist');
var path = require('path');
var moduleConf = require('./module-conf');

var parentPath = path.resolve(process.cwd(), '..');
// 拷贝一个widget
gulp.task('clone', function (cb) {
  var pwd = process.cwd();
  var argv = minimist(process.argv.slice(2));
  var from = argv.from;
  var widget = argv.widget;
  if (!from || !widget) {
    $.util.log($.util.colors.red('请输入widget来源和widget名称'));
    cb();
    return;
  }
  gulp.src(['./' + from + '/widget/' + widget + '/**'])
    .pipe($.rename(function (path) {
      if (path.basename !== 'images' && path.dirname !== 'images' && path.basename !== '') {
        path.basename = from + '_' + path.basename;
      }
    }))
    .pipe(gulp.dest('./' + moduleConf.module + '/widget/' + from + '_' + widget));
  cb();

});

process.chdir(parentPath);
require('../gulpfile');
