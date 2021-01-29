/* eslint-disable camelcase */
// 详情查看 https://wiki.inkept.cn/pages/viewpage.action?pageId=120756158
//  mock配置文件，key就是接口的URL地址，value可以是
const faker = require('faker/locale/zh_CN')

function getInviteList() { // mock数据
  return Array.from({ length: 10 }).map(i => ({
    portrait: faker.image.avatar(),
    money: faker.random.number(9999) / 100,
    nick: faker.internet.userName(),
    create_time: faker.date.past().format('yyyy-MM-dd hh:mm:ss'), // 过去的时间
  }))
}
module.exports = {
  /**
   * 全局mock开关，如果不写，默认为开启状态，如果设置为false，表示关闭整个配置文件的mock配置，等服务端的接口准备ready后，可以将这个字段设置为false
   */
  enable: true,
  /**
   * 直播间信息
   */
  '/app/hall/live/infos': async (params, req, res) => {
    await new Promise((resolve, reject) => setTimeout(resolve, 700)) // 自动loading
    return {
      dm_error: 0,
      error_msg: 'success',
      data: {
        list: getInviteList(),
        wx_code_url: '23423', // 审核通过的微信二维码url
        wx_code_verify_url: '', // 正在审核中的微信二维码url
        wx_code_verify_reason: 'asdfa', // 审核原因
        wx_code_operator_time: 1599709727, // 上传时间
      }
    }
  }
}
