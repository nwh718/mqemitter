'use strict'

const mqemitter = require('.')

const mq = mqemitter()
const subscriptions = new Map()

function subscribe (topic, queue) {
  let subscription = subscriptions.get(topic)

  if (!subscription) {
    const queues = new Set()
    const callback = function callback (value, cb) {
      for (const currentQueue of queues) {
        currentQueue.push(value)
      }
      cb()
    }

    subscription = { callback, queues }
    subscriptions.set(topic, subscription)
    mq.on(topic, callback)
  }

  subscription.queues.add(queue)
  queue.close = close

  return queue

  function close () {
    const currentSubscription = subscriptions.get(topic)

    if (!currentSubscription) {
      return
    }

    currentSubscription.queues.delete(queue)

    if (currentSubscription.queues.size > 0) {
      return
    }

    subscriptions.delete(topic)
    mq.removeListener(topic, currentSubscription.callback)
  }
}

module.exports = {
  mq,
  subscribe
}
