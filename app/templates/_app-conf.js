'use strict';

module.exports = {
  app: '<%= conf.appName %>',
  common: 'gb',
  moduleList: ['gb'],
  deploy: {
    qiang: {
      host: 'labs.qiang.it',
      user: '',
      pass: '',
      port: 21,
      remotePath: '/labs.qiang.it/h5/<%= conf.appName %>'
    },
    jdTest: {
      host: '192.168.193.32',
      user: '',
      pass: '',
      port: 22,
      remotePath: '/export/paipai/resource/static/fd/h5/<%= conf.appName %>'
    }
  }
};