# generator-athena

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

项目将由以下结构组成

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
    ├── gulpfile.js             - gulp配置文件
    │
    ├── map.json                - 通过gulp编译后生成页面依赖widget列表
    │
    ├── module-conf.js          - 模块的配置信息
    │
    └── package.json

在这种项目组织方式中，将页面拆分成各个widget组件，在页面中通过加载各个widget的方式来拼装页面，再经过gulp编译，生成正常页面。

## 快速开始

### 新增模块

生成一个新的模块目录，比如在**wd**中新增一个**open**模块，只需要在项目根目录下执行

```
yo athena
```

然后根据提示一步一步来，再也不用复制代码了哟~

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

### module-conf

在生成的文件中**module-conf**文件是一个通过传入配置项生成的关于本模块的配置文件，我们可以看到它包含如下配置：

```javascript

'use strict';

module.exports = {
  app: 'qwd', // 项目名称
  module: 'frs', // 模块名称
  common: 'gb', // 本项目的公共模块
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
其中**app**、**module**、**common**这三个配置项**不要**修改，我们需要重点关注**deploy**这个配置项，这是发布到一些机器上的配置，可以注意到用户名和密码是空的，我们需要自己去完善它，同时上传的目录可以根据自己的需要进行修改。

### gulp

在编写完页面后可以通过``gulp``命令来执行对整个模块的编译，编译后的结果生成在``dist``目录下。

### gulp serve

通过``gulp serve``命令可以实时预览正在编辑的页面。

可以通过携带参数来决定要浏览的页面：
```
gulp serve --page [页面名]
```

### gulp deploy

如果想要将生成好的页面发布到测试环境，可以通过``gulp deploy``来做，它会读取``module-conf.js``的配置来决定要发布到哪台机器的哪个目录下。

通过传入参数来决定将要发布的目标机器：
```
gulp deploy --remote [机器代号]
```
**机器代号**目前可以是*qiang*和*jdtest*

通过传入参数来观察文件传输情况：
```
gulp deploy --verbose
```

当然聪明如你肯定知道两个参数是可以一起传的

```
gulp deploy --verbose --remote [机器代号]
```



