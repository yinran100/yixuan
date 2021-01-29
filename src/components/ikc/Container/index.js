import React, { forwardRef, Children, cloneElement, useState } from 'react'
import { setViewport } from '../utils'
import { classFix } from 'utils'
import FixedContainer from './FixedContainer'
import FixedWidget from './FixedWidget'
import './index.less'
import { setThrottle } from '@decorator'

const classPrefix = 'ikc-container'
const cx = classFix(classPrefix)

const RefNode = forwardRef((props, ref) => <div {...props} />);

/**
 * H5页面的容器，始终铺满整个屏幕，监听页面尺寸变化，自动撑满屏幕
 */
class Container extends React.PureComponent {
  state = {
    maxHeight: window.innerHeight,
    widgets: [],
    topContainers: [],
    subContainers: [],
    children: []
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const widgets = []
    const topContainers = []
    const bottomContainers = []
    const children = []
    Children.forEach(nextProps.children, (child, index) => {
      const _proto = Object.getPrototypeOf(child.type || {})
      // If there is no key provide, use the panel order as default key
      const key = child.key || String(index)
      if (_proto === FixedWidget) return widgets.push(React.cloneElement(child, { ...child.props, iscontainer: true, key }))
      if (_proto === FixedContainer) {
        return (child.props.mode === 'top' ? topContainers : bottomContainers).push(React.cloneElement(child, { ...child.props, iscontainer: true, key }))
      }
      children.push(child)
    })
    return {
      widgets,
      topContainers,
      bottomContainers,
      children
    }
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden'
    // document.body.style.touchAction = 'none'
    setViewport('width=device-width,initial-scale=1,maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,viewport-fit=cover') // 不允许用户缩放
    window.addEventListener('resize', this.resizeThrottler, false);
  }

  componentWillUnmount() {
    document.body.style.overflow = ''
    // document.body.style.touchAction = ''
    window.removeEventListener('resize', this.resizeThrottler, false);
  }

  @setThrottle(50)
  resizeThrottler = () => {
    console.log(window.innerHeight);
    this.setState({
      maxHeight: window.innerHeight
    })
  }

  render() {
    const { maxHeight, children, widgets, topContainers, bottomContainers } = this.state
    const { onRef, style = {} } = this.props
    const hasSubComponents = !!(topContainers.length || bottomContainers.length || widgets.length)
    return <div ref={hasSubComponents ? void 0 : onRef} className={classPrefix} style={{
      ...style,
      height: maxHeight,
      // overflow: hasSubComponents ? 'hidden' : '',
    }}>
      {widgets}
      {topContainers}
      <div className={cx('content')} ref={onRef}>
        {children}
      </div>
      {bottomContainers}
    </div>
  }
}
const Con = forwardRef((props, ref) => {
  return <Container {...props} onRef={ref}/>
})
Con.FixedContainer = FixedContainer
Con.FixedWidget = FixedWidget

export default Con
