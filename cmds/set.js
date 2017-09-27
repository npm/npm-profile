'use strict'
module.exports = set
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const validateCIDR = require('./util/validate-cidr.js')
const read = require('./util/read.js')
const retryWithOTP = require('./util/retry-with-otp')

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
      info.cidr_whitelist = validateCIDR.list(argv.value)
    } else if (argv.property === 'password') {
      const oldpassword = await read.password('Current password: ')
      const newpassword = await read.password('New password:     ')
      info.password = {'old': oldpassword, 'new': newpassword}
    } else {
      info[argv.property] = argv.value
    }
    const result = await retryWithOTP({
      otp: argv.otp,
      get: () => read.otp('Authenticator provided OTP:'),
      fn: otp => profile.set(info, {registry: argv.registry, auth: {token, otp}})
    })
    console.log('Set', argv.property, 'to', result[argv.property])
  } catch (ex) {
    if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}
