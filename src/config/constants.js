// export const HOST_ONLINE = 'boc.inke.cn'
// 通过正则来匹配多种域名, 如: boc2.inke.cn, boc3.inke.cn
// 因为 new RegExp('boc(\\d+)?.inke.(cn|com)') 字符串经过转义, 需要"双斜杠"
export const HOST_ONLINE = 'h5.inke.(cn|com)'
export const HOST_BETA = 'betah5.inke.cn'
export const HOST_TEST = 'testh5.inke.cn'
export const HOST_DEV = 'development'

// **service相关静态配置**

/**
 * 映客通用响应jsonKey, 与requestOptsWrapper搭配使用
 * 详见: https://github.com/libaoxu/axios-service#%E5%85%B6%E4%BB%96%E9%AB%98%E9%98%B6%E5%87%BD%E6%95%B0
 */
export const INKE_COMMON_RESPONSE_KEYS = { dataKey: 'data', msgKey: 'error_msg', codeKey: 'dm_error', successCode: 0 }

// 常量应该大写, 小写的保持之前的引用
export const inkeCommonResponseKeys = INKE_COMMON_RESPONSE_KEYS
