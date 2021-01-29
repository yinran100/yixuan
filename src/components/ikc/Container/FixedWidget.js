import React, { memo, useCallback, useEffect, useState } from 'react'
import './index.less'

const classPrefix = 'ikc-fixed-widget'
/**
 * Wrapper容器里的固定挂件容器，不会挤占其他空间，会遮挡Wrapper容器里内容
 * @important 必须作为Container的子元素使用，否则不展示!
 */
class FixedWidget extends React.PureComponent {
  render() {
    let { top, right, left, bottom, iscontainer, children } = this.props
    if (top === void 0 && left === void 0) top = 0
    if (left === void 0 && right === void 0) left = 0
    return iscontainer ? <div className={classPrefix} style={{ top, right, left, bottom }}>
      {children}
    </div> : null
  }
}

export default FixedWidget
