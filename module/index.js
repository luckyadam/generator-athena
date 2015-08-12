'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });
  },
  initializing: function () {
    this.argument('moduleName', {
      required: false,
      type: String,
      desc: 'module name'
    });
    this.log(yosay(
      chalk.cyan('拍拍无线页面构建脚手架')
    ));
    this.log('need help? go and open issue: https://github.com/luckyadam/generator-athena/issues/new');
    this.conf = {};
    this.pkg = require('../package.json');
  },
  prompting: function () {
    var done = this.async();
    var prompts = [];
    if (!this.moduleName) {
      prompts.push({
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
      });
    }
    if (fs.existsSync(this.destinationPath(this.moduleName))) {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: '模块已经存在哦，换个名字吧~',
        store: false,
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (fs.existsSync(this.destinationPath(input))) {
            return '模块已经存在哦，换个名字吧~';
          }
          return true;
        }.bind(this)
      });
    }
    prompts.push({
      type: 'input',
      name: 'moduleDescription',
      message: '这个模块是干什么的呢？',
      store: false
    });
    prompts.push({
      type: 'input',
      name: 'author',
      message: '雁过留声，人过留名~~',
      default: this.user.git.name() || process.env.USER,
      store: true
    });
    this.prompt(prompts, function(anwsers) {
      var appConfPath = this.destinationPath('app-conf.js');
      var appConf = require(appConfPath);
      this.conf = anwsers;
      this.conf.appName = appConf.app;
      this.conf.moduleName = this.conf.moduleName || this.moduleName;
      this.conf.moduleDescription = this.conf.moduleDescription || '';

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

      this.copy('_module-conf.js', conf.moduleName + '/module-conf.js');
      this.copy('_gulpfile.js', conf.moduleName + '/gulpfile.js');

      var appConfPath = this.destinationPath('app-conf.js');
      var appConf = require(appConfPath);
      var appConfFile = fs.readFileSync(appConfPath);
      var appConfStr = String(appConfFile);
      var appConfStrLines = appConfStr.split('\n');

      if (appConf.moduleList.indexOf(conf.moduleName) < 0) {
        for (var i = 0; i < appConfStrLines.length; i++) {
          var line = appConfStrLines[i];
          if (line.indexOf('moduleList') >= 0) {
            appConfStrLines[i] = line.split(']')[0];
            appConfStrLines[i] += ', \'' + conf.moduleName + '\'],';
          }
        }
        fs.writeFileSync(appConfPath, appConfStrLines.join('\n'));
      }
    }
  },
  end: function () {
    var talkText = 'yo yo 文件已经生成好啦~~\n';
    this.log(chalk.green(talkText) + chalk.white('You are ready to go') + '\n' + chalk.green('HAPPY CODING \\(^____^)/'));
  }
});
