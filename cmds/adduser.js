'use strict'
module.exports = adduser
const read = require('./util/read.js')
const log = require('./util/log.js')('profile:adduser')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')

async function adduser (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  try {
    const username = await read.username(argv.username, opts)
    const email = await read.email(argv.email, opts)
    const password = await read.password()
    const result = await profile.adduser(username, email, password, argv.registry)
    npmrc.setAuthToken(conf, argv.registry, result.token)
    await npmrc.write(argv.config, conf)
    console.log('Account created:', username)
  } catch (ex) {
    if (ex.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
      return
    } if (ex.code === 400 || ex.code === 401 || ex.code === 409) {
      throw ex.message
    } else {
      throw ex
    }
  }
}
