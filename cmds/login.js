'use strict'
module.exports = login
const read = require('./util/read.js')
const log = require('./util/log.js')('profile:auth')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const retryWithOTP = require('./util/retry-with-otp')

async function login (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  try {
    const username = await read.username(argv.username, opts)
    const password = await read.password()
    const result =  await retryWithOTP({
      otp: argv.otp,
      get: () => read.otp('Authenticator provided OTP:'),
      fn: otp => profile.login(username, password, {registry: argv.registry, auth: {otp}})
    })
    npmrc.setAuthToken(conf, argv.registry, result.token)
    await npmrc.write(argv.config, conf)
    console.log('Logged in as:', username)
  } catch (ex) {
    if (ex.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
    } else if (ex.code === 'E400' || ex.code === 'E401' || ex.code === 'E409') {
      throw ex.message
    } else {
      throw ex
    }
  }
}
