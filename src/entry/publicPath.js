/**
 * CDN
 */
function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}
const canCdnPathEffect = document.documentElement.getAttribute('data-prerendered') === 'true'
const isPrerendering = window.__PRERENDER_INJECTED__ === 'prerender'
const PUBLIC_URL = process.env.PUBLIC_URL || ''
const CDN_PATH = process.env.CDN_PATH;

/**
 * 注意这里一定一定一定不可以: window.__webpack_public_path__,
 * 因为直接写: __webpack_public_path__ 会编译为 __webpack_require__.p, __webpack_require__是一个全局对象, 通过地址引用来改变 publicPath
 * 但是如果写 window.__webpack_public_path__ 就只会编译为: window.__webpack_public_path__
 */
// eslint-disable-next-line
__webpack_public_path__ = isPrerendering ? PUBLIC_URL: (canCdnPathEffect && CDN_PATH || ensureSlash(PUBLIC_URL, true))
