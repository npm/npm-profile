'use strict'
module.exports = retryWithOTP

function retryWithOTP (opts) {
  return opts.fn(opts.otp).catch(err => {
    if (opts.otp || err.code !== 'otp') throw err
    return opts.get().then(opts.fn)
  })
}
