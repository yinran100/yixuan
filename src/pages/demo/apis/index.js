/**
 * @Author: xxx@inke.cn
 * @Date: 2020-01-11
 *
 *  接口文档：
 *  @desc
 **/
import { getRequestsByRoot, serviceHocs, getMessageDecorator } from 'axios-service'
import apiRoots from 'src/config/apiRoots'
import $utils from 'utils'
import { Toast } from 'entry/unprerender-ui'
import { setProtectLoading, setLoadingWrapper } from '@decorator'
const { requestOptsWrapper, setParamsDecorate } = serviceHocs

const {
  get: baseGet, post: basePost, /* postXForm */
} = getRequestsByRoot({ root: apiRoots.baseapi })
const customParams = $utils.getUrlParams()
const responseKeys = { dataKey: 'data', msgKey: 'error_msg', codeKey: 'dm_error', successCode: 0 }

const get = requestOptsWrapper(baseGet, responseKeys)
const post = requestOptsWrapper(basePost, responseKeys)

const messageDecorator = getMessageDecorator({
  success: msg => Toast.info(msg, 2, null, false),
  error: msg => Toast.info(msg, 2, null, false)
})
class Apis {
  /**
   * 获取微信config配置get
   */
  @setParamsDecorate(customParams)
  getWxShareConfig = get('/app/wx_share_config')

  /**
   * 获取微信config配置post
   */
  @setProtectLoading
  @setParamsDecorate(customParams)
  postWxShareConfig = post('/app/wx_share_config')

  /**
   *  接口：获取房间信息接口
   * @param id：live_id
   */
  @messageDecorator({ errorMsg: (error) => (error && error.msg) || '网络出错' })
  @setLoadingWrapper
  @setParamsDecorate(customParams)
  getLiveRoomInfo = get('/app/hall/live/infos')
  /**
   *  接口：商品上下架
   * @param goodsId 商品id
   */
  @messageDecorator({ successMsg: () => '提交成功', errorMsg: (error) => (error && error.msg) || '网络出错' })
  @setProtectLoading
  @setParamsDecorate(customParams)
  changeSale = post('api/goods/changeSale')
}

export default new Apis()
