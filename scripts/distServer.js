process.env.NODE_ENV = 'production';
const express = require('express');
const path = require('path')
const fs = require('fs')
const address = require('address')
const open = require('open')
const setupProxy = require('./utils/setupProxy')
const compression = require('compression')
const { entryChunkNames, entryProxyEach, entryProxyFiles } = require('./config/entry')
const chalk = require('chalk')
const detect = require('detect-port-alt');
const { readFileDisplay } = require('./utils/readFile')
// const dynamicProxyMiddleware = require('./utils/proxyRulesMiddleware');
const serviceProxyMiddleware = require('service-proxy-middleware');
const argv = require('minimist')(process.argv.slice(2));
const configFactory = require('./config/webpack.config');
const paths = require('./config/paths');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const app = express()
const root = resolveApp(argv['dist-root'] || 'dist')
const isOpen = argv['open']

const extraProxyRules = [
  {
    enable: false,
    context: ['/url'],
    target: 'http://chatroom.inke.cn'
  },
]

const staticOptions = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  // dist server不能 要缓存, 有时候缓存反而出问题
  // maxAge: 0,
  redirect: false,
  setHeaders: function (res, path, stat) {
    // res.set('x-timestamp', Date.now())
    // html 不能gizp
    // res.set('Content-Encoding', 'gzip')
  }
}

const webpackConfig = configFactory(process.env.NODE_ENV);

app.use(compression())
app.use(express.static(root, staticOptions))
// app.use(dynamicProxyMiddleware({ DIST_SERVE_PATH: '/react' }));
// 动态代理中间件
app.use(serviceProxyMiddleware({
  webpackConfig,
  publicPath: '/react',
  commonProxys: [
    path.join(paths.appCommonEntry, 'proxyRules.js')
  ]
}));

const IP = address.ip()

const DEFAULT_PORT = 3001

/**
 * 避免端口重复而服务启动失败
 */
detect(DEFAULT_PORT, '0.0.0.0').then((port) => {
  app.listen(port, () => {
    console.log(`dist server listening on port ${port}!`)
    console.log()
    readFileDisplay({
      filePath: root,
      extensions: ['.html'],
      matchedExtensionCallback: function (res) {
        const url = `http://${IP}:${port}/${res.relativeFileDir.replace(/\//, '')}`
        if (isOpen) {
          open(url)
        }
        console.log(url)
        console.log()
      }
    })
  })
}).catch((e) => {
  console.error(e)
})
