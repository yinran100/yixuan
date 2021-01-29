const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

/**
 * 路径说明
 * CDN_PATH 和 PUBLIC_URL 环境变量区别
 * 将CDN_PATH和PUBLIC_URL区分开, 是因为预渲染时候不能走CDN_PATH, 只能以本地的PUBLIC_URL相对路径进行预渲染, 构建文件的cdn路径分别通过三个阶段来注入
 * 1. file-loader 中 options.publicPath函数内动态添加CDN_PATH
 * 2. src/entry/publicPath.js 中 __webpack_public_path__
 * 3. PrerenderSPAPlugin 中 postProcess事件, 动态修改html中引用标签的cdnPath
 */
const envPublicUrl = process.env.PUBLIC_URL
const devPublicUrl = process.env.DEV_PUBLIC_URL
const cdnPath = process.env.CDN_PATH
const customDistServePath = process.env.DIST_SERVE_PATH || ''

function ensureSlash(inputPath, needsSlash) {
  if (!inputPath) {
    if (needsSlash) return '/'
    return inputPath
  }
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.URL(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

const resolveEntries = (resolveFn, filePath) => {

}
// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuildStaticDir: resolveApp(`_dist`),
  appBuild: resolveApp(`_dist/${customDistServePath}`),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  appCommonEntry: resolveApp('src/entry'),
  // testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  // proxySetup: resolveApp('src/config/setupProxy.js'),
  // appIndexJs: resolveModule(resolveApp, 'src/index'),
  pages: resolveApp('src/pages'),
  views: resolveApp('src/views'),
  prodEntryViews: resolveApp('.prodEntryViews.js'),
  devPublicUrl,
  devPublicUrlWithSlash: ensureSlash(devPublicUrl, true),
  cdnPath,
  cdnPathWithSlash: ensureSlash(cdnPath, true),
  resolveApp,
  ensureSlash,
  moduleFileExtensions,
}
