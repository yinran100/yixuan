## 2020-4-23
  - 修复 `objToString` 方法对转行字符串的保留，而导致带有自定义customTemplateHeader和customTemplate的entry打包失败的情况
### Changed
  - axios-service升级至1.4.1
  - 修改变量`decorator`为`decorate`, 详见:[装饰器名字修改](https://github.com/libaoxu/axios-service/releases/tag/v1.4.1)

## 2020-4-1

### Changed
  - axios-service升级至1.4.1
  - 修改变量`decorator`为`decorate`, 详见:[装饰器名字修改](https://github.com/libaoxu/axios-service/releases/tag/v1.4.1)


## 2020-3-31

### Changed
- [`service-hoc`](./src/entry/service-hoc.js)全部迁移至[decorator/service](./src/decorator/service.js) 和 [serivce-assiter](./src/decorator/service-assister.js), 其中的部分api标志为废弃的

### add
- pkg增加[createDecorator](https://github.com/inkefe/create-decorator#create-decorator)
- [decorator/service](./src/decorator/service.js)增加[`commonAtomDecorator`](./src/decorator/service.js#L112)、[`activityAtomDecorator`](./src/decorator/service.js#L125)、[`asyncAtomDecorate`](./src/decorator/service.js#L160)等装饰器, 具体使用可参考[pages/demo/apis/share.js](./src/pages/demo/apis/share.js)

## 2020-3-18

### Changed
- `src/config/constants.js` 中的HOST_${ENV}配置, 支持传入字符串正则, 适用于线上多域名的场景, 可简化apisRoot配置, 详见[get CUR_HOST](./src/config/apiRoots.js#L24)

## 2020-3-11

### Changed
- 在views中没有配置useArms时, 在html模板中注入`__ikBl`对象, 包括`invoke`等空函数, 详见: [getNoUseArmsTpl](./scripts/tpl/arms.js#L62)

### Added
- 新建`tsconfig.json`与webpack中alias相对应

## 2019-12-20

### Changed
- 更新 Webpack 配置，修改 runtimeChunk；增加 NamedChunksPlugin；增加 HashedModuleIdsPlugin；修改 splitChunks.cacheGroups 配置
- entry > serviceIntercept.js 中移除 loading
- prerenderHelper 中增加 [removePrenderJsonpResource](./scripts/utils/prerenderHelper.js#L11)，预渲染后，会把异步加载的脚本、样式注入 Head 标签最后；本方法用于移除这些无需首屏加载的资源。

### Added
- 增加 setLoadingWrapper 装饰器，[用法](./src/decorator/index.js#L40)

## 2019-12-17

### Changed
- axios-service 更新至 v1.3.7 版，[更新内容](https://github.com/libaoxu/axios-service/releases/tag/v1.3.7)

### Added
- 增加 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) ，[插件规则](https://zh-hans.reactjs.org/docs/hooks-faq.html#what-exactly-do-the-lint-rules-enforce)，建议非 hook 函数不要使用 `use` 打头的函数名


## 2019-12-12

### Changed
- axios response interceptors 去掉blReport, 统一在views中useArms选项里配置, 参考[ignoreApis](./src/views/config/libx/index.js#L51)

### Fixed
- request拦截器中params添加_t时间戳的参数, 去掉post判断, 因为post里面的data分为`FormData`, `String`, `JSON`等多种情况, 而且如果是去缓存, 那么也应该再query string上添加, 详见[serviceIntercept](./src/entry/serviceIntercept.js#L56)


## 2019-12-4
### Changed
  - 去掉package-lock.json, yarn.lock, 目前带来的不便比便利多

### Added
  - 支持pc端构建, views增加`isPx2rem`选项, 默认值为`true`, 设置false可支持pc端应用
  - 支持更多entry中不同key的check, 当前支持`checkBaseSize`, `checkIsPx2Rem`, 详见: [flexibleCheck.js](./scripts/utils/flexibleCheck.js')

## 2019-12-3
### Changed
  - 监控`bl.js`又`alicdn`指向[webcdn.bl.js](https://webcdn.inke.cn/tpc/common/bl@1.0.0/bl.min.js)
  - axios超时时间由5s改为10s
  - dist-server 关掉cache-control
  - `brd:test`, `brd:gray`等自动化命令, 关闭构建压缩, 更方便定位问题

### Added
  - `bridgex`根据uid和sid来判断站外场景, 清空`WVJBIFrameUrl`, 不进行bridge初始化
  - utils中的`ua`添加`isInke`字段
  - `@babel/preset-env`, 启用`useBuiltIns`, 按需加载依赖, 详见: [babel-preset-env#usebuiltins](https://babeljs.io/docs/en/babel-preset-env#usebuiltins)


## 2019-11-14
### Changed
  - 升级`axios-service`@1.3.6
### fixed
  - `src/entry/serviceIntercept.js` 中 axios.interceptors中在errorHanlder中返回类型`Promise.reject`
### Added
  - `public/index.html` 增加dns-prefetch


## 2019-11-13
### Changed
  - 更新监控环境控制，仅在生产环境注入监控代码
  - 更新监控上报控制，仅在灰度环境、线上环境打开上报功能
  - 添加灰度专用监控 pid
  - 修复 `objToString` 方法对象变量是字符串的问题
  - 修复端内打开，报 `ik_share_*` 等取不到的问题
### Added
  - 增加示例代码
  - 增加 `script-ext-html-webpack-plugin` 插件，支持给 script 标签添加 crossorigin 属性。
  - 增加 [log.js](./src/utils/log.js)

## 2019-10-30
### Added
  * `scripts/tpl/arms.js` 增加 arms 监控配置，可以在 views 中配置 `useArms: true` 开启监控。

### Changed
  * 修改 entryCheck 配置文件类型为 JS，以支持传递函数，正则表达式等对象给 HTML。

## 2019-10-18
### Added
  * `scripts/build`通过checkbox想要构建的entry view, 避免误构建他人entry, 详见[entry-check](./scripts/entryCheck.js),
  * `scripts/config/entry`文件在`prod`模式从临时文件`.prodEntryViews`来获取需要构建的entry列表, [cofig/entry](./scripts/config/entry.js#L5)

## 2019-09-20
- 修改`ik.release.conf.js`中升级`ik-release`增加`maxChangesLimit`参数
- [deploy.js](./scripts/deploy.js#L31)中增加`openDistServer`和`openRemoteAddress`
- package.json中精简命令, 收集重复命令, 如`npm run basedeploy` 和 `npm run cdndeploy`

## 2019-08-29
- 修改`ik.release.conf.js`中`NODE_ENV`为`SCRIPT_ENV`, 避免`NODE_ENV`被webpack修改
- 添加[deploy.js](./scripts/deploy.js) 将`build` `ik-release` `ik-deploy`操作连贯起来, 做到一键发布
- package.json中添加`brd:test`, `brd:gray`, `brd:gray:cdn`等命令, 通过`SCRIPT_ENV`这个环境变量来做区分

## 2019-08-27
- 更新`axios-service`到1.3.4, 主要对`setAtomParamsWapper`这个功能的bug修复, 详见[修复自定义装饰器](https://github.com/libaoxu/axios-service/releases/tag/v1.3.4)
- 更改html中`data-prerender`为`data-prerendered`, 这个是个过去时, 表示已经渲染完成, 其相关依赖都做更改, 如: [public/index.html](./public/index.html#L2), [prerenderHelpers](./scripts/utils/prerenderHelper.js#L48), [publicPath](./src/entry/publicPath.js#L), [src/config](./src/config/index.js#L8)
- 废弃`src/config`下的一些`prerender`相关变量, 但是保留export, 每个变量都有时态, 后面起变量名字时候需要谨慎, 不要给业务留坑

## 2019-08-23
- 更新`axios-service`升级到1.3.3, `getErrorMsg`开始基于`axios-service`的`serviceHocs`来创建, 引入不变, 如: [service-hoc](./src/entry/service-hoc.js)
- 利用`axios-service`提供的`requestOptsWrapper`可以直接在业务中使用, 如[api-share](./src/pages/demo/apis/share.js#L8)

## 2019-08-20
- 接入`axios-service`的消息装饰器`getMessageDecorator`, 如[messageDecorator](./src/entry/service-hoc.js#L6), 使用案例可以参考: [shareApis.js](./src/pages/demo/apis/share.js#L29)
- 考虑到业务差异性, 就不在axios.interceptors.request中统一添加原子参数, 改用原子参数的service装饰器, 如[setAtomParamsWapper](./src/entry/service-hoc.js#L81)
- `less-loader`固定到5.0, 最新安装的4.x版本会有问题

## 2019-08-19
- 升级基础库: react@16.8.6, react-dom@16.8.6, react-redux@7.1.0, 拥抱React Hook最新变化
- demo中演示了React 和 redux 结合的hook写法, 如: [ReactHooks](./src/pages/demo/views/ReactHooks.js)

## 2019-08-17
- loading超时保护与axios.defaults.timeout统一, 详见[serviceIntercept](./src/entry/serviceIntercept.js#L46)和[loading](./src/components/loading/index.js#L19)
- [loadingUntilFirstContentPaint](./src/entry/index.js#L31)添加注释, 只要你的页面有使用loading, 就一定要在具体页面的entry中引入这个函数, 真的希望大家能够谨记!!!

## 2019-08-15
- 创建高阶函数来解决构建渲染时候经常将toast打入dom影响页面展现, 并保持在开发阶段不影响使用, 详见[escapeWhenPrerender](./src/config/index.js#L8)
- 将ant-mobile的Toast和Modal组件中的函数进行装饰转换, 在业务中引入直接可用, 不需要关心预渲染, 详见[unPrerenderFormat](./src/entry/unprerender-ui.js#L4)
- 挂载在React.prototype上的$toast和$modal已经指向`unprerender-ui`, 详见[proto-mix](./src/entry/proto-mix.js#L5)

*2019-08-12*
- 接入最新`ik-flexible`, [script 引入](./public/index.html#L21), [html 配置](./public/index.html#L2)

*2019-08-08*
- views配置支持 customTemplateHeader, 在public/index.html基础模板中显示, 详细参考[view/demo](./src/views/config/libx/index.js#L25)

*2019-08-02*
- bridgex 增加 bridgeMock方案, 如[bridge-legacy-mock](./src/bridgex/mocks/bridge-legacy-mock.js) 和 [bridge-core-mock](./src/bridgex/mocks/bridge-core-mock.js), 更多请参考[ik-bridgex](https://code.inke.cn/opd/fe-aws/modules/ik-bridgex)

*2019-07-30*
- 入口添加 baseSize 字段的配置，默认 750，可以根据业务 webview 的宽度动态地配置。可以参考 src/views/config/libx/index 的配置方法。如下图。
![baseSize](https://img.ikstatic.cn/MTU2NDY2OTI0OTYwMiM4OTgjcG5n.png)
- build 机制调整：本项目打包到 _dist 文件夹中，再通过 ik-release 自动 copy 到 dist 文件夹中，增量上线
- src/views 中 [utils](./src/views/utils.js) 增加 isWeChat 参数，动态引入微信 SDK

*2019-07-26*
- 添加 bridgex 目录，从 ik-bridgex 做二次扩展，[action扩展](./src/bridgex/actions.js) 和 [postmessage扩展](./src/bridgex/postmessage.js)
- components/loading.less 从 style/varible.less 中读取全局样式变量，后面开发人员注意点吧

