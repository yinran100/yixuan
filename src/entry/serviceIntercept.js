import axios from 'axios'
import axiosService from 'axios-service'
import $loading from 'components/loading'
import { compose } from 'redux'

const TIME_OUT = 10000

axiosService.init(axios, {
  // 基础设置
  defaults: {
    withCredentials: true
  },
  requestDefaults: {
    // response.data 下面的配置
    // server 端请求信息 key
    msgKey: 'error_msg',
    // server 端请求数据 key
    dataKey: 'data',
    // server 端请求状态 key
    codeKey: 'dm_error',
    // server 端请求成功的状态，注意：此为 response.data 下该接口请求成功的状态码，非浏览器中 http 请求返回的成功状态（200）
    successCode: 0
  }
})

// 超时时间
axios.defaults.timeout = TIME_OUT

const errorLoadingHandle = error => {
  $loading.hide()
  return error
}

const enhanceErrorMsg = (message, config = {}) => `message: ${message}; params: ${JSON.stringify(config.params)}; data: ${JSON.stringify(config.data)}`

/**
 * 手动对api请求失败进行上报, 并将报错信息变的更详细
 * 所以统一走arms自带的接口上报, 这里不做错误处理, 同时避免多次上报, 在业务逻辑里和parseResponse自己处理
 *
 * @param {Object} error axios返回的Error信息
 */
const blReport = error => {
  let config
  if (window.__ikBl && error && (config = error.config)) {
    window.__ikBl.invoke('api', config.url, false, config.timeout || 0, -1, enhanceErrorMsg(error.message, error.config))
  }
  return error
}

const createComposedRejectHanlder = (...funcs) => compose(Promise.reject.bind(Promise), ...funcs)

const requestErrorHandler = createComposedRejectHanlder(errorLoadingHandle)

const responseErrorHandler = createComposedRejectHanlder(errorLoadingHandle)

axios.interceptors.request.use(config => {
  config.params = {
    ...config.params,
    _t: Date.now()
  }

  if (config.autoLoading !== void 0) {
    console.warn('🚫axios的拦截器不再根据config.autoLoading字段控制是否使用通用loading效果，新的推荐用法请参考decorator/index.js的setLoadingWrapper和setProtectLoading装饰器方法')
  }

  return config
}, requestErrorHandler)

axios.interceptors.response.use(config => {
  return config
}, responseErrorHandler)
