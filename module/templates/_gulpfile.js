'use strict';

var gulp = require('gulp');
var athenaMate = require('athena-mate');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var minimist = require('minimist');
var pngquant = require('imagemin-pngquant');
var autoprefixer = require('autoprefixer-core');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var _ = require('lodash');
var moduleConf = require('./module-conf');

var originPath = __dirname;
var parentPath = path.resolve(originPath, '..');

var appConf = require(parentPath + '/app-conf');

function generateTemp () {
  var tempFolder = path.join(parentPath, '.temp');
  var indexFile = path.join(tempFolder + '/index.html');
  if (fs.existsSync(indexFile)) {
    fs.unlinkSync(indexFile);
  }
  var files = fs.readdirSync(tempFolder);
  var folders = [];
  var htmlFiles = {};
  for (var i in files){
    var name = path.join(tempFolder + '/' + files[i]);
    if (fs.statSync(name).isDirectory()) {
      folders.push(files[i]);
    }
  }
  for (var k = 0; k < folders.length; k++) {
    var subFolder = path.join(tempFolder + '/' + folders[k]);
    var subHtmlFiles = [];
    var subFiles = fs.readdirSync(subFolder);
    for (var j = 0; j < subFiles.length; j++) {
      var subName = path.join(subFolder + '/' + subFiles[j]);
      if (fs.statSync(subName).isFile()) {
        subHtmlFiles.push(subFiles[j]);
      }
    }
    htmlFiles[folders[k]] = subHtmlFiles;
  }
  var htmlStr = '<!DOCTYPE html>';
  htmlStr += '<html>';
  htmlStr += '<head>';
  htmlStr += '<meta charset="UTF-8">';
  htmlStr += '<title>Document</title>';
  htmlStr += '</head>';
  htmlStr += '<body>';
  for (var key in htmlFiles) {
    htmlStr += '<h2>' + key + '</h2>';
    htmlStr += '<ul>';
    for (var g in htmlFiles[key]) {
      htmlStr += '<li><a href="' + key + '/' + htmlFiles[key][g] + '">' + htmlFiles[key][g] + '</a></li>';
    }
    htmlStr += '</ul>';
  }
  htmlStr += '</body>';
  htmlStr += '</html>';
  fs.writeFileSync(indexFile, htmlStr);
}

gulp.task('athena_mate', function (cb) {
  var stream = gulp.src('page/**/*.html')
      .pipe($.flatten())
      .pipe(athenaMate.scan({
        cwd: parentPath,
        module: moduleConf.module
      }))
      .pipe(gulp.dest('dist'));
    stream.on('end', function () {
      athenaMate.concat({
        cwd: parentPath,
        module: moduleConf.module,
        map: 'map.json',
        dest: 'dist',
        end: function () {
          cb();
        }
      });
    }).on('error', function (err) {
      cb(err)
    });
});

gulp.task('images', function () {
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

  return gulp.src(['dist/css/*.css', '!dist/css/*.min.css'])
    .pipe($.postcss(processors))
    .pipe($.csso())
    .pipe($.rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('temp', ['styles', 'images'], function (cb) {
  gulp.src('dist/**', { base: 'dist' })
    .pipe(gulp.dest(parentPath + '/.temp/' + moduleConf.module))
    .on('end', function () {
      generateTemp();
      cb();
    });
});

// 拷贝一个widget
gulp.task('clone', function (cb) {
  var argv = minimist(process.argv.slice(2));
  var from = argv.from;
  var widget = argv.widget;
  if (!from || !widget) {
    $.util.log($.util.colors.red('请输入widget来源和widget名称'));
    cb();
    return;
  }
  gulp.src(parentPath + '/' + from + '/widget/' + widget + '/**')
    .pipe($.rename(function (path) {
      if (path.basename !== 'images' && path.dirname !== 'images' && path.basename !== '') {
        path.basename = from + '_' + path.basename;
      }
    }))
    .pipe(gulp.dest(originPath + '/widget/' + from + '_' + widget));
  cb();

});

gulp.task('deploy', ['temp'], function () {
  var deploy = appConf.deploy;
  var qiang = deploy.qiang;
  gulp.src(originPath + '/dist/**', { base: originPath + '/dist' })
    .pipe($.ftp({
      host: qiang.host,
      user: qiang.user,
      pass: qiang.pass,
      port: qiang.port,
      remotePath: qiang.remotePath + '/' + moduleConf.module
    }))
    .pipe($.util.noop());
});

gulp.task('publish', ['temp'], function (cb) {
  var knownOptions = {
    string: 'remote',
    default: { remote: 'tencent' }
  };
  var argv = minimist(process.argv.slice(2), knownOptions);
  var deploy = appConf.deploy;
  var deployOptions = deploy[argv.remote];
  if (!deployOptions) {
    $.util.log($.util.colors.red('机器名错误，目前支持publish到 jdTest 和 tencent 这两台机器！'));
    cb();
  }

  var gulpSSH = new $.ssh({
    sshConfig: {
      host: deployOptions.host,
      port: deployOptions.port,
      username: deployOptions.user,
      password: deployOptions.pass
    }
  });
  var deployParams = {
    host: deployOptions.host,
    user: deployOptions.user,
    pass: deployOptions.pass,
    port: deployOptions.port
  };
  var deployRemoteParams = _.merge(deployParams, {
    remotePath: deployOptions.remotePath + '/' + moduleConf.module
  });
  var deployCssiParams = _.merge(deployParams, {
    remotePath: deployOptions.cssi + '/' + moduleConf.module
  });
  gulp.src(originPath + '/dist/**', { base: originPath + '/dist' })
    .pipe($.if(argv.remote === 'tencent', $.ftp(deployParams)))
    .pipe($.if(argv.remote === 'jdTest', gulpSSH.dest(deployOptions.remotePath + '/' + moduleConf.module)))
    .pipe($.util.noop()).on('finish', function (err) {

      if (err) {
        $.util.log(err);
      }
      // 执行combo操作
      gulp.src('dist/*.html')
        .pipe(athenaMate.combo({
          app: moduleConf.app,
          module: moduleConf.module,
          fdPath: deployOptions.fdPath,
          domain: deployOptions.domain
        }))
        .pipe(gulp.dest('combofile'))
        .on('finish', function (err) {
          if (err) {
            $.util.log(err);
          }
          es.merge(
            gulp.src('combofile/*.html')
              .pipe($.if(argv.remote === 'jdTest', gulpSSH.dest(deployOptions.remotePath + '/' + moduleConf.module)))
              .pipe($.if(argv.remote === 'tencent', $.ftp(deployRemoteParams))),
            gulp.src('combofile/*.shtml')
              .pipe($.if(argv.remote === 'jdTest', gulpSSH.dest(deployOptions.cssi + '/' + moduleConf.module)))
              .pipe($.if(argv.remote === 'tencent', $.ftp(deployCssiParams)))
          ).on('end', function () {
            if (gulpSSH) {
              gulpSSH.close();
            }
            cb();
          });
        });
    });
});

gulp.task('temp_reload', ['temp'], function (cb) {
  reload();
  cb();
});

gulp.task('serve', ['temp'], function () {
  var argv = minimist(process.argv.slice(2));
  var tempFolder = path.join(parentPath, '.temp');
  var serverParam = {
    baseDir: tempFolder
  };

  if (argv.page) {
    serverParam.baseDir = [tempFolder, tempFolder + '/' + moduleConf.module];
    serverParam.index = moduleConf.module + '/' + argv.page + '.html'
  }
  browserSync({
    notify: false,
    port: 3001,
    server: serverParam
  });

  // watch for changes
  gulp.watch([
    'page/**/*.*',
    'widget/**/*.*',
  ], ['temp_reload']);
});

gulp.task('build', ['temp']);

gulp.task('default', ['build']);
