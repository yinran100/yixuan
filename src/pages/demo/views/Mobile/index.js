import React from 'react'
import { Accordion, List, InputItem } from 'antd-mobile';
import { classFix } from 'utils'
import { Container, Input, Button } from 'ikc'
import './index.less'
import { setLoadingWrapper, setProtectLoading } from '@decorator';

const classPrefix = 'demo-mobile'
const cx = classFix(classPrefix)
const { FixedWidget, FixedContainer } = Container

const gotoTest = (url = window.location.href, fullScreen) => {
  url = url || window.location.href
  const href = `duiyuan://com.lingxi.cupid/web_page?link=${encodeURIComponent(url)}?mode=full_screen`
  console.log(href);
  window.location.href = href
}
export default
class Home extends React.Component {
  state = {
    text: ''
  }

  componentDidMount() {
    console.log(this.container, this.div);
  }
  onChange = e => {
    this.setState({ text: e.target.value })
  }

  @setProtectLoading
  showLoading = async () => {
    await new Promise(resolve => setTimeout(resolve, 2200))
  }

  render() {
    const { text } = this.state
    return (
      <Container ref={el => (this.container = el)} sc='123'>
        <div className={classPrefix}>
          <p onClick={() => gotoTest()}>组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件</p>
          <div className={cx('div')} onClick={() => window.location.reload()}>-</div>
          <Button className={cx('btn')} effectColor="#999" ref={el => (this.div = el)} onClick={console.log}>点击</Button>
          <Input className={cx('input')} value={text} onChange={this.onChange}/>
          <div className={cx('div1')}>-</div>
          <p >组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件组件</p>
        </div>
        {/* <div className={cx('fixed')}>我的</div> */}
        <FixedWidget top={160} left={0}>
          <div className={cx('fixed')} onClick={this.showLoading}>我的</div>
        </FixedWidget>
        <FixedContainer mode='top'>
          <div className={cx('bottom')}>顶部</div>
        </FixedContainer>
        <FixedContainer mode='bottom'>
          <div className={cx('bottom')}>底部</div>
        </FixedContainer>
      </Container>
    )
  }
}
