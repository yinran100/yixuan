import React, { forwardRef, useRef, useState } from 'react'
import { classFix } from 'utils'
import debounce from 'lodash/debounce'
import './index.less'
const classPrefix = 'ikc-button'
const cx = classFix(classPrefix)

/**
 * 带有点击波纹效果的按钮
*/
const Button = forwardRef((props, ref) => {
  let buttonRef = null
  const rippleContainer = useRef();
  const _ref = function(...res) {
    ref?.apply && ref.apply(this, res)
    buttonRef = res[0]
  }
  const { className, children, style, effectColor = '#eee', ...rest } = props
  const [effectSpans, setEffectSpans] = useState([])
  const cleanUp = debounce(e => {
    const [ first, ..._effectSpans ] = effectSpans
    setEffectSpans(_effectSpans)
  }, 1000)
  const showRipple = event => {
    const size = buttonRef.offsetWidth;
    const pos = buttonRef.getBoundingClientRect();
    const e = event.touches[0]
    const left = e.pageX - pos.left - (size / 2);
    const top = e.pageY - pos.top - (size / 2);
    const _effectSpans = [...effectSpans, {
      style: { left, top, width: size, height: size, backgroundColor: effectColor },
      key: `${left}${top}${event.timeStamp}`
    }]
    setEffectSpans(_effectSpans)
  };
  return <div {...rest} ref={_ref} className={`${classPrefix} ${className}`} style={style}
    // onMouseDown={showRipple} onMouseUp={cleanUp}
    onTouchStart={showRipple} onTouchEnd={cleanUp}>
    <div className={cx('ripple--container')} ref={rippleContainer}>
      {
        effectSpans.map(i => <span key={i.key} style={i.style}/>)
      }
    </div>
    {children}
  </div>
})

export default Button
