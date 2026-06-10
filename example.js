'use strict'

const mqemitter = require('.')

const mq = mqemitter()
const listeners = new Map()
const queues = new Map()

function subscribe (topic, queue) {
  if (listeners.has(topic)) {
    listeners.get(topic).queues.push(queue)
    queues.get(topic).push(queue)
    return
  }

  function callback (message, cb) {
    const queueList = queues.get(topic)
    if (queueList) {
      for (const q of queueList) {
        q.push(message)
      }
    }
    cb()
  }

  listeners.set(topic, { callback, queues: [queue] })
  queues.set(topic, [queue])
  mq.on(topic, callback)

  return {
    close: function (done) {
      const listener = listeners.get(topic)
      if (listener) {
        const queueList = queues.get(topic)
        const idx = queueList ? queueList.indexOf(queue) : -1
        if (idx !== -1) {
          queueList.splice(idx, 1)
        }
        listener.queues.splice(listener.queues.indexOf(queue), 1)

        if (listener.queues.length === 0) {
          mq.removeListener(topic, listener.callback, done)
          listeners.delete(topic)
          queues.delete(topic)
        } else if (done) {
          done()
        }
      } else if (done) {
        done()
      }
    }
  }
}
// const listeners = new Map()
//
//
// const queues = new Map()
//
// function subscribe (topic, queue) {
//   if (listeners.has(topic)) {
//
//   }
//
//   function callback (err) {
//
//     for (var value of queues) {
//     }
//   }
//
//   listeners.set(topic, callback)
//   queues.set(topic, [queue])
// }

// const listeners = new Map()
//
//
// const queues = new Map()
//
// function subscribe (topic, queue) {
//   if (listeners.has(topic)) {
//
//   }
//
//   function callback (err) {
//
//     for (var value of queues) {
//     }
//   }
//
//   listeners.set(topic, callback)
//   queues.set(topic, [queue])
// }
//
//   function callback (err) {
//
//     for (var value of queues) {
//     }
//   }
//
//   listeners.set(topic, callback)
//   queues.set(topic, [queue])
// }
//   }
//
//   function callback (err) {
//
//     for (var value of queues) {
//     }
//   }
//
//   listeners.set(topic, callback)
//   queues.set(topic, [queue])
// }

//
// const queues = new Map()
//
// function subscribe (topic, queue) {
//   if (listeners.has(topic)) {
//
//   }
//
//   function callback (err) {
//
//     for (var value of queues) {
//     }
//   }
//
//   listeners.set(topic, callback)
//   queues.set(topic, [queue])
// }
