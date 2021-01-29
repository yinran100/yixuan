/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { createBrowserHistory } from 'history'
import { Icon } from 'antd-mobile'
import $bridge from 'bridgex'

import './index.less'

const history = createBrowserHistory();
let classPrefix = 'ik-nav-bar'
const cx = c => `${classPrefix}-${c}`

let outerSetTitle = () => {}
Object.defineProperty(document, 'title', { // 响应式同步更改文档的title
  get: () => document.getElementsByTagName('title')[0].innerText,
  set: value => {
    outerSetTitle(value)
    document.getElementsByTagName('title')[0].innerText = value;
  }
})
const handleBack = () => {
  // console.log('goBack', history)
  let url = window.location.href
  history.goBack()
  setTimeout(() => {
    // console.log(window.location.href === url, url)
    if (window.location.href === url) $bridge.close() // 需要bridge实现功能
  }, 100)
}

// 自定义导航栏的组件，回退调用history的goback，若url没有变化，则调用bridge的关闭页面，组件顶部高度150
const NavBar = memo(({ title, color = '#000', bgColor = '#fff', customClass, rightNode, customStyle = {}, children }) => {
  customClass && (classPrefix = customClass)
  const [newTitle, setTitle] = useState('')
  document.body.style.overflow = 'hidden'
  useEffect(() => {
    setTimeout(() => {
      setTitle(title || document.title)
    }, 100);
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
  outerSetTitle = value => setTitle(value || title || document.title)

  return <div className={classPrefix} >
    <div className={cx('panel')} style={{ color, backgroundColor: bgColor, ...customStyle }}>
      <Icon size="md" type="left" className={cx('left')} onClick={handleBack} />
      <div className={cx('title')}>{newTitle}</div>
      <div className={cx('right')}>{rightNode}</div>
    </div>
    <div className={cx('content')}>{
      children
    }</div>
  </div>
})

NavBar.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  color: PropTypes.string,
  bgColor: PropTypes.string,
  customClass: PropTypes.string,
  customStyle: PropTypes.object,
  rightNode: PropTypes.oneOfType([PropTypes.node, PropTypes.string])
}

NavBar.defaultProps = {
  color: '',
  bgColor: '',
  customClass: '',
  rightNode: '',
  customStyle: {}
}

export default NavBar
