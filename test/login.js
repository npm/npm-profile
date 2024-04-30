const t = require('tap')
const profile = require('..')
const http = require('http')
const PORT = +process.env.PORT || 13445

const reg = 'http://localhost:' + PORT

// track requests made so that any change is noticed
const requests = []

t.beforeEach(async () => {
  if (this.parent === t) {
    requests.push(this.name)
  }
})

let retryTimer = null
let retryAgain = 0

const server = http.createServer((q, s) => {
  // Retries are nondeterministic
  // We should get SOME retrying, but can't know the amount
  const reqLog = `${q.method} ${q.url}`
  if (reqLog !== requests[requests.length - 1] ||
      reqLog !== requests[requests.length - 2] ||
      reqLog.indexOf(' /retry') === -1) {
    requests.push(reqLog)
  }
  let body = ''
  q.on('data', c => {
    body += c
  })
  q.on('end', () => {
    try {
      body = JSON.parse(body)
    } catch (er) {
      body = undefined
    }
    switch (q.url) {
      case '/weblogin/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://example.com/blerg',
          doneUrl: reg + '/weblogin/-/v1/login/blerg',
        })

      case '/weblogin/-/v1/login/blerg':
        return respond(s, 200, { token: 'blerg' })

      case '/couchdb/-/user/org.couchdb.user:user':
        if (body && body.name === 'user' && body.password === 'pass') {
          body.token = 'blerg'
          return respond(s, 201, body)
        } else {
          return respond(s, 403, { error: 'nope' })
        }

      case '/couchdb/-/user/org.couchdb.user:nemo':
        return respond(s, 400, { error: 'invalid request' })

      case '/couchdb/-/user/org.couchdb.user:exists':
        return respond(s, 409, { error: 'conflict' })

      case '/couchdb/-/user/org.couchdb.user:exists?write=true':
        return respond(s, 200, {
          name: 'exists',
          _rev: 'goodbloodmoon',
          roles: ['yabba', 'dabba', 'doo'],
          email: 'i@izs.me',
        })

      case '/couchdb/-/user/org.couchdb.user:exists/-rev/goodbloodmoon':
        // make sure we got the stuff we wanted.
        if (body && body.roles &&
            body.roles.join(',') === 'yabba,dabba,doo' &&
            body.email === 'i@izs.me' &&
            body.password === 'pass' &&
            body._rev === 'goodbloodmoon') {
          return respond(s, 201, { ok: 'created', token: 'blerg' })
        } else {
          return respond(s, 403, {
            error: 'what are you even doing?',
            sentBody: body,
          })
        }

      case '/501/-/v1/login':
      case '/501/-/v1/login/blerg':
      case '/501/-/user/org.couchdb.user:user':
        return respond(s, 501, { pwn: 'witaf idk lol' })

      case '/notoken/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://example.com/blerg',
          doneUrl: reg + '/notoken/-/v1/login/blerg',
        })
      case '/notoken/-/v1/login/blerg':
        return respond(s, 200, { oh: 'no' })

      case '/retry-after/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://www.example.com/blerg',
          doneUrl: reg + '/retry-after/-/v1/login/blerg',
        })

      case '/retry-after/-/v1/login/blerg':
        if (!retryTimer) {
          retryTimer = Date.now() + 250
        }

        if (retryTimer > Date.now()) {
          const newRTA = (retryTimer - Date.now()) / 1000
          s.setHeader('retry-after', newRTA)
          return respond(s, 202, {})
        } else {
          retryTimer = null
          return respond(s, 200, { token: 'blerg' })
        }

      case '/retry-again/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://www.example.com/blerg',
          doneUrl: reg + '/retry-again/-/v1/login/blerg',
        })

      case '/retry-again/-/v1/login/blerg':
        retryAgain++

        if (retryAgain < 5) {
          return respond(s, 202, {})
        } else {
          retryAgain = 0
          return respond(s, 200, { token: 'blerg' })
        }

      case '/invalid-login/-/v1/login':
        return respond(s, 200, { salt: 'im helping' })

      case '/invalid-login-url/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'ftp://this.is/not-a-webpage/now/is/it?',
          doneUrl: reg + '/invalid-done/-/v1/login',
        })

      case '/invalid-done/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://www.example.com/blerg',
          doneUrl: reg + '/invalid-done/-/v1/login/blerg',
        })
      case '/invalid-done/-/v1/login/blerg':
        return respond(s, 299, { salt: 'im helping' })

      default:
        return respond(s, 404, { error: 'not found' })
    }
  })
})

const respond = (s, code, body) => {
  s.statusCode = code || 200
  s.setHeader('connection', 'close')
  s.end(JSON.stringify(body || {}))
}

t.test('start server', t => server.listen(PORT, t.end))

t.test('login web', t => {
  let calledOpener = false
  const opener = () => new Promise(resolve => {
    calledOpener = true
    resolve()
  })

  t.resolveMatch(profile.loginWeb(opener, {
    registry: reg + '/weblogin/',
  }), { token: 'blerg' })

  return t.test('called opener', t => {
    t.equal(calledOpener, true)
    t.end()
  })
})

t.test('adduser web', t => {
  let calledOpener = false
  const opener = () => new Promise(resolve => {
    calledOpener = true
    resolve()
  })

  t.resolveMatch(profile.adduserWeb(opener, {
    registry: reg + '/weblogin/',
    opts: {},
  }), { token: 'blerg' })

  return t.test('called opener', t => {
    t.equal(calledOpener, true)
    t.end()
  })
})

t.test('login web by default', t => {
  let calledOpener = false

  const opener = () => new Promise(resolve => {
    calledOpener = true
    resolve()
  })

  const prompter = () => {
    throw new Error('should not do this')
  }

  t.resolveMatch(profile.login(opener, prompter, {
    registry: reg + '/weblogin/',
  }), { token: 'blerg' })

  return t.test('called opener', t => {
    t.equal(calledOpener, true)
    t.end()
  })
})

t.test('adduser web', t => {
  let calledOpener = false
  const opener = () => new Promise(resolve => {
    calledOpener = true
    resolve()
  })

  t.resolveMatch(profile.adduserWeb(opener, {
    registry: reg + '/weblogin/',
  }), { token: 'blerg' })

  return t.test('called opener', t => {
    t.equal(calledOpener, true)
    t.end()
  })
})

t.test('adduser web by default', t => {
  let calledOpener = false

  const opener = () => new Promise(resolve => {
    calledOpener = true
    resolve()
  })

  const prompter = () => {
    throw new Error('should not do this')
  }

  t.resolveMatch(profile.adduser(opener, prompter, {
    registry: reg + '/weblogin/',
  }), { token: 'blerg' })

  return t.test('called opener', t => {
    t.equal(calledOpener, true)
    t.end()
  })
})

t.test('login couch', t => {
  const registry = reg + '/couchdb/'
  const expect = { token: 'blerg' }
  t.test('login as new user', t =>
    t.resolveMatch(profile.loginCouch('user', 'pass', { registry }), expect))

  t.test('login as existing user', t =>
    t.resolveMatch(profile.loginCouch('exists', 'pass', { registry }), expect))

  const expectedErr = {
    code: 'E400',
    statusCode: 400,
    method: 'PUT',
    message: 'There is no user with the username "nemo"',
  }
  t.test('unknown user', t =>
    profile.loginCouch('nemo', 'pass', { registry })
      .catch(er => t.match(er, expectedErr)))

  t.end()
})

t.test('adduser couch', t => {
  return t.resolveMatch(profile.adduserCouch('user', 'i@izs.me', 'pass', {
    registry: reg + '/couchdb/',
  }), { token: 'blerg' })
})

t.test('login fallback to couch', t => {
  let calledPrompter = false

  const opener = () => new Promise(() => {
    throw new Error('should not call opener')
  })

  const prompter = () => {
    return new Promise((resolve) => {
      calledPrompter = true
      resolve({
        username: 'user',
        password: 'pass',
        email: 'i@izs.me',
      })
    })
  }

  t.resolveMatch(profile.login(opener, prompter, {
    registry: reg + '/couchdb/',
  }), { token: 'blerg' })

  return t.test('called prompter', t => {
    t.equal(calledPrompter, true)
    t.end()
  })
})

t.test('adduser fallback to couch', t => {
  let calledPrompter = false

  const opener = () => new Promise(() => {
    throw new Error('should not call opener')
  })

  const prompter = () => {
    return new Promise((resolve) => {
      calledPrompter = true
      resolve({
        username: 'user',
        password: 'pass',
        email: 'i@izs.me',
      })
    })
  }

  t.resolveMatch(profile.adduser(opener, prompter, {
    registry: reg + '/couchdb/',
  }), { token: 'blerg' })

  return t.test('called prompter', t => {
    t.equal(calledPrompter, true)
    t.end()
  })
})

t.test('501s', t => {
  const opener = () => {
    throw new Error('poop')
  }
  const prompter = () => new Promise(resolve => resolve({
    username: 'user',
    password: 'pass',
    email: 'i@izs.me',
  }))

  const registry = reg + '/501/'

  t.plan(6)

  const expectErr = {
    code: 'E501',
    body: {
      pwn: 'witaf idk lol',
    },
  }

  t.test('login', t =>
    profile.login(opener, prompter, { registry })
      .catch(er => t.match(er, expectErr)))

  t.test('adduser', t =>
    profile.adduser(opener, prompter, { registry })
      .catch(er => t.match(er, expectErr)))

  t.test('loginWeb', t =>
    profile.loginWeb(opener, { registry })
      .catch(er => t.match(er, expectErr)))

  t.test('adduserWeb', t =>
    profile.adduserWeb(opener, { registry })
      .catch(er => t.match(er, expectErr)))

  t.test('loginCouch', t =>
    profile.loginCouch('user', 'pass', { registry })
      .catch(er => t.match(er, expectErr)))

  t.test('adduserCouch', t =>
    profile.adduserCouch('user', 'i@izs.me', 'pass', { registry })
      .catch(er => t.match(er, expectErr)))
})

t.test('fail at login step', t => {
  const registry = reg + '/invalid-login/'
  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }
  t.plan(1)
  const expectedErr = {
    statusCode: 200,
    code: 'E200',
    method: 'POST',
    uri: reg + '/invalid-login/-/v1/login',
    body: {
      salt: 'im helping',
    },
    message: 'Invalid response from web login endpoint',
  }
  profile.login(opener, prompter, { registry })
    .catch(er => t.match(er, expectedErr))
})

t.test('fail at login step by having an invalid url', t => {
  const registry = reg + '/invalid-login-url/'
  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }
  t.plan(1)
  const expectedErr = {
    statusCode: 200,
    code: 'E200',
    method: 'POST',
    uri: reg + '/invalid-login-url/-/v1/login',
    body: {
      loginUrl: 'ftp://this.is/not-a-webpage/now/is/it?',
      doneUrl: reg + '/invalid-done/-/v1/login',
    },
    message: 'Invalid response from web login endpoint',
  }
  profile.login(opener, prompter, { registry })
    .catch(er => t.match(er, expectedErr))
})

t.test('fail at the done step', t => {
  const registry = reg + '/invalid-done/'
  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }
  t.plan(1)
  const expectedErr = {
    statusCode: 299,
    code: 'E299',
    method: 'GET',
    uri: reg + '/invalid-done/-/v1/login/blerg',
    body: {
      salt: 'im helping',
    },
    message: 'Invalid response from web login endpoint',
  }
  profile.login(opener, prompter, { registry })
    .catch(er => t.match(er, expectedErr))
})

t.test('notoken response from login endpoint (status 200, bad data)', t => {
  const registry = reg + '/notoken/'

  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }

  const expectedErr = {
    code: 'E200',
    statusCode: 200,
    method: 'GET',
    uri: registry + '-/v1/login/blerg',
    body: {
      oh: 'no',
    },
    message: 'Invalid response from web login endpoint',
  }

  t.test('loginWeb', t =>
    profile.loginWeb(opener, { registry })
      .catch(er => t.match(er, expectedErr)))

  t.test('login with fallback', t =>
    profile.login(opener, prompter, { registry })
      .catch(er => t.match(er, expectedErr)))

  t.end()
})

t.test('retry-after 202 response', t => {
  const registry = reg + '/retry-after/'

  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }

  const expect = { token: 'blerg' }

  t.test('loginWeb', t =>
    t.resolveMatch(profile.loginWeb(opener, { registry }), expect))
  t.test('login', t =>
    t.resolveMatch(profile.login(opener, prompter, { registry }), expect))
  t.end()
})

t.test('no retry-after 202 response', t => {
  const registry = reg + '/retry-again/'

  const opener = () => new Promise(resolve => resolve())
  const prompter = () => {
    throw new Error('should not do this')
  }

  const expect = { token: 'blerg' }

  t.test('loginWeb', t =>
    t.resolveMatch(profile.loginWeb(opener, { registry }), expect))
  t.test('login', t =>
    t.resolveMatch(profile.login(opener, prompter, { registry }), expect))
  t.end()
})

t.test('cleanup', t => {
  // NOTE: snapshot paths are not platform-independent
  process.platform !== 'win32' &&
    t.matchSnapshot(JSON.stringify(requests, 0, 2), 'got expected requests')
  server.close()
  t.end()
})
