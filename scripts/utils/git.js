const { exec, execSync } = require('child_process')
const util = require('util')

/**
* @function 获取当前分支名称
*/
exports.getBranchName = function () {
  return execSync('git name-rev --name-only HEAD').toString().replace('\n', '')
}

/**
 * @function 获取当前 git 仓库名
 */
exports.getRepoName = function () {
  // return process.cwd().split('/').pop()
  return execSync(`git remote -v | head -n1 | awk '{print $2}' | sed 's/.*\\///' | sed 's/\\.git//'`).toString().replace('\n', '')
}

/**
 * @function 获取当前仓库远程 http 地址
 */
exports.getRepoHttpsUrl = function () {
  const sshUrl = execSync(`git remote -v | head -n1 | awk '{print $2}'`).toString().replace('\n', '')
  if (sshUrl.indexOf('http') > -1) {
    return sshUrl
  } else {
    return 'https://' + sshUrl.replace(/(\S*@|\.git$)/g, '').replace(':', '/')
  }
}

/**
 * @function 获取 merage request 地址
 */
exports.getNewMergeRequestUrl = function (fromBranch) {
  const httpsUrl = exports.getRepoHttpsUrl()
  const path = '/merge_requests/new'
  const search = '?' + encodeURIComponent(`merge_request[source_branch]=${fromBranch}`)
  return httpsUrl + path + search
}

