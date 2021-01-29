import { serviceHocs, getMessageDecorator } from 'axios-service'
import { showModalAlert, showToastInfo } from 'entry/unprerender-ui'
import { INKE_COMMON_RESPONSE_KEYS } from '@config/constants'
import utils, { noop, deprecatedWrapper } from '@utils'
import { compose } from 'redux'

if (serviceHocs === undefined) {
  console.warn(
    `[axios-service]版本过低, 请升级到最新版: npm update axios-service`
  )
}

/**
 * getErrorMsg, setCustomParamsWrapper, setCustomDataWrapper 都是 requestPahWrapper 装饰器
 * 使用参考: https://github.com/libaoxu/axios-service/blob/v1.3.3/src/service-decorators.js#L109
 */
export const { getErrorMsg, requestOptsWrapper, setCustomParamsWrapper, setCustomDataWrapper } = serviceHocs

/**
 * 内部包含了映客通用responseKey
 * @example
 * const { get: baseGet, post: basePost } = getRequestsByRoot({ root: apiRoots.service })
 * before:
 * const get = requestOptsWrapper(baseGet, inkeCommonResponseKeys)
 * const post = requestOptsWrapper(basePost, inkeCommonResponseKeys)
 *
 * after:
 * const get = inkeCommonRequestWrapper(baseGet)
 * const post = inkeCommonRequestWrapper(basePost)
 */
export const inkeCommonRequestWrapper = requestWithRoot => requestOptsWrapper(requestWithRoot, INKE_COMMON_RESPONSE_KEYS)

/**
 * errorMsg 消息高阶函数, 针对绝大多数 error
 * @param {String} msg 预置消息
 *
 * @example
 * class Api {
 *  @messageDecorator({ errorMsg: getErrorMsg('请求失败请重试') })
 *  requestAAA = get('api/requestAAA')
 * }
 *
 * or
 *
 * class Api {
 *  @messageDecorator({ errorMsg: requestFailErrMsg})
 *  requestAAA = get('api/requestAAA')
 * }
 */

/**
 * 接口请求失败中, 使用 '请求失败, 请重试~' 文案的装饰器
 * @example
 * class Api {
 *  @messageDecorator({ errorMsg: requestFailErrMsg})
 *  requestAAA = get('api/requestAAA')
 * }
 */
export const requestFailErrMsg = getErrorMsg('请求失败, 请重试~')

/**
 * 接口请求失败中, 使用 '网络连接失败, 请重试~' 文案的装饰器
 * @example
 * class Api {
 *  @messageDecorator({ errorMsg: noNetworkErrMsg})
 *  requestAAA = get('api/requestAAA')
 * }
 */
export const noNetworkErrMsg = getErrorMsg('网络连接失败, 请重试~')

// 创建通用错误类提示装饰器(C端大多数是错误才提示 正确不需要提示)
export const createErrorMessageDecorator = fn => getMessageDecorator({ error: fn, success: noop })

// 获取原子参数对象
const atom = utils.getUrlParams()

/**
 * @name 灵活获取原子参数对象的键值对 比如我只需要 uid pid useid等等
 * @param { Array }
 */
export const getCustomAtom = atomKeys =>
  atomKeys.length
    ? atomKeys.reduce((res, key) => {
      if (atom.hasOwnProperty(key)) {
        res[key] = atom[key]
      }
      return res
    }, {})
    : atom

/**
 * @name 原子参数和请求参数拼接路径装饰器
 * @param fn {Function} axios-service 的 getRequestsByRoot 产出的requestPathWrapper函数, 如get, post
 * @param atomKeys {Array} 自定义原子参数的[key]
 * @param transfer {Function} 转换函数
 *
 * @example
 * const customAtomKeys = ['uid', 'sid', 'publisher']
 *
 * // 特殊具体业务处理拓展 比如publisher无值 customAtom.aid = customAtom.uid
 * const transformAid = customAtom => {
 *   if (!customAtom.publisher) {
 *     customAtom.aid = customAtom.uid
 *   }
 *   return customAtom
 * }
 * const postWithAtomAll = setAtomParamsWapper(post)
 * const getWithAtomAll = setAtomParamsWapper(get)
 * // 特定原子参数配置
 * const postWithAtomCustom = setAtomParamsWapper(post, customAtomKeys, transformAid)
 *
 *
 * class Apis {
 *  getA = getWithAtomAll('/api/getA')
 *  postB = postWithAtomAll('/api/postB')
 *  customC = postWithAtomCustom('/api/customC')
 * }
 */
export const setAtomParamsWapper = compose(
  deprecatedWrapper('setAtomParamsWapper', 'https://github.com/libaoxu/axios-service#%E6%9B%B4%E5%A4%9A%E8%A3%85%E9%A5%B0%E5%99%A8'),
  (fn, atomKeys = [], transfer = _ => _) => {
    const customAtom = transfer(getCustomAtom(atomKeys))
    return setCustomParamsWrapper(fn, customAtom)
  }
)

// 活动业务通用参数转换规则 tip: publisher => aid
const transformAid = customAtom => {
  if (!customAtom.publisher) {
    customAtom.aid = customAtom.uid
  } else {
    customAtom.aid = customAtom.publisher
  }
  delete customAtom.publisher
  return customAtom
}
export const customActivitysAtomKeys = ['uid', 'sid', 'publisher'] // 活动原子参数
export const customInkeAtomKeys = ['uid', 'sid'] // 通用映客原子参数
// 通用映客原子参数
export const commonAtom = getCustomAtom(customInkeAtomKeys)
// 活动专用原子参数
export const activityAtom = transformAid(getCustomAtom(customActivitysAtomKeys))

/**
 * uid, sid的注入
 * @deprecated
 */
export const setInkeLoginAtomParamsWrapper = compose(
  deprecatedWrapper('setInkeLoginAtomParamsWrapper', 'src/decorator/service.js 中 `commonAtomDecorator`用法'),
  fn => setCustomParamsWrapper(fn, customInkeAtomKeys)
)

/**
 * 活动用高阶函数合并(旧), 包括uid, sid, aid的注入
 * @deprecated
 */
export const inkeLoginApiWrapper = compose(
  deprecatedWrapper('inkeLoginApiWrapper', 'src/decorator/service.js 中 `activityAtomDecorator`用法'),
  fn => setAtomParamsWapper(fn, customActivitysAtomKeys, transformAid), // 参数注入
  fn => requestOptsWrapper(fn, INKE_COMMON_RESPONSE_KEYS) // codeKey注入
)

/**
 * 活动用高阶函数合并(临时)
 * @deprecated
 */
export const inkeLoginApiWrapperNoTransfrom = compose(
  deprecatedWrapper('inkeLoginApiWrapperNoTransfrom', 'src/decorator/service.js 中 `asyncAtomDecorator`用法'),
  fn => setAtomParamsWapper(fn, customInkeAtomKeys), // 参数注入
  fn => requestOptsWrapper(fn, INKE_COMMON_RESPONSE_KEYS) // codeKey注入
)
