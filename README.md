npm-profile-cli
---------------

A minimal CLI for taking actions against your npmjs.com profile.  Is a
wrapper around the `npm-profile` library.

```
npm-profile <cmd> <args>

Commands:
  adduser [<username>] [<email>]  adduser a new account
  login [<username>]              login to an existing account
  token [create|list|delete]      create and remove authentication tokens
  get [<property>]                get the value of a profile property
  set <property> <value>          set the value of a profile property
  2fa [status|enable|disable]     control two factor authentication for this
                                  account                         [aliases: tfa]
  2fa status         get the status of 2fa for the current login
  2fa disable        disable 2fa for the current login
  2fa enable <mode>  enable 2fa for the current login
    <mode> can be one of:
      auth-only - Require two-factor authentication only when logging in
      auth-and-writes - Require two-factor authentication when logging in AND when publishing


Options:
  --config    the npmrc to read/write your configuration from/to
                                     [string] [default: "/Users/rebecca/.npmrc"]
  --registry  the registry to talk to                                   [string]
  --otp       a one time password                                       [string]
  --help      Show help                                                [boolean]
```
