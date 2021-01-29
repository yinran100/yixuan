/* eslint-disable standard/no-callback-literal */
import * as actions from '../constants/action-types'

const ns = '[bridge-core-mock] '

export default {
  callHandler (key, data, cb) {
    switch (key) {
      case actions.SET_BG_COLOR:
        cb(`${ns} ${actions.SET_BG_COLOR} 设置成功`)
        break
      default:
        break
    }
  },
  registerHandler (key, data, cb) {

  }
}
