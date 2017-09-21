# npm-profile

Updating an npmjs.com profile

```js
const profile = require('npm-profile')
profile.get(registry, {token}).then(result => {
   // …
})
```

## Functions

### profile.adduser(username, email, password, registry) → Promise

```js
profile.adduser(username, email, password, registry).then(result => {
  // do something with result.token
})
```

Creates a new user on the server along with a fresh bearer token for future
authentication as this user.  This is what you see as an `authToken` in an
`.npmrc`.

If the user already exists then the npm registry will return an error, but
this is registry specific and not guaranteed.

* `username` String
* `email` String
* `password` String
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)

#### **Promise Value**

An object with a `token` property that can be passed into future authentication requests.

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.



### profile.login(username, password, registry, auth) → Promise

```js
profile.login(username, email, password, registry, {}).catch(err => {
  if (err.code === 'otp') {
    return getOTPFromSomewhere().then(otp => {
      return profile.login(username, email, password, registry, {otp})
    })
  }
}).then(result => {
  // do something with result.token
})
```

Logs you into an existing user.  Does not create the user if they do not
already exist.  Logging in means generating a new bearer token for use in
future authentication. This is what yous as an `authToken` in an `.npmrc`.
 
* `username` String
* `email` String
* `password` String
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `otp` — the one-time password from a two-factor
  authentication device.

#### **Promise Value**

An object with a `token` property that can be passed into future authentication requests.

#### **Promise Rejection**

An error object indicating what went wrong.

If the object has a `code` property set to `otp` then that indicates that
this account must use two-factor authentication to login.  Try again with a
one-time password.

If the object has a `code` property set to `ip` then that indicates that
this account is only allowed to login from certain networks and this ip is
not on one of those networks.

If the error was nenither of these thenthe error object will have a
`code` property set to the HTTP response code and a `headers` property with
the HTTP headers in the response.

### profile.get(registry, auth) → Promise

```js
profile.get(registry, {token}).then(userProfile => {
  // do something with userProfile
})
```

Fetch profile information for the authenticated user.
 
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `token` — a bearer token returned from
  `adduser`, `login` or `createToken`, or, `username`, `password` (and
  optionally `otp`).  Authenticating for this command via a username and
  password will likely not be supported in the future.

#### **Promise Value**

An object that looks like this:

```js
// "*" indicates a field that may not always appear
{
  tfa: null |
       false |
       {"mode": "auth-only", pending: Boolean} |
       ["recovery", "codes"] |
       "otpauth://...",
  name: String,
  email: String,
  email_verified: Boolean,
  created: Date,
  updated: Date,
  cidr_whitelist: null | ["192.168.1.1/32", ...],
  fullname: String, // *
  homepage: String, // *
  freenode: String, // *
  twitter: String,  // *
  github: String    // *
}
```

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.


### profile.set(profileData, registry, auth) → Promise

```js
profile.set({github: 'great-github-account-name'}, registry, {token})
```

Update profile information for the authenticated user.

* `profileData` An object, like that returned from `profile.get`, but see
  below for caveats relating to `tfa` and `cidr_whitelist`.
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `token` — a bearer token returned from
  `adduser`, `login` or `createToken`, or, `username`, `password` (and
  optionally `otp`).  Authenticating for this command via a username and
  password will likely not be supported in the future.

#### **SETTING `cidr-whitelist`**

Only valid CIDR ranges are allowed in this array.  Be very careful as it's
possible to lock yourself out of your account with this.  This is not
currently exposed in `npm` itself.

#### **SETTING `tfa`**

Enabling two-factor authentication is a multi-step process.

1. `profile.set({tfa: {password, mode}}, registry, {token})`
   * Note that the user's password is required here IN ADDITION to the token.
   * Where `mode` is either `auth-only` which requires `otp` when calling `login` or `createToken`.
   * Or `mode` is `auth-and-writes` and an `otp` will be required when publishing.
2. If the result from calling `profile.set` has an empty `tfa` property
   then that means that enabling `tfa` was already started elsewhere or is
   already setup.  In either case you'll need to set it to `disable` before
   setting it to one of the modes above.
3. If the result has a `tfa` property it will be an `otpauth` URL, as
   [used by Google Authenticator](https://github.com/google/google-authenticator/wiki/Key-Uri-Format).
   You will need to show this to the user for them to add to their
   authenticator application.  This is typically done as a QRCODE, but you can
   also show the value of the `secret` key in the `otpauth` query string and
   they can type or copy paste that in.
4. To complete setting up two factor auth you need to make a second call to `profile.set` with
   `tfa` set to an array of TWO codes from the user's authenticator, eg:
   `profile.set(tfa: [otp1, otp2]}, registry, {token})`
5. On success you'll get a result object with a `tfa` property that has an
   array of one-time-use recovery codes.  These are used to authenticate
   later if the second factor is lost and generally should be printed and
   put somewhere safe.

#### **Promise Value**

An object reflecting the changes you made, see description for `profile.get`.

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.

### profile.listTokens(registry, auth) → Promise

```js
profile.listTokens(registry, {token}).then(tokens => {
  // do something with tokens
})
```

Fetch a list of all of the authentication tokens the authenticated user has.

* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `token` — a bearer token returned from
  `adduser`, `login` or `createToken`, or, `username`, `password` (and
  optionally `otp`).  Authenticating for this command via a username and
  password will likely not be supported in the future.

#### **Promise Value**

An array of token objects. Each token object has the following properties:

* key — A sha512 that can be used to remove this token.
* token — The first six characters of the token UUID.  This should be used
  by the user to identify which token this is.
* created — The date and time the token was created
* readonly — If true, this token can only be used to download private modules. Critically, it CAN NOT be used to publish.
* cidr_whitelist — An array of CIDR ranges that this token is allowed to be used from.

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.

### profile.removeToken(token|key, registry, auth) → Promise

```js
profile.removeToken(key, registry, {token}).then(() => {
  // token is gone!
})
```

Remove a specific authentication token.

* `token|key` String, either a complete authentication token or the key returned by `profile.listTokens`.
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `token` — a bearer token returned from
  `adduser`, `login` or `createToken`, or, `username`, `password` (and
  optionally `otp`).  Authenticating for this command via a username and
  password will likely not be supported in the future.

#### **Promise Value**

No value.

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.

### profile.createToken(password, readonly, cidr_whitelist, registry, auth) → Promise

```js
profile.createToken(password, readonly, cidr_whitelist, registry, {token, otp}).then(newToken => {
  // do something with the newToken
})
```

Create a new authentication token, possibly with restrictions.

* `password` String
* `readonly` Boolean
* `cidr_whitelist` Array
* `registry` String (for reference, the npm registry is `https://registry.npmjs.org`)
* `auth` Object, properties: `token` — a bearer token returned from
  `adduser`, `login` or `createToken`, or, `username`, `password` (and
  optionally `otp`).  Authenticating for this command via a username and
  password will likely not be supported in the future.

#### **Promise Value**

The promise will resolve with an object very much like the one's returned by
`profile.listTokens`.  THe only difference is that `token` is not truncated.

```
{
  token: String,
  key: String,    // sha512 hash of the token UUID
  cidr_whitelist: [String],
  created: Date,
  readonly: Boolean
}
```

#### **Promise Rejection**

An error object indicating what went wrong.  It will have a `code` property
set to the HTTP response code and a `headers` property with the HTTP headers
in the response.

