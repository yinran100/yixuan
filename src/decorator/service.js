import { getMessageDecorate, serviceHocs } from 'axios-service'
import createDecorator from '@inkefe/create-decorator'
import { showModalAlert, showToastInfo } from 'entry/unprerender-ui'
import { createErrorMessageDecorator, commonAtom, activityAtom } from './service-assister'
import utils, { deprecatedWrapper, noop, getSingleton } from '@utils'
import { compose } from 'redux'

// 旧的api兼容, 这里全部标志为废弃的
export {
  setAtomParamsWapper,
  inkeLoginApiWrapper,
  inkeLoginApiWrapperNoTransfrom,
  setInkeLoginAtomParamsWrapper,
} from './service-assister'

if (!getMessageDecorate) {
  console.warn('请按照package.json制定版本, 升级axios-service, 命令: npm install axios-service or yarn add axios-service')
}

const { getErrorMsg, setDataDecorate, setParamsDecorate } = serviceHocs

// ** decorators **

/**
 * 内置了Toast.info 弹窗的 messageDecorator
 *
 * class A {
 *   @messageToastDecorate({ errorMsg: getErrorMsg('服务器开小差了，请稍后再试') })
 *   request = get('path')
 * }
 */
export const messageToastDecorate = createErrorMessageDecorator(showToastInfo)

/**
 * 内置了Modal.alert 弹窗的 messageDecorator
 *
 * class A {
 *   @messageModalDecorate({ errorMsg: getErrorMsg('服务器开小差了，请稍后再试') })
 *   request = get('path')
 * }
 *
 * or
 *
 * const requestFailMsgDecorator = messageModalDecorate({ errorMsg: getErrorMsg('服务器开小差了，请稍后再试') })
 * class A {
 *   @requestFailMsgDecorator
 *   request = get('path')
 * }
 */
export const messageModalDecorate = createErrorMessageDecorator(showModalAlert)

/**
 * 消息装饰器
 *
 * @example
 *
 * before:
 * class Api {
 *  requestAAA = get('api/requestAAA')
 * }
 *
 * try {
 *   const { data } = await api.requestAAA()
 * } catch (e) {
 *   Toast.info(error && error.msg || '请求失败请重试')
 * }
 *
 * now:
 * class Api {
 *  @messageDecorator({ successMsg: '获取用户信息请求成功', errorMsg: getErrorMsg('请求失败请重试') })
 *  requestAAA = get('api/requestAAA')
 * }
 *
 * const { data } = await api.requestAAA()
 *
 * *优点* 当同一个接口被使用多次, 相同的逻辑`try catch 和 Toast.info(error && error.msg || '请求失败请重试')`不用写多次
 *
 * *注意* 这里的`getMessageDecorate({ success: showToast, error: showToast })`是个使用案例, 如果该业务的toast样式需要自定义, 那就在该项目apis中重新生成一个装饰器即可
 *
 * *更多详细案例请参考* https://github.com/libaoxu/axios-service#%E6%B6%88%E6%81%AF%E8%A3%85%E9%A5%B0%E5%99%A8
 */
export const messageDecorate = getMessageDecorate({
  success: showToastInfo,
  error: showToastInfo
})

export const messageDeocator = messageDecorate // spell fix

export const messageDecorator = messageDecorate // spell fix

/**
 * 通用错误弹窗Modal装饰器
 * @example
 * @important and high frequency use
 * class A {
 *   @requestFailMsgDecorator
 *   getInfo = get('user/info')
 * }
 */
export const requestFailMsgDecorator = messageModalDecorate({ errorMsg: getErrorMsg('服务器开小差了，请稍后再试') })

/**
 * 之前暴露了这个名字, 这里保持旧的引用不变, 这个装饰器是请求错误的, 是通用的, 怎么能叫activity呢?
 * @deprecated
 */
export const activityDecorator = deprecatedWrapper('activityDecorator', '名字不对, 请使用: `requestFailMsgDecorator`')(requestFailMsgDecorator)

/**
 * 因为createDecorator创造出的装饰器仍然可以当做高阶函数来用, 所以setDataDecorate和setParamsDecorate 还可以使用compose, 详见: https://github.com/inkefe/create-decorator#%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3
 * 其中内置了uid和sid, 其他的再扩展
 * @param {Object} customAtom 自定义原子参数数据
 *
 * class A {
 *   @getAtomDecorator({ xid: 123 })
 *   getInfo = get('user/info')
 * }
 */
export const getAtomDecorator = customAtom => {
  const mergedAtom = { ...commonAtom, ...customAtom }
  return createDecorator(
    compose(
      setDataDecorate(mergedAtom),
      setParamsDecorate(mergedAtom)
    )
  )
}

/**
 * 映客通用原子参数装饰器, 只注入了: uid和sid, 如果自行调用`getAtomDecorator`来扩展
 * get请求 会注入到 query string上
 * post请求 会注入到 body上
 *
 * @important and high frequency use
 * @example
 * class A {
 *  @commonAtomDecorator
 *  getInfo = get('user/info')
 * }
 */
export const commonAtomDecorator = getAtomDecorator(commonAtom)

/**
 * 映客活动专用原子参数装饰器, 包含: uid, sid, aid(publisher)
 * get请求 会注入到 query string上
 * post请求 会注入到 body上
 *
 * @example
 * @deprecated 因为现在aid很多场景是异步获取, 所以这个同步的基本就没有应用场景了
 * class A {
 *  @activityAtomDecorator
 *  getInfo = get('user/info')
 * }
 */
export const activityAtomDecorator = getAtomDecorator(activityAtom)

/**
 * 获取异步原子参数注入的装饰器创造器
 * @param {Promise} atomPromise 一个promise对象, 返回值是新的atom对象
 * @param {Object} baseAtom 基础的atom原子参数, 包括: uid, sid
 */
export const getAsyncAtomDecorate = (atomPromise, baseAtom) => {
  /**
   * @param {Function} transformAtom atom对象转换器, 方便扩展用
   * @return {Decorator} 可用的装饰器
   */
  return (transformAtom = noop) => createDecorator(fn => {
    const getReqeust = getSingleton(data => getAtomDecorator(data)(fn))
    let atom
    return (...args) => {
      return atomPromise.then && atomPromise.then((asyncAtom) => {
        atom = atom || transformAtom({ ...baseAtom, ...asyncAtom })
        return getReqeust(atom)(...args)
      })
    }
  })
}

/**
 * 异步原子参数注入的装饰器的创造器
 * @param {Function} transformAtom 原子参数转换器, 默认可以什么都不传
 * 使用场景: 需要在直播间内打开 & 依赖主播uid情况, 如果仅是用户uid就能完成的事, 用这个会浪费性能
 *
 * @important and high frequency use
 * @example
 * class A {
 *   // 走自定义atom
 *   @asyncAtomDecorate(atom => ({ ...atom, [${toServerKey}]: atom[${originKey}] }))
 *   getInfo = get('user/info')
 * }
 *
 * or
 *
 * class A {
 *   // 这样走默认atom配置, 注入的key为: uid, sid, anchor_id
 *   @asyncAtomDecorate()
 *   getInfo = get('user/info')
 * }
 */
export const asyncAtomDecorate = getAsyncAtomDecorate(new Promise((resolve) => {
  setTimeout(() => {
    resolve({ anchor_id: 'im a async anchor_id' })
  }, 2000);
}), commonAtom)

/**
 * 异步原子参数注入的装饰器, 注入的key为: uid, sid, anchor_id
 * @important and high frequency  use
 * @example
 * class A {
 *   @asyncAtomDecorator
 *   getInfo = get('user/info')
 * }
 */
export const asyncAtomDecorator = asyncAtomDecorate()
