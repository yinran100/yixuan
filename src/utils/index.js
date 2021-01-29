import './protoExtension'
import srcConfig from 'src/config'
import classname from 'classnames'
import _ from 'lodash'
const userAgent = navigator.userAgent
const toString = Object.prototype.toString
const location = window.location
const reg = process.env.NODE_ENV === 'development' ? '/' : '/react/|/h5/|/' // 避免本地缓存的命名空间混淆。开发者页面的文件夹不要以react或者h5开头
const pathKey = location.pathname.replace(/\/index.html$/, '').replace(new RegExp(`^${reg}`), '')

/**
   * 将url中? 后面的参数,
   */
function getSearch(url = location.href) {
  return url.indexOf('?') > -1 ? url.replace(/[^?]+\?/, '').replace(/#\/?[^?]*\??/, '&') : ''
}

export const noop = _ => _

/**
 * 标志废弃的高阶函数
 * @param {String} fnName 函数名
 * @param {String} readmeUrl 提示地址
 * @example
 * const setAtomParamsWapper = deprecatedWrapper('setAtomParamsWapper', 'https')(() => {})
 * 详见可参考 src/decorator/service-assister.js
 */
export const deprecatedWrapper = (fnName, readmeUrl) => fn => (...args) => {
  console.warn(`[boc.react]: 🚫${fnName || fn.name}已经废弃, 更多用法请参考: ${readmeUrl || ''}`)
  return fn(...args)
}

/**
 * 单例
 * @param {Function} fn 被装饰的函数
 * @return {Function} 代理函数, 接收被装饰的函数一模一样的参数
 */
export const getSingleton = (fn) => {
  let result
  let flag
  return function singletonProxy() {
    if (!flag) {
      flag = true
      return (result = fn.apply(this, arguments))
    } else {
      return result
    }
  }
}
/**
   * 得到url中某个参数
   */
export const getUrlQuery = name => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  if (location.href.indexOf('?') < 0) return false
  let search = getSearch()
  if (!search) return false
  let r = search.replace(/(#|\/)+/ig, '').match(reg)
  if (r != null) {
    // 对编码的字符串进行解码
    let unescapeStr = unescape(decodeURIComponent(r[2]))
    switch (unescapeStr) {
      case 'true':
        return true
      case 'null':
        return null
      case 'false':
        return false
      case 'undefined':
        return undefined
      default:
        return unescapeStr
    }
  } else {
    return null
  }
}

const $common = {
  // isIos: userAgent.match(/iPhone/i) || userAgent.match(/iPad/i) || userAgent.match(/iPod/i),

  // isAndroid: !$common.isIos,

  // isWx: userAgent.match(/MicroMessenger/i),

  // isFirefox: userAgent.match(/Firefox/i),

  // isPc: !['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'].some((model) => userAgent.indexOf(model) > -1),
  getUrlQuery,
  getSearch,
  ua: (() => {
    const regs = {
      // 系统
      // 'ios': /iphone|ipad|ipod/,
      'android': /android/i,

      // 机型
      'iphone': /iphone/i,
      'ipad': /ipad/i,
      'ipod': /ipod/i,

      // 环境
      'weixin': /micromessenger/i,
      'mqq': /QQ\//i,
      'app': /inke/i,
      'alipay': /aliapp/i,
      'weibo': /weibo/i,

      // 浏览器
      'chrome': /chrome\//i
    };

    const ret = {}
    Object.keys(regs).forEach((key) => {
      var reg = regs[key]
      ret[key] = reg.test(userAgent)
    })

    ret.ios = ret.iphone || ret.ipad || ret.ipod;
    ret.mobile = ret.ios || ret.android;
    ret.pc = !ret.mobile;

    ret.chrome = !!window.chrome
    // 经过多次坑验证, 只有在同时有uid 和 sid的时候, 才可以认为是映客环境, 其他的ua等等判断都不靠谱, 虽然有些low, 但是最稳定
    ret.isInke = !!(getUrlQuery('uid') && getUrlQuery('sid'))

    return ret;
  })(),

  /**
   * 客户端版本检查
   * ver <= 客户端当前版本时return true
   */
  checkVersion: (ver) => {
    let cv = $common.getUrlQuery('cv')
    if (!cv) {
      return null
    }
    let thisVersion = cv.replace(/[^\d.]/g, '')
    return ver <= thisVersion
  },

  regs: {
    telephone: /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
    http: /http(|s):\/\//
  },

  /**
   * 设置 iPhoneX viewport 填充模式。
   * @param {"contain"|"cover"} mode
   */
  setViewportFit(mode) {
    const meta = document.querySelector(`meta[name="viewport"]`);
    const content = meta.getAttribute('content');
    const parts = (content || '').replace(/\s/g, '').split(',').map(token => token.split('='));

    let index = -1;

    for (let i = 0; i < parts.length; ++i) {
      if (parts[i][0] === 'viewport-fit') {
        index = i;
        break;
      }
    }

    if (~index) {
      parts[index][1] = mode;
    } else {
      parts.push(['viewport-fit', mode]);
    }

    meta.setAttribute('content', parts.map(token => token.join('=')).join(','));
  },

  getOsVersion: _ => {
    let reg = /(\S+)_(\d+)/
    let os = $common.getUrlQuery('osversion') || false
    if (!os) {
      return false
    }
    let match = reg.exec(os)
    return {
      os: match[1],
      version: match[2]
    }
  },

  /**
   * 参数格式化, 符合url方式
   * @params {Object} {a: '123', age: '18'}
   * @return {String} 'a=123&age=18'
   */
  stringifyParams(params, cb) {
    let name
    let value
    let str = ''

    for (name in params) {
      value = params[name]
      str += name + '=' + (typeof cb === 'function' ? cb(value, name) : value) + '&'
    }

    return str.slice(0, -1)
  },

  /**
  * 将url中? 后面的参数, 变成一个json
  * @return {Object}
  * @example
  * '#hash?a=1&b=3' => {a: 1, b: 3}
  * '?a=1&b=3#hash' => {a: 1, b: 3}
  * '?a=1&b=3#hash?a=2&b=4' => {a: 2, b: 4}
  */
  getUrlParams(sourceStr) {
    // 防止hash值, 影响参数名称
    let search
    if (sourceStr) {
      // 只取最后一个?号后面的参数
      search = sourceStr.indexOf('?') > -1 ? sourceStr.split('?').slice(-1).toString() : sourceStr
    } else {
      // 链接中的最后一个
      search = $common.getSearch()
      if (!search) return $common.getLocalData('query_params', false, false) || {}
    }
    // 如果没有, 则返回空对象
    if (!search) return {}

    let searchArr = search.split('&').filter(Boolean)

    let urlParams = {}

    searchArr.forEach((str, index) => {
      let [ key, ...vals ] = str.split('=')
      // 如果已经有该参数就不添加进去了
      // if (urlParams[paramArr[0]]) return false
      key = decodeURIComponent(key)
      let value = unescape(decodeURIComponent(vals.join('=')))
      value = value === 'undefined' ? void 0 : value
      urlParams[key] = value
    })
    if ($common.isEmptyObject(urlParams)) return $common.getLocalData('query_params', false, false) || {}
    // console.log(urlParams)
    $common.saveLocalData('query_params', urlParams, false, false)
    return urlParams
  },

  /**
   * 根据日期获取星座
   * @param {String} date
   */
  getStarSigns(date) {
    const getAstro = (m, d) => {
      return '魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯'.substr(m * 2 - (d < '102223444433'.charAt(m - 1) - -19) * 2, 2);
    }
    let d = new Date(date.replace(/-/g, '/'))
    return getAstro(d.getMonth() + 1, d.getDate()) + '座'
  },
  /**
   * 图片缩放
   * @param param
   * @return {string}
   */
  scaleImg(param) {
    var opt = {
      url: '',
      w: '100',
      h: '100',
      s: 80
    };
    if (!param || !param.url) {
      return;
    }
    opt = Object.assign({}, opt, param || {});
    var base = location.protocol + '//imagescale.inke.cn/imageproxy2/dimgm/scaleImage';
    return (
      base +
      '?url=' +
      encodeURIComponent(opt.url) +
      '&w=' +
      opt.w +
      '&h=' +
      opt.h +
      '&s=' +
      (opt.s || 80)
    );
  },
  /**
   * 活动链接内部跳转
   */
  activityUrlWithoutSearch(url) {
    let _url = url
    let _locationParams = $common.getUrlParams()
    let _urlParams = $common.getUrlParams(_url)
    if (_urlParams.inkewid) { // 跳转 url 有 inkewid，替换 location 的 inkewid
      let _urlObj = {
        ..._locationParams,
        ..._urlParams,
        from: _locationParams.from || _urlParams.from
      }
      _url = `${_url.split('?')[0]}?${$common.stringifyParams(_urlObj)}`
    } else {
      if (_locationParams.inkewid) { // location 有 inkewid，url 无 inkewid，删除 location 的 inkewid
        delete _locationParams.inkewid
        delete _locationParams.inkewname
        delete _locationParams.inkewtype
        _url = _url.indexOf('?') >= 0 ? `${_url}&${$common.stringifyParams(_locationParams)}` : `${_url}?${$common.stringifyParams(_locationParams)}`
      } else {
        _url = _url.indexOf('?') >= 0 ? `${_url}&${location.search.replace('?', '')}` : `${_url}${location.search}`
      }
    }
    let a = document.createElement('a')
    a.href = _url
    a.click()
  },

  /**
   * app内直接跳转到某个页面
   */
  innerAppSkipUrl(url) {
    let a = document.createElement('a')
    a.href = url
    a.click()
  },

  /**
   * 判断对象是否为空
   * @return {Boolean} 是否是空对象
   */
  isEmptyObject(obj) {
    let key

    for (key in obj) {
      return false
    }

    return true
  },

  isObject(obj) {
    return toString.call(obj) === '[object Object]'
  },
  /**
  * 把数据保存到本地
  */
  saveLocalData(key, item, isSession, nameSpace = true) {
    const storage = isSession ? sessionStorage : localStorage
    try {
      if (key === void 0) {
        const data = $common.getLocalData()
        return Object.keys(data).forEach(item => {
          $common.saveLocalData(item)
        })
      }
      if (item === void 0) storage.removeItem(nameSpace ? `_${pathKey}_${key}` : key)
      else storage.setItem(nameSpace ? `_${pathKey}_${key}` : key, JSON.stringify(item))
    } catch (error) {
      console.error(error)
    }
  },
  /**
    * 读取本地数据, key若不传，得到本命名空间下存的所有本地数据
    */
  getLocalData(key, isSession, nameSpace = true) {
    let res = null
    try {
      if (key === void 0) {
        let allName = Object.keys(isSession ? sessionStorage : localStorage).filter(name => name.match(new RegExp(`^_${pathKey}_`)))
        if (allName.length > 0) {
          res = {}
          allName.forEach(item => {
            let keyName = item.match(new RegExp(`^_${pathKey}_(.*)$`))[1]
            res[keyName] = $common.getLocalData(keyName)
          })
        }
      } else res = JSON.parse((isSession ? sessionStorage : localStorage).getItem(nameSpace ? `_${pathKey}_${key}` : key))
    } catch (error) {
      console.error(error)
    }
    return res
  },
  getHttpUrl(url = '') {
    typeof url !== 'string' && (url = '')
    return url.replace(/^http(s?):\/\//, '//')
  },

  /**
   * 拷贝, 支持深拷贝, 支持多个参数
   * 第一个参数如果为 boolean类型且为true, 做深拷贝
   * @example
   * 浅拷贝 common.copy({name: 'libaoxu'}, {age: 18}) => { name: 'libaoxu', age: 18 }
   * 深拷贝 common.copy(true, {name: 'libaoxu', age: 18, obj: {sex: '1', love: 'bei'}}, {name: 'deep', obj: {sex: '2'}}) => { name: 'deep', age: 18, obj: { sex: 2, love: 'bei' } }
   */
  copy() {
    let target = arguments[0] || {}
    let i = 1
    let length = arguments.length
    let deep = false

    if (typeof target === 'boolean') {
      deep = target
      target = arguments[1] || {}
      i++
    }

    if (typeof target !== 'object' && typeof target !== 'function') {
      target = {}
    }

    for (; i < length; i++) {
      let options
      if ((options = arguments[i]) != null) {
        for (let prop in options) {
          let src = target[prop]
          let copy = options[prop]

          if (target === copy) continue

          let copyIsArray

          if ((deep && copy) ? $common.isObject(copy) : (copyIsArray = Array.isArray(copy))) {
            let clone
            if (copyIsArray) {
              copyIsArray = false
              clone = src && Array.isArray(src) ? src : []
            } else {
              clone = src && $common.isObject(copy) ? src : {}
            }

            target[prop] = $common.copy(deep, clone, copy)
          } else if (copy != null) {
            target[prop] = copy
          }
        }
      }
    }

    return target
  },

  /**
   * 节流函数
   * @param {Function} func 回调函数
   * @param {Number} wait 等待时间
   * @param {Object} options 配置参数
   * @property options.leading false: 如果你想禁用第一次首先执行的
   * @property options.trailing false: 你想禁用最后一次执行的话
   */
  throttle(func, wait, options = {}) {
    let timeout
    let context
    let args
    let result
    let previous = 0
    if (!options) options = {}

    const later = function () {
      previous = options.leading === false ? 0 : Date.now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }

    const throttled = function () {
      let now = Date.now()
      if (!previous && options.leading === false) previous = now
      let remaining = wait - (now - previous)
      // console.log('remaining: ', remaining, 'now: ', now, 'previous: ', previous, remaining > wait)
      context = this
      args = arguments
      // remaining > wait 防止用户修改系统时间
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          // console.log('clear timeout')
          clearTimeout(timeout)
          timeout = null
        }
        // console.log('remaining <=0 || remaining > wait')
        // 进来之后 previous 才被赋值, 保证第一次执行成功
        previous = now
        result = func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) { // !timeout, 保证上一次later执行完的 标识
        // console.log('!timeout: ', timeout)
        timeout = setTimeout(later, remaining)
      }
      return result
    }

    throttled.cancel = function () {
      clearTimeout(timeout)
      previous = 0
      timeout = context = args = null
    }

    return throttled
  },

  noop() {
  },

  isDef: v => (v !== undefined),
  createPromise() {
    let _resolve
    let _reject
    let promise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })

    return {
      promise,
      resolve: _resolve,
      reject: _reject
    }
  },
  // 注意: 因为会给imgScale用, 必须要有protocol, 否则报错,
  getImgUrlAdapter(url, defaultUrl = `${window.location.protocol}//img2.inke.cn/MTUyODQ0Nzk2NTg5MyM0ODEjanBn.jpg`) {
    const httpReg = this.regs.http;
    if (url) {
      if (httpReg.test(url)) {
        return url.replace(httpReg, `${window.location.protocol}//`)
      }

      return `${window.location.protocol}//img2.inke.cn/${url}`
    }
    return url || defaultUrl
  },

  completImgUrlWithHost(url, imgHost = 'https://img2.inke.cn/') {
    // http开头的, 变为https
    if (url && typeof url === 'string') {
      if (url.indexOf('http://') > -1) {
        return url.replace('http://', 'https://')
      } else {
        // 路径结尾的,
        return `${imgHost}${url}`
      }
    } else {
      // return require('src/assets/images/common/default-portrait.png')
      return 'https://'
    }
  },

  getOpenInkeUrl(url) {
    const scheme = 'inke://pname=web&url='
    return scheme + encodeURIComponent(url)
  },

  getOpenInkeUrlQrCode(key = 'local') {
    if (srcConfig.IS_DEV) {
      const keys = {
        local: location.host,
        818: 'https://testboc.inke.cn:818',
        828: 'https://testboc.inke.cn:828',
        838: 'https://testboc.inke.cn:838',
        848: 'https://testboc.inke.cn:848',
        858: 'https://testboc.inke.cn:858',
        gray: 'https://betaboc.inke.cn',
        online: 'https://boc.inke.cn'
      }
      const pathname = location.pathname
      const search = location.search
      const scheme = 'inke://pname=web&url='
      let url = scheme + encodeURIComponent((keys[key] || keys['local']) + pathname + search)
      if (window.QRCode) {
        window.QRCode.toDataURL(url).then(base64 => {
          console.log(base64)
          console.log('%c ', `padding:100px 100px; background:url(${base64}) no-repeat;`)
        })
      } else {
        console.log(url)
      }
    }
  },
  /**
   * 链接是.html紧跟哈希路由的情况，需要调整url，防止用push导致search消失(当.html后面紧接哈希路由)，调整后重新加载页面
   * ***.html#/home?a=33&b=444 转换成 ***.html?a=33&b=444#/home
   */
  replaceUrlAfterHash () {
    const res = window.location.href.match(/.html(#\/?[^?]*)/)
    if (res) {
      window.location.replace(window.location.href.replace(res[1], '') + res[1])
    }
  },
  // 生成随机id，在要求不高的情况下
  getRandomID() {
    return ('' + (+new Date()) * Math.random()).slice(0, 8)
  },
  /**
   * 删除url中某个参数
   * @param url 目标url地址
   * @param {Array} keys 要删除的参数key
   * @return {String} 'uid=333&sid=xxxx'
   */
  getDeleteKeyParams(keys, url = location.href) {
    let params = $common.getUrlParams(url)
    keys.forEach(v => {
      delete (params[v])
    })
    return $common.stringifyParams(params)
  },

  /* 字符串裁切
  * @param {String} str 字符串
  * @param {Number} len 需要裁切的长度
  */
  truncateString(str = '', len) {
    const list = [...str]
    for (let i = 0, j = 0, k = false; i < list.length; ++i) {
      if (list[i].charCodeAt(0) <= 0x7f) {
        // ASCII
        j += 1
        k = true
      } else {
        j += 2
        k = false
      }
      if (i >= list.length - 1) {
        return str
      }
      if (j >> 1 >= len) {
        return list.slice(0, k ? i - 1 : i).join('') + '…'
      }
    }
    return str
  },

  // 下划线转换驼峰
  toHump(name) {
    return name.replace(/_(\w)/g, (all, letter) => {
      return letter.toUpperCase()
    })
  },
  // 驼峰转换下划线
  toLine(name) {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase()
  },
  /**
   * 锁定异步请求，请求未响应之前，多次调用函数只会执行一次。
   */
  lockAsyncFunction(fn) {
    if (!fn || typeof fn !== 'function') {
      throw new Error('必须传入一个函数');
    }
    let isLookAsync = false;
    return async function () {
      if (isLookAsync) return;
      isLookAsync = true;
      const res = await fn.apply(this, arguments);
      isLookAsync = false;
      return res;
    }
  },
  /**
   * @name 秒数格式化成天时分秒
   * @params Number | String 122
   * @return Array<String> [00, 00, 02, 02]
   * @example
   * formatTime(122) == [00, 00, 02, 02]
   */
  formatTime (time) {
    let _time = parseInt(time)
    const days =
      _time / 60 / 60 / 24 >= 10
        ? '' + parseInt(_time / 60 / 60 / 24)
        : '0' + parseInt(_time / 60 / 60 / 24)
    const hours =
      (_time / 60 / 60) % 24 >= 10
        ? '' + parseInt((_time / 60 / 60) % 24)
        : '0' + parseInt((_time / 60 / 60) % 24)
    const minutes =
      (_time / 60) % 60 >= 10
        ? '' + parseInt((_time / 60) % 60)
        : '0' + parseInt((_time / 60) % 60)
    const seconds =
      _time % 60 >= 10 ? '' + parseInt(_time % 60) : '0' + parseInt(_time % 60)

    return [ days, hours, minutes, seconds ]
  },
  /**
   * 格式化数字
   * @example 12222222222 > 99999999 显示 122.22亿
   * @example 15000 > 10000 显示 1.5万
   */
  formatNumber(number) {
    let value = number;
    if (number > 99999999) {
      value = `${Number((number / 100000000).toFixed(2))}亿`;
    } else if (number > 9999) {
      value = `${Number((number / 10000).toFixed(2))}万`;
    }
    return value;
  },
  /**
   * 监听页面状态
   * onShow 当页面隐藏后重新被看到时触发
   * onHide 当用户切换应用时 || 按Home键时触发 || 看不见页面时触发
   * 仅IOS可以使用，android请使用bridge
   */
  addPageStateListener({ onShow, onHide }) {
    const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
    const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
    const execute = fn => fn && typeof fn === 'function' && fn();
    document.addEventListener(visibilityChangeEvent, () => {
      if (document[hiddenProperty]) {
        execute(onHide);
      } else {
        execute(onShow);
      }
    });
  },
  /**
   * 监听WebView显示，当页面隐藏后重新被看到时触发
   */
  addWebViewShowListener(onShowCallback) {
    if ($common.ua.ios) { // IOS
      $common.addPageStateListener({ onShow: onShowCallback });
    } else if ($common.ua.android) { // android需要使用bridge
      const _origin = window.sendInkeJsInfo;
      window.sendInkeJsInfo = (...args) => {
        _origin.call(window, ...args);
        onShowCallback(...args)
      }
    }
  },
}

export default $common
/**
 * 保留几位小数,没有四舍五入
 * @param fractionDigits
 */
export const toFixed = (number, fractionDigits = 0) => {
  if (isNaN(parseFloat(number))) {
    return '0.00';
  }
  const rate = 10 ** fractionDigits
  return Math.floor(parseFloat(number) * rate) / rate;
}
// 获取IOS的版本号
export const getIosVersion = () => {
  const ua = navigator.userAgent.toLowerCase();
  var version = null;
  if (ua.indexOf('like mac os x') > 0) {
    const reg = /os [\d._]+/gi;
    const vInfo = ua.match(reg);
    version = (vInfo + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.'); // 得到版本号9.3.2或者9.0
  }

  return version;
}
// 获取Android的版本号
export const getAndroidVersion = () => {
  const ua = navigator.userAgent.toLowerCase();
  var version = null;
  if (ua.indexOf('android') > 0) {
    const reg = /android [\d._]+/gi;
    const vInfo = ua.match(reg);
    version = (vInfo + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.'); // 得到版本号4.2.2
    // version = parseInt(version.split('.')[0]);// 得到版本号第一位
  }
  return version;
}
// 获取微信的版本号
export const getWeixinVersion = () => {
  var wechatInfo = navigator.userAgent.match(/MicroMessenger\/([.\d]+)/i);
  return wechatInfo[1];
}
/**
 * 比较版本号
 * @param  currentVersion, preVersion
 */
export const compareVersion = (currentVersion, preVersion) => {
  const arr1 = currentVersion.split('.')
  const arr2 = preVersion.split('.')
  const length1 = arr1.length
  const length2 = arr2.length
  const minlength = Math.min(length1, length2)
  let i = 0
  for (i; i < minlength; i++) {
    let a = parseInt(arr1[i] || 0)
    let b = parseInt(arr2[i] || 0)
    if (a > b) {
      return 1
    } else if (a < b) {
      return -1
    }
  }
  if (length1 > length2) {
    for (let j = i; j < length1; j++) {
      if (parseInt(arr1[j]) !== 0) {
        return 1
      }
    }
    return 0
  } else if (length1 < length2) {
    for (let j = i; j < length2; j++) {
      if (parseInt(arr2[j]) !== 0) {
        return -1
      }
    }
    return 0
  }
  return 0
}
/**
 * less防污染命名
 * @param {String} prefix  - Unique Key
 * @param {styles} styles  - sass style
 */
export const classnames = (prefix, styles) => {
  const cx = classname.bind(styles);
  return (...names) =>
    cx(
      _.map(names, name => {
        if (typeof name === 'string') {
          return `${prefix}-${name}`;
        } else if (typeof name === 'object') {
          const returnObj = {};
          for (const key in name) {
            if (Object.prototype.hasOwnProperty.call(name, key)) {
              const element = name[key];
              returnObj[`${prefix}-${key}`] = element;
            }
          }
          return returnObj;
        }
        return '';
      })
    );
}
/**
 * 类名命名,返回函数cx(),支持数组
 * @param {String} classPrefix  - className
 */
export const classFix = classPrefix => (className = '') => {
  if (typeof className === 'string') return classPrefix ? `${classPrefix}-${className}` : classPrefix
  else if (Array.isArray(className) && className.length > 0) return className.map(i => (i || i === 0) ? `${classPrefix}-${i}` : '').join(' ')
  return classPrefix
}
/**
 * 展示微信蒙层
 */
export const showWxToast = () => {
  const wxMask = document.getElementById('wx-mask')
  wxMask && (wxMask.ontouchend = () => (wxMask.style.display = 'none'))
  wxMask.style.display = 'block'
}
// 把数据分段成二维数组，每一项等量个数，用于数据转行
export const getSliceArray = (arr = [], n = 4) => {
  if (isNaN(Number(n)) || !Array.isArray(arr)) return []
  return Array.from({ length: Math.ceil(arr.length / n) }).map((_, index) => {
    return arr.slice(n * index, n * (index + 1))
  })
}
