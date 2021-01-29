import React from 'react'
import { connectEntire } from '../../common/utils'
import { createKeepAlive } from 'decorator'
import { Button, Modal } from 'antd-mobile'
import { classFix } from 'utils'
import { routePaths } from '../../router'

import './index.less'
import { Link } from 'react-router-dom'
const classPrefix = 'demo-room'
const cx = classFix(classPrefix)

export default
@connectEntire('reducers')
@createKeepAlive
class Home extends React.Component {
  state = {
    num: 1
  }

  componentDidActivate() {
    console.log('componentDidActivate')
  }
  componentWillUnactivate() {
    console.log('componentWillUnactivate')
  }
  get _nick () {
    return this.props.userInfo.nick
  }

  _toggleNick = () => {
    if (this._nick === 'libx') {
      this.props.saveUserInfo({ nick: 'lizh' })
    } else {
      this.props.saveUserInfo({ nick: 'libx' })
    }
  }

  showModal = () => {
    Modal.alert('modal demo', 'how are you? ')
  }

  gotoMotion = () => {
    let searchObj = this.$utils.getUrlParams()
    searchObj = {
      ...searchObj,
      id: 12
    }
    this.props.history.push(routePaths.MOTION)
  }

  render () {
    return <div className={classPrefix}>
      <Button type="primary" onClick={this._toggleNick}>click to change{ this._nick }</Button>
      <br/>
      <Button inline onClick={this.showModal}>To showModal True</Button>
      <div className={cx(['btn', 'link'])} onClick={this.gotoMotion}>动画页面</div>
      <Link className={cx('btn')} to={routePaths.MOBILE}>mobile页面</Link>
    </div>
  }
}
