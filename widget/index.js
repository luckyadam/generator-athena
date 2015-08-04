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
  },

  initializing: function () {
    this.argument('widgetName', {
      required: false,
      type: String,
      desc: 'widget name'
    });
    this.log(yosay(
      chalk.cyan('拍拍无线页面构建脚手架')
    ));
    this.log('need help? go and open issue: https://github.com/luckyadam/generator-athena/issues/new');
    this.widgetConf = {};
    this.pkg = require('../package.json');
    var pwd = this.destinationPath();
    this.moduleConf = require(pwd + '/module-conf');
  },

  prompting: function () {
    var done = this.async();
    var prompts = [];
    if (!this.widgetName) {
      prompts.push({
        type: 'input',
        name: 'widgetName',
        message: '请告诉我widget名字吧~',
        store: false,
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (fs.existsSync(this.destinationPath('widget/' + input))) {
            return '页面已经存在当前目录中了，换个名字吧~';
          }
          return true;
        }.bind(this)
      });
    }
    if (fs.existsSync(this.destinationPath('widget/' + this.widgetName))) {
      prompts.push({
        type: 'input',
        name: 'widgetName',
        message: '页面已经存在当前目录中了，换个名字吧~',
        store: false,
        validate: function(input) {
          if (!input) {
            return '不能为空哦，会让人家很为难的~';
          }
          if (fs.existsSync(this.destinationPath('widget/' + input))) {
            return '页面已经存在当前目录中了，换个名字吧~';
          }
          return true;
        }.bind(this)
      });
    }
    prompts.push({
      type: 'input',
      name: 'author',
      message: '雁过留声，人过留名~~',
      default: this.user.git.name() || process.env.USER,
      store: true
    });

    this.prompt(prompts, function(anwsers) {
      this.widgetConf = anwsers;
      this.widgetConf.date = ((new Date()).getFullYear()) + '-' + ((new Date()).getMonth() + 1) + '-' + ((new Date()).getDate());
      this.widgetConf.modName = this.moduleConf.module;
      this.widgetConf.modClassName = this._.classify(this.widgetConf.modName);
      this.widgetConf.modName = _.decapitalize(this.widgetConf.modClassName);
      this.widgetConf.widgetName = this.widgetConf.widgetName || this.widgetName;
      this.widgetConf.appName = this.moduleConf.app;
      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      var widgetConf = this.widgetConf;
      var widgetName = widgetConf.widgetName;
      this.mkdir('widget/' + widgetName);
      this.mkdir('widget/' + widgetName + '/images');

      this.copy('widget.html', 'widget/' + widgetName + '/' + widgetName + '.html');
      this.copy('widget.css', 'widget/' + widgetName + '/' + widgetName + '.css');
      this.copy('widget.js', 'widget/' + widgetName + '/' + widgetName + '.js');
    }
  },
  end: function() {
    var talkText = 'yo yo 文件已经生成好啦~~\n';
    this.log(chalk.green(talkText) + chalk.white('You are ready to go') + '\n' + chalk.green('HAPPY CODING \\(^____^)/'));
  }
});
