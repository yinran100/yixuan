const paths = require('./paths')
const path = require('path')
const { getEntryAndShortcut } = require('../utils/common')
const { judgePathExist } = require('../utils/webpackDevServerUtils')
const { armsTpl, getNoUseArmsTpl } = require('../tpl/arms')

// 生产环境统一读取临时写入的 prodEntryViews.json 文件
const entryConfig = getEntryAndShortcut(process.env.NODE_ENV === 'development' ? require(`${paths.views}`) : require(`${paths.prodEntryViews}`))
const entryConfigKeys = Object.keys(entryConfig)
const entryConfigEntries = Object.entries(entryConfig)

const entries = entryConfigKeys.reduce((entryObj, key) => {
  entryObj[key] = `${paths.pages}/${judgePathExist(key)}index.js`
  return entryObj
}, {})

const entryConfigValues = entryConfigKeys.map((entryKey) => {
  let entryValue = entryConfig[entryKey];
  entryValue.filePath = entryKey;
  entryValue.entryKey = entryKey;
  return entryValue;
})

const entryConfigVal = entryConfigValues;

const entryProxyFiles = entryConfigKeys
  .map((entryKey) => `${paths.pages}/${entryKey}/proxyRules.js`)
  .concat([path.resolve(paths.appCommonEntry, 'proxyRules.js')])
  .filter(Boolean)

const keyValueArgsTrans = (fn = () => {}) => ([key, value]) => fn(key, value)

const generateScriptTag = (src) => `<script cdn-rendered src="${src}"></script>`

/**
 * 注入脚本
 */
const handleInjectScript = ([key, value]) => {
  if (value.injectScript && Array.isArray(value.injectScript)) {
    let script = value.injectScript.map(generateScriptTag).join('\n')
    value.scriptList = script
  }
  return [key, value]
}

/**
 * 注入 arms 参数，处理 useArms 属性
 */
const handleUseArms = ([key, value]) => {
  const useArms = value.useArms
  if (useArms && process.env.NODE_ENV === 'production') {
    switch (typeof useArms) {
      case 'boolean':
      case 'string':
        value = Object.assign(value, armsTpl())
        break
      case 'object':
        value = Object.assign(value, armsTpl(useArms))
        break
      default:
        throw new TypeError(`Unable to parse this script: ${useArms}`)
    }
    delete value.useArms
  } else {
    value = Object.assign(value, getNoUseArmsTpl())
  }
  return [key, value]
}

const composeMap = handler => {
  if (!Array.isArray(handler)) {
    throw new TypeError(`${handler} must be an array!`)
  }

  return handler.reduce((prev, curr) => (...args) => prev(curr(...args)))
}

const entryComposedList = entryConfigEntries.map(composeMap([
  handleUseArms,
  handleInjectScript
]))

module.exports = {
  entries,
  entryConfigVal,
  entryConfigKeys,
  entryConfigValues,
  entryChunkNames: Object.keys(entries),
  entryConfigEach: fn => entryComposedList.forEach(keyValueArgsTrans(fn)),
  entryConfigMap: fn => entryComposedList.map(keyValueArgsTrans(fn)),
  entryProxyEach: fn => entryProxyFiles.forEach(fn),
}
