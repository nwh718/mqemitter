'use strict'

const MQEmitter = require('./mqemitter')

function DrainableMQEmitter(opts) {
  if (!(this instanceof DrainableMQEmitter)) {
    return new DrainableMQEmitter(opts)
  }

  MQEmitter.call(this, opts)

  this._drainCallbacks = []
}

DrainableMQEmitter.prototype = Object.create(MQEmitter.prototype)
DrainableMQEmitter.prototype.constructor = DrainableMQEmitter

Object.defineProperty(DrainableMQEmitter.prototype, 'queuedCount', {
  get: function () {
    return this._messageQueue.length
  },
  enumerable: true
})

DrainableMQEmitter.prototype.emit = function emit(message, cb) {
  const that = this
  const wrappedCb = function (err) {
    if (cb) cb(err)
    that._checkDrain()
  }
  return MQEmitter.prototype.emit.call(this, message, wrappedCb)
}

DrainableMQEmitter.prototype._checkDrain = function () {
  if (this._messageQueue.length === 0 && this.current === 0) {
    const drainCallbacks = this._drainCallbacks.splice(0)
    for (let i = 0; i < drainCallbacks.length; i++) {
      drainCallbacks[i]()
    }
  }
}

const originalReleased = MQEmitter.prototype._released
DrainableMQEmitter.prototype._released = function () {
  originalReleased.call(this)
  this._checkDrain()
}

DrainableMQEmitter.prototype.drain = function drain(cb) {
  if (this._messageQueue.length === 0 && this.current === 0) {
    setImmediate(cb)
  } else {
    this._drainCallbacks.push(cb)
  }
  return this
}

module.exports = DrainableMQEmitter
