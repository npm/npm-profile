'use strict'
module.exports = login
const userValidate = require('npm-user-validate')
const Bluebird = require('bluebird')
const read = Bluebird.promisify(require('read'))
const log = require('./util/log.js')('profile:auth')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')

async function login (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  try {
    console.log(argv.registry)
    const username = (await readUsername(argv.username, opts)).trim()
    const password = await readPassword()
    const result = await profile.login(username, password, argv.registry, {otp: argv.otp})
    npmrc.setAuthToken(conf, argv.registry, result.token)
    await npmrc.write(argv.config, conf)
    console.log("Logged in as:", username)
  } catch (ex) {
    if (ex.message === 'canceled') {
      console.error('\n')
      log.error('canceled')
      return
    } if (ex.code === 400 ||ex.code === 401 || ex.code === 409) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

function readUsername (username, opts) {
  if (username) {
    const error = userValidate.username(username, opts)
    if (error) {
      opts.log && opts.log.warn(error.message)
    } else {
      return username
    }
  }
      
  return read({prompt: 'Username: ', default: username || ''})
    .then(username => readUsername(username, opts))
}

function readPassword (password) {
  if (password) return password
      
  return read({prompt: 'Password: ', silent: true, default: password || ''})
    .then(readPassword)
}

