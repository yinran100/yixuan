// import React from 'react'
import { wxApiProxy } from 'ik-weixin'
import utils from 'utils'
import $loading from 'components/loading'
import { Toast, Modal } from './unprerender-ui'
import { escapeWhenPrerendering } from '../config';

/**
 * 统一在 $loading.hide 这里做拦截, 保证预渲染时候 hide 失效, 页面始终有 loading
 */
const _loadingHide = $loading.hide;
try {
  Object.defineProperty($loading, 'hide', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: escapeWhenPrerendering(_loadingHide)
  })
} catch (e) {
  console.log(e);
}

const staicMixMap = {
  // 用户
  // $user,

  // lib
  $common: utils,
  $utils: utils,

  // ui
  $loading,
  // $lessVar,
  // $message: Feedback.toast,
  // $toast: Feedback.toast,
  // $notification: Notification,
  $toast: Toast,
  $modal: Modal,

  $wx: wxApiProxy

}

const setProperty = (source, key, val) => {
  if (source[key]) {
    setProperty(source, `_${key}`, val)
  } else {
    source[key] = val
  }
}

const mix = (source, mixMap) => {
  /* eslint-disable-next-line array-callback-return */
  Object.keys(mixMap).map(key => {
    const val = mixMap[key]
    setProperty(source, key, val)
    setProperty(source.prototype, key, val)
  })
}

export default (source, more = {}) => {
  mix(source, {
    ...staicMixMap,
    ...more,
  })

  // userPromise.then(data => {
  //   mix(source, { $userInfo: $user.get() });
  // })
}
