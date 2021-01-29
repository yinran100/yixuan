import React from 'react'
import { classFix } from 'utils'
import './index.less'
const classPrefix = 'ikc-error'
const cx = classFix(classPrefix)

const ErrorPoster = '//img.ikstatic.cn/MTYxMDQzOTQ4ODM3OSM5MDgjcG5n.png'
/**
 * 处理错误的解决组件
 * @description 当render方法出错时，用于展示对应的页面，防止页面白屏
 * @usage 把根组件包裹，<ErrorBoundary><App /></ErrorBoundary>
*/
export default class ErrorBoundary extends React.Component {
  state = {
    error: false
  }
  componentDidCatch(error, info) {
    this.setState({ error, info })
  }

  render() {
    const { error, info } = this.state
    if (error) {
      return (
        <div className={classPrefix}>
          <div className={cx('poster')}>
            <img src={ErrorPoster} alt=''/>
          </div>

          <div className={cx('tips')}>哎呀，页面好像发生错误了~</div>
          <div className={cx('detail')}>
            <div className={cx('content')}>
              <div className={cx('title')}>
                {error.toString()}
              </div>
              {
                info && info.componentStack.split('\n').map(i => <div className={cx('info')} key={i}>
                  {i}
                </div>)
              }
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
