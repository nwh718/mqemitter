'use strict'

const fastparallel = require('fastparallel')
const MQEmitter = require('./mqemitter')

function DrainableMQEmitter (opts) {
  if (!(this instanceof DrainableMQEmitter)) {
    return new DrainableMQEmitter(opts)
  }

  MQEmitter.call(this, opts)

  const that = this
  this._drainCallbacks = []

  function released () {
    that.current--

    const message = that._messageQueue.shift()
    const callback = that._messageCallbacks.shift()

    if (message) {
      that._do(message, callback)
    } else {
      that._doing = false
      that._checkDrain()
    }
  }

  this._released = released
  this._parallel = fastparallel({
    results: false,
    released
  })
}

Object.setPrototypeOf(DrainableMQEmitter.prototype, MQEmitter.prototype)

Object.defineProperty(DrainableMQEmitter.prototype, 'queuedCount', {
  get: function () {
    return this._messageQueue.length
  },
  enumerable: true
})

DrainableMQEmitter.prototype.drain = function drain (cb) {
  if (this._messageQueue.length === 0 && this.current === 0) {
    setImmediate(cb)
  } else {
    this._drainCallbacks.push(cb)
  }
  return this
}

DrainableMQEmitter.prototype._checkDrain = function _checkDrain () {
  if (this._messageQueue.length === 0 && this.current === 0 && this._drainCallbacks.length > 0) {
    const callbacks = this._drainCallbacks.splice(0)
    for (const cb of callbacks) {
      setImmediate(cb)
    }
  }
}

module.exports = DrainableMQEmitter