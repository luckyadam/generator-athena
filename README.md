# generator-athena

[![npm version](https://badge.fury.io/js/generator-athena.svg)](http://badge.fury.io/js/generator-athena)
[![Code Climate](https://codeclimate.com/github/luckyadam/generator-athena/badges/gpa.svg)](https://codeclimate.com/github/luckyadam/generator-athena)

> JDC构建项目生成工具，生成相应目录和代码，同时提供Gulp配置对项目进行编译

## 安装

基于``node``，请确保已具备较新的node环境

需要全局安装**yeoman**

```
[sudo] npm install -g yo
```

然后安装本脚手架

```
[sodu] npm install -g generator-athena
```

## 项目结构

一个项目对应一个目录，项目中可以包含多个模块，项目将由以下结构组成


    ├── module1                 - 模块1 
    ├── module2                 - 模块2
    ├── module3                 - 模块3
    ├── gulpfile.js             - gulp文件
    ├── app-conf.js             - 项目的配置信息
    └── package.json

项目中模块将由以下结构组成

    ├── dist                    - 通过编译生成的目录
    │   ├── css                 - 通过编译生成的css文件
    │   ├── js                  - 通过编译生成的js文件
    │   ├── image               - 通过编译压缩后的image文件
    │   ├── page1.html          - 通过编译生成的页面html
    │
    ├── page                    - 所有页面目录
    │   ├── page                - 某一页面目录
    │       ├── page.css        - 页面级css
    │       ├── page.js         - 页面级js
    │       ├── page.html       - 页面html
    │   
    ├── static
    │   ├── css                 - 额外的css文件
    │   ├── js                  - 额外的js文件
    │   ├── image               - 额外的image文件
    │  
    ├── widget                  - 所有widget目录
    │   ├── widget              - 某一widget目录
    │       ├── image           - widget的图片目录
    │       ├── widget.css      - widget的css
    │       ├── widget.js       - widget的js
    │       ├── widget.html     - widget的html
    │
    ├── map.json                - 通过gulp编译后生成页面依赖widget列表
    │
    └── module-conf.js          - 模块的配置信息

在这种项目组织方式中，将页面拆分成各个widget组件，在页面中通过加载各个widget的方式来拼装页面，再经过gulp编译，生成正常页面。

## 快速开始

### 生成新项目

生成一个新的项目目录

```
yo athena
```

然后根据提示一步一步来，将会自动生成项目的结构和所需文件代码，再也不用复制代码了哟~

### 新增模块

在某一项目中新增一个模块，比如在项目**wd**中新增一个**open**模块，需要在项目根目录下执行

```
yo athena:module [模块名]
```
然后根据提示一步一步来，将会自动生成项目的结构和所需文件代码，再也不用复制代码了哟~

### 新增页面

在某一模块下新增一个页面，**进入到该模块**下，执行

```
yo athena:page [pageName]
```

然后根据提示一步一步来，再也不用复制代码了哟~

### 新增widget

在某一模块下新增一个widget组件，**进入到该模块**下，执行

```
yo athena:widget [widgetName]
```

然后根据提示一步一步来，再也不用复制代码了哟~

## 使用及编译

### 模块化

通过阅读设计稿，我们可以将页面拆分成不同``widget``，而一些可以通用的``widget``我们可以放到一个公共模块中去统一管理，通过这样的页面组件化方式，我们可以很好地避开复制代码的问题，同时让我们的代码更好管理。

在执行``yo athena:page [pageName]``命令生成页面后，可以发现在模块的``page``目录下多了一个以刚刚输入的页面名称``pageName``作为名字的目录，这个目录下面包含 **html/js/css** 三个文件。在``html``文件中一般通过加载各个``widget``的方式来进行开发，具体代码如下：

```
<%= widegt.load('user') %>
<%=
	widegt.load('user', {
		param: 'test'
	})
%>
<%= widegt.load('user', null, 'gb') %>
```
``widget.load``可以方法接收三个参数，第一个参数是``widget``的名称，后面两个参数是可选参数，第二个是向``widget``传递的一些参数，第三个是``widget``所属的模块，如果是本模块，可以不传。

**注意**

* ``<%= widget.load %>`` 语句末尾不要加分号

### app-conf.js

在**项目**的根目录下生成的文件中，**app-conf.js**文件是一个通过传入配置项生成的关于本项目的配置文件，我们可以看到它包含如下配置：

```javascript

'use strict';

module.exports = {
  app: 'qwd', // 项目名称
  common: 'gb', // 公共模块
  moduleList: ['gb', 'frs', 'test'], // 项目下模块列表，通过yo athena:module命令生成模块时会自动往此处添加新模块名
  deploy: {  // 需要发布时的配置
    qiang: {
      host: 'labs.qiang.it', // 机器host
      user: '', // 用户名
      pass: '', // 密码
      port: 21, // 端口
      remotePath: '/labs.qiang.it/h5/qwd/frs' // 上传到的目录
    },
    jdTest: {
      host: '192.168.193.32',
      user: '',
      pass: '',
      port: 22,
      remotePath: '/export/paipai/resource/static/fd/h5/qwd/frs'
    }
  }
};

```
其中 **app**、**common** 配置项 **不要** 修改，我们需要重点关注 **deploy** 这个配置项，这是发布到一些机器上的配置，可以注意到用户名和密码是空的，我们需要自己去完善它，同时上传的目录可以根据自己的需要进行修改。

### map.json

**map.json** 文件是通过执行gulp任务后生成一个标识依赖关系的文件，文件中包含了当前模块所有页面所依赖的**widget**组件的信息，它的文件结构如下

```javascript
{
  "find.html": [],
  "index.html": [],
  "open.html": [],
  "open1.html": [],
  "open3.html": [],
  "shop.html": [
    {
      "widgetName": "topbar",
      "param": {
        "topbar": "微信"
      },
      "module": "test",
      "exists": true
    }
  ]
}

```

### gulp

在编写完页面后可以通过``gulp``命令来执行对整个项目的编译，编译后的结果生成在各个模块的``dist``目录下。

同时你可以通过传入参数来决定只编译一个模块

```
gulp --module [模块名]
```


### gulp serve

通过``gulp serve``命令可以实时预览正在编辑的页面。

可以通过携带参数来决定要浏览的页面：
```
gulp serve --module [模块名] --page [页面名]
```

### gulp deploy

通过``gulp deploy``可以将整个项目重新编译，并且将编译好的文件发布到指定机器上去，它会读取``module-conf.js``的配置来决定要发布到哪台机器的哪个目录下。

通过传入参数来决定将要发布的目标机器：

```
gulp deploy --remote [机器代号]
```
**机器代号**目前可以是*qiang*、*jdtest*、*tencent*

通过传入参数来观察文件传输情况：

```
gulp deploy --verbose
```
可以选择只发布一个模块的内容

```
gulp deploy --module [模块名]
```

多个参数一起携带

```
gulp deploy --verbose --remote [机器代号]
```

### gulp clone

进入到某一模块下，通过``gulp clone`` 命令可以复制另一个模块的**widget**到当前模块。


```
gulp clone --from [来源模块] --widget [widget名字]
```
