import { wxConfig, wxApiProxy } from 'ik-weixin'
import { getRequestsByRoot } from 'axios-service'
import apiRoots from 'src/config/apiRoots'
import pick from 'lodash/pick'
import $common from 'utils'

const { get } = getRequestsByRoot({ root: apiRoots.baseapi })

if ($common.ua.weixin) {
  get('/open/WxShareApi')().then(({ data }) => {
    wxConfig({
      ...pick(data, ['signature', 'timestamp']),
      appId: data.appid,
      nonceStr: data.noncestr,
      openTagList: ['wx-open-launch-app']
    })
  })
}

const defaultShareOpt = {
  title: '上映客 直播我',
  desc: '映客直播，实时、高清、快捷、流畅的视频直播平台，中国全新的视频社交媒体，明星大咖、网络红人、时尚娱乐、视频交友、高颜值等尽在映客直播app。',
  imgUrl: 'http://img2.inke.cn/MTUyMjM4MTc4OTA1NSM4NDgjanBn.jpg',
  link: `${window.location.origin + window.location.pathname}?from=other`
}

export const weixinMenuShareInit = opts => {
  const _opts = { ...defaultShareOpt, ...opts }
  wxApiProxy.onMenuShareAppMessage(_opts)
  wxApiProxy.onMenuShareTimeline(
    Object.assign({}, _opts, {
      title: _opts.desc,
      desc: _opts.title
    })
  )
  wxApiProxy.onMenuShareQQ(_opts)
  wxApiProxy.onMenuShareQZone(_opts)
}

export default wxApiProxy
