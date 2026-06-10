'use strict'

const mqemitter = require('.')
const mq = mqemitter()

const listeners = new Map()
const queues = new Map()

function subscribe(topic) {
  const obj = []

  if (!queues.has(topic)) {
    queues.set(topic, [])
  }
  queues.get(topic).push(obj)

  if (!listeners.has(topic)) {
    function callback(value, cb) {
      const qs = queues.get(topic)
      for (const q of qs) {
        q.push(value)
      }
      cb()
    }
    listeners.set(topic, callback)
    mq.on(topic, callback)
  }

  obj.close = function close() {
    const qs = queues.get(topic)
    const idx = qs.indexOf(obj)
    if (idx !== -1) {
      qs.splice(idx, 1)
    }
    if (qs.length === 0) {
      const cb = listeners.get(topic)
      mq.removeListener(topic, cb)
      listeners.delete(topic)
      queues.delete(topic)
    }
  }

  return obj
}