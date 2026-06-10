'use strict'

const mqemitter = require('.')

const mq = mqemitter()

const listeners = new Map()
const queues = new Map()

function subscribe (topic, queue) {
  if (!queues.has(topic)) {
    queues.set(topic, new Set())
  }
  queues.get(topic).add(queue)

  if (!listeners.has(topic)) {
    function callback (value, cb) {
      const topicQueues = queues.get(topic)
      if (topicQueues) {
        for (const q of topicQueues) {
          q.push(value)
        }
      }
      cb()
    }

    listeners.set(topic, callback)
    mq.on(topic, callback)
  }

  function close () {
    const topicQueues = queues.get(topic)
    if (topicQueues) {
      topicQueues.delete(queue)
      
      if (topicQueues.size === 0) {
        queues.delete(topic)
        const callback = listeners.get(topic)
        if (callback) {
          mq.removeListener(topic, callback)
          listeners.delete(topic)
        }
      }
    }
  }

  queue.close = close
  return queue
}

