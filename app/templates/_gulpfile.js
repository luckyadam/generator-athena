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
var appConf = require('./app-conf');
var es = require('event-stream');

function generateTemp () {
  var tempFolder = '.temp';
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

var taskList = [];
var argv = minimist(process.argv.slice(2));
var buildModules = argv.module;

if (!buildModules) {
  buildModules = appConf.moduleList;
}
var athenaMateTask = '';
var imagesTasks = [];
var styleTasks = [];

if (typeof buildModules === 'string') {
  buildModules = [buildModules];
}
buildModules.forEach(function (buildModule, i) {
  var athenaMateName = 'athena_mate_' + buildModule;
  // athenaMateTasks.push(name);
  var preName = buildModules[i - 1];
  preName = preName ? ['athena_mate_' + preName] : null;
  athenaMateTask = athenaMateName;
  gulp.task(athenaMateName, preName, function(cb) {
    var stream = gulp.src(buildModule + '/page/**/*.html')
      .pipe($.flatten())
      .pipe(athenaMate.scan(buildModule))
      .pipe(gulp.dest(buildModule + '/dist'));
    stream.on('end', function () {
      athenaMate.concat({
        module: buildModule,
        map: 'map.json',
        dest: 'dist',
        end: function () {
          cb();
        }
      });
    }).on('error', function (err) {
      cb(error)
    });
  });

  var imagesName = 'images_' + buildModule;
  imagesTasks.push(imagesName);
  gulp.task(imagesName, function () {
    return gulp.src([buildModule + '/widget/*/images/*', buildModule + '/page/*/images/*', buildModule + '/static/images/*'])
      .pipe($.flatten())
      .pipe($.imagemin({
        progressive: true,
        interlaced: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(buildModule + '/dist/images'));
  });

  var stylesName = 'styles_' + buildModule;
  styleTasks.push(stylesName);
  gulp.task(stylesName, [athenaMateName], function () {
    var processors = [
      autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}),
    ];

    return gulp.src(buildModule + '/dist/css/*')
      .pipe($.postcss(processors))
      .pipe(gulp.dest(buildModule + '/dist/css'));
  });
});

taskList = imagesTasks.concat(styleTasks);

gulp.task('temp', taskList, function (cb) {
  var gulpArr = [];
  var modules = appConf.moduleList;
  modules.forEach(function (moduleItem) {
    gulpArr.push(gulp.src(moduleItem + '/dist/**', { base: moduleItem + '/dist' })
      .pipe(gulp.dest('.temp/' + moduleItem)));
  });
  es.concat(gulpArr).on('end', function () {
    generateTemp();
    cb();
  });
});

gulp.task('temp_reload', styleTasks, function (cb) {
  var gulpArr = [];
  var modules = appConf.moduleList;
  modules.forEach(function (moduleItem) {
    gulpArr.push(gulp.src(moduleItem + '/dist/**', { base: moduleItem + '/dist' })
      .pipe(gulp.dest('.temp/' + moduleItem)));
  });
  es.concat(gulpArr).on('end', function () {
    reload();
    cb();
  });
});

gulp.task('serve', ['temp'], function () {
  var argv = minimist(process.argv.slice(2));
  var tempFolder = '.temp';
  var serverParam = {
    baseDir: tempFolder
  };

  if (argv.page && argv.module) {
    serverParam.baseDir = [tempFolder, tempFolder + '/' + argv.module];
    serverParam.index = argv.module + '/' + argv.page + '.html'
  }
  browserSync({
    notify: false,
    port: 3001,
    server: serverParam
  });

  // watch for changes
  gulp.watch([
    '*/page/**/*.*',
    '*/widget/**/*.*',
  ], ['temp_reload']);
});

gulp.task('build', taskList);

gulp.task('deploy', ['temp'], function () {
  var knownOptions = {
    string: 'remote',
    default: { remote: 'qiang' }
  };
  var argv = minimist(process.argv.slice(2), knownOptions);
  var deploy = appConf.deploy;
  var qiang = deploy.qiang;
  var jdTest = deploy.jdTest;
  var modules = appConf.moduleList;
  if (argv.module) {
    gulp.src(argv.module + '/dist/**', { base: argv.module + '/dist' })
      .pipe($.if(argv.remote === 'qiang', $.ftp({
        host: qiang.host,
        user: qiang.user,
        pass: qiang.pass,
        port: qiang.port,
        remotePath: qiang.remotePath + '/' + argv.module
      })))
      .pipe($.if(argv.remote === 'jdtest', $.sftp({
        host: jdTest.host,
        user: jdTest.user,
        pass: jdTest.pass,
        port: jdTest.port,
        remotePath: jdTest.remotePath + '/' + argv.module
      })))
      .pipe($.util.noop());
  } else {
    gulp.src('.temp/**')
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
      .pipe($.util.noop());
  }
});

gulp.task('default', function () {
  gulp.start('build');
});
