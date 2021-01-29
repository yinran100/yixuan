
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const serviceMockMiddleware = require('service-mock-middleware');
const serviceProxyMiddleware = require('service-proxy-middleware');
const bodyParser = require('body-parser');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const paths = require('./paths');
const fs = require('fs');
const proxySetup = require('../utils/setupProxy')
const { entryProxyEach, entryChunkNames } = require('./entry')
const chalk = require('chalk');
const path = require('path');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';
const DEV_PUBLIC_URL = process.env.DEV_PUBLIC_URL || ''

module.exports = function(proxy, allowedHost, webpackConfig) {
  return {
    // WebpackDevServer 2.4.3 introduced a security fix that prevents remote
    // websites from potentially accessing local content through DNS rebinding:
    // https://github.com/webpack/webpack-dev-server/issues/887
    // https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
    // However, it made several existing use cases such as development in cloud
    // environment or subdomains in development significantly more complicated:
    // https://github.com/facebook/create-react-app/issues/2271
    // https://github.com/facebook/create-react-app/issues/2233
    // While we're investigating better solutions, for now we will take a
    // compromise. Since our WDS configuration only serves files in the `public`
    // folder we won't consider accessing them a vulnerability. However, if you
    // use the `proxy` feature, it gets more dangerous because it can expose
    // remote code execution vulnerabilities in backends like Django and Rails.
    // So we will disable the host check normally, but enable it if you have
    // specified the `proxy` setting. Finally, we let you override it if you
    // really know what you're doing with a special environment variable.
    disableHostCheck:
      !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // By default WebpackDevServer serves physical files from current directory
    // in addition to all the virtual build products that it serves from memory.
    // This is confusing because those files won’t automatically be available in
    // production build folder unless we copy them. However, copying the whole
    // project directory is dangerous because we may expose sensitive files.
    // Instead, we establish a convention that only files in `public` directory
    // get served. Our build script will copy `public` into the `build` folder.
    // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
    // Note that we only recommend to use `public` folder as an escape hatch
    // for files like `favicon.ico`, `manifest.json`, and libraries that are
    // for some reason broken when imported through Webpack. If you just want to
    // use an image, put it in `src` and `import` it from JavaScript instead.
    contentBase: paths.appPublic,
    // By default files from `contentBase` will not trigger a page reload.
    watchContentBase: true,
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: DEV_PUBLIC_URL || '/',
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    host,
    overlay: false,
    historyApiFallback: {
      rewrites: [
        // https://webpack.js.org/configuration/dev-server/#devserver-historyapifallback
        { from: /^\/$/, to: '/index/index.html' },
        { from: /^\/demo/, to: '/demo/index.html' }
      ],
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
    },
    public: allowedHost,
    proxy,
    before(app, server) {
      // POST 创建 application/x-www-form-urlencoded 编码解析
      app.use(bodyParser.urlencoded({ extended: false }));
      // mock 数据中间件
      app.use(serviceMockMiddleware({ webpackConfig, server, publicPath: DEV_PUBLIC_URL || '/' }));
      // 动态代理配置
      app.use(serviceProxyMiddleware({ webpackConfig, server, publicPath: DEV_PUBLIC_URL, commonProxys: [ path.join(paths.appCommonEntry, 'proxyRules.js') ] }));
      // 支持每个entry 独立配置proxyRule, 进行项目分离
      // const table = new Table({ head: [chalk.bold('entry (入口)'), chalk.bold('enable (代理开关)'), chalk.bold('target (目标主机)'), chalk.bold('context (目标URL)')], style: { border: [] } });
      // entryProxyEach((proxyRulesFile, index) => {
      //   if (fs.existsSync(proxyRulesFile)) {
      //     const proxyRules = require(proxyRulesFile)
      //     // console.log(chalk.yellow(`entry: ${entryChunkNames[index] || 'default'}; setup proxy`), proxyRules)
      //     proxyRules.forEach(item => table.push([chalk.yellow(`${entryChunkNames[index] || 'default'}`), item.enable, item.target, JSON.stringify(item.context)]))
      //     // This registers user provided middleware for proxy reasons
      //     proxySetup(app, proxyRules)
      //   }
      // })
      console.log(chalk.bgCyan.white.bold('      - 使命 -     '));
      console.log(chalk.cyan('    让快乐更简单'));
      console.log(chalk.bgBlueBright.white.bold('      - 愿景 -     '));
      console.log(chalk.green('    让娱乐视频化'));
      console.log(chalk.bgYellow.white.bold('     - 价值观 -    '));
      console.log(chalk.yellow('  拥抱用户 激情担当'));
      console.log(chalk.yellow('  协作共享 创新进取'));
      // console.log(table.toString());

      // This lets us fetch source contents from webpack for the error overlay
      app.use(evalSourceMapMiddleware(server));
      // This lets us open files from the runtime error overlay.
      app.use(errorOverlayMiddleware());

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      app.use(noopServiceWorkerMiddleware());
    },
  };
};
