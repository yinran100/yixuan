import { Toast as antToast, Modal as antModal } from 'antd-mobile'
import { escapeWhenPrerendering } from '../config';

/**
 * 这样经过转换后的函数直接调用, 不需要关注是否预渲染
 */
const unPrerenderFormat = obj => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      if (typeof value === 'function') {
        // 故意通过地址引用的方式, 不能破坏原有对象的类型和其他属性的引用
        obj[key] = escapeWhenPrerendering(value)
      }
    }
  }
  return obj
}

export const Toast = unPrerenderFormat(antToast)

export const Modal = unPrerenderFormat(antModal)

// 将常用的函数直接暴露出来, 业务里直接用了
export const showModalAlert = Modal.alert.bind(Modal)
export const showToastInfo = Toast.info.bind(Toast)
