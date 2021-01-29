#!/usr/bin/env node
// 用于检测被提交的文件里，有没有冲突标记
// 如果逻辑代码有这种标记字符串，为了避免报错，可以在上一行增加备注 /* disable-check-conflict */

function getBLen(str) {
  if (str == null) return 0
  if (typeof str != 'string') {
    str += ''
  }
  return str.replace(/[^\x00-\xff]/g, '01').length
}
const chalk = require('chalk')
const { spawnSync } = require('child_process')
const command = 'git status -s'
const commandFile = 'git ls-files --stage'

/* disable-check-conflict */
const matchReg = /(<<<<<<|>>>>>>)/
const fileMap = {} // 通过文件路径得到hash
// 获取git改动清单
const getArrList = (str, types) => {
  const arr = str.split('\n')
  return arr.map(item => {
    return {
      stage: item[0],
      staging: item[1],
      filepath: item.substr(3),
    }
  })
}
// 根据文件获取路径获取内容，返回内容数组
const getFileLine = async file => {
  const hash = fileMap[file]
  if (hash) {
    const list = await new Promise((resolve, reject) => {
      const command = `git show ${hash}`;
      const { stdout, stderr } = spawnSync(command, [], {
        shell: true,
        windowsVerbatimArguments: true
      });
      const data = stdout.toString();
      const err = stderr.toString();
      const str = data.toString();
      const temp = str.split('\n');
      if (err) {
        console.error(`stderr: ${err}`);
      } else {
        resolve(temp)
      }
    });
    return list
  }
  return []
}
// 获取暂存区文件的内容的哈希 （并非此时本地文件的内容）
const getFileHash = () => {
  const { stdout, stderr } = spawnSync(commandFile, [], {
    shell: true,
    windowsVerbatimArguments: true
  });
  const data = stdout.toString();
  const err = stderr.toString();
  if (err) {
    console.error(`stderr: ${err}`);
  } else {
    const temp = data.split('\n');
    temp.forEach(line => {
      const res = line.split(/\s|\t/g)
      fileMap[res[3]] = res[1]
    })
  }
}
getFileHash()

const ignore = line => line && line.match(/\\*/) && line.match(/disable-check-conflict/)

const checkStageFile = () => {
  const { stdout, stderr } = spawnSync(command, [], {
    shell: true,
    windowsVerbatimArguments: true
  });
  const data = stdout.toString();
  const err = stderr.toString();
  if (err) {
    console.error(`stderr: ${err}`);
  } else {
    const typeList = ['M', 'A'] //  'M': '修改', 'D': '删除', 'A': '新增'
    let fileArr = getArrList(data)
    fileArr = fileArr.filter(item => item.stage !== ' ' && item.stage !== 'D' && item.filepath).map(i => i.filepath)
    // console.log('stageFiles => ', fileArr)
    fileArr.forEach(async (filepath, fileIndex) => {
      const lineContent = await getFileLine(filepath)
      const len = lineContent.length
      lineContent.forEach((line, index) => {
        const res = line.match(matchReg)
        if (res && ((len > 1 && !ignore(lineContent[index - 1])) || len === 1)) {
          const startIndex = index - 5 <= 0 ? 0 : index - 5;
          const endIndex = index + 5 >= len ? len : index + 5;
          lineContent.slice(startIndex, endIndex).forEach((l, i) => {
            if (l.match(matchReg)) {
              console.log(chalk.red((index - 1 + i) + l))
            } else {
              console.log(chalk.green((index - 1 + i) + l))
            }
          })
          console.log(`【暂存区】${filepath}文件有未解决的冲突，请解决后提交!!!!`)
          console.log(`【暂存区】${filepath}文件有未解决的冲突，请解决后提交!!!!`)
          process.exit(1);
        }
      })
      if (fileIndex === fileArr.length - 1) console.log('没有检测到冲突标记~')
    })
  }
}

checkStageFile()
