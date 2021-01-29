# ik-h5-react
> 映客h5基础模板脚手架 - react版


## 升级内容

一. 跨域代理分entry独立配置

在每个entry对应的页面文件夹中创建proxyRules.js,  如
[proxyRules.js](src/pages/demo/proxyRules.js)

二. entry配置支持更多自定义配置, 基础模板public/index.html 扩展性更强

**injectScript**: 支持自定义js库链接, 避免通过isVue这种配置, 降低public/index.html的耦合度

**customTemplate**: 自一定html模板,

如: [views](src/views/index.js)

二. 暴露更多环境变量, 支持更复杂的自定义构建
在process.env上挂在很多环境变量, 如PUBLIC_URL, GENERATE_SOURCEMAP, PORT, 在package.json的scripts中自由组合多种命令, 如[scripts](package.json)

三 支持更强大的调试能力
build, build:debug, build:debug:nosourcemap, start:devtools, start:wenire等, 可参考[项目命令说明](#项目命令说明)

四. 通过构建预览进行页面检查
可以对构建后的dist文件, 启动服务进行上线前预览

五. 支持预渲染
首屏dom结构直接构建到html中

六. 多个通用库独立, 通过npm集成
[ik-weixin](https://code.inke.cn/opd/fe-aws/modules/ik-weixin), [ik-bridgex](https://code.inke.cn/opd/fe-aws/modules/ik-bridgex), [ik-release](https://code.inke.cn/opd/fe-aws/modules/ik-release)等通用库已经抽离

七. 适配方案升级
vw适配方案, rem为降级方案, [rem与vw方案对比](https://www.zhihu.com/question/37179916/answer/469610853)

八. 统一mock规范
使用axios-service的getMockDecoratorByEnv, 统一在判断环境变量的基础上进行mock数据模拟, 如[mock规范](src/pages/demo/mocks/demo.mock.js#L20)

## 安装

首先要安装ik-cli, 具体可参考[ik-cli安装及使用](https://code.inke.cn/opd/fe-aws/ik-cli#ik-cli)

安装ik-cli后, 创建项目演示
```bash
ik-cli init ik-h5-react <project-name>

git remote add origin git@code.inke.cn:opd/{你的仓库的地址}.git

git push -u origin master
```

更新项目
```bash
ik-cli update ik-h5-react
```

## process.env相关环境变量介绍

| 参数 | 描述 | 业务场景 | scripts案例 |
| --- | --- | --- | --- |
| `NODE_ENV` | 环境变量 | 区分不同环境做处理 | npm run start |
| `PORT` | 项目端口 | 项目启动 | npm run start |
| `DEV_PUBLIC_URL` | 开发环境下自定义publicPath路径 | 项目启动时需要自定义publicPath路径 | npm run start:custom-serve-path |
| `WEINRE_PORT` | wenire调试端口 | 项目带wenire启动 | npm run start:wenire |
| `DEVTOOLS_PORT` | 终端react-devtools端口 | 项目需要在终端启动react-devtools | npm run start:devtools |
| `GENERATE_SOURCEMAP` | 构建产物是否带sourceMap | 上线项目不需要sourceMap构建 | npm run build |
| `DIST_SERVE_PATH` | 构建后dist后面的目录路径 | 上线需要带自定义路径区分, 如https://h5.inke.cn/react-app/... | npm run build:custom-serve-path |
| `PUBLIC_URL` | 生成环境下自定义publicPath路径 | ${publicPath}/static/... | npm run build:custom-serve-path |
| `CDN_PATH` | CDN路径 | 项目静态资源需要上cdn | npm run build:cdn |
| `BUILD_WATCH` | 实时监测构建 | 调试构建后输出文件 | npm run build:debug |


## 项目命令说明
**一 项目启动相关**

1. 项目启动 `npm run start` | `npm start`

控制台会输出页面路径, views相关配置请参考[views参数配置](#views参数配置)

2. weinre调试`npm run start:weinre` 和 `npm run weinre`

适合真机调试, 注意`需要启动两个服务`

3. 非chrome使用 react-devtools进行调试 `npm run start:devtools` 和  `npm run devtools`

适合于非chrome端使用react-devtools进行调试, 如safari, 微信模拟器等, 注意`需要启动两个服务`

**二 项目构建相关**

1. 执行命令 `npm run build`

2. 构建cdn `npm run build:cdn`

3. 构建调试 `npm run build:debug`

构建非压缩版, 并且带有sourcemap, 方便调试production文件并且映射到development文件

4. 构建调试 `npm run build:debug:nosourcemap`

构建非压缩版, 并且不带有sourcemap, 适用于完全构建production文件的场景

5. 构建检查 `npm run dist-server`

*一定非常注意:* npm run build:debug 和 npm run dist-server 是我们非常非常有用的功能, 而且都是针对前端工程化引起的很多实际业务场景, 经常出现的问题, 解决这些问题存在的, `是团队每个成员必会的命令, 是团队每个成员必会的命令, 是团队每个成员必会的命令`
## 项目其他配置

### views参数配置
> 可参考[views-demo](src/views/index.js)

| 参数 | 是否必传 | 类型 | 描述 |
| --- | --- | --- | --- |
| title | false | String |  |
| keywords | false | String |  |
| description | false | String |  |
| customTemplate | false | String | 自定义模板, 可以在公共public.html内注入相关自定义html |
| customTemplateHeader | false | String | 自定义模板, 可以在公共public.html内注入相关自定义head内容 |
| injectScript | false | String | script标签, 注意`需要带http路径` |
| baseSize | false | Number | 基础字段配置，默认750，可以根据业务webview的宽度动态地配置` |

### 微信接入默认配置更改
> 可参看[ik-weixin接入案例](src/entry/wechat.js)

在`src/entry/wechat.js`中做修改, 主要修改两个地方
- 修改获取微信config变量(appid, signature, noncestr, timestamp)的接口
- 修改微信默认分享字段默认参数, 如: title, desc, imgUrl, link

### 接口根host配置

- 在`src/config/apiRoots.js` 添加不同的serviceRootHost, 如[apiRoots修改参考](src/config/apiRoots.js)

- 在`src/config/constants.js` 修改不同prod环境的域名, 如[prod环境域名修改参考](src/config/constants.js)

### 跨域代理配置

本项目跟之前的[ik-h5]脚手架相比, 支持单entry配置自己的跨域代理文件, 中采用的代理中间件为[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware), 相关配置写法都与http-proxy-middleware统一, 如[proxyRules配置参考](src/pages/demo/proxyRules.js)

### API配置规范和mock规范

推荐使用的[axios-service](https://github.com/libaoxu/axios-service)作为api请求规范, 该库是经过多年项目开发经验打磨出来的, 可以更有效的规范业务代码, 更好的支持接口的配置和扩展性, 具体使用可参考[apis.js](src/pages/demo/apis/share.js) 和 [mock.js](src/pages/demo/mocks/demo.mock.js)

### 资源上cdn

- 图片上cdn资源接口: [图床工具](http://h5.inke.cn/common/upload_2.html)
- 其他资源上cdn: [cdn引用](http://wiki.inkept.cn/pages/viewpage.action?pageId=22952299)

## 项目注意事项和相关说明

### CDN_PATH 和 PUBLIC_URL 环境变量区别

首先要了解webpack的config文件中, output.publicPath参数的意义, 该参数就是替换html中script标签的根路径(默认是/static/开头), 之前的boc项目都是直接将publicPath的地址执行cdn地址, 如[boc-assetsPublicPath](https://code.inke.cn/opd/activitys/boc.inke.cn.source/blob/master/src/config/build.js#L12)

但是这里却将CDN_PATH和PUBLIC_URL区分开, 是因为预渲染时候不能走CDN_PATH, 只能以本地的PUBLIC_URL相对路径进行预渲染, 构建文件的cdn路径分别通过三个阶段来注入

1. file-loader 中 options.publicPath函数内动态添加CDN_PATH
2. src/entry/publicPath.js 中 __webpack_public_path__
3. PrerenderSPAPlugin 中 postProcess事件, 动态修改html中引用标签的cdnPath

### react-router的history方案

其中broswerHistory需要更改nginx配置, 如果是新域名的项目, 如果是首页, 首选broswerHistory, 如果是发布到其他域名下, 首选hashHistory

`如果使用broswerHistory需要注意:`

1: 开发模式 config/webpackDevServer.config.js 中的 historyApiFallback 中rewrite进行配置, 如[rewriteDemo](scripts/config/webpackDevServer.config.js#L81)

2: 线上需要再ngix做响应配置, 才可以使用browserHistory
配置参考: http://react-guide.github.io/react-router-cn/docs/guides/basics/Histories.html

## 目录结构说明
```
|- 📁 .vscode # vscode 相关设置。
|- 📁 dist # 构建之后的静态文件, 包括html, js, css, img, font等。
|- 📁 scripts # 项目启动脚本及配置文件
|  |- 📁 config #webpack配置文件
|  |- 📁 utils #webpack配置工具函数
|  |  |- build.js
|  |  |- distServer.js
|  |  |- start.js
|  |  |- test.js
|- 📁 node_modules # NPM 模块安装目录。
|- 📁 src # 项目源代码。
|  |- 📁 views # webpack 多entry路径配置文件, 指向pages路径
|  |- 📁 pages # webpack 多entry指向的具体文件执行的脚本
|  |- 📁 entry # pages页面启动时, 执行通用入口逻辑封装
|- .gitignore # git 文件忽略配置。
|- .editorconfig # 统一编辑器配置。
|- .eslintignore.js # es语法检查器忽略配置。
|- .postcss.config.js # postcss相关插件配置。
|- .eslintrc.js # es语法检查配置文件。
|- ik.release.conf.js # 项目发布配置文件。
|- jest.config.js # jest测试配置
|- package.json & package-lock.json # NPM 包配置文件。
|- README.md # 项目说明。
```

## 前端其他资源
- [新人指南](http://wiki.inkept.cn/pages/viewpage.action?pageId=12583447)
- [新人指南](http://wiki.inkept.cn/pages/viewpage.action?pageId=12584422)
- [前端项目汇总](http://wiki.inkept.cn/pages/viewpage.action?pageId=17976184)
- [通用仓库集](https://code.inke.cn/opd/fe-aws)



## 客户端内h5参数相关
- 针对ios的全面屏手机在直播间内弹窗蒙层无法全屏遮盖的问题，在h5的url后面拼接isWebFullScreen=true即可。 
  [相关wiki]：(https://wiki.inkept.cn/pages/viewpage.action?pageId=71895460)
