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
    }, {
      type: 'input',
      name: 'commonModule',
      message: '公共模块',
      default: 'gb',
      store: true
    }, {
      type: 'input',
      name: 'moduleName',
      message: '告诉我模块名称吧~',
      store: false,
      validate: function(input) {
        if (!input) {
          return '不能为空哦，会让人家很为难的~';
        }

        if (fs.existsSync(this.destinationPath(input))) {
          return '模块已经存在哦，如果你只想增加页面，请使用 yo athena:page 页面名~';
        }
        return true;
      }.bind(this)
    }];

    this.prompt(prompts, function(anwsers) {
      this.conf = anwsers;
      this.conf.date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());
      this.conf.moduleClassName = this._.classify(this.conf.moduleName);
      this.conf.moduleName = _.decapitalize(this.conf.moduleClassName);
      var pwd = this.destinationPath();
      if (pwd.indexOf('/') >= 0) {
        this.conf.folderPath = pwd + '/';
      } else {
        this.conf.folderPath = pwd + '\\';
      }

      done();
    }.bind(this));
  },
  writing: {
    app: function () {
      // 创建目录
      var conf = this.conf;
      this.mkdir(conf.moduleName);
      this.mkdir(conf.moduleName + '/page');
      this.mkdir(conf.moduleName + '/static');
      this.mkdir(conf.moduleName + '/static/css');
      this.mkdir(conf.moduleName + '/static/images');
      this.mkdir(conf.moduleName + '/static/js');
      this.mkdir(conf.moduleName + '/widget');

      this.log(this.conf);

      this.copy('_package.json', conf.moduleName + '/package.json');
      this.copy('_gulpfile.js', conf.moduleName + '/gulpfile.js');
      this.copy('_module-conf.js', conf.moduleName + '/module-conf.js');
    }
  },
  install: function () {
    if (this.options['skip-install']) {
      return;
    }
    process.chdir(this.conf.moduleName);
    this.npmInstall();
    this.on('end', function () {
      var talkText = 'yo yo 文件已经生成好啦~~\n';
      this.log(chalk.green(talkText) + chalk.white('You are ready to go') + '\n' + chalk.green('HAPPY CODING \\(^____^)/'));
    }.bind(this));
  }
});
