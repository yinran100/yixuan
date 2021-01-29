import React from 'react'
import { Button } from 'antd-mobile'
import Animate from 'rc-animate'
import MyModal from '../../components/MyModal'
import 'styles/motion/index.less'
import { connectEntire } from '../../common/utils'

export default
@connectEntire()
class Motion extends React.PureComponent {
  state = {
    transitionName: '',
    visible: false
  }

  handleFadeMotion = () => {
    this.setState({ visible: !this.state.visible, transitionName: 'fade' })
  }

  handleZoomMotion = () => {
    this.setState({ visible: !this.state.visible, transitionName: 'zoom' })
  }

  onAnimateLeave = (e) => {
    console.log('onAnimateLeave: ', e)
  }

  render () {
    const { visible, transitionName } = this.state
    const { setModalVisible } = this.props

    return <div>
      <Button type="primary" inline onClick={() => setModalVisible(true)}>弹窗</Button>
      <br/>
      <Button type="primary" inline onClick={this.handleFadeMotion}>fade motion</Button>
      <br/>
      <Button type="primary" inline onClick={this.handleZoomMotion}>zoom motion</Button>
      <br/>
      <Animate
        transitionName={transitionName}
        onLeave={this.onAnimateLeave}
        component=""
        transitionAppear
      >
        {
          visible && <div
            key="motion-element"
            style={{ position: 'fixed', backgroundColor: '#00d46d', width: 400, height: 200 }}
            role="document"
          >
            animating
          </div>
        }
      </Animate>
      <MyModal />
    </div>
  }
}
