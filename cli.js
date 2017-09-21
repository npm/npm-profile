#!/usr/bin/env node
'use strict'
const os = require('os')
const path = require('path')
const Bluebird = require('bluebird')
const log = require('npmlog')
const yargs = require('yargs')
const npmrc = require('./cmds/util/npmrc.js')

process.on('log', function (level) {
  return log[level].apply(log, [].slice.call(arguments, 1))
})

let running = false

const argv = yargs
  .usage('npm-profile <cmd> <args>')
  .option('config', {
    describe: 'the npmrc to read/write your configuration from/to',
    type: 'string',
    default: path.join(os.homedir(), '.npmrc')
  })
  .option('registry', {
    describe: 'the registry to talk to',
    type: 'string'
  })
  .option('otp', {
    describe: 'a one time password',
    type: 'string'
  })
  .command({
    command: 'adduser [<username>] [<email>]',
    desc: 'adduser a new account',
    handler: run('adduser')
  })
  .command({
    command: 'login [<username>]',
    desc: 'login to an existing account',
    handler: run('login')
  })
  .command({
    command: 'token [create|list|delete]',
    desc: 'create and remove authentication tokens',
    builder: yargs => yargs
      .command({
        command: 'create [--readonly] [--cidr]',
        desc: 'create a new authentication token',
        handler: run('token', 'create'),
        builder: yargs => yargs
          .option('readonly', {
            type: 'boolean'
          })
          .option('cidr', {
            type: 'string'
          })
      })
      .command({
        command: 'list',
        desc: 'list all authentication tokens that this account has',
        handler: run('token', 'list')
      })
      .command({
        command: 'delete <id>',
        aliases: [ 'rm' ],
        desc: 'remove an authentication token',
        handler: run('token', 'rm')
      })
  })
  .command({
    command: 'get [<property>]',
    desc: 'get the value of a profile property',
    handler: run('get')
  })
  .command({
    command: 'set <property> <value>',
    desc: 'set the value of a profile property',
    handler: run('set')
  })
  .command({
    command: '2fa [status|enable|disable]',
    aliases: [ 'tfa' ],
    desc: 'control two factor authentication for this account',
    builder: yargs => yargs
      .command({
        command: 'status',
        desc: 'get the status of 2fa for the current login',
        handler: run('tfa', 'status')
      })
      .command({
        command: 'enable <mode>',
        desc: 'enable 2fa for the current login (mode: auth-only, auth-and-writes)',
        handler: run('tfa', 'enable')
      })
      .command({
        command: 'disable',
        desc: 'disable 2fa for the current login',
        handler: run('tfa', 'disable')
      })
  })
  .demandCommand()
  .help()
  .argv

if (!running) {
  console.error('Invalid command:', argv._[0], '\n')
  yargs.showHelp()
  process.exit(1)
}

function run (cmd, subcmd) {
  return argv => {
    running = true
    const args = [argv].concat(argv._.slice(1).map(v => String(v)))
    if (!argv.registry) {
      const conf = npmrc.read(argv.config)
      argv.registry = conf.registry || 'http://registry.npm.red'
    }
    Bluebird.try(() => {
      let action = require(`./cmds/${cmd}.js`)
      if (subcmd) action = action[subcmd]
      return action.apply(null, args)
    }).error(ex => {
      console.error(ex.stack)
      process.exit(1)
    }).catch(ex => {
      console.error(ex.stack || ex)
      process.exit(1)
    })
  }
}
