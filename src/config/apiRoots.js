import { HOST_BETA, HOST_ONLINE, HOST_TEST, HOST_DEV } from './constants'

// const { location: { host: HOST, origin: ORIGIN } } = window
const { location: { host: HOST } } = window

export const IS_DEV = process && process.env.NODE_ENV === 'development'

export const HOST_ENV = [HOST_BETA, HOST_ONLINE, HOST_TEST].find(key => HOST.indexOf(key) === 0) || HOST_DEV

export const prodRootMap = {
  [HOST_ONLINE]: {
    baseapi: '//baseapi.busi.inke.cn/',
    actapi: '//actapi.busi.inke.cn/',
  },
  [HOST_BETA]: {
    baseapi: '//baseapi.busi.inke.cn/',
    actapi: '//betaactapi.busi.inke.cn/',
  },
  [HOST_TEST]: {
    baseapi: '//baseapi.busi.inke.cn/',
    actapi: '//testactapi.busi.inke.cn/',
  }
}

export const prodApi = prodRootMap[HOST_ONLINE]

const CUR_HOST = Object.keys(prodRootMap).find((key) => {
  // 将字符串转为正则, 找到"匹配索引"为0的 host
  // 这样key就可以支持正则写法了, 如: 'h5.inke.(cn|com)' 就可以 既匹配h5.inke.cn又匹配h5.inke.com了
  const match = HOST.match(new RegExp(key))
  return match && (match.index === 0)
}) || HOST_ONLINE

const rootObj = prodRootMap[CUR_HOST] || {}

const DEFAULT_ROOT = '/'

// 再root很多的场景, 非常适用
const formatAPIS = fn => Object.keys(rootObj).reduce((obj, host) => {
  if (host) {
    obj[host] = fn(rootObj[host])
  }
  return obj
}, {})

const PROD = {
  APIS: formatAPIS(rootStr => rootStr || DEFAULT_ROOT)
}

const DEV = {
  APIS: {
    ...formatAPIS(() => DEFAULT_ROOT),
  }
}

const ENV = IS_DEV ? DEV : PROD
export default ENV.APIS
