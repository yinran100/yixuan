/**
 * 全局loading效果
 *
 * @example
 *
 * import loading from 'components/loading'
 * loading.show()
 * loading.hide()
 */

import { LoadingView } from './Loading'
import LoadingManager from './loading-manager';

const loadingManager = new LoadingManager()
const DEFAULT_TIMEOUT = 5000
const MIN_TIMEOUT = 300
let canHide = true
let timer = null
let timer2 = null

const show = (props) => {
  const timeout = (props && props.timeout !== undefined) ? props.timeout : DEFAULT_TIMEOUT

  loadingManager.show()
  LoadingView.show(props)
  console.log(timer, timer2, timeout);
  canHide = false
  if (timer2) {
    clearTimeout(timer2)
    timer2 = null
  }
  timer2 = setTimeout(() => {
    if (canHide) hide()
    canHide = true
    timer2 = null
  }, MIN_TIMEOUT)

  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  if (timeout && typeof timeout === 'number') {
    // 超时保护
    timer = setTimeout(() => {
      console.log('超时', timeout);
      if (!loadingManager.isQueueClear) {
        loadingManager.clearQueue()
        LoadingView.hide()
      }
      timer = null
    }, timeout)
  }
}

const hide = () => {
  if (!canHide) return (canHide = true)
  loadingManager.hide()
  if (loadingManager.isQueueClear) {
    LoadingView.hide()
  }
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

export default {
  show,
  hide
}
