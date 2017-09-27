'use strict'
exports.list = list
exports.create = create
exports.rm = rm

const read = require('./util/read.js')
const npmrc = require('./util/npmrc.js')
const profile = require('../lib')
const cliui = require('cliui')
const validateCIDR = require('./util/validate-cidr.js')
const treeify = require('treeify')

function table () {
  const headers = [].slice.apply(arguments)
  headers.forEach(head => {
    if (head.width) {
      head.width += 2
      head.padding = [0, 2, 0, 0]
    }
  })
  const ui = cliui({width: process.stdout.columns})
  ui.div.apply(ui, headers)
  const td = function () {
    const data = [].slice.apply(arguments).map((value, ii) => {
      return Object.assign({}, headers[ii], {
        text: headers[ii].width ? value.slice(0, headers[ii].width - 2) : value
      })
    })
    ui.div.apply(ui, data)
  }
  td.toString = () => ui.toString()
  return td
}

function generateTokenIds (tokens, minLength) {
  const byId = {}
  tokens.forEach(token => {
    token.id = token.key
    for (let ii = minLength; ii < token.key.length; ++ii) {
      if (!tokens.some(ot => ot !== token && ot.key.slice(0, ii) === token.key.slice(0, ii))) {
        token.id = token.key.slice(0, ii)
        break
      }
    }
    byId[token.id] = token
  })
  return byId
}

async function list (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const tokens = await profile.listTokens({registry: argv.registry, auth: {token, otp: argv.otp}})
    generateTokenIds(tokens, 6)
    const idWidth = tokens.reduce((acc, token) => Math.max(acc, token.id.length), 0)
    const td = table(
      {text: 'id', width: Math.max(idWidth, 2)},
      {text: 'token', width: 7},
      {text: 'created', width: 10},
      {text: 'readonly', width: 8},
      {text: 'CIDR whitelist'}
    )
    tokens.forEach(token => {
      td(token.id, token.token + '…', token.created, token.readonly ? 'yes' : 'no', token.cidr_whitelist ? token.cidr_whitelist.join(', ') : '')
    })
    console.log(td.toString())
  } catch (ex) {
    if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

async function create (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const password = await read.password()
    const cidr = validateCIDR.list(argv.cidr)
    let result
    try {
      result = await profile.createToken(password, argv.readonly, cidr, {registry: argv.registry, auth: {token, otp: argv.otp}})
    } catch (ex) {
      if (ex.code !== 401 || argv.otp) throw ex
      // if profile.get doesn't throw then their auth token is ok and we probably should prompt for otp
      if (ex.code !== 'otp') await profile.get({registry: argv.registry, auth: {token, otp: argv.otp}})
      const otp = await read.otp('Authenicator provided OTP:')
      result = await profile.createToken(password, argv.readonly, cidr, {registry: argv.registry, auth: {token, otp}})
    }
    console.log(treeify.asTree(result, true))
  } catch (ex) {
    if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}

async function rm (argv) {
  try {
    const conf = await npmrc.read(argv.config)
    const token = npmrc.getAuthToken(conf, argv.registry)
    const tokens = await profile.listTokens({registry: argv.registry, auth: {token, otp: argv.otp}})
    const byId = generateTokenIds(tokens, 6)
    if (!byId[argv.id]) {
      if (tokens.some(token => token.id.slice(0, argv.id.length) === argv.id)) {
        console.error('Token ID was ambiguous, a new token may have been created since you last ran `npm-profile token list`.')
        process.exit(1)
      } else {
        console.error('Unknown token ID. Token IDs must come from the output of `npm-profile token list`. They are NOT the token itself.')
        process.exit(1)
      }
    }
    const key = byId[argv.id].key
    await profile.removeToken(key, {registry: argv.registry, auth: {token, otp: argv.otp}})
    console.log('Token removed.')
  } catch (ex) {
    if (ex.code === 401) {
      throw ex.message
    } else {
      throw ex
    }
  }
}
