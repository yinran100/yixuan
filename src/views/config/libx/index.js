const scriptsMap = require('../../scriptsMap')
const isEnvDevelopment = process.env.NODE_ENV === 'development'
const utils = require('../../utils')

exports.index = {
  index: utils.getEntryViewConfig({
    title: '映客直播',
    description: '最牛逼的直播',
    // baseSize: 100,
    // isPx2rem: false
  })
}

/**
 * 参数说明
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
exports.demo = {
  demo: utils.getEntryViewConfig({
    title: 'demo',
    description: '最牛逼的demo',
    prerenderOptions: {
      routes: ['/']
    },
    // customTemplate: `
    //   <script>
    //     var __A__ = 1
    //   </script>
    // `
    // customTemplate: utils.readPagesFile('demo/customTemplate.html'),
    injectScript: [scriptsMap.WX_SDK, isEnvDevelopment && '//:a.js'].filter(Boolean),
    baseSize: 750,
    // shortcut: { // 用于解决预渲染只能预渲染一个入口的问题，path为增加一个打包入口的路径，其他的字段会覆盖外部，该路径的文件，一般只是路由的重定向不同，其他都引入的是源路径的文件
    //   path: 'shortcut/demo',
    //   title: 'demo的另一个路径',
    // },
    // isPx2rem: false,
    // useArms 内支持传函数，必须使用 es5 编写，且不能引用外部包
    // 更多监控写法: https://wiki.inkept.cn/pages/viewpage.action?pageId=86318060
    // useArms: true,
    // 如需对重要接口进行监控，则按照如下方式使用
    // useArms: {
    //   disableHook: false, // 开启接口监控
    //   ignore: {
    //     ignoreApis: [
    //       /*
    //        * 仅上报重要接口示例
    //        * 返回 true 则忽略，返回 false 则上报
    //        */
    //       function (str) {
    //         return !(str && [
    //           '/api/some-important-api',
    //           '/api/some-important-api2',
    //         ].some(function (api) {
    //           return str.indexOf(api) > -1
    //         }))
    //       }
    //     ]
    //   }
    // }
  })
}

exports.example = {
  example: utils.getEntryViewConfig({
    title: 'example'
  })
}
