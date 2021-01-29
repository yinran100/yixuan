import { combineReducers } from 'redux'
import reducers from './reducers'

export default function createReducer (injectedReducers) {
  return combineReducers({
    reducers,
    ...injectedReducers
  })
}
