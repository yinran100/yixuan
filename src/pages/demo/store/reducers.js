/* eslint-disable camelcase */
import * as actionTypes from './actionTypes'
import $utils from 'utils'
const { userId = '', user_id = '' } = $utils.getUrlParams()
const initialState = {
  modalVisible: false, // 弹窗控制
  user_id, // 房主uid
  userId, // 直播ID
  userInfo: {
    nick: 'lizh'
  },
  isLiveEnd: false, // 是否关播
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case actionTypes.USER_INFO:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          ...payload
        }
      }
    case actionTypes.SET_LIVE_END:
      return {
        ...state,
        isLiveEnd: !!payload
      }
    case actionTypes.MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: !!payload
      }
    default:
      return state
  }
}
