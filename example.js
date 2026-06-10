'use strict'

const mqemitter = require('.')

const mq = mqemitter()

const callbacks = new Map()
const subscribers = new Map()

function subscribe (topic, obj) {
  let callback = callbacks.get(topic)

  if (!callback) {
    callback = function callback (value, cb) {
      const list = subscribers.get(topic) || []
      for (const subscriber of list) {
        subscriber.push(value)
      }
      cb()
    }
    callbacks.set(topic, callback)
    subscribers.set(topic, [])
    mq.on(topic, callback)
  }

  subscribers.get(topic).push(obj)

  obj.close = function close () {
    const list = subscribers.get(topic)
    if (!list) {
      return
    }
    const idx = list.indexOf(obj)
    if (idx === -1) {
      return
    }
    list.splice(idx, 1)
    if (list.length === 0) {
      mq.removeListener(topic, callback)
      callbacks.delete(topic)
      subscribers.delete(topic)
    }
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

mq.emit({ topic: 'hello', payload: 'world' })

a.close()
b.close()
c.close()

mq.emit({ topic: 'hello', payload: 'world' })
