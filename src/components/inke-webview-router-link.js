/**
 * @name InkeWebviewRouterLink 映客webview跳转组件
 * @author songjf
 * @description 不依赖history的路由跳转
 */
import React from 'react'
import PropTypes from 'prop-types'
import invariant from 'invariant'

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

/**
 * The public API for rendering a history-aware <a>.
 */
class InkeWebviewRouterLink extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    target: PropTypes.string,
    replace: PropTypes.bool,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    innerRef: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  }

  static defaultProps = {
    replace: false,
    onClick: _ => _
  }

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
        createHref: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  }

  get search () { // 搜索参数
    const to = this.props.to
    return (to && (typeof to === 'object') && to.search) || {}
  }

  get path () { // 跳转路径
    const to = this.props.to
    return typeof to === 'string' ? to : (typeof to === 'object' && to.pathname) || ''
  }

  get href () { // 渲染页面路径
    const defaultHost = window.location.origin + window.location.pathname
    const path = this.path && '#' + this.path
    const search = this.$common.stringifyParams({ ...this.$common.getUrlParams(), ...this.search } || {})
    return path ? (this.host || defaultHost) + (search ? `?${search}` : '') + path : 'javascript: void(0)' // eslint-disable-line
  }

  handleClick = event => {
    if (this.props.onClick) this.props.onClick(event);

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault()
      window.location.href = this.href
    }
  };

  render() {
    const { replace, to, innerRef, children, ...props } = this.props

    invariant(
      this.context.router,
      'You should not use <Link> outside a <Router>'
    );

    invariant(to !== undefined, 'You must specify the "to" property');

    return (
      <a {...props} onClick={this.handleClick} href={this.href} ref={innerRef}>
        { children }
      </a>
    )
  }
}

export default InkeWebviewRouterLink
