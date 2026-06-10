'use strict'
const mq = require('./mqemitter.js')
const e = mq()

try {
  e.emit(null, (err) => console.log('callback got:', err && err.message))
} catch (err) {
  console.log('THROWN (uncaught):', err.message)
}

try {
  e.emit(undefined, (err) => console.log('callback got:', err && err.message))
} catch (err) {
  console.log('THROWN (uncaught):', err.message)
}
