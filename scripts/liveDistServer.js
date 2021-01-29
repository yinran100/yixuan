process.env.NODE_ENV = 'production';
const fs = require('fs');
const address = require('address')
const path = require('path');
const liveServer = require('live-server');
const compression = require('compression');
const { readFileDisplay } = require('./utils/readFile')
// const dynamicProxyMiddleware = require('./utils/proxyRulesMiddleware');
const serviceProxyMiddleware = require('service-proxy-middleware');
const configFactory = require('./config/webpack.config');
const paths = require('./config/paths');

const argv = require('minimist')(process.argv.slice(2));
const root = path.resolve(process.cwd(), argv['dist-root']);
const IP = address.ip();
const PORT = 3001;
const webpackConfig = configFactory(process.env.NODE_ENV);

liveServer.start({
  host: IP,
  port: PORT,
  open: false,
  middleware: [
    compression(),
    serviceProxyMiddleware({
      webpackConfig,
      // publicPath: '/react',
      commonProxys: [
        path.join(paths.appCommonEntry, 'proxyRules.js')
      ]
    })
  ],
  root: root
});
readFileDisplay({
  filePath: root,
  extensions: ['.html'],
  matchedExtensionCallback: function (res) {
    console.log()
    console.log(`http://${IP}:${PORT}/${res.relativeFileDir.replace(/\//, '')}`)
  }
})
