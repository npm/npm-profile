'use strict'
module.exports = login
const read = require('./util/read.js')
const log = require('./util/log.js')('profile:auth')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const opener = require('opener')

const prompter = async creds => {
  const opts = { log: log }
  creds.name = await read.username(creds.name, opts)
  creds.password = await read.password()
  return creds
}


// when called, this already has name and password
const readOTP = async () => {
  return await read.otp('Authenticator provided OTP:')
}

async function login (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  conf.registry = argv.registry
  conf.creds = conf.creds || {}
  if (argv.username)
    conf.creds.name = argv.username
  let result
  try {
    try {
      result = await profile.login(opener, prompter, conf)
    } catch (er) {
      if (er.code !== 'EOTP')
        throw er
      conf.auth = conf.auth || {}
      conf.auth.otp = await readOTP()
      const name = conf.creds.name
      const pass = conf.creds.password
      result = await profile.loginCouch(name, pass, conf)
    }
    npmrc.setAuthToken(conf, conf.registry, result.token)
    await npmrc.write(argv.config, conf)
    const msg = result.name ? ' as ' + result.name : ''
    console.error(result)
    console.log('Logged in%s', msg)
  } catch (er) {
    if (er.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
    } else {
      throw er
    }
  }
}
