
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../store/actions'
// 用于将store里的所有导出的action和reducer注入组件中，可直接调用和获取redux里的值
export const connectEntire = (reducer = 'reducers') => target =>
  connect(
    state => ({ ...state[reducer] }),
    dispatch => ({ ...bindActionCreators(actions, dispatch) })
  )(target)
