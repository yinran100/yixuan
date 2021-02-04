/* eslint-disable no-extend-native */
// import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import $loading from 'components/loading'
import { ErrorBoundary } from 'ikc'
import protoMix from './proto-mix'
import $utils from '../utils'
import '../styles/base.css'

const appContainer = document.getElementById('root')
const IS_DEV = process && process.env.NODE_ENV === 'development'

/**
 * 注意: 只要你的页面有使用loading, 就一定要在具体页面的entry中引入这句话, 谨记, 否则预渲染之后会多个不消失loading
 */
export const loadingUntilFirstContentPaint = () => {
  // $loading.show({ animateName: 'line-scale' })

  // DOMContentLoaded 页面仍然是白的, 这里的200ms是 DOMContentLoaded -> First Contentful Paint 时间预估
  document.addEventListener('load', () => setTimeout($loading.hide, 200))
}

if (__DEV__ && process.env.VCONSOLE) { // 移动端调试
  import('vconsole').then(res => {
    let VConsole = res.default
    let vConsole = new VConsole();
  })
}
$utils.setViewportFit('cover')
export default (App, Opts = {}) => {
  const { store = {} } = Opts

  const mixMap = {
    $store: store
  }

  protoMix(React.Component, mixMap)
  protoMix(React.PureComponent, mixMap)

  const isUseRedux = !$utils.isEmptyObject(store)
  const createApp = () => React.isValidElement(App) ? App : <ErrorBoundary><App /></ErrorBoundary>
  ReactDOM.render(
    isUseRedux ? <Provider store={store}>
      { createApp() }
    </Provider>
      : createApp(),
    appContainer
  )
}
