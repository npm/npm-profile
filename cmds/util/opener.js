'use strict'
const opener = require('opener')

/* istanbul ignore else */
if (process.env.TEST_NPM_PROFILE) {
  module.exports = async url => console.log(url)
} else {
  module.exports = async url => new Promise((resolve, reject) =>
    opener(url, er => er ? reject(er) : resolve))
}
