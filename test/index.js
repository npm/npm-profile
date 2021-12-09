'use strict'

const test = require('tap').test
const tnock = require('./fixtures/tnock.js')

const profile = require('../index.js')

const registry = 'https://registry.npmjs.org/'

test('get', t => {
  const srv = tnock(t, registry)
  const getUrl = '/-/npm/v1/user'
  srv.get(getUrl).reply(function () {
    const auth = this.req.headers.authorization
    t.notOk(auth, 'no authorization info sent')
    return [auth ? 200 : 401, '', {}]
  })
  return profile.get().then(result => {
    t.fail('GET w/o auth should fail')
  }, err => {
    t.equal(err.code, 'E401', 'auth errors are passed through')
  }).then(() => {
    srv.get(getUrl).reply(function () {
      const auth = this.req.headers.authorization
      t.same(auth, ['Bearer deadbeef'], 'got auth header')
      return [auth ? 200 : 401, { auth: 'bearer' }, {}]
    })
    return profile.get({ '//registry.npmjs.org/:_authToken': 'deadbeef' })
  }).then(result => {
    t.match(result, { auth: 'bearer' })
  }).then(() => {
    srv.get(getUrl).reply(function () {
      const auth = this.req.headers.authorization
      t.match(auth[0], /^Basic /, 'got basic auth')
      const [username, password] = Buffer.from(
        auth[0].match(/^Basic (.*)$/)[1], 'base64'
      ).toString('utf8').split(':')
      t.equal(username, 'abc', 'got username')
      t.equal(password, '123', 'got password')
      return [auth ? 200 : 401, { auth: 'basic' }, {}]
    })
    return profile.get({
      '//registry.npmjs.org/:username': 'abc',
      // Passwords are stored in base64 form and npm-related consumers expect
      // them in this format. Changing this for npm would be a bigger change.
      '//registry.npmjs.org/:_password': Buffer.from('123', 'utf8').toString('base64')
    })
  }).then(result => {
    t.match(result, { auth: 'basic' })
  }).then(() => {
    srv.get(getUrl).reply(function () {
      const auth = this.req.headers.authorization
      const otp = this.req.headers['npm-otp']
      t.same(auth, ['Bearer deadbeef'], 'got auth header')
      t.same(otp, ['1234'], 'got otp token')
      return [auth ? 200 : 401, { auth: 'bearer', otp: !!otp }, {}]
    })
    return profile.get({
      otp: '1234',
      '//registry.npmjs.org/:_authToken': 'deadbeef'
    })
  }).then(result => {
    t.match(result, { auth: 'bearer', otp: true })
  })
  // with otp, with token, with basic
  // prob should make w/o token 401
})

test('set', t => {
  const prof = { user: 'zkat', github: 'zkat' }
  tnock(t, registry).post('/-/npm/v1/user', {
    github: 'zkat',
    email: null
  }).reply(200, prof)
  return profile.set({
    github: 'zkat',
    email: ''
  }).then(json => {
    t.same(json, prof, 'got the profile data in return')
  })
})

test('listTokens', t => {
  const tokens = [
    { key: 'sha512-hahaha', token: 'blah' },
    { key: 'sha512-meh', token: 'bleh' }
  ]
  tnock(t, registry).get('/-/npm/v1/tokens').reply(200, {
    objects: tokens,
    total: 2,
    urls: {}
  })
  return profile.listTokens().then(tok => t.same(tok, tokens))
})

test('loginCouch happy path', t => {
  tnock(t, registry)
    .put('/-/user/org.couchdb.user:blerp')
    .reply(201, {
      ok: true
    })
  return t.resolveMatch(profile.loginCouch('blerp', 'password'), {
    ok: true,
    username: 'blerp'
  })
})

test('login fallback to couch', t => {
  tnock(t, registry)
    .put('/-/user/org.couchdb.user:blerp')
    .reply(201, {
      ok: true
    })
    .post('/-/v1/login')
    .reply(404, { error: 'not found' })
  const opener = url => t.fail('called opener', { url })
  const prompter = creds => Promise.resolve({
    username: 'blerp',
    password: 'prelb',
    email: 'blerp@blerp.blerp',
  })
  return t.resolveMatch(profile.login(opener, prompter), {
    ok: true,
    username: 'blerp'
  })
})

test('adduserCouch happy path', t => {
  tnock(t, registry)
    .put('/-/user/org.couchdb.user:blerp')
    .reply(201, {
      ok: true
    })
  return t.resolveMatch(profile.adduserCouch('blerp', 'password'), {
    ok: true,
    username: 'blerp'
  })
})

test('adduser fallback to couch', t => {
  tnock(t, registry)
    .put('/-/user/org.couchdb.user:blerp')
    .reply(201, {
      ok: true
    })
    .post('/-/v1/login')
    .reply(404, { error: 'not found' })
  const opener = url => t.fail('called opener', { url })
  const prompter = creds => Promise.resolve({
    username: 'blerp',
    password: 'prelb',
    email: 'blerp@blerp.blerp',
  })
  return t.resolveMatch(profile.adduser(opener, prompter), {
    ok: true,
    username: 'blerp'
  })
})

test('adduserCouch happy path', t => {
  tnock(t, registry)
    .put('/-/user/org.couchdb.user:blerp')
    .reply(201, {
      ok: true
    })
  return t.resolveMatch(profile.adduserCouch('blerp', 'password'), {
    ok: true,
    username: 'blerp'
  })
})

test('adduserWeb fail, just testing default opts setting', t => {
  tnock(t, registry)
    .post('/-/v1/login')
    .reply(404, { error: 'not found' })
  const opener = url => t.fail('called opener', { url })
  return t.rejects(profile.adduserWeb(opener), {
    message: 'Web login not supported'
  })
})

test('loginWeb fail, just testing default opts setting', t => {
  tnock(t, registry)
    .post('/-/v1/login')
    .reply(404, { error: 'not found' })
  const opener = url => t.fail('called opener', { url })
  return t.rejects(profile.loginWeb(opener), {
    message: 'Web login not supported'
  })
})


test('listTokens multipage', t => {
  const tokens1 = [
    { key: 'sha512-hahaha', token: 'blah' },
    { key: 'sha512-meh', token: 'bleh' }
  ]
  const tokens2 = [
    { key: 'sha512-ugh', token: 'blih' },
    { key: 'sha512-ohno', token: 'bloh' }
  ]
  const tokens3 = [
    { key: 'sha512-stahp', token: 'bluh' }
  ]
  const srv = tnock(t, registry)
  srv.get('/-/npm/v1/tokens').reply(200, {
    objects: tokens1,
    total: 2,
    urls: {
      next: '/idk/some/other/one'
    }
  })
  srv.get('/idk/some/other/one').reply(200, {
    objects: tokens2,
    total: 2,
    urls: {
      next: '/-/npm/last/one-i-swear'
    }
  })
  srv.get('/-/npm/last/one-i-swear').reply(200, {
    objects: tokens3,
    total: 1,
    urls: {}
  })
  return profile.listTokens().then(tok => {
    t.same(
      tok,
      tokens1.concat(tokens2).concat(tokens3),
      'supports multi-URL token requests and concats them'
    )
  })
})

test('removeToken', t => {
  tnock(t, registry).delete('/-/npm/v1/tokens/token/deadbeef').reply(200)
  return profile.removeToken('deadbeef').then(ret => {
    t.equal(ret, null, 'null return value on success')
  })
})

test('createToken', t => {
  const base = {
    password: 'secretPassw0rd!',
    readonly: true,
    cidr_whitelist: ['8.8.8.8/32', '127.0.0.1', '192.168.1.1']
  }
  const obj = Object.assign({
    token: 'deadbeef',
    key: 'sha512-badc0ffee',
    created: (new Date()).toString()
  })
  delete obj.password
  tnock(t, registry).post('/-/npm/v1/tokens', base).reply(200, obj)
  return profile.createToken(
    base.password,
    base.readonly,
    base.cidr_whitelist
  ).then(ret => t.same(ret, obj, 'got the right return value'))
})
