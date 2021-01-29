const paths = require('./paths')
const path = require('path')

const srcPathResolve = relativePath => path.resolve(paths.appSrc, relativePath)

const matchVscodeCompilerPath = obj => {
  // 根路径标识
  const ROOT_SRC_ALIA = '@'
  return Object.entries(obj)
    .reduce((result, [key, value]) => {
      if (key.indexOf(ROOT_SRC_ALIA) === -1) {
        key = `${ROOT_SRC_ALIA}${key}`
      }
      result[key] = value
      return result
    }, obj) // 在原obj基础上修改
}

module.exports = matchVscodeCompilerPath({
  antd: 'ik-antd',
  'antd-mobile': 'ik-antd-mobile',
  '@': paths.appSrc,
  src: paths.appSrc,
  pages: srcPathResolve('pages'),
  bridgex: srcPathResolve('bridgex'),
  entry: srcPathResolve('entry'),
  resources: srcPathResolve('resources'),
  styles: srcPathResolve('styles'),
  config: srcPathResolve('config'),
  components: srcPathResolve('components'),
  ikc: srcPathResolve('components/ikc'),
  mocks: srcPathResolve('mocks'),
  utils: srcPathResolve('utils'),
  decorator: srcPathResolve('decorator'),
  'react-activation': 'ik-react-activation'
})
