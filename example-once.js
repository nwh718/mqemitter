'use strict'

const mqemitter = require('./mqemitter')

const mq = mqemitter()

mq.once('hello', (message, cb) => {
  console.log('触发一次 (Triggered once):', message.payload)
  cb()
})

console.log('第一次触发...')
mq.emit({ topic: 'hello', payload: 'A' })

console.log('第二次触发...')
mq.emit({ topic: 'hello', payload: 'B' })
