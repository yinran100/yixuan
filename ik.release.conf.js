const { version } = require('ik-release/package.json')
const { checkout, getBranchName, dispatcher } = require('ik-release')
const { spawn, execSync } = require('child_process')
const chalk = require('chalk');
const semver = require('semver')
const opn = require('opn')
const { getCliName } = require('./scripts/utils/common')
const { getNewMergeRequestUrl } = require('.//scripts/utils/git')

const npmCli = getCliName('npm')
const IS_ONLINE_STATUS = process.env.SCRIPT_ENV === 'prod'
const IS_COPY_CDN = process.env.COPY_CDN
const envMap = { // 环境变量配置
  test: {
    branch: 'test',
    maxChangesLimit: 100,
  },
  gray: {
    branch: 'gray',
    maxChangesLimit: 100,
  },
  prod: {
    branch: 'release',
    maxChangesLimit: IS_COPY_CDN ? 10 : 100,
  }
}
const envConfig = envMap[process.env.SCRIPT_ENV]

if (semver.lt(version, '0.8.9')) {
  console.log(chalk.red(`[ik-release]版本过低, 请执行cnpm install ik-release, 再进行自动化提交, 谢谢`))
  console.log()
  process.exit(1)
}
const originBranchName = getBranchName()

const unOnlineTask = {
  source: '_dist', // copy 文件夹
  destinationFolder: 'dist', // 目标仓库文件夹
  destinationCwd: '.', // 目标仓库位置
  destinationBranch: envConfig.branch,
  filter: [],
  onCopyStart() {
    execSync('git pull')
  },
  onPullStart ({ commitDesc }) {
    return dispatcher({ type: 'GIT_PUSH_TASK', config: unOnlineTask, commitDesc })
  },
  onCommitEnd () {
    checkout(originBranchName)
  }
}

const onlineTask = {
  source: '_dist', // copy 文件夹
  destinationFolder: 'dist', // 目标仓库文件夹
  destinationCwd: '.', // 目标仓库位置
  destinationBranch: originBranchName,
  filter: [],
  onCommitEnd () {
    // spawn(npmCli, [ 'run', 'merge-requests' ], { stdio: 'inherit' })
    opn(getNewMergeRequestUrl())
  }
}

module.exports = { // ik-release 读取配置
  isNeedGitHandle: true, // 是否包含 git 操作 type: Boolean
  task: [
    IS_ONLINE_STATUS ? onlineTask : unOnlineTask,
    IS_COPY_CDN && {
      source: 'dist', // 要copy的文件夹
      destinationFolder: '../static-resources/h5.inke.cn/ik-h5-react', // 目标文件夹
      destinationCwd: '../static-resources', // 目标仓库位置
      destinationBranch: 'master', // 要提交的分支
      destinationRepo: 'git@code.inke.cn:tpc/sre/static-resources.git', // 目标仓库地址
      filter: [/\.(js|css|png|jpg|jpeg|gif|eot|woff|svg|ttf|ico|woff2)$/],
    },
  ].filter(Boolean)
}
