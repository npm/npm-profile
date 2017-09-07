'use strict'
module.exports = create
const userValidate = require('npm-user-validate')
const Bluebird = require('bluebird')
const read = Bluebird.promisify(require('read'))
const log = require('./util/log.js')('profile:create')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')

async function create (argv) {
  const conf = await npmrc.read(argv.config)
  const opts = { log: log }
  try {
    const username = await readUsername(argv.username, opts)
    const email = await readEmail(argv.email, opts)
    const password = await readPassword()
    const result = await profile.create(username, email, password, argv.registry)
    npmrc.setAuthToken(conf, argv.registry, result.token)
    await npmrc.write(argv.config, conf)
    console.log("Account created:", username)
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
      return username.trim()
    }
  }
      
  return read({prompt: 'Username: ', default: username || ''})
    .then(username => readUsername(username, opts))
}

function readEmail (email, opts) {
  if (email) {
    const error = userValidate.email(email)
    if (error) {
      opts.log && opts.log.warn(error.message)
    } else {
      return email.trim()
    }
  }
      
  return read({prompt: 'Email (this IS public): ', default: email || ''})
    .then(username => readEmail(username, opts))
}


function readPassword (password) {
  if (password) return password
      
  return read({prompt: 'Password: ', silent: true, default: password || ''})
    .then(readPassword)
}

