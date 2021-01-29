/**
 * 获取输入参数类型
 * @param {any} obj 参数
 */
exports.type = (obj) => {
  return Reflect.apply(Object.prototype.toString, obj, []).replace(/^\[object\s(\w+)\]$/, '$1').toLowerCase()
}

/**
 * 类似 JSON.stringify ，将 function 类型的值转为字符串
 * @param {any} o 参数
 */
exports.objToString = (o) => {
  switch (this.type(o)) {
    case 'function':
    case 'number':
    default:
      return o.toString()
    case 'null':
    case 'undefined':
      return `${o}`
    case 'string':
      return `'${o}'`
    case 'array':
      return `[${o.map(item => this.objToString(item))}]`
    case 'object':
      return JSON.stringify(o, function(key, val) {
        if (typeof val === 'function') {
          return val + '';
        }
        return val;
      })
  }
}
