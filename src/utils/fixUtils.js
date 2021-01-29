
// 用于解决常见的兼容性问题的工具方法
import debounce from 'lodash/debounce'
import { Toast } from 'entry/unprerender-ui'
import utils from './index'
import { IS_DEV } from '@config'
const windowHeight = window.innerHeight// 输入框失焦后，上下滚动一像素
// 解决IOS输入框失焦后，页面高度不恢复的问题，输入框失焦后调用
const _fixedInput = () => {
  let windowFocusHeight = window.innerHeight
  let currentPosition;
  let speed = 1; // 页面滚动距离
  currentPosition = document.documentElement.scrollTop || document.body.scrollTop;
  currentPosition -= speed;
  window.scrollTo(0, currentPosition); // 页面向上滚动
  currentPosition += speed; // speed变量
  window.scrollTo(0, currentPosition); // 页面向下滚动
}

export const fixedInput = debounce(_fixedInput, 200)
/**
 * 解决H5可能参数丢失的问题，在每个router的render里执行
 * @param {String, Array} keyParmas 必需的参数字段
 * @param {String} tips 弹窗提示信息
 * @example
 */
// const customParams = utils.getUrlParams()
let modal = null
export const checkParmas = (keyParmas, tips) => {
  if (!keyParmas) return
  const location = window.location
  const currentParams = utils.getUrlParams(`?${utils.getSearch()}`)
  const localParam = utils.getUrlParams()
  let diff = 0
  Array.isArray(keyParmas) || (keyParmas = [keyParmas])
  keyParmas.forEach(key => {
    if (currentParams[key] !== localParam[key]) {
      diff++
    }
  });
  if (diff) {
    console.log('补齐参数')
    window.history.replaceState(null, null,
      `${location.origin}${location.pathname}?${utils.stringifyParams(localParam)}${location.hash}`)
  } else {
    const res = keyParmas.filter(key => !currentParams[key])
    if (res.length > 0) {
      const lastSearch = utils.getSearch(document.referrer)
      console.log('补齐参数', lastSearch)
      if (lastSearch) return location.replace(`${location.origin}${location.pathname}?${lastSearch}${location.hash}`)
      setTimeout(() => {
        modal && modal.close()
        modal = Toast.info(tips || 'url缺少必要参数,请重新进入页面', 2.5, null, false)
        if (!window.fundebug || __DEV__ || location.host.match(/^localhost|^\d+\.\d+/)) return
        window.fundebug.notify('Parmas Error', JSON.stringify({
          keyParmas,
          referrer: document.referrer,
          localParam: JSON.stringify(localParam)
        }));
      }, 100)
    }
  }
}
