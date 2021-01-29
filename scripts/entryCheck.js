/**
 * 读取src/views/index.js 中的 entry配置, 通过用户的选择, 得到entry内容, 并将entry结果写到一个临时文件中
 * @author libx@inke.cn 2019.10.18
 */
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const paths = require('./config/paths')
const entryConfig = require(`${paths.views}`)
const { objToString } = require('./utils/objToString')

const CHOICE_COMBLINE_SIGN = ' - '

const promptEntrySelect = function promptEntrySelect() {
  const ENTRY_SELECT = 'ENTRY_SELECT'
  const prompt = {
    type: 'checkbox',
    name: ENTRY_SELECT,
    message: '请选择想要构建的entry (可多选)',
    choices: Object.entries(entryConfig)
      .reduce(
        (choices, [key, value]) =>
          choices.concat([key, value.title].join(CHOICE_COMBLINE_SIGN)),
        []
      )
  }
  return inquirer.prompt(prompt).then(res => {
    const select = res[ENTRY_SELECT]
    if (select.length === 0) {
      console.log(chalk.red('请选择想要构建的entry, 按 <空格(space)> 进行选择'))
      process.exit(1)
    } else {
      return select.reduce((obj, selectId) => {
        // 不可以直接通过'-'来分割, 因为有些entry的名字就带有'-', 如: gift-mananger
        let entryName = selectId.split(CHOICE_COMBLINE_SIGN)[0]
        if (entryName && Object.prototype.hasOwnProperty.call(entryConfig, entryName)) {
          obj[entryName] = entryConfig[entryName]
        }
        return obj
      }, {})
    }
  })
}

const transFuncToStr = obj => Object.entries(obj).reduce((target, [key, val]) => {
  if (typeof val === 'function') {
    // 通过地址引用
    target[key] = val.toString()
  }
  return target
}, obj)

const writeDataToFile = function writeDataToFile(filePath, obj) {
  const fileData = `module.exports = ${objToString(obj)}\n`
  return new Promise((resolve, reject) => {
    // 不推荐使用fs.exist, 详见 http://nodejs.cn/api/fs.html#fs_fs_access_path_mode_callback
    fs.writeFile(filePath, fileData, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

const entryCheck = function entryCheck() {
  return promptEntrySelect(entryConfig)
    .then(obj => writeDataToFile(paths.prodEntryViews, obj))
}

// const next = () => console.log('entryCheck write entry views: ', require(paths.prodEntryViews))

// promptEntrySelect()
//   .then(console.log)

// writeDataToFile(paths.prodEntryViews, entryConfig)
//   .then(next)

// const objWithFunc = {
//   title: '映客直播',
//   getUrl: function getUrl(url) {
//     return url.trim()
//   },
// }
// writeDataToFile(paths.prodEntryViews, objWithFunc)
//   .then(next)

// entryCheck()
//   .then(next)

module.exports = entryCheck
