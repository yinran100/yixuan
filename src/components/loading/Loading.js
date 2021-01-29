/**
 * 全局loading
 *
 * @params {String} borderColor
 * @params {Boolean} visible
 */
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { CSSTransition } from 'react-transition-group'
import './Loading.less'

const classPrefix = 'ik-h5-loading'
const cx = name => `${classPrefix}-${name}`
const LOADING_DOM_ID = 'inke-loading-root'
const destroyFns = []
const IS_REACT_16 = !!ReactDOM.createPortal;

const LoadingComponenst = {
  point: style => <div className={cx('point')} style={style}></div>,
  'clip-rotate': style => <div className={cx('clip-rotate')} style={style}>
    <div/><div/>
  </div>,
  'line-scale': style => <div className={cx('line-scale')} style={style}>
    <div/><div/><div/><div/><div/>
  </div>,
  'ball-scale': style => <div className={cx('ball-scale')} style={style}>
    <div/><div/>
  </div>,
}
const defaultAnimate = 'clip-rotate'
export class InKeLoading extends React.Component {
  static propsTypes = {
    visible: PropTypes.bool,
    borderColor: PropTypes.string,
    animateName: PropTypes.string,
  }

  static defaultProps = {
    visible: false,
    animateName: defaultAnimate
  }

  state = {
    display: ''
  }
  loadingRoot = document.getElementById(LOADING_DOM_ID)

  changeDisplay = (display = '') => {
    this.setState({ display })
    const container = this.el?.parentNode
    if (!container) return
    if (!this.loadingRoot) this.loadingRoot = document.getElementById(LOADING_DOM_ID)
    if (container !== this.loadingRoot) { // 当作为其他组件内部时，父容器的高度不能为0
      container.style.height = display ? '' : '100%'
      container.style.overflow = display ? '' : 'hidden'
    }
  }

  render() {
    const { borderColor, visible, animateName, isStop } = this.props
    const { display } = this.state

    let loadingStyle = {}
    if (borderColor) {
      loadingStyle = { 'border-color': `${borderColor} transparent transparent ${borderColor}` }
    }
    return (
      <CSSTransition in={visible} timeout={150} classNames="fade" appear
        onExited={() => this.changeDisplay('none')} onEnter={() => this.changeDisplay()}>
        <div className={`${classPrefix} ${cx(isStop ? 'stop-wrapper' : 'loading')}`}
          ref={el => (this.el = el)} style={{ display }}>
          {
            LoadingComponenst[animateName]?.(loadingStyle) || LoadingComponenst[defaultAnimate](loadingStyle)
          }
        </div>
      </CSSTransition>
    )
  }
}

export const LoadingView = {
  hide () {},

  show (props) {
    let div = this.div || document.getElementById(LOADING_DOM_ID)
    if (!div) {
      const firstChild = document.body.children[0]
      div = document.createElement('div')
      div.setAttribute('id', LOADING_DOM_ID)
      if (firstChild) {
        document.body.insertBefore(div, firstChild)
      } else {
        document.body.appendChild(div)
      }
    }
    this.div = div
    let currentConfig = { ...props, close, visible: true }

    this.hide = close.bind(this)

    function close (...args) {
      currentConfig = { ...props, visible: false, afterClose: destroy.bind(this, ...args) }

      if (IS_REACT_16) {
        render(currentConfig);
      } else {
        destroy(...args);
      }
    }

    function update (newConfig) {
      currentConfig = {
        ...currentConfig,
        ...newConfig,
      };
      render(currentConfig);
    }

    function destroy (...args) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div)
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div)
      }

      for (let i = 0; i < destroyFns.length; i++) {
        const fn = destroyFns[i];
        if (fn === close) {
          destroyFns.splice(i, 1);
          break;
        }
      }
    }

    function render (props) {
      ReactDOM.render(<InKeLoading { ...props }/>, div)
    }

    render(currentConfig)

    destroyFns.push(close)

    return {
      destroy: close,
      update
    }
  }
}
