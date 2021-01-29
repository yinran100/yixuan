/**
 * 规范文档
 * @description http://wiki.inkept.cn/pages/viewpage.action?pageId=17972981
 *
 * 注意: 每个页面 entry 时候需要进行初始化一下, 并传入两个参数 后面的按钮统计需要这两个参数
 *
 * @example src/pages/banner/201712/inke-music/index.js
 */
import srcConfig from 'src/config'
import $utils from 'utils'
import _omit from 'lodash/omit'
import axios from 'axios'

const location = window.location
const _origin = location.origin
const _pathname = location.pathname
const reportUrl = '//webclick.busi.inke.cn/web/click_report'

const instance = axios.create({
  timeout: 500
})

const createHeadRequrest = (innerOpts, options = {}) => {
  if (process.env.NODE_ENV === 'production') {
    const url = reportUrl + '?' + $utils.stringifyParams(innerOpts)
    return instance({
      method: 'head',
      url,
      ...(options || {})
    }).catch(_ => {})
  } else {
    console.warn('[log mock] 将上报如下信息：')
    console.log(innerOpts)
    return Promise.resolve(innerOpts)
  }
}

let fromKeys = [
  { key: 'banner', label: 'Banner' },
  { key: 'screen', label: '闪屏' },
  { key: 'msg', label: '私信' },
  { key: 'icon', label: '直播间浮窗' },
  { key: 'task', label: '活动中心' },
  { key: 'sidecard', label: '直播间第三屏' },
  { key: 'push', label: 'Push' },
  { key: 'hallhot', label: '首页弹窗' },
  { key: 'other', label: '站外' },
  { key: 'room_msg', label: '房间消息' },
  { key: 'me', label: '我的页选项' },
  { key: 'plugin', label: '直播间插件入口' },
  { key: 'find', label: '发现页' },
  { key: 'giftwall', label: '礼物墙banner' },
  { key: 'broadcast', label: '广播页面' }
]

export const setFromKeysWithClear = (newKeys) => {
  fromKeys = []
  setFromKeys(newKeys)
}

export const setFromKeys = (newKeys) => {
  fromKeys = [...fromKeys, ...newKeys]
}

/**
 * 基础参数, url中有就从url中获取, 否则需要在页面入口页(index.js)注册一下
 */
let baseOptions = {
  inkewid: $utils.getUrlQuery('inkewid') || '',
  inkewname: $utils.getUrlQuery('inkewname') || '',
  from: $utils.getUrlQuery('from') || '',
}

/**
 * 设置logx基础内容
 *
 * @param {Object} newOptions
 * @param {String} newOptions.inkewbid 具体某个页面的id
 * @param {String} newOptions.inkewbname 具体某个页面的名称
 * @example $logx.setBaseOptions({ inkewbid, inkewbname })
 */
export const setBaseOptions = function (newOptions = baseOptions) {
  let {
    inkewid = baseOptions.inkewid,
    inkewname = baseOptions.inkewname
  } = newOptions

  baseOptions = {
    ...baseOptions,
    inkewid,
    inkewname
  }
}

/**
 * 获取统计的url
 * @param {Object} newOptions 该对象包含了其他需要放到url中的参数, 如 from 等
 * @example getWebStatisticUrl({ from: 'other' })
 */
export const getWebStatisticUrl = function (newOptions = {},
  { origin = _origin, pathname = _pathname } = { origin: _origin, pathname: _pathname }
) {
  let shareUid = $utils.getUrlQuery('uid')
  let innerOpts = {
    from: newOptions.from || baseOptions.from,
    inkewtype: 'web',
    ..._omit(baseOptions, 'from'),
    ...(shareUid ? { share_uid: shareUid } : {}),
    ..._omit(newOptions, 'from'),
  }

  if (!innerOpts.inkewid || !innerOpts.inkewname) {
    console.warn('缺少[inkewbid] 和 [inkewname], 将导致pv、uv统计失效')
  }
  return `${origin}${pathname}?${$utils.stringifyParams(innerOpts)}`
}

/**
 * 获取其他入口页面的url，需要手动输入其他页面的inkewid和inkewname
 * @param {object} options
 * @param {object} origin和pathname
 */
export const getOtherWebStatisticUrl = function (newOptions = {},
  { origin = _origin, pathname = _pathname } = { origin: _origin, pathname: _pathname }
) {
  let innerOpts = {
    from: newOptions.from || baseOptions.from,
    inkewtype: 'web',
    ..._omit(newOptions, 'from'),
  }

  if (!innerOpts.inkewid || !innerOpts.inkewname) {
    console.warn('缺少[inkewbid] 和 [inkewname], 将导致pv、uv统计失效')
  }
  return `${origin}${pathname}?${$utils.stringifyParams(innerOpts)}`
}

/**
 * 返回encode后的getWebStatisticUrl
 * 跳转到APP时（bridge）使用
 */
export const getEncodeURIComponentWebStatisticUrl = function (newOptions = {},
  { origin = _origin, pathname = _pathname } = { origin: _origin, pathname: _pathname }
) {
  return encodeURIComponent(getWebStatisticUrl(newOptions, { origin, pathname }))
}

/**
 * 返回encode后的getWebStatisticUrl
 * 微信分享链接shareOpts使用
 */
export const getEncodeURIWebStatisticUrl = function (newOptions = {},
  { origin = _origin, pathname = _pathname } = { origin: _origin, pathname: _pathname }
) {
  return encodeURI(getWebStatisticUrl(newOptions, { origin, pathname }))
}

/**
 * 批量产生发送给运营的链接, 发送邮件用, 默认会产生线上的链接
 * @param {Object} locations 传入的location
 * @property origin 页面origin: https://boc.inke.cn
 * @property pathname
 *
 * @example
 * 线上: $logx.createFromUrls()
 * 测试: $logx.createFromUrls({ origin: 'https://testboc.inke.cn' })
 */
export const createFromUrls = function (locations, params: {}) {
  return fromKeys.map(item => '  ' + item.label + '：' + getWebStatisticUrl({ from: item.key, ...params }, {
    origin: `https://boc.inke.cn`,
    ...locations
  })).join('\n')
}

/**
 * 按钮点击
 * @example
 * btn_id: 表示体按钮的id
 * btn_name: 表示体按钮的名称
 * $logx.clickReport({
 *   inkewbid: '[btn_id]',
 *   inkewbname: '[btn_name]'
 * })
 */
export const clickReport = function (newOptions) {
  const { inkewbid, inkewbname } = newOptions
  let innerOpts = {
    ...$utils.getUrlParams(),
    ...baseOptions,
    inkewtype: 'btn',
    ...newOptions,
    inkewbid: `${inkewbid}`,
    inkewbname: `${inkewbname}`,
  }

  createHeadRequrest(innerOpts)
}

/**
 * 因客户端原因, 有时候url中不能拼接正确参数, 所以通过发送report, 模拟页面entry的统计,
 * 注: inkewtype: 'web'
 * @example
 * web_id: 具体某个页面的id
 * web_name: 具体某个页面的名称
 * $logx.webReport({
 *   inkewbid: '[web_id]',
 *   inkewbname: '[web_name]'
 * })
 */
export const webReport = function (newOptions = { from: 'banner', inkewid: '', inkewname: '' }) {
  let innerOpts = {
    ...$utils.getUrlParams(),
    from: newOptions.from || baseOptions.from,
    inkewtype: 'web',
    ..._omit(baseOptions, 'from'),
    ..._omit(newOptions, 'from'),
  }

  createHeadRequrest(innerOpts)
}

export default {
  webReport,
  clickReport,
  setBaseOptions,
  getWebStatisticUrl,
  getOtherWebStatisticUrl,
  getEncodeURIWebStatisticUrl,
  getEncodeURIComponentWebStatisticUrl,
  createFromUrls,
  setFromKeysWithClear,
  setFromKeys
}
