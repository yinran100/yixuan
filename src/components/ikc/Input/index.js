import React, { useRef, forwardRef } from 'react'
import { fixedInput } from 'utils/fixUtils'

/*
  带有兼容性的输入框，失焦时自动调整页面。防止页面高度不对;
  聚焦时，会滚动输入框到视图内，防止被输入法挡住
*/
const Input = forwardRef((props, ref) => {
  let inputRef = null
  const _ref = function(...res) {
    ref?.apply && ref.apply(this, res)
    inputRef = res[0]
  }
  const onBlur = function(...e) {
    props.onBlur && props.onBlur.apply(this, e)
    fixedInput()
  }
  const onFocus = function(...e) {
    props.onFocus && props.onFocus.apply(this, e)
    typeof inputRef.scrollIntoViewIfNeeded === 'function'
      ? inputRef.scrollIntoViewIfNeeded(true)
      : inputRef.scrollIntoView({ block: 'center' })
  }
  return <input {...props} ref={_ref} onFocus={onFocus} onBlur={onBlur} style={{
    ...(props.style || {}),
    userSelect: 'auto'
  }}/>
})
export default Input
