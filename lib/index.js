'use strict'

const fetch = require('npm-registry-fetch')
const os = require('os')
const pudding = require('figgy-pudding')
const url = require('url')
const validate = require('aproba')

exports.adduserCouch = adduserCouch
exports.loginCouch = loginCouch
exports.adduserWeb = adduserWeb
exports.loginWeb = loginWeb
exports.login = login
exports.adduser = adduser
exports.get = get
exports.set = set
exports.listTokens = listTokens
exports.removeToken = removeToken
exports.createToken = createToken

const ProfileConfig = pudding({
  creds: {},
  hostname: {}
})

// try loginWeb, catch the "not supported" message and fall back to couch
function login (opener, prompter, conf) {
  validate('FFO', arguments)
  conf = ProfileConfig(conf)
  return loginWeb(opener, conf).catch(er => {
    if (er instanceof WebLoginNotSupported) {
      process.emit('log', 'verbose', 'web login not supported, trying couch')
      return prompter(conf.creds)
        .then(data => loginCouch(data.username, data.password, conf))
    } else {
      throw er
    }
  })
}

function adduser (opener, prompter, conf) {
  validate('FFO', arguments)
  conf = ProfileConfig(conf)
  return adduserWeb(opener, conf).catch(er => {
    if (er instanceof WebLoginNotSupported) {
      process.emit('log', 'verbose', 'web adduser not supported, trying couch')
      return prompter(conf.creds)
        .then(data => adduserCouch(data.username, data.email, data.password, conf))
    } else {
      throw er
    }
  })
}

function adduserWeb (opener, conf) {
  validate('FO', arguments)
  const body = { create: true }
  process.emit('log', 'verbose', 'web adduser', 'before first POST')
  return webAuth(opener, conf, body)
}

function loginWeb (opener, conf) {
  validate('FO', arguments)
  process.emit('log', 'verbose', 'web login', 'before first POST')
  return webAuth(opener, conf, {})
}

function webAuth (opener, conf, body) {
  conf = ProfileConfig(conf)
  body.hostname = conf.hostname || os.hostname()
  const target = '/-/v1/login'
  return fetch(target, conf.concat({
    method: 'POST',
    body
  })).then(res => {
    return Promise.all([res, res.json()])
  }).then(([res, content]) => {
    const {doneUrl, loginUrl} = content
    process.emit('log', 'verbose', 'web auth', 'got response', content)
    if (
      typeof doneUrl !== 'string' ||
      typeof loginUrl !== 'string' ||
      !doneUrl ||
      !loginUrl
    ) {
      throw new WebLoginInvalidResponse('POST', target, res, content)
    }
    return content
  }).then(({doneUrl, loginUrl}) => {
    process.emit('log', 'verbose', 'web auth', 'opening url pair')
    return opener(loginUrl).then(
      () => webAuthCheckLogin(doneUrl, conf.concat({cache: false}))
    )
  }).catch(er => {
    if ((er.statusCode >= 400 && er.statusCode <= 499) || er.statusCode === 500) {
      throw new WebLoginNotSupported('POST', target, {
        status: er.statusCode,
        headers: { raw: () => er.headers }
      }, er.body)
    } else {
      throw er
    }
  })
}

function webAuthCheckLogin (doneUrl, conf) {
  return fetch(doneUrl, conf).then(res => {
    return Promise.all([res, res.json()])
  }).then(([res, content]) => {
    if (res.status === 200) {
      if (!content.token) {
        throw new WebLoginInvalidResponse('GET', doneUrl, res, content)
      } else {
        return content
      }
    } else if (res.status === 202) {
      const retry = +res.headers.get('retry-after') * 1000
      if (retry > 0) {
        return sleep(retry).then(() => webAuthCheckLogin(doneUrl, conf))
      } else {
        return webAuthCheckLogin(doneUrl, conf)
      }
    } else {
      throw new WebLoginInvalidResponse('GET', doneUrl, res, content)
    }
  })
}

function adduserCouch (username, email, password, conf) {
  validate('SSSO', arguments)
  conf = ProfileConfig(conf)
  const body = {
    _id: 'org.couchdb.user:' + username,
    name: username,
    password: password,
    email: email,
    type: 'user',
    roles: [],
    date: new Date().toISOString()
  }
  const logObj = {}
  Object.keys(body).forEach(k => {
    logObj[k] = k === 'password' ? 'XXXXX' : body[k]
  })
  process.emit('log', 'verbose', 'adduser', 'before first PUT', logObj)

  const target = '/-/user/org.couchdb.user:' + encodeURIComponent(username)
  return fetch.json(target, conf.concat({
    method: 'PUT',
    body
  })).then(result => {
    result.username = username
    return result
  })
}

function loginCouch (username, password, conf) {
  validate('SSO', arguments)
  conf = ProfileConfig(conf)
  const body = {
    _id: 'org.couchdb.user:' + username,
    name: username,
    password: password,
    type: 'user',
    roles: [],
    date: new Date().toISOString()
  }
  const logObj = {}
  Object.keys(body).forEach(k => {
    logObj[k] = k === 'password' ? 'XXXXX' : body[k]
  })
  process.emit('log', 'verbose', 'login', 'before first PUT', logObj)

  const target = '-/user/org.couchdb.user:' + encodeURIComponent(username)
  return fetch.json(target, conf.concat({
    method: 'PUT',
    body
  })).catch(err => {
    if (err.code === 'E400') {
      err.message = `There is no user with the username "${username}".`
      throw err
    }
    if (err.code !== 'E409') throw err
    return fetch.json(target, conf.concat({
      query: {write: true}
    })).then(result => {
      Object.keys(result).forEach(function (k) {
        if (!body[k] || k === 'roles') {
          body[k] = result[k]
        }
      })
      return fetch.json(`${target}/-rev/${body._rev}`, conf.concat({
        method: 'PUT',
        body,
        username,
        password
      }))
    })
  }).then(result => {
    result.username = username
    return result
  })
}

function get (conf) {
  validate('O', arguments)
  return fetch.json('/-/npm/v1/user', conf)
}

function set (profile, conf) {
  validate('OO', arguments)
  Object.keys(profile).forEach(key => {
    // profile keys can't be empty strings, but they CAN be null
    if (profile[key] === '') profile[key] = null
  })
  return fetch.json('/-/npm/v1/user', ProfileConfig(conf, {
    method: 'POST',
    body: profile
  }))
}

function listTokens (conf) {
  validate('O', arguments)
  conf = ProfileConfig(conf)

  return untilLastPage('/-/npm/v1/tokens')

  function untilLastPage (href, objects) {
    return fetch.json(href, conf).then(result => {
      objects = objects ? objects.concat(result.objects) : result.objects
      if (result.urls.next) {
        return untilLastPage(result.urls.next, objects)
      } else {
        return objects
      }
    })
  }
}

function removeToken (tokenKey, conf) {
  validate('SO', arguments)
  const target = `/-/npm/v1/tokens/token/${tokenKey}`
  return fetch(target, ProfileConfig(conf, {
    method: 'DELETE'
  })).then(res => {
    res.body.resume()
    return null
  })
}

function createToken (password, readonly, cidrs, conf) {
  validate('SBAO', arguments)
  return fetch.json('/-/npm/v1/tokens', ProfileConfig(conf, {
    method: 'POST',
    body: {
      password: password,
      readonly: readonly,
      cidr_whitelist: cidrs
    }
  }))
}

class HttpErrorBase extends Error {
  constructor (method, target, res, body) {
    super()
    this.headers = res.headers.raw()
    this.statusCode = res.status
    this.code = 'E' + res.status
    this.method = method
    this.target = res.url
    this.body = body
    this.pkgid = packageName(target)
  }
}

class WebLoginInvalidResponse extends HttpErrorBase {
  constructor (method, target, res, body) {
    super(method, target, res, body)
    this.message = 'Invalid response from web login endpoint'
    Error.captureStackTrace(this, WebLoginInvalidResponse)
  }
}

class WebLoginNotSupported extends HttpErrorBase {
  constructor (method, target, res, body) {
    super(method, target, res, body)
    this.message = 'Web login not supported'
    this.code = 'ENYI'
    Error.captureStackTrace(this, WebLoginNotSupported)
  }
}

function packageName (href) {
  try {
    let basePath = url.parse(href).pathname.substr(1)
    if (!basePath.match(/^-/)) {
      basePath = basePath.split('/')
      var index = basePath.indexOf('_rewrite')
      /* istanbul ignore next */
      if (index === -1) {
        index = basePath.length - 1
      } else {
        // TODO - I don't even know how we'd hit this but w/e
        /* istanbul ignore next */
        index++
      }
      return decodeURIComponent(basePath[index])
    }
  } catch (_) {
    // this is ok
  }
}

function sleep (ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
