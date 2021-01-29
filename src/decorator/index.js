/**
 * @name 通用装饰器集合
 */

import React, { Component } from 'react'
import KeepAlive, { withActivation } from 'react-activation'
import $log from 'utils/log'
import { compose } from 'redux'
import createDecorator from '@inkefe/create-decorator'
import $loading from 'components/loading'
import utils from 'utils';
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

/**
 * @name 埋点装饰器
 * @param {Object} { inkewbid, inkewbname, ...restParams }
 * @author songjf
 * @example
 * @log({ inkewbid: 'test', inkewbname: 'test' })
 * fn = () => {}
 */
export const log = ({ inkewbid, inkewbname, ...restParams }) => createDecorator(fn => (...rest) => {
  if (!inkewbid || !inkewbname) {
    throw new SyntaxError('inkewbid和inkewbname是必须的')
  }

  // 开发模式自动走log mock
  $log.clickReport({
    inkewbid,
    inkewbname,
    ...restParams
  })

  return Reflect.apply(fn, this, rest)
})

/**
 * @name 接口loading装饰器 (不阻止点击事件)
 * @example
 * class Apis {
 *  @setLoadingWrapper
 *  getList = get('ab/cd/ef')
 * }
 */
export const setLoadingWrapper = createDecorator(fn => (...rest) => {
  $loading.show({ timeout: 30000 })
  const apiPromise = fn(...rest)
  apiPromise.finally($loading.hide)
  return apiPromise
})
/**
 * @name 接口loading装饰器 (阻止点击事件, 防止某些请求重复点击)
 * @example
 * class Apis {
 *  @setProtectLoading
 *  getList = get('ab/cd/ef')
 * }
 */
export const setProtectLoading = createDecorator(fn => (...rest) => {
  $loading.show({ isStop: true, timeout: 30000 })
  const apiPromise = fn(...rest)
  apiPromise.finally($loading.hide)
  return apiPromise
})

/**
 * @desc 异步请求函数锁定装饰器，请求未返回结果之前，再次点击不会发请求
 * @example
 * @lockAsyncFunction
 * const onSubscription = async () => {}
 */
export const lockAsyncFunction = createDecorator(utils.lockAsyncFunction);
/**
 * @name 节流函数装饰器
 * @example
 * @setThrottle(500)
 * onScroll = () => {}
 */
export const setThrottle = time => createDecorator(throttle, time)

/**
 * @name 防抖函数装饰器
 * @example
 * @setDebounce(100)
 * onSave = () => {}
 */
export const setDebounce = time => createDecorator(debounce, time)

/**
 * @name 通过react-activation实现的keep-alive,必须包裹在AliveScope里,注入生命周期函数componentDidActivate和componentWillUnactivate
 * @description 详情参考 https://github.com/CJY0208/react-activation/blob/master/README_CN.md
 * @example
 * @createKeepAlive
 * class Apis from React.Component {
 *  componentDidActivate() {}
 *  componentWillUnactivate() {}
 * }
 * @remark 如果只是想给内部组件注入这两个生命周期，用react-activation提供的withActivation装饰器就行了,chrome版本低于44的安卓不支持
 */
const isSupport = (() => { // chrome版本低于44的安卓不支持
  if (utils.ua.ios) return true
  const uaInfo = navigator.userAgent.match(/[^(\s]+(\s\([^)]+\))?/g)
  const chromeInfo = uaInfo.find(item => item.match(/^chrome\//i))
  if (!chromeInfo) return true
  const chromeVersion = chromeInfo.split('/')[1]
  return chromeVersion.split('.')[0] >= 44
})()
export const createKeepAlive = compose(
  Com => props => isSupport ? <KeepAlive >
    <Com {...props}/>
  </KeepAlive> : <Com {...props}/>,
  withActivation
)
