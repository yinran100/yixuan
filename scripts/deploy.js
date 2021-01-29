const inquirer = require('inquirer');
const { spawnSync, execSync, exec, spawn } = require('child_process');
const chalk = require('chalk');
const { autoPublish } = require('ik-release');
const { readFileDisplay } = require('./utils/readFile')
const path = require('path')
const fs = require('fs')
const { getCliName } = require('./utils/common')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const open = require('open')
const distRoot = resolveApp('_dist')

const npmCli = getCliName('npm')
const deployCli = getCliName('ik-deploy')

const PROMPT_LIST = [{
  type: 'input',
  message: '输入项目名称:',
  name: 'project'
}, {
  type: 'input',
  message: '请输入发布内容:',
  name: 'desc'
}];

const createLog = chalkFunctor => msg => console.log(chalkFunctor(msg))

const purpleLog = createLog(chalk.hex('#ff1f96').underline)
const redLog = createLog(chalk.red)
const greenLog = createLog(chalk.hex('#00d364'))
const IS_ONLINE_STATUS = process.env.SCRIPT_ENV === 'prod'
const IS_COPY_CDN = process.env.COPY_CDN === 'true'

const openDistServer = () => {
  spawn(`node`, [ 'scripts/distServer.js', '--dist-root=_dist', '--open' ], { stdio: 'inherit' });
  greenLog('open dist-server done')
}

// 没法close, 这时候关闭端口又好像太暴力
const closeDistServer = () => {

}

const openRemoteAddress = () => {
  readFileDisplay({
    filePath: distRoot,
    extensions: ['.html'],
    matchedExtensionCallback: function (res) {
      const url = `${process.env.TARGET_HOST || ''}/${res.relativeFileDir.replace(/\//, '')}`
      open(url)
      console.log(url)
      console.log()
    }
  })
}

const triggerCommand = (command, events = {}) => {
  return new Promise((resolve, reject) => {
    const res = command()
    if (res && res.status === 0) {
      resolve(res)
      events.onSuccess && events.onSuccess(res)
    } else {
      events.onError && events.onError(res)
      reject(res)
    }
  })
}

const getMessage = () => inquirer.prompt(PROMPT_LIST)
const startBuild = () => triggerCommand(() => spawnSync(npmCli, [ 'run', 'build' ], { stdio: 'inherit' }))
const startDepoloy = () => triggerCommand(() => spawnSync(deployCli, [], { stdio: 'inherit' }), {
  onSuccess (res) {
    greenLog('deploy done')
  },
  onError (res) {
    // 命令不存在, 表示未安装
    if (res && res.error) {
      if (res.error.code === 'ENOENT') {
        redLog('ik-deploy未全局安装，请执行以下命令进行全局安装：')
        purpleLog('yarn add -g git+ssh://git@code.inke.cn:opd/fe-aws/modules/ik-deploy.git')
      } else {
        redLog('ik-deploy 报错, 请检查错误重新执行命令')
      }
    }
  }
})

const startBuildReleaseDeploy = async _ => {
  const message = await getMessage()
  // 开始构建
  // 执行npm run build命令
  await startBuild()
  greenLog('build done')

  if (!IS_COPY_CDN) {
    openDistServer()
  }

  // 执行 ik-release 的copy和git操作
  await autoPublish(message)
  greenLog('release done')

  // 线上环境不允许deploy, 除非有cdn发布, 需要再ik.deploy.config里做好判断, 线上只有cdn是自动发布
  if (!IS_ONLINE_STATUS || IS_COPY_CDN) {
    // 开始ik-deploy到远端
    await startDepoloy()
  }

  if (IS_COPY_CDN) {
    greenLog('cdn已发布完成, 请严格按照README中的说明, 提交merge request, 并发布boc.inke.cn, 💪相信你自己, 你是最棒的👍')
    openDistServer()
  } else if (!IS_ONLINE_STATUS) {
    // 测试环境 & 灰度环境 打开远端地址
    openRemoteAddress()
  }

  closeDistServer()
}

const startBuildAndCheck = async () => {
  await startBuild()
  openDistServer()
}

const startBuildCheckRelease = async () => {
  const message = await getMessage()

  await startBuild()
  greenLog('build done')

  openDistServer()

  // 执行 ik-release 的copy和git操作
  await autoPublish(message)
  greenLog('release done')
}

// openRemoteAddress()
// openDistServer()
const scriptsEnvs = {
  BUILD_CHECK: startBuildAndCheck,
  BUILD_CHECK_RELEASE: startBuildCheckRelease,
  BUILD_RELEASE_DEPLOY: startBuildReleaseDeploy
}
try {
  let command
  for (let name in scriptsEnvs) {
    if (process.env[name]) {
      command = scriptsEnvs[name]
      command && command()
      break
    }
  }

  if (!command) {
    startBuildReleaseDeploy()
  }
} catch (e) {
  redLog('deploy fail: ' + JSON.stringify(e))
}
