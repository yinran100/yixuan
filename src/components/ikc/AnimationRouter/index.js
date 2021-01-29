import React, { Suspense, useEffect, useRef } from 'react'
import utils from 'utils'
import dom from 'utils/dom'
import { Switch } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import './transform.less';

// 方便给页面跳转增加路由动画，用法参考pages/demo/router/index.js
let needAnimation = true // 控制滑动自带动画冲突
const delayReset = () => { // 延后重置控制参数
  setTimeout(() => {
    needAnimation = true
  }, 16)
}
window.addEventListener('touchstart', e => {
  needAnimation = true
})
window.addEventListener('touchmove', e => {
  needAnimation = false
})
window.addEventListener('touchend', delayReset)

const routerStack = (utils.getLocalData('ROUTER_STACK', true) || '').split(',').filter(Boolean) // 路由堆栈记录
const getClassName = location => {
  if (!needAnimation) return ''
  const pathname = location.pathname.split('?')[0] // 防止？参数影响匹配
  const index = routerStack.lastIndexOf(pathname) // 这里要找出现的最后一条记录
  if (index >= 0 && routerStack.length - 1 === index) return 'forward' // 重复打开同样的路由不增加记录
  const isLastRoute = index >= 0 && index === routerStack.length - 2 // 存在且是上一页
  const className = isLastRoute ? 'back' : 'forward'
  if (isLastRoute) routerStack.pop()
  else routerStack.push(pathname)
  utils.saveLocalData('ROUTER_STACK', routerStack.join(), true) // 更改后随时保存
  return className
}
// 给Dom添加appear类，300ms后去掉
const appearDom = node => {
  dom.addClass(node, 'appear')
  setTimeout(function() { dom.removeClass(node, 'appear') }, 300)
}

// 监听_temp容器的子元素变化
const mo = new MutationObserver(function(mutations) {
  mutations.forEach(function(record) {
    if (record.type === 'childList') { // record.addedNodes.forEach(appearDom)
      return record.addedNodes.forEach(appearDom)
    }
  });
});
// 增加页面出现的动画
const addListener = () => {
  mo.disconnect()
  const temps = document.getElementsByClassName('_temp')
  if (temps.length === 1) {
    return appearDom(temps[0])
  }
  temps.forEach(node => mo.observe(node, { childList: true }))
}

/**
 * 带有左右进出场动画的页面路由组件
 * @description 解决了路由层级判断和与手机手势冲突的问题，解决懒加载的动画问题，带有简单的页面显示动效
 * @usage 在Router和Route之间，传入fallback作为Suspense的fallback
*/
const AnimationRouter = ({ location, children, fallback }) => {
  const tempRef = useRef();
  const classNames = getClassName(location)
  delayReset() // 防止某些浏览器不触发touchend
  useEffect(function() {
    mo.observe(tempRef.current, { childList: true })
  }, [])
  return <TransitionGroup component={null} childFactory={child => React.cloneElement(
    child,
    { classNames }
  )}>
    <CSSTransition key={location.pathname} timeout={300} onEnter={addListener} appear>
      <div className="_temp" ref={tempRef} style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={fallback}>
          <Switch location={location}>
            {children}
          </Switch>
        </Suspense>
      </div>
    </CSSTransition>
  </TransitionGroup>
}

export default AnimationRouter
