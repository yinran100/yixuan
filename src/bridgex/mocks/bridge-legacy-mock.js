import * as actionTypes from '../constants/postmessage-action-types'

const ns = '[bridge-legacy-mock] '

export default msg => {
  const { action, data } = JSON.parse(msg)

  switch (action) {
    case actionTypes.SET_TITLE_RIGHT_BUTTON:
      window.setTimeout(() => {
        // 模拟发送支付成功
        window.sendInkeJsInfo({
          action: actionTypes.ON_TITLE_RIGHT_BUTTON_CLICK,
          data: {
            message: `${ns} 设置右上角分享`
          }
        })
      }, 100);
      break;

    default:
      break
  }
}
