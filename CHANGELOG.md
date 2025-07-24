# Changelog

## [12.0.0](https://github.com/npm/npm-profile/compare/v11.0.1...v12.0.0) (2025-07-24)
### ⚠️ BREAKING CHANGES
* `npm-profile` now supports node `^20.17.0 || >=22.9.0`
### Bug Fixes
* [`637f654`](https://github.com/npm/npm-profile/commit/637f6545c641b0be98d1996c4bc863d5a3729f7b) [#164](https://github.com/npm/npm-profile/pull/164) align to npm 11 node engine range (@owlstronaut)
### Dependencies
* [`7366688`](https://github.com/npm/npm-profile/commit/7366688ede67cbe133b48423289e44a5a9f8ae00) [#164](https://github.com/npm/npm-profile/pull/164) `npm-registry-fetch@19.0.0`
### Chores
* [`8934c09`](https://github.com/npm/npm-profile/commit/8934c09cb8d4d04b168747fe7905b9c21d9a27b1) [#164](https://github.com/npm/npm-profile/pull/164) `nock@13.5.6` (@owlstronaut)
* [`ea70eaa`](https://github.com/npm/npm-profile/commit/ea70eaa9a5e03c7e0e755cb929bff338b8b0bde8) [#164](https://github.com/npm/npm-profile/pull/164) template-oss apply fix (@owlstronaut)
* [`2aa199f`](https://github.com/npm/npm-profile/commit/2aa199f07c1271ffad51a0d716bc89a054c3e6f8) [#161](https://github.com/npm/npm-profile/pull/161) postinstall workflow updates (#161) (@owlstronaut)
* [`87e427e`](https://github.com/npm/npm-profile/commit/87e427e95d32cfe52e7a7ecf35a170ce60068073) [#160](https://github.com/npm/npm-profile/pull/160) bump nock from 13.5.6 to 14.0.3 (#160) (@dependabot[bot])
* [`49ce76a`](https://github.com/npm/npm-profile/commit/49ce76a5adaf71914b1e6d326773d2adb2aa5ad8) [#163](https://github.com/npm/npm-profile/pull/163) bump @npmcli/template-oss from 4.24.4 to 4.25.0 (#163) (@dependabot[bot], @npm-cli-bot)

## [11.0.1](https://github.com/npm/npm-profile/compare/v11.0.0...v11.0.1) (2024-10-02)
### Dependencies
* [`7c3c631`](https://github.com/npm/npm-profile/commit/7c3c631c3268f7a305af06bbc7ad48834811d063) [#155](https://github.com/npm/npm-profile/pull/155) bump `npm-registry-fetch@18.0.0`

## [11.0.0](https://github.com/npm/npm-profile/compare/v10.0.0...v11.0.0) (2024-09-26)
### ⚠️ BREAKING CHANGES
* `npm-profile` now supports node `^18.17.0 || >=20.5.0`
### Bug Fixes
* [`a0ea10b`](https://github.com/npm/npm-profile/commit/a0ea10b41698df6f8077178f008ac16c27db4620) [#152](https://github.com/npm/npm-profile/pull/152) align to npm 10 node engine range (@reggi)
* [`4ea3f70`](https://github.com/npm/npm-profile/commit/4ea3f70330f36b3d019709fa2ac41426e605e895) [#144](https://github.com/npm/npm-profile/pull/144) exit handler error on login (#144) (@milaninfy)
### Dependencies
* [`66bcc40`](https://github.com/npm/npm-profile/commit/66bcc4087b938e5ea23fb5d238c1e0620591b90d) [#152](https://github.com/npm/npm-profile/pull/152) `proc-log@5.0.0`
### Chores
* [`8ac1fdb`](https://github.com/npm/npm-profile/commit/8ac1fdbfef7b863d0a9d38fd47970614b745a3eb) [#152](https://github.com/npm/npm-profile/pull/152) run template-oss-apply (@reggi)
* [`1fdff2e`](https://github.com/npm/npm-profile/commit/1fdff2e67aa37a26457c60a20656eecd3408a8f6) [#146](https://github.com/npm/npm-profile/pull/146) bump @npmcli/eslint-config from 4.0.5 to 5.0.0 (@dependabot[bot])
* [`5b3ebbc`](https://github.com/npm/npm-profile/commit/5b3ebbc6580e4389bcc85dbdfb74816810b62f4c) [#134](https://github.com/npm/npm-profile/pull/134) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`6b4558f`](https://github.com/npm/npm-profile/commit/6b4558f6d91ffc7f21f181941462146acccb218e) [#147](https://github.com/npm/npm-profile/pull/147) postinstall for dependabot template-oss PR (@hashtagchris)
* [`c644e89`](https://github.com/npm/npm-profile/commit/c644e89bf1abfdea2a84359c9a394bb85df12d6e) [#147](https://github.com/npm/npm-profile/pull/147) bump @npmcli/template-oss from 4.23.1 to 4.23.3 (@dependabot[bot])

## [10.0.0](https://github.com/npm/npm-profile/compare/v9.0.2...v10.0.0) (2024-05-02)

### ⚠️ BREAKING CHANGES

* this uses AbortSignal.throwIfAborted() which is not available in all versions of Node 16
* `hostname` is no longer sent as part of the web auth body
* the opener function will now receive an object with an abort signal which can be used to listen for the abort event intead of an event emitter

### Features

* [`f67687d`](https://github.com/npm/npm-profile/commit/f67687d2bdc58ace8ee4e236254525cb2f3c07ef) [#131](https://github.com/npm/npm-profile/pull/131) drop node 16 support (@lukekarrys)
* [`d6f6ebe`](https://github.com/npm/npm-profile/commit/d6f6ebe1b7e2ac75f63d261271ab442a9a96c610) [#131](https://github.com/npm/npm-profile/pull/131) remove hostname from body (@lukekarrys, @wraithgar)
* [`c0bb22f`](https://github.com/npm/npm-profile/commit/c0bb22fa0027859b494b643fe3c670e3a366c822) [#131](https://github.com/npm/npm-profile/pull/131) add webAuthOpener method (@lukekarrys)
* [`df44705`](https://github.com/npm/npm-profile/commit/df44705b4a7b4590531536449fcfd81de01bc36b) [#131](https://github.com/npm/npm-profile/pull/131) use AbortSignal instead of EventEmitter for opener (@lukekarrys)

### Bug Fixes

* [`53db633`](https://github.com/npm/npm-profile/commit/53db633662252216c23599d43cf2daac3dac1c20) [#131](https://github.com/npm/npm-profile/pull/131) pass signal to webAuthCheckLogin timer (@lukekarrys)

### Dependencies

* [`5c4221b`](https://github.com/npm/npm-profile/commit/5c4221b67306792ab5ec27ab4c2ce27f320f81f9) [#133](https://github.com/npm/npm-profile/pull/133) `npm-registry-fetch@17.0.1` (#133)

## [9.0.2](https://github.com/npm/npm-profile/compare/v9.0.1...v9.0.2) (2024-04-30)

### Bug Fixes

* [`06687c8`](https://github.com/npm/npm-profile/commit/06687c86200ad1d12114f002d6eb53d646e96eee) [#130](https://github.com/npm/npm-profile/pull/130) linting: no-unused-vars (#130) (@wraithgar)

### Dependencies

* [`29e6172`](https://github.com/npm/npm-profile/commit/29e6172878c19deef8ebd6aacac63ad17a11e37d) [#129](https://github.com/npm/npm-profile/pull/129) `npm-registry-fetch@17.0.0` (#129)

### Chores

* [`1c8afe8`](https://github.com/npm/npm-profile/commit/1c8afe8a2652b91bca147641b4a90d7fb590919b) [#127](https://github.com/npm/npm-profile/pull/127) postinstall for dependabot template-oss PR (@lukekarrys)
* [`3b68ec1`](https://github.com/npm/npm-profile/commit/3b68ec1791d555545ad86d5f95995a963a4110ce) [#127](https://github.com/npm/npm-profile/pull/127) bump @npmcli/template-oss from 4.21.3 to 4.21.4 (@dependabot[bot])

## [9.0.1](https://github.com/npm/npm-profile/compare/v9.0.0...v9.0.1) (2024-04-12)

### Dependencies

* [`44972e2`](https://github.com/npm/npm-profile/commit/44972e20d5eb75097c8a3d7ee438b604fd8cbc98) [#126](https://github.com/npm/npm-profile/pull/126) `proc-log@4.0.0` (#126)

### Chores

* [`11f4605`](https://github.com/npm/npm-profile/commit/11f46058f159a0ec15c0733a61d6620db1a6b96a) [#122](https://github.com/npm/npm-profile/pull/122) postinstall for dependabot template-oss PR (@lukekarrys)
* [`0719640`](https://github.com/npm/npm-profile/commit/0719640d5c1122aa3bd64381672a6a2280a7fe8b) [#122](https://github.com/npm/npm-profile/pull/122) bump @npmcli/template-oss from 4.21.1 to 4.21.3 (@dependabot[bot])
* [`e944f88`](https://github.com/npm/npm-profile/commit/e944f88129d2179697f4f85d8cda164eed4445e7) [#119](https://github.com/npm/npm-profile/pull/119) postinstall for dependabot template-oss PR (@lukekarrys)
* [`28888c7`](https://github.com/npm/npm-profile/commit/28888c7d277f65bc0b14cdd232848730eada2856) [#119](https://github.com/npm/npm-profile/pull/119) bump @npmcli/template-oss from 4.19.0 to 4.21.1 (@dependabot[bot])
* [`30097a5`](https://github.com/npm/npm-profile/commit/30097a5eef4239399b964c2efc121e64e75ecaf5) [#101](https://github.com/npm/npm-profile/pull/101) postinstall for dependabot template-oss PR (@lukekarrys)
* [`efe9f20`](https://github.com/npm/npm-profile/commit/efe9f20d9b456ad3f3c96a686b5c71ef7dd97f4f) [#101](https://github.com/npm/npm-profile/pull/101) bump @npmcli/template-oss from 4.18.1 to 4.19.0 (@dependabot[bot])
* [`cd076f1`](https://github.com/npm/npm-profile/commit/cd076f19c289abc4e14c18c111163dca7ceb7047) [#100](https://github.com/npm/npm-profile/pull/100) postinstall for dependabot template-oss PR (@lukekarrys)
* [`e928f0c`](https://github.com/npm/npm-profile/commit/e928f0c356e7207b5bd99460c361b7534ed913a4) [#100](https://github.com/npm/npm-profile/pull/100) bump @npmcli/template-oss from 4.18.0 to 4.18.1 (@dependabot[bot])

## [9.0.0](https://github.com/npm/npm-profile/compare/v8.0.0...v9.0.0) (2023-08-15)

### ⚠️ BREAKING CHANGES

* support for node <=16.13 has been removed

### Bug Fixes

* [`d2fdd5e`](https://github.com/npm/npm-profile/commit/d2fdd5eeb907fab727797750e8340b213bffd60c) [#97](https://github.com/npm/npm-profile/pull/97) drop node 16.13.x support (@lukekarrys)

### Dependencies

* [`1855caf`](https://github.com/npm/npm-profile/commit/1855cafdc9028168fd44ac805310a782761cd89b) [#96](https://github.com/npm/npm-profile/pull/96) bump npm-registry-fetch from 15.0.0 to 16.0.0

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
