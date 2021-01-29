const fs = require('fs')
const path = require('path')
const scriptsMap = require('./scriptsMap')

/**
 * 读取页面文件
 * @param filePath
 * @return {string}
 */
exports.readPagesFile = function readPagesFile (filePath) {
  return fs.readFileSync(path.join(__dirname, `../pages/${filePath}`), 'utf-8')
}

/**
 * 获取统一的入口，参数说明
 * @param title
 * @param keywords
 * @param description
 * @param injectScript script标签, 注意需要带http路径
 * @param customTemplate 自定义模板, 可以在公共public.html内注入相关自一定html
 * @param customTemplateHeader 自定义模板, 可以在公共public.html head内注入相关自一定html
 * @param isPx2rem 表示是否使用px2rem插件, 将单位进行转换, 此开关默认开始, 如果开闭适合pc端应用, 注意细节: 如果关闭此开关的话, 不能引入ant-mobile组件, 应该引用antd组件
 * @param baseSize 宽度配置，默认750，可以根据业务webview的宽度动态地配置
 * @return {{keywords: string, description: string, title: string}}
 */
module.exports.getEntryViewConfig = (opts) => {
  const {
    title = '映客直播',
    keywords = '映客,映客直播,映客app,映客官网,直播,明星直播,映客下载,映客直播下载,映客app下载,视频交友,全民直播,美女直播,高颜值直播',
    description = '映客直播,实时、高清、快捷、流畅的视频直播平台,中国全新的视频社交媒体,明星大咖、网络红人、时尚娱乐、高颜值、视频交友等尽在映客直播app',
    injectScript = [],
    isPx2rem = true,
    baseSize = 750,
    isWeChat = false,
  } = opts

  return Object.assign(opts, {
    title,
    keywords,
    description,
    injectScript: [ ...isWeChat ? [scriptsMap.WX_SDK] : [], ...injectScript ],
    baseSize,
    isPx2rem
  })
}
