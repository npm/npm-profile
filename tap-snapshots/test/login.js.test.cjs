/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/login.js TAP cleanup > got expected requests 1`] = `
[
  "POST /weblogin/-/v1/login",
  "POST /weblogin/-/v1/login/blerg",
  "POST /weblogin/-/v1/login",
  "POST /weblogin/-/v1/login/blerg",
  "POST /weblogin/-/v1/login",
  "POST /weblogin/-/v1/login/blerg",
  "POST /weblogin/-/v1/login",
  "POST /weblogin/-/v1/login/blerg",
  "POST /weblogin/-/v1/login",
  "POST /weblogin/-/v1/login/blerg",
  "PUT /couchdb/-/user/org.couchdb.user:user",
  "PUT /couchdb/-/user/org.couchdb.user:exists",
  "GET /couchdb/-/user/org.couchdb.user:exists?write=true",
  "PUT /couchdb/-/user/org.couchdb.user:exists/-rev/goodbloodmoon",
  "PUT /couchdb/-/user/org.couchdb.user:nemo",
  "PUT /couchdb/-/user/org.couchdb.user:user",
  "POST /couchdb/-/v1/login",
  "PUT /couchdb/-/user/org.couchdb.user:user",
  "POST /couchdb/-/v1/login",
  "PUT /couchdb/-/user/org.couchdb.user:user",
  "POST /501/-/v1/login",
  "POST /501/-/v1/login",
  "POST /501/-/v1/login",
  "POST /501/-/v1/login",
  "PUT /501/-/user/org.couchdb.user:user",
  "PUT /501/-/user/org.couchdb.user:user",
  "POST /invalid-login/-/v1/login",
  "POST /invalid-login-url/-/v1/login",
  "POST /invalid-done/-/v1/login",
  "POST /invalid-done/-/v1/login/blerg",
  "POST /notoken/-/v1/login",
  "POST /notoken/-/v1/login/blerg",
  "POST /notoken/-/v1/login",
  "POST /notoken/-/v1/login/blerg",
  "POST /retry-after/-/v1/login",
  "POST /retry-after/-/v1/login/blerg",
  "POST /retry-after/-/v1/login/blerg",
  "POST /retry-after/-/v1/login",
  "POST /retry-after/-/v1/login/blerg",
  "POST /retry-after/-/v1/login/blerg",
  "POST /retry-again/-/v1/login",
  "POST /retry-again/-/v1/login/blerg",
  "POST /retry-again/-/v1/login/blerg",
  "POST /retry-again/-/v1/login",
  "POST /retry-again/-/v1/login/blerg",
  "POST /retry-again/-/v1/login/blerg"
]
`
