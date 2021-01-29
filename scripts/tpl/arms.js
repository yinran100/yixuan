const fs = require('fs')
const path = require('path')
const lodash = require('lodash')
const armsBodyFirstStr = fs.readFileSync(path.resolve(__dirname, './armsBodyFirst.ejs'), { encoding: 'utf-8' })
const armsHeadFirstStr = fs.readFileSync(path.resolve(__dirname, './armsHeadFirst.ejs'), { encoding: 'utf-8' })
const noArmsBodyFirst = fs.readFileSync(path.resolve(__dirname, './noArmsBodyFirst.ejs'), { encoding: 'utf-8' })

const { objToString } = require('../utils/objToString')

const GRAY_PID = 'a1usb033ta@abd3aa2f5add9e9'
const DEFAULT_PID = 'a1usb033ta@e9021d7af2420de'

/**
 * 合并 ignore 参数
 */
const mergeConfigIgnore = (...args) => {
  const uniq = array => Array.from(new Set(array))
  const merge = (origin, source) => {
    return Object.entries({ ...origin, ...source })
      .map(([key, value]) => [key, uniq([...(origin[key] || []), ...(source[key] || [])])])
      .reduce((prev, curr) => Object.assign({}, prev, { [curr[0]]: curr[1] }), {})
  }
  return args.reduce((prev, curr) => merge(prev, curr), {})
}

// 参数描述 https://help.aliyun.com/document_detail/58655.html#title-ps9-1pa-qg5
const defaultConfig = {
  appType: 'web',
  imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?',
  enableSPA: false,
  disableHook: true,
  useFmp: true,
  sendResource: true,
  parseResponse: function (res) {
    if (!res || typeof res !== 'object') return {};
    var code = res.dm_error !== undefined ? res.dm_error : (res.error_code !== undefined ? res.error_code : (res.code !== undefined ? res.code : 0))
    var msg = res.msg || res.message || res.errorMsg || res.error_msg || '';
    return { msg: msg, code: code, success: true };
  },
  ignore: {
    ignoreApis: [
      'webclick.busi.inke.cn/web/click_report', // 埋点接口地址
    ],
    ignoreUrls: [
      function (str) {
        // 仅在**灰度**和**线上**环境上报监控
        return !/^(beta)?boc.inke.cn/.test(str)
      }
    ],
    ignoreErrors: [
      /ik_share_/,
      /WebViewJavascriptBridge.init called twice/,
      /timeout of \d+ms exceeded/,
      function (str) {
        // 仅线上环境忽略 script error 上报
        return /^boc.inke.cn/.test(window.location.host) && /^Script error\.?$/.test(str)
      }
    ]
  }
}

exports.getNoUseArmsTpl = () => {
  return {
    bodyFirst: noArmsBodyFirst
  }
}

exports.armsTpl = (config = {}) => {
  let pid = config.pid
  delete config.pid
  return {
    headFirst: armsHeadFirstStr,
    bodyFirst: lodash.template(armsBodyFirstStr)({
      config: objToString(
        Object.assign({}, defaultConfig, config, {
          ignore: mergeConfigIgnore(defaultConfig.ignore, config.ignore || {})
        })
      ).slice(1, -1) + `, pid: window.location.host === 'boc.inke.cn' ? ('${pid || DEFAULT_PID}') : '${GRAY_PID}'`
    })
  }
}
