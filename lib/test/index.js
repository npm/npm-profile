'use strict'
const test = require('tap').test
const requireInject = require('require-inject')

function promise$try (fn) {
  return new Promise(resolve => {
    resolve(fn())
  })
}

function mockFetch (mocks) {
  const fn = function (href, opts) {
    const mockf = mocks[href]
    const method = (opts && opts.method) || 'GET'
    const mock = mockf && mockf(method, opts)
    if (!mock) {
      return mockFetchResponse(404, 'not found:' + href, {}, '')
    }
    return mockFetchResponse(mock.status, mock.statusText, mock.headers, mock.body)
  }
  fn.defaults = setDefaults
  return fn

  function setDefaults (moreOpts) {
    const fn = (href, opts) => {
      return this.call(this, href, Object.assign({}, opts || {}, moreOpts))
    }
    fn.defaults = setDefaults
    return fn
  }
}

function mockFetchResponse (status, statusText, headers, body) {
  if (body == null) {
    body = headers
    headers = {}
  }
  return Promise.resolve({
    status: status,
    statusText: statusText,
    headers: {
      get (header) {
        return headers[header]
      },
      raw () {
        return headers
      }
    },
    buffer () {
      if (Buffer.isBuffer(body)) {
        return Promise.resolve(body)
      } else if (typeof body === 'string') {
        return Promise.resolve(Buffer.from(body))
      } else if (typeof body === 'object') {
        return Promise.resolve(Buffer.from(JSON.stringify(body)))
      } else {
        return Promise.reject(new Error('Unknown body type: ' + typeof body))
      }
    },
    json () {
      return this.buffer().then(body => JSON.parse(body))
    }
  })
}

// make sure it's in the cache before require-inject is called, because its
// combination of deferred loading and instanceof checks makes things go
// bad.
require('readable-stream')

test('create')
test('login')

test('get', t => {
  const profile = requireInject.withEmptyCache('../index.js', {
    'make-fetch-happen': mockFetch({
      '/-/npm/v1/user': (method, opts) => {
        if (method !== 'GET') return {status: 400, statusText: 'error', headers: {}, body: ''}
        if (!opts.headers) return {status: 401, statusText: 'no headers', headers: {}, body: ''}
        if (!opts.headers['Authorization']) return {status: 401, statusText: 'unauthorized', headers: {}, body: ''}
        const body = {ok: true}
        if (opts.headers['npm-otp']) body.otp = true
        if (/Bearer/.test(opts.headers['Authorization'])) body.auth = 'bearer'
        if (/Basic/.test(opts.headers['Authorization'])) body.auth = 'basic'
        return {
          status: 200,
          statsText: 'ok',
          headers: {},
          body: body
        }
      }
    })
  })
  return promise$try(() => {
    return profile.get({registry: '/'})
  }).then(result => {
    t.fail('GET w/o auth should fail')
  }, err => {
    t.is(err.code, 'E401', 'auth errors are passed through')
  }).then(() => {
    return profile.get({registry: '/', auth: {token: 'deadbeef'}})
  }).then(result => {
    t.like(result, {auth: 'bearer'})
  }).then(() => {
    return profile.get({registry: '/', auth: {basic: {username: 'abc', password: '123'}}})
  }).then(result => {
    t.like(result, {auth: 'basic'})
  }).then(() => {
    return profile.get({registry: '/', auth: {otp: '1234', token: 'deadbeef'}})
  }).then(result => {
    t.like(result, {auth: 'bearer', otp: true})
  })
  // with otp, with token, with basic
  // prob should make w/o token 401
})
test('set')
test('listTokens')
test('removeToken')
test('createToken')
