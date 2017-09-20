npm-profile-cli
---------------

A minimal CLI for taking actions against your npmjs.com profile.  Is a
wrapper around the `npm-profile` library.

```
npx npm-profile create [username] [email]
npx npm-profile login [username]
npx npm-profile get [property]
npx npm-profile set property value
npx npm-profile set fullname "Abc Def"
npx npm-profile 2fa enable auth-only
npx npm-profile 2fa enable auth-and-writes
npx npm-profile 2fa disable
```
