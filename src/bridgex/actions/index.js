/**
 * bridge-core 是基于 webviewJavaScriptBridge 通信方案, 支持从bridge-core做二次扩展
 * bridge-core详见: https://code.inke.cn/opd/fe-aws/modules/ik-bridgex/blob/master/src/bridge-core.js
 * 二次扩展参考案例: https://code.inke.cn/opd/fe-aws/modules/ik-bridgex/blob/master/src/actions/index.js
 *
 * 内置通信方案: 吊起 native 充值页面, 设置sonic webview背景颜色, 关闭大厅webview等
 */
import { bridgeCore } from 'ik-bridgex';
import { ACTION_DEMO } from '../constants'

const { registerHandler, callHandler } = bridgeCore

// eslint-disable-next-line import/export
export * from './postmessage'

/**
 * 与native实时通信
 * @param {Function} callback
 */
const registerHandlerCreator = type => (...args) => registerHandler(type, ...args)

/**
 * 一次性通信native
 * @param {Object} data
 * @param {Function} callback
 */
const callHandlerCreator = type => (...args) => callHandler(type, ...args)

/**
 * 外层不需要考虑data, data固定是null
 * @param {Function} callback
 */
const noDataCallHandlerCreator = type => (...args) => callHandler(type, null, ...args)

// demo
export const actionDemo = callHandlerCreator(ACTION_DEMO)
