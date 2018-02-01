const t = require('tap')
const profile = require('../index.js')
const http = require('http')
const PORT = +process.env.PORT || 13445

// process.on('log', console.error)

const reg = 'http://localhost:' + PORT

// track requests made so that any change is noticed
const requests = []

t.beforeEach(function (cb) {
  if (this.parent === t) { requests.push(this.name) }
  cb()
})

const server = http.createServer((q, s) => {
  requests.push(`${q.method} ${q.url}`)
  let body = ''
  q.on('data', c => { body += c })
  q.on('end', () => {
    try {
      body = JSON.parse(body)
    } catch (er) {
      body = undefined
    }
    process.emit('log', '%j\n%j\n%j', q.url, q.headers, body)
    switch (q.url) {
      case '/weblogin/-/v1/login':
        return respond(s, 200, {
          loginUrl: 'http://example.com/blerg',
          doneUrl: reg + '/weblogin/-/v1/login/blerg'
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

      case '/501/-/v1/login':
      case '/501/-/user/org.couchdb.user:user':
        return respond(s, 501, { pwn: 'witaf idk lol' })

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
  const opener = (url, conf) => new Promise(resolve => {
    calledOpener = true
    process.emit('log', 'in opener', url, conf)
    resolve()
  })

  t.resolveMatch(profile.loginWeb(opener, {
    registry: reg + '/weblogin/'
  }), { token: 'blerg' })

  return t.test('called opener', async t => t.equal(calledOpener, true))
})

t.test('adduser web', t => {
  let calledOpener = false
  const opener = (url, conf) => new Promise(resolve => {
    calledOpener = true
    process.emit('log', 'in opener', url, conf)
    resolve()
  })

  t.resolveMatch(profile.adduserWeb(opener, {
    registry: reg + '/weblogin/',
    opts: {}
  }), { token: 'blerg' })

  return t.test('called opener', async t => t.equal(calledOpener, true))
})

t.test('login web by default', t => {
  let calledOpener = false

  const opener = (url, conf) => new Promise(resolve => {
    calledOpener = true
    process.emit('log', 'in opener', url, conf)
    resolve()
  })

  const prompter = () => { throw new Error('should not do this') }

  t.resolveMatch(profile.login(opener, prompter, {
    registry: reg + '/weblogin/'
  }), { token: 'blerg' })

  return t.test('called opener', async t => t.equal(calledOpener, true))
})

t.test('adduser web', t => {
  let calledOpener = false
  const opener = (url, conf) => new Promise(resolve => {
    calledOpener = true
    process.emit('log', 'in opener', url, conf)
    resolve()
  })

  t.resolveMatch(profile.adduserWeb(opener, {
    registry: reg + '/weblogin/'
  }), { token: 'blerg' })

  return t.test('called opener', async t => t.equal(calledOpener, true))
})

t.test('adduser web by default', t => {
  let calledOpener = false

  const opener = (url, conf) => new Promise(resolve => {
    calledOpener = true
    process.emit('log', 'in opener', url, conf)
    resolve()
  })

  const prompter = () => { throw new Error('should not do this') }

  t.resolveMatch(profile.adduser(opener, prompter, {
    registry: reg + '/weblogin/'
  }), { token: 'blerg' })

  return t.test('called opener', async t => t.equal(calledOpener, true))
})

t.test('login couch', t => {
  return t.resolveMatch(profile.loginCouch('user', 'pass', {
    registry: reg + '/couchdb/'
  }), { token: 'blerg' })
})

t.test('adduser couch', t => {
  return t.resolveMatch(profile.adduserCouch('user', 'i@izs.me', 'pass', {
    registry: reg + '/couchdb/'
  }), { token: 'blerg' })
})

t.test('login fallback to couch', t => {
  let calledPrompter = false

  const opener = (url, conf) => new Promise(resolve => {
    throw new Error('should not call opener')
  })

  const prompter = async () => {
    calledPrompter = true
    return {
      name: 'user',
      password: 'pass',
      email: 'i@izs.me'
    }
  }

  t.resolveMatch(profile.login(opener, prompter, {
    registry: reg + '/couchdb/'
  }), { token: 'blerg' })

  return t.test('called prompter', async t => t.equal(calledPrompter, true))
})

t.test('adduser fallback to couch', t => {
  let calledPrompter = false

  const opener = (url, conf) => new Promise(resolve => {
    throw new Error('should not call opener')
  })

  const prompter = async () => {
    calledPrompter = true
    return {
      name: 'user',
      password: 'pass',
      email: 'i@izs.me'
    }
  }

  t.resolveMatch(profile.adduser(opener, prompter, {
    registry: reg + '/couchdb/'
  }), { token: 'blerg' })

  return t.test('called prompter', async t => t.equal(calledPrompter, true))
})

t.test('501s', t => {
  const opener = () => { throw new Error('poop') }
  const prompter = () => new Promise(resolve => resolve({
    name: 'user',
    password: 'pass',
    email: 'i@izs.me'
  }))

  const registry = reg + '/501/'

  t.plan(6)

  const expectErr = {
    code: 'E501',
    body: {
      pwn: 'witaf idk lol'
    }
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

t.test('cleanup', t => {
  t.matchSnapshot(requests, 'got expected requests')
  server.close()
  t.end()
})
