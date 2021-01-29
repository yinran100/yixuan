const objToString = Object.prototype.toString

exports.isObject = a => objToString.call(a) === '[object Object]'
