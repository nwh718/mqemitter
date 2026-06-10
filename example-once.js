'use strict'

const mqemitter = require('.')

const mq = mqemitter({ concurrency: 1 })

mq.once('hello/once', function (message, cb) {
  console.log('once listener received:', message.payload)
  cb()
})

mq.once('hello/wildcard/+', function (message, cb) {
  console.log('wildcard once listener received:', message.payload)
  cb()
})

mq.emit({ topic: 'hello/once', payload: 'first' })
mq.emit({ topic: 'hello/once', payload: 'second' })

mq.emit({ topic: 'hello/wildcard/a', payload: 'match a' })
mq.emit({ topic: 'hello/wildcard/b', payload: 'match b' })

setTimeout(function () {
  mq.close(function () {
    console.log('closed')
  })
}, 100)
