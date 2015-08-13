'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var _ = require('underscore.string');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });
  },
  initializing: function () {
    this.log(yosay(
      chalk.cyan('拍拍无线页面构建脚手架')
    ));
    this.log('need help? go and open issue: https://github.com/luckyadam/generator-athena/issues/new');
    this.conf = {};
    this.pkg = require('../package.json');
  },
  prompting: function () {
    var done = this.async();
    var prompts = [{
      type: 'input',
      name: 'author',
      message: '雁过留声，人过留名~~',
      default: this.user.git.name() || process.env.USER,
      store: true
    }, {
      type: 'input',
      name: 'appName',
      message: '告诉我项目名称吧~',
      store: true,
      validate: function(input) {
        if (!input) {
          return '不能为空哦，会让人家很为难的~';
        }
        return true;
      }.bind(this)
    }];

    this.prompt(prompts, function(anwsers) {
      this.conf = anwsers;
      this.conf.date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());

      done();
    }.bind(this));
  },
  writing: {
    app: function () {
      // 创建公共模块
      var conf = this.conf;
      var commonModule = conf.appName + '/' + 'gb';
      this.mkdir(conf.appName);
      this.mkdir(commonModule);
      this.mkdir(commonModule + '/page');
      this.mkdir(commonModule + '/static');
      this.mkdir(commonModule + '/static/css');
      this.mkdir(commonModule + '/static/images');
      this.mkdir(commonModule + '/static/js');
      this.mkdir(commonModule + '/widget');

      this.copy('_gb.css', commonModule + '/static/css/base.css');
      this.copy('_module-conf.js', commonModule + '/module-conf.js');
      this.copy('_module_gulp.js', commonModule + '/gulpfile.js');

      this.copy('_package.json', conf.appName + '/package.json');
      this.copy('_gulpfile.js', conf.appName + '/gulpfile.js');
      this.copy('_app-conf.js', conf.appName + '/app-conf.js');
    }
  },
  install: function () {
    if (this.options['skip-install']) {
      return;
    }
    process.chdir(this.conf.appName);
    this.npmInstall();
    this.on('end', function () {
      var talkText = 'yo yo 文件已经生成好啦~~\n';
      this.log(chalk.green(talkText) + chalk.white('You are ready to go') + '\n' + chalk.green('HAPPY CODING \\(^____^)/'));
    }.bind(this));
  }
});
