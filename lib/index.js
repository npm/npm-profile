const { URL } = require('node:url')
const timers = require('node:timers/promises')
const os = require('node:os')
const fetch = require('npm-registry-fetch')
const { HttpErrorBase } = require('npm-registry-fetch/lib/errors')
const { log } = require('proc-log')

// try loginWeb, catch the "not supported" message and fall back to couch
const login = async (opener, prompter, opts = {}) => {
  try {
    return await loginWeb(opener, opts)
  } catch (er) {
    if (er instanceof WebLoginNotSupported) {
      log.verbose('web login', 'not supported, trying couch')
      const { username, password } = await prompter(opts.creds)
      return loginCouch(username, password, opts)
    }
    throw er
  }
}

const adduser = async (opener, prompter, opts = {}) => {
  try {
    return await adduserWeb(opener, opts)
  } catch (er) {
    if (er instanceof WebLoginNotSupported) {
      log.verbose('web adduser', 'not supported, trying couch')
      const { username, email, password } = await prompter(opts.creds)
      return adduserCouch(username, email, password, opts)
    }
    throw er
  }
}

const adduserWeb = (opener, opts = {}) => {
  log.verbose('web adduser', 'before first POST')
  return webAuth(opener, opts, { create: true })
}

const loginWeb = (opener, opts = {}) => {
  log.verbose('web login', 'before first POST')
  return webAuth(opener, opts, {})
}

const isValidUrl = u => {
  try {
    return /^https?:$/.test(new URL(u).protocol)
  } catch {
    return false
  }
}

const webAuth = async (opener, opts, body) => {
  const abortController = new AbortController()
  try {
    const res = await fetch('/-/v1/login', {
      ...opts,
      method: 'POST',
      body: {
        ...body,
        hostname: opts.hostname || os.hostname(),
      },
    })

    const content = await res.json()
    log.verbose('web auth', 'got response', content)

    const { doneUrl, loginUrl } = content
    if (!isValidUrl(doneUrl) || !isValidUrl(loginUrl)) {
      throw new WebLoginInvalidResponse('POST', res, content)
    }

    log.verbose('web auth', 'opening url pair')
    return await Promise.all([
      opener(loginUrl, { signal: abortController.signal }),
      webAuthCheckLogin(doneUrl, { ...opts, cache: false }).then((r) => {
        log.verbose('web auth', 'done-check finished')
        abortController.abort()
        return r
      }),
    ]).then(([, authResult]) => authResult)
  } catch (er) {
    abortController.abort()
    if ((er.statusCode >= 400 && er.statusCode <= 499) || er.statusCode === 500) {
      throw new WebLoginNotSupported('POST', {
        status: er.statusCode,
        headers: { raw: () => er.headers },
      }, er.body)
    }
    throw er
  }
}

const webAuthCheckLogin = async (doneUrl, opts) => {
  const res = await fetch(doneUrl, opts)
  const content = await res.json()

  if (res.status === 200) {
    if (!content.token) {
      throw new WebLoginInvalidResponse('GET', res, content)
    }
    return content
  }

  if (res.status === 202) {
    const retry = +res.headers.get('retry-after') * 1000
    if (retry > 0) {
      await timers.setTimeout(retry)
    }
    return webAuthCheckLogin(doneUrl, opts)
  }

  throw new WebLoginInvalidResponse('GET', res, content)
}

const couchEndpoint = (username) => `/-/user/org.couchdb.user:${encodeURIComponent(username)}`

const putCouch = async (path, username, body, opts) => {
  const result = await fetch.json(`${couchEndpoint(username)}${path}`, {
    ...opts,
    method: 'PUT',
    body,
  })
  result.username = username
  return result
}

const adduserCouch = async (username, email, password, opts = {}) => {
  const body = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password,
    email: email,
    type: 'user',
    roles: [],
    date: new Date().toISOString(),
  }

  log.verbose('adduser', 'before first PUT', {
    ...body,
    password: 'XXXXX',
  })

  return putCouch('', username, body, opts)
}

const loginCouch = async (username, password, opts = {}) => {
  const body = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password,
    type: 'user',
    roles: [],
    date: new Date().toISOString(),
  }

  log.verbose('login', 'before first PUT', {
    ...body,
    password: 'XXXXX',
  })

  try {
    return await putCouch('', username, body, opts)
  } catch (err) {
    if (err.code === 'E400') {
      err.message = `There is no user with the username "${username}".`
      throw err
    }

    if (err.code !== 'E409') {
      throw err
    }
  }

  const result = await fetch.json(couchEndpoint(username), {
    ...opts,
    query: { write: true },
  })

  for (const k of Object.keys(result)) {
    if (!body[k] || k === 'roles') {
      body[k] = result[k]
    }
  }

  return putCouch(`/-rev/${body._rev}`, username, body, {
    ...opts,
    forceAuth: {
      username,
      password: Buffer.from(password, 'utf8').toString('base64'),
      otp: opts.otp,
    },
  })
}

const get = (opts = {}) => fetch.json('/-/npm/v1/user', opts)

const set = (profile, opts = {}) => fetch.json('/-/npm/v1/user', {
  ...opts,
  method: 'POST',
  // profile keys can't be empty strings, but they CAN be null
  body: Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, v === '' ? null : v])),
})

const paginate = async (href, opts, items = []) => {
  const result = await fetch.json(href, opts)
  items = items.concat(result.objects)
  if (result.urls.next) {
    return paginate(result.urls.next, opts, items)
  }
  return items
}

const listTokens = (opts = {}) => paginate('/-/npm/v1/tokens', opts)

const removeToken = async (tokenKey, opts = {}) => {
  await fetch(`/-/npm/v1/tokens/token/${tokenKey}`, {
    ...opts,
    method: 'DELETE',
    ignoreBody: true,
  })
  return null
}

const createToken = (password, readonly, cidrs, opts = {}) => fetch.json('/-/npm/v1/tokens', {
  ...opts,
  method: 'POST',
  body: {
    password: password,
    readonly: readonly,
    cidr_whitelist: cidrs,
  },
})

class WebLoginInvalidResponse extends HttpErrorBase {
  constructor (method, res, body) {
    super(method, res, body)
    this.message = 'Invalid response from web login endpoint'
    Error.captureStackTrace(this, WebLoginInvalidResponse)
  }
}

class WebLoginNotSupported extends HttpErrorBase {
  constructor (method, res, body) {
    super(method, res, body)
    this.message = 'Web login not supported'
    this.code = 'ENYI'
    Error.captureStackTrace(this, WebLoginNotSupported)
  }
}

module.exports = {
  adduserCouch,
  loginCouch,
  adduserWeb,
  loginWeb,
  login,
  adduser,
  get,
  set,
  listTokens,
  removeToken,
  createToken,
  webAuthCheckLogin,
}
