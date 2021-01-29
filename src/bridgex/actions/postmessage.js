/**
 * postMessage方案, 支持从bridge-legacy中api做二次扩展
 * bridge-legacy: https://code.inke.cn/opd/fe-aws/modules/ik-bridgex/blob/master/src/bridge-legacy.js
 * 二次扩展参考案例: https://code.inke.cn/opd/fe-aws/modules/ik-bridgex/blob/master/src/actions/postmessage.js
 *
 * 默认提供的能力: 设置webview右上角按钮, 弹出客户端分享弹窗, 调用支付接口的接口, js刷新, 关闭页面
 */
import { bridgeLegacy } from 'ik-bridgex';

const { callPostMessageHandler, onKeepOncePostMessage, onPostMessage } = bridgeLegacy

// export const ...
