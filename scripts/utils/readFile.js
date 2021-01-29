const fs = require('fs')
const path = require('path')
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const defaulOptions = {
  filePath: fs.realpathSync(process.cwd()),
  extensions: ['.html'],
  matchedExtensionCallback: function (result) {
    // console.log('matchedExtensionCallback: ', result)
  }
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
exports.readFileDisplay = function (options) {
  options = Object.assign({}, defaulOptions, options || {})
  const rootFilePath = options.filePath

  const fileDisplay = function (filePath) {
    // 根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function(err, files) {
      if (err) {
        console.warn(err)
      } else {
        // 遍历读取到的文件列表
        files.forEach(function (filename) {
          // 获取当前文件的绝对路径
          // console.log('filename: ', filePath, filename, path.extname(filename))
          var filedir = path.join(filePath, filename);
          // 根据文件路径获取文件信息，返回一个fs.Stats对象
          fs.stat(filedir, function(eror, stats) {
            if (eror) {
              console.warn('获取文件stats失败');
            } else {
              var isFile = stats.isFile(); // 是文件
              var isDir = stats.isDirectory();// 是文件夹
              if (isFile && options.extensions.indexOf(path.extname(filename)) > -1) {
                options.matchedExtensionCallback({
                  filename,
                  relativeFileDir: path.join(filePath.replace(rootFilePath, ''), filename)
                })
              }
              if (isDir) {
                fileDisplay(filedir, options); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
              }
            }
          })
        });
      }
    });
  }

  return fileDisplay(options.filePath)
}
