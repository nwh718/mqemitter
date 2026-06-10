'use strict'

const mqemitter = require('.')

const mq = mqemitter()

function subscribe (topic, obj) {
  mq.on(topic, callback)
  obj.close = close

  function callback (value, cb) {
    obj.push(value)
    cb()
  }

  function close () {
    mq.removeListener(topic, callback)
  }
}

class MyQueue {
  push (value) {
    console.log(value)
  }
}

const a = new MyQueue()
const b = new MyQueue()
const c = new MyQueue()

subscribe('hello', a)
subscribe('hello', b)
subscribe('hello', c)

mq.once('hello', function (value, cb) {
  console.log('once', value)
  cb()
})

mq.emit({ topic: 'hello', payload: 'world' })
mq.emit({ topic: 'hello', payload: 'again' })

a.close()
b.close()
c.close()

mq.emit({ topic: 'hello', payload: 'world' })
