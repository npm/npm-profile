'use strict'
module.exports = get
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const treeify = require('treeify')

async function get (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const info = await profile.get(argv.registry, {token, otp: argv.otp})
    if (argv.property) {
      console.log(JSON.stringify(info[argv.property]))
    } else {
      if (!info.cidr_whitelist) delete info.cidr_whitelist
      console.log(treeify.asTree(info, true))
    }
  } catch (ex) {
    if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}
