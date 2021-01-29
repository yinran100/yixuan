/* eslint-disable camelcase */
import * as actionTypes from './actionTypes'
import API from '../apis'
import actionCreator from './action-creator'

export const saveUserInfo = actionCreator(actionTypes.USER_INFO)

export const setModalVisible = actionCreator(actionTypes.MODAL_VISIBLE)

export const getRoomInfo = params => async (dispatch, getState) => {
  const {
    reducers: { user_id }
  } = getState()
  const { data } = await API.getLiveRoomInfo({ user_id, ...params })
  console.log('用户信息=>', data)
  dispatch(saveUserInfo(data))
}
