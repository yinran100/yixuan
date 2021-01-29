import IKTracking from '@inkefe/ik-tracking'
import $utils from './index'
// ⚠️注意：创建IKTracking对象的时候会自动上报一条埋点数据
const ikTracking = new IKTracking({
  /** 埋点上报开关，默认为开启状态，开发开发环境不上报，生产环境才上报 */
  enable: process.env.NODE_ENV === 'production',
  // enable: true,
  /** 上报埋点的域名, 不同业务线需要申请自己的埋点上报域名；映客业务线域名为：https://maidian.busi.inke.cn； */
  domain: 'https://maidian.xxx.cn',
  /** 日志级别，因为埋点数据是经过加密的，开发阶段如果打开日志，就无法判断埋点上报是否正确 */
  logLevel: 'info',
  /** 埋点协议相关参数，详情: https://wiki.inkept.cn/pages/viewpage.action?pageId=98464228 */
  mdParams: {
    /** cv为必传参数，并且跟域名绑定，有严格的格式限制，详情见下方表格,每个项目都不同，需要确认清楚！！！ */
    cv: '',
    /** 网页类: `h5log`、小程序: `miniapp`、性能监控: `h5quality`; 不同的md_etype会将数据打到不同的kafka, 如果需要扩展, 需要有`于雪雪`沟通确认 */
    md_etype: 'h5log'
  },
  // path: '/api/v1/base/log/upload',
});
/**
 * ik-tracking 总共就3个API函数，分别是：
    设置埋点基础参数 - setMdParams(mdParams: object)
    埋点上报 - report(eid: string, md_einfo: object)
    埋点上报装饰器 - reportDecorator(eid: string, md_einfo: object)
 */
ikTracking.initMdParams = () => {
  const urlParams = $utils.getUrlParams()
  console.log('ikTracking-------------------', urlParams)
  const cvArr = urlParams.cv?.split('_') || ['BJ1.4.8']
  ikTracking.setMdParams({
    'md_userid': (urlParams.ownid ?? urlParams.uid) || 0,
    'cv': cvArr[0] + '_Web',
    // 用户的devi
  })
}

export default ikTracking
