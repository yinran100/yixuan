import React, { memo, useCallback, useEffect, useState } from 'react'
import { classFix } from 'utils'
import './index.less'

const classPrefix = 'ikc-fixed-container'
const cx = classFix(classPrefix)
/**
 * Wrapper容器里的固定容器，会挤占其他空间，成为独立的一个区域
 * @important 必须作为Container的子元素使用，否则不展示!
 */
class FixedContainer extends React.PureComponent {
  render() {
    const { mode = 'bottom', height, iscontainer, children } = this.props
    return iscontainer ? <div className={`${classPrefix} ${mode === 'top' ? mode : cx('bottom')}`} style={{ height }}>
      {children}
    </div> : null
  }
}

export default FixedContainer
