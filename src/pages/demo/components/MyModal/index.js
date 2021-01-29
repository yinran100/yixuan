import React from 'react'
import ReactDOM from 'react-dom'
import Animate from 'rc-animate'
import { classFix } from 'utils'
import './index.less'
import { connectEntire } from '../../common/utils'
import { CLOSE_ICON } from '../../common'

const classPrefix = 'my-modal'
const cx = classFix(classPrefix)

export default
@connectEntire()
class MyModal extends React.Component {
  state = {
    prevModalVisible: false,
    visible: false,
  }
  // 内部生成一份visible,控制弹窗显隐，和外部传入的visible关联
  static getDerivedStateFromProps(props, state) {
    const { prevModalVisible, visible } = state
    const { modalVisible } = props
    if (prevModalVisible !== modalVisible) { // 是否是打开或者关闭弹窗
      return {
        visible: modalVisible || visible,
        prevModalVisible: modalVisible
      }
    }
    return null
  }

  // 退出动画后的回调(关闭弹窗)
  onAnimateLeave = () => this.props.setModalVisible(false)

  // 关闭弹窗
  exit = e => this.setState({ visible: false })

  render() {
    const { modalVisible } = this.props
    const { visible } = this.state
    // transitionName: fade || zoom
    return ReactDOM.createPortal(<div className={cx('mask')} style={{ display: `${modalVisible ? '' : 'none'}` }}>
      <Animate transitionName='zoom' onLeave={this.onAnimateLeave} transitionAppear >
        {
          visible && <div className={cx('wrapper')}>
            <div className={cx('box')}>
              content....
            </div>
            <img src={CLOSE_ICON} className={cx('close-icon')} alt='' onClick={this.exit}/>
          </div>
        }
      </Animate>
    </div>,
    document.body)
  }
}
