export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * 预渲染中: 非开发模式 && html中 data-prerendered (预渲染完成) 为false
 */
export const isPrerendering = !IS_DEV && document.documentElement.getAttribute('data-prerendered') === 'false'

/**
 * 这个变量当时声明的时候欠考虑, 应该把时态维护一下, 现在用新的 isPrerendering, isPrerender已弃用
 * @deprecated
 */
export const isPrerender = isPrerendering

/**
 * 预渲染完成
 */
export const isPrerendered = !isPrerendering

/**
 * 在prod模式下, 如果预渲染中, 则禁止执行 toast 或 Modal.alert等内容, 会构建到html中, 影响页面首屏显示, 而且相关js事件已经断开, 页面会无法操作, 禁忌禁忌
 */
export const canExeWhenPrerendering = isPrerendered

/**
 * 旧变量名, 没有时态 已遗弃
 * @deprecated
 */
export const canExeWhenPrerender = canExeWhenPrerendering

/**
 * 因为在构建预渲染时候, 会在node层将html进行解析, 这时候如果接口请求报错, 如果业务逻辑又展示toast这种弹窗的话, 会将toast相关dom打入到构建好html中,
 * 那么线上的html中会带有 toast dom, 影响首屏页面展示不说, 因为预渲染时候打入的toast这些相关dom, 在html打开时候这些dom已经跟js事件断联, 会影响页面操作
 *
 * Modal.alert
 * toast.info
 * 都需要用这个函数装饰一下
 * @example
 * const unPrerenderToastInfo = escapeWhenPrerender(toast.info.bind(toast))
 * const unPrerenderAlert = escapeWhenPrerender(Modal.alert.bind(Modal))
 *
 * unPrerenderToastInfo(...args)
 * unPrerenderAlert(...args)
 */
export function escapeWhenPrerendering(fn, ...preArgs) {
  return function (...extraArgs) {
    // 尽量保证一下this指向不会乱
    return isPrerendered ? fn.call(this, ...preArgs, ...extraArgs) : null
  }
}

/**
 * @deprecated
 */
export const escapeWhenPrerender = escapeWhenPrerendering

export default {
  isPrerender,
  isPrerendering,
  isPrerendered,
  IS_DEV,
}
