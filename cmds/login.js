'use strict'
module.exports = login
const read = require('./util/read.js')
const log = require('./util/log.js')('profile:auth')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')

async function login (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  try {
    const username = await read.username(argv.username, opts)
    const password = await read.password()
    let result
    try {
      result = await tryLogin(username, password, argv.registry, argv.otp)
    } catch (ex) {
      if (ex.code === 'otp' && !argv.otp) {
        const otp = await read.otp()
        result = await tryLogin(username, password, argv.registry, otp)
      } else {
        throw ex
      }
    }
    npmrc.setAuthToken(conf, argv.registry, result.token)
    await npmrc.write(argv.config, conf)
    console.log("Logged in as:", username)
  } catch (ex) {
    if (ex.code === 400 ||ex.code === 401 || ex.code === 409) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

async function tryLogin (username, password, registry, otp) {
  try {
    return await profile.login(username, password, registry, {otp})
  } catch (ex) {
    if (ex.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
      return
    } else {
      throw ex
    }
  }
}
