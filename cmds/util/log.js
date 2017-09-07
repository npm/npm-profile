'use strict'
const log = require('npmlog')

module.exports = section => {
  const args = [section]
  const logger = {}
  Object.keys(log.levels).forEach(level => {
    const fn = log[level]
    logger[level] = function () {
      return fn.apply(null, args.concat([].slice.call(arguments)))
    }
  })
  return logger
}
