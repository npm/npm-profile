'use strict'
const ini = require('ini')
const Bluebird = require('bluebird')
const fs = require('fs')
const readFile = Bluebird.promisify(fs.readFile)
const writeFile = Bluebird.promisify(fs.writeFile)
const url = require('url')

exports.read = read
exports.write = write
exports.getAuthToken = getAuthToken
exports.setAuthToken = setAuthToken

async function read (file) {
  try {
    return ini.decode(await readFile(file, 'utf8'))
  } catch (ex) {
    return {}
  }
}

function write (file, conf) {
  delete conf.auth
  delete conf.creds
  return writeFile(file, ini.encode(conf))
}

function getAuthToken (conf, registry) {
  const prop = registryKey(registry) + ':_authToken'
  return conf[prop]
}

function setAuthToken (conf, registry, token) {
  const prop = registryKey(registry) + ':_authToken'
  conf[prop] = token
}

function registryKey (registry) {
  const parsed = url.parse(registry)
  const formatted = url.format({
    host: parsed.host,
    pathname: parsed.pathname,
    slashes: parsed.slashes
  })
  return url.resolve(formatted, '.')
}
