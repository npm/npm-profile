'use strict'
module.exports = adduser
const read = require('./util/read.js')
const log = require('./util/log.js')('profile:auth')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const opener = require('opener')

const prompter = async creds => {
  const opts = { log: log }
  creds.name = await read.username(creds.name, opts)
  creds.email = await read.email(creds.email, opts)
  creds.password = await read.password()
  return creds
}

async function adduser (argv) {
  const conf = await npmrc.read(argv.config)
  conf.registry = argv.registry
  conf.creds = conf.creds || {}
  if (argv.username) { conf.creds.name = argv.username }
  if (argv.email) { conf.creds.email = argv.email }
  let result
  try {
    result = await profile.adduser(opener, prompter, conf)
    npmrc.setAuthToken(conf, conf.registry, result.token)
    await npmrc.write(argv.config, conf)
    const msg = result.name ? ': ' + result.name : ''
    console.error(result)
    console.log('Account created%s', msg)
  } catch (er) {
    if (er.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
    } else {
      throw er
    }
  }
}
