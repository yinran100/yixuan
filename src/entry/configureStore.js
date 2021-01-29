import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

// 这里注释掉了，全局reducer
// import createReducer from './reducers'

export default (createReducer) => {
  const middlewares = [thunk]

  const enhancers = [applyMiddleware(...middlewares)]

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        shouldHotReload: false,
      })
      : compose
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    composeEnhancers(...enhancers)
  )
  return store
}
