# Changelog

## [8.0.0](https://github.com/npm/npm-profile/compare/v7.0.1...v8.0.0) (2023-08-14)

### ⚠️ BREAKING CHANGES

* support for node 14 has been removed

### Bug Fixes

* [`cfd2d07`](https://github.com/npm/npm-profile/commit/cfd2d07ef5eeaac7187c75e31718c2d73af596da) [#93](https://github.com/npm/npm-profile/pull/93) drop node14 support (@lukekarrys)

### Dependencies

* [`96370c2`](https://github.com/npm/npm-profile/commit/96370c2f60a6a50a8e6027ca2b4972716af5efec) [#92](https://github.com/npm/npm-profile/pull/92) bump npm-registry-fetch from 14.0.5 to 15.0.0

## [7.0.1](https://github.com/npm/npm-profile/compare/v7.0.0...v7.0.1) (2022-10-17)

### Dependencies

* [`36fa4b1`](https://github.com/npm/npm-profile/commit/36fa4b13df38e2dde7a74bf23e49e013ca8129c6) [#76](https://github.com/npm/npm-profile/pull/76) bump npm-registry-fetch from 13.3.1 to 14.0.0
* [`29616ad`](https://github.com/npm/npm-profile/commit/29616ad8e59847e2350d3376e755a4688d0c81a0) [#77](https://github.com/npm/npm-profile/pull/77) bump proc-log from 2.0.1 to 3.0.0

## [7.0.0](https://github.com/npm/npm-profile/compare/v6.2.1...v7.0.0) (2022-09-30)

### ⚠️ BREAKING CHANGES

* `npm-profile` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`e16befb`](https://github.com/npm/npm-profile/commit/e16befb96a182525432f4023952033f759f8c814) [#68](https://github.com/npm/npm-profile/pull/68) postinstall for dependabot template-oss PR (@lukekarrys)

## [6.2.1](https://github.com/npm/npm-profile/compare/v6.2.0...v6.2.1) (2022-08-02)


### Bug Fixes

* cancel opener promise if web login fails ([#57](https://github.com/npm/npm-profile/issues/57)) ([cdc4acb](https://github.com/npm/npm-profile/commit/cdc4acb81d28924bdc8f5503f2eb2515884b6478))
* remove `npm-use-webauthn` header ([#53](https://github.com/npm/npm-profile/issues/53)) ([b701df2](https://github.com/npm/npm-profile/commit/b701df2630c12de0db555138238eb24a026a438b))

## [6.2.0](https://github.com/npm/npm-profile/compare/v6.1.0...v6.2.0) (2022-07-12)


### Features

* Add export for `webauthCheckLogin` ([#54](https://github.com/npm/npm-profile/issues/54)) ([05a7811](https://github.com/npm/npm-profile/commit/05a78112a4a5c473813cb1f26be346452687899b))

## [6.1.0](https://github.com/npm/npm-profile/compare/v6.0.3...v6.1.0) (2022-06-08)


### Features

* Allow web-login donecheck to cancel opener promise ([#50](https://github.com/npm/npm-profile/issues/50)) ([aa82de0](https://github.com/npm/npm-profile/commit/aa82de07a3c2e5adf90c79d6401dba7b9705da27))
* set 'npm-use-webauthn' header depending on option ([#48](https://github.com/npm/npm-profile/issues/48)) ([6bdd233](https://github.com/npm/npm-profile/commit/6bdd2331b988d981be58953b28ec93a2c3412b58))

### [6.0.3](https://github.com/npm/npm-profile/compare/v6.0.2...v6.0.3) (2022-04-20)


### Dependencies

* update npm-registry-fetch requirement from ^13.0.0 to ^13.0.1 ([#34](https://github.com/npm/npm-profile/issues/34)) ([a444b51](https://github.com/npm/npm-profile/commit/a444b5149653e7cfba2cdbcd8e31bb12d97bc152))

### [6.0.2](https://www.github.com/npm/npm-profile/compare/v6.0.1...v6.0.2) (2022-02-15)


### Dependencies

* bump npm-registry-fetch from 12.0.2 to 13.0.0 ([#28](https://www.github.com/npm/npm-profile/issues/28)) ([7c01310](https://www.github.com/npm/npm-profile/commit/7c0131079fb3ab955b304f34e28374f0c1321565))

### [6.0.1](https://www.github.com/npm/npm-profile/compare/v6.0.0...v6.0.1) (2022-02-14)


### Bug Fixes

* Modify logincouch target ([#27](https://www.github.com/npm/npm-profile/issues/27)) ([1889375](https://www.github.com/npm/npm-profile/commit/1889375c240f85fbb2d38b72c2dda7e5a73bf9f0))


### Dependencies

* update npm-registry-fetch requirement from ^12.0.0 to ^12.0.2 ([82b65f8](https://www.github.com/npm/npm-profile/commit/82b65f8fef07497c116a64f141e275c173cb8cf1))
* use proc-log instead of process.emit ([fe2b8f3](https://www.github.com/npm/npm-profile/commit/fe2b8f3988578661d688415feb4c37dd1aa8b82d))

## [6.0.0](https://www.github.com/npm/npm-profile/compare/v5.0.4...v6.0.0) (2022-01-19)


### ⚠ BREAKING CHANGES

* this drops support for node<=10 and non-LTS versions of node12 and node14

### Features

* move to template-oss ([3f668be](https://www.github.com/npm/npm-profile/commit/3f668be0e12b4752fe87f7410cdb5ae6a97eef70))


### Documentation

* Update README.md ([#14](https://www.github.com/npm/npm-profile/issues/14)) ([531e352](https://www.github.com/npm/npm-profile/commit/531e35262bec5bb8f3611f774bc87cbd42437c3f))


### dependencies

* npm-registry-fetch@12.0.0 ([852b3f0](https://www.github.com/npm/npm-profile/commit/852b3f07b56c9c0a10efacde841d5c6172f87c5c))

## v5.0.0 (2020-02-27)

- Drop the CLI from the project, just maintain the library
- Drop support for EOL Node.js versions
- Remove `Promise` option, just use native Promises
- Remove `figgy-pudding`
- Use `npm-registry-fetch` v8
- fix: do not try to open invalid URLs for WebLogin

## v4.0.3 (2020-02-27)

- fix: do not try to open invalid URLs for WebLogin

## v4.0.2 (2019-07-16)

- Update `npm-registry-fetch` to 4.0.0

## v4.0.1 (2018-08-29)

- `opts.password` needs to be base64-encoded when passed in for login
- Bump `npm-registry-fetch` dep because we depend on `opts.forceAuth`

## v4.0.0 (2018-08-28)

### BREAKING CHANGES:

- Networking and auth-related options now use the latest [`npm-registry-fetch` config format](https://www.npmjs.com/package/npm-registry-fetch#fetch-opts).

## v3.0.2 (2018-06-07)

- Allow newer make-fetch-happen.
- Report 500s from weblogin end point as unsupported.
- EAUTHUNKNOWN errors were incorrectly reported as EAUTHIP.

## v3.0.1 (2018-02-18)

- Log `npm-notice` headers

## v3.0.0 (2018-02-18)

### BREAKING CHANGES:

- profile.login() and profile.adduser() take 2 functions: opener() and
  prompter().  opener is used when we get the url couplet from the
  registry.  prompter is used if web-based login fails.
- Non-200 status codes now always throw.  Previously if the `content.error`
  property was set, `content` would be returned. Content is available on the
  thrown error object in the `body` property.

### FEATURES:

- The previous adduser is available as adduserCouch
- The previous login is available as loginCouch
- New loginWeb and adduserWeb commands added, which take an opener
  function to open up the web browser.
- General errors have better error message reporting

### FIXES:

- General errors now correctly include the URL.
- Missing user errors from Couch are now thrown. (As was always intended.)
- Many errors have better stacktrace filtering.
