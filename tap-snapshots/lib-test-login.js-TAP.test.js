/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`lib/test/login.js TAP cleanup > got expected requests 1`] = `
[ 'start server',
  'login web',
  'POST /weblogin/-/v1/login',
  'GET /weblogin/-/v1/login/blerg',
  'adduser web',
  'POST /weblogin/-/v1/login',
  'GET /weblogin/-/v1/login/blerg',
  'login web by default',
  'POST /weblogin/-/v1/login',
  'GET /weblogin/-/v1/login/blerg',
  'adduser web',
  'POST /weblogin/-/v1/login',
  'GET /weblogin/-/v1/login/blerg',
  'adduser web by default',
  'POST /weblogin/-/v1/login',
  'GET /weblogin/-/v1/login/blerg',
  'login couch',
  'PUT /couchdb/-/user/org.couchdb.user:user',
  'adduser couch',
  'PUT /couchdb/-/user/org.couchdb.user:user',
  'login fallback to couch',
  'POST /couchdb/-/v1/login',
  'PUT /couchdb/-/user/org.couchdb.user:user',
  'adduser fallback to couch',
  'POST /couchdb/-/v1/login',
  'PUT /couchdb/-/user/org.couchdb.user:user',
  '501s',
  'POST /501/-/v1/login',
  'POST /501/-/v1/login',
  'POST /501/-/v1/login',
  'POST /501/-/v1/login',
  'PUT /501/-/user/org.couchdb.user:user',
  'PUT /501/-/user/org.couchdb.user:user',
  'cleanup' ]
`
