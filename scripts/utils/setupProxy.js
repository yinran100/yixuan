const httpProxyMiddleware = require('http-proxy-middleware');
const chalk = require('chalk')
const types = require('./types')
require('./protoExtension')
/**
 * https://github.com/chimurai/http-proxy-middleware#context-matching
 */
// const proxyRules = [
//   {
//     enable: true,
//     context: ['/app/**', '/ajax/**'],
//     target: 'https://actapi.busi.inke.cn'
//   }
// ]

module.exports = function(app, proxyRules = []) {
  if (types.isObject(proxyRules)) return

  proxyRules.forEach(({ context, enable, target, ...opts }) => {
    if (!enable) return

    const proxyOptions = {
      context: context,
      target: target,
      changeOrigin: true,
      logLevel: 'warn',
      ws: true,
      onProxyRes: function onProxyReq(proxyRes, req, res) {
        proxyRes.headers['x-proxy-by'] = 'ik-h5-proxy';
        proxyRes.headers['x-proxy-match'] = context;
        proxyRes.headers['x-proxy-target'] = target;
        if (target && target.endsWith('/')) {
          target = target.replace(/\/$/, '');
        }
        proxyRes.headers['x-proxy-target-path'] = target + req.url;
      },
      ...opts,
    };
    const exampleProxy = httpProxyMiddleware(context, proxyOptions);
    app.use(exampleProxy);
  });
};
