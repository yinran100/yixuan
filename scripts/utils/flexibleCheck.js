const chalk = require('chalk');

const DEFAULT_BASESIZE = 750;

/**
 * 监测entry中同一个key的配置是否相同
 * 因为entry虽然支持配置多样化, 但是某些key是不能在多entry中配置不同的值的, 如baseSize px2Rem等
 *
 * @param {String} theCheckKey 监测的key
 * @param {Array} entryConfigValues config配置各个值的数组
 * @param {Boolean|String|Number} defaultValue 默认值
 * @param {Function} formatValue 转换函数
 */
const checkSameEntryConfig = theCheckKey => (entryConfigValues, defaultValue, formatValue = v => v) => {
  if (!Array.isArray(entryConfigValues)) {
    console.log(chalk.red('入口配置错误'))
    process.exit(1);
  }

  const targetValue = formatValue(entryConfigValues[0][theCheckKey]);
  // 当只存在一个入口配置
  if (entryConfigValues.length === 1) {
    return targetValue
  }
  const isSameValue = entryConfigValues.every(entryConfigObj => {
    const currentValue = formatValue(entryConfigObj[theCheckKey]);
    const isSameValue = currentValue === targetValue;
    if (!isSameValue) {
      console.log(chalk.red(`项目根目录src/views文件夹下的入口文件配置项${theCheckKey}需要配置相同，默认是${defaultValue}`));
      console.log(chalk.red(`项目根目录src/views文件夹下index.js文件中，key为${entryConfigObj.filePath}的${theCheckKey}值是${currentValue}，key为${entryConfigValues[0].filePath}的${theCheckKey}值是${targetValue}，存在冲突，请修改`));
      console.log(chalk.red(`如果存在需要配置不同${theCheckKey}的情况，请按照${theCheckKey}相同的分组多次构建`));
    }
    return isSameValue;
  });
  if (!isSameValue) {
    process.exit(1);
  }
  return targetValue;
}

// 监测baseSize
exports.checkBaseSize = checkSameEntryConfig('baseSize')

// 监测px2rem
exports.checkIsPx2Rem = checkSameEntryConfig('isPx2rem')
