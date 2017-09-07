'use strict'
exports.status = status
exports.enable = enable
exports.disable = disable

const Bluebird = require('bluebird')
const read = Bluebird.promisify(require('read'))
const log = require('./util/log.js')('profile:set')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const yargs = require('yargs')
const url = require('url')
const queryString = require('query-string')
const qrcodeTerminal = require('qrcode-terminal')

function qrcode (url) {
  return new Bluebird(resolve => qrcodeTerminal.generate(url, resolve))
}

async function status (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const info = await profile.get(argv.registry, {token, otp: argv.otp})
    let status
    if (info.tfa) {
      if (info.tfa.pending) {
        status = 'pending'
      } else {
        status = info.tfa.mode
      }
    } else {
      status = 'disabled'
    }
    console.log('two factor authentication:', status)
  } catch (ex) {
   if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

async function enable (argv) {
  if (argv.mode !== 'auth-only' && argv.mode !== 'auth-and-writes') {
    console.error('Valid modes are:')
    console.error('  auth-only - Require two-factor authentication only when logging in')
    console.error('  auth-and-writes - Require two-factor authentication when logging in AND when publishing')
    process.exit(1)
  }
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const password = await readPassword()
    const info = {
      tfa: {
        password,
        mode: argv.mode
      }
    }
    let challenge = await profile.set(info, argv.registry, {token, otp: argv.otp})
    if (challenge.tfa === null) {
      let result = await profile.set({tfa: {password, mode: 'disable'}}, argv.registry, {token, otp: argv.otp})
      console.log(result)
      challenge = await profile.set(info, argv.registry, {token, otp: argv.otp})
    }
    if (typeof challenge.tfa !== 'string' || !/^otpauth:[/][/]/.test(challenge.tfa)) {
    console.log(challenge)
      console.error('Unknown error enabling two-factor authentication. Expected otpauth URL, got:', challenge.tfa)
      process.exit(1)
    }
    const otpauth = url.parse(challenge.tfa)
    const opts = queryString.parse(otpauth.query)
    const code = await qrcode(challenge.tfa)    
    console.log('Scan into your authenticator app:\n' + code + '\n Or enter code:', opts.secret)
    const otp1 = await readOtp('And first OTP code:  ')
    const otp2 = await readOtp('And second OTP code: ')
    const result = await profile.set({tfa: [otp1, otp2]}, argv.registry, {token, otp: argv.otp})
    console.log('TFA successfully enabled. Below are your recovery codes, please print these out.')
    console.log('You will need these to recover access to your account if you lose your authentication device.')
    result.tfa.forEach(c => console.log('\t' + c))
  } catch (ex) {
   if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

async function disable (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const password = await readPassword()
    const result = await profile.set({tfa: {password, mode: 'disable'}}, argv.registry, {token, otp: argv.otp})
    console.log(result)
  } catch (ex) {
   if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

function readPassword (password) {
  if (password) return password
      
  return read({prompt: 'Password: ', silent: true, default: password || ''})
    .then(readPassword)
}

function readOtp (msg, otp) {
  if (otp && /^[\d ]+$/.test(otp)) return otp.replace(/\s+/g, '')

  return read({prompt: msg, default: otp || ''})
    .then(otp => readOtp(msg, otp))
}
