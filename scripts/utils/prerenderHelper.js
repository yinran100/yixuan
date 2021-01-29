const cheerio = require('cheerio')
const paths = require('../config/paths')
const CDN_PATH = process.env.CDN_PATH || ''
const PUBLIC_URL = process.env.PUBLIC_URL || ''
// 始终保证有一个slash
const CDN_PATH_SLASH = paths.ensureSlash(CDN_PATH, true)
const PUBLIC_URL_SLASH = paths.ensureSlash(PUBLIC_URL, true)
const PUBLIC_URL_UN_SLASH = paths.ensureSlash(PUBLIC_URL, false)

// 删除预渲染时，打入 html -> head 中的异步 js 和 css
exports.removePrenderJsonpResource = function (html) {
  const scriptReg = /<script charset="utf-8" src="\S+"><\/script>/g
  const styleReg = /<link rel="stylesheet" type="text\/css" href="\S+">/g
  const titleReg = /<title[^>]*>.+<\/title>/g

  // 因为首屏有异步组件, 如果预渲染时候去掉异步css就容易引发样式闪动
  return html
    .replace(scriptReg, '')
    .replace(titleReg, '<title>加载中...</title>') // 标题不要预渲染
    // .replace(styleReg, '')
}

exports.renderHtml = function (html) {
  const $ = cheerio.load(html)
  const self = {
    /**
     * 去掉meta 中的viewport值, flexible会根据浏览器自动计算
     */
    removeMetaViewport () {
      $('meta[name="viewport"]').remove()
      return self
    },
    /**
     * 替换现有script标签, link标签的, cdn路径, 注意: 是非
     */
    replaceCdnPath () {
      if (!CDN_PATH) return self

      const setAttributeCurry = attribute => (index, $elem) => {
        const originAttrValue = $elem.attribs[attribute]
        // 原来是没有具体地址的
        if (originAttrValue.indexOf('http') === -1 && originAttrValue.indexOf(CDN_PATH_SLASH) === -1) {
          const cdnHost = CDN_PATH_SLASH.replace(PUBLIC_URL_UN_SLASH, '')
          $elem.attribs[attribute] = `${paths.ensureSlash(cdnHost, false)}${originAttrValue}`
        }
      }

      $('script[src]:not([cdn-rendered])').each(setAttributeCurry('src'))
      $('link[href]:not([cdn-rendered])').each(setAttributeCurry('href'))

      return self
    },
    changeHtmlRenderStatus () {
      const $html = $('html').get(0)
      const setHtmlAttribs = attr => {
        if ($html.attribs[attr] !== null) {
          $('html').get(0).attribs[attr] = 'true'
        }
      }

      setHtmlAttribs('data-prerendered')

      return self
    },
    html: $.html.bind($),
  }
  return self
}
