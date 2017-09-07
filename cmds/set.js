'use strict'
module.exports = set
const Bluebird = require('bluebird')
const log = require('./util/log.js')('profile:set')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')

const blacklist = [ 'email_verified', 'tfa' ]

async function set (argv) {
  if (blacklist.indexOf(argv.property) !== -1) {
    console.error(`You can't set "${argv.property}" via this command`)
    process.exit(1)
  }
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const info = {}
    if (argv.property === 'cidr_whitelist') {
      info[argv.property] = argv.value.split(/,\s*/)
    } else {
      info[argv.property] = argv.value
    }
    const result = await profile.set(info, argv.registry, {token, otp: argv.otp})
    console.log('Set', argv.property, 'to', info[argv.property])
  } catch (ex) {
   if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}
