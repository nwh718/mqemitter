'use strict'

const mqemitter = require('.')

const mq = mqemitter({ concurrency: 2 })

mq.on('hello', function onMessage (message, cb) {
  console.log('[on ] hello:', message.payload)
  cb()
})

mq.once('hello', function onceMessage (message, cb) {
  console.log('[once] hello (will fire only once):', message.payload)
  cb()
})

mq.emit({ topic: 'hello', payload: 'world #1' }, function () {
  console.log('emit #1 done')
})

mq.emit({ topic: 'hello', payload: 'world #2' }, function () {
  console.log('emit #2 done')
})

mq.emit({ topic: 'hello', payload: 'world #3' }, function () {
  console.log('emit #3 done')
})