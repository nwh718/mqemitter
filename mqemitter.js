'use strict'

const { Qlobber } = require('qlobber')
const assert = require('assert')
const fastparallel = require('fastparallel')

function MQEmitter (opts) {
  if (!(this instanceof MQEmitter)) {
    return new MQEmitter(opts)
  }

  opts = opts || {}
  opts.matchEmptyLevels = opts.matchEmptyLevels === undefined ? true : !!opts.matchEmptyLevels
  opts.separator = opts.separator || '/'
  opts.wildcardOne = opts.wildcardOne || '+'
  opts.wildcardSome = opts.wildcardSome || '#'

  this._messageQueue = []
  this._messageCallbacks = []
  this._released = released.bind(this)
  this._parallel = fastparallel({
    results: false,
    released: this._released
  })

  this.concurrency = opts.concurrency || 0

  this.current = 0
  this._doing = false
  this._matcher = new Qlobber({
    match_empty_levels: opts.matchEmptyLevels,
    separator: opts.separator,
    wildcard_one: opts.wildcardOne,
    wildcard_some: opts.wildcardSome
  })

  this.closed = false
}

function DrainableMQEmitter (opts) {
  if (!(this instanceof DrainableMQEmitter)) {
    return new DrainableMQEmitter(opts)
  }

  MQEmitter.call(this, opts)
  this._drainCallbacks = []
}

DrainableMQEmitter.prototype = Object.create(MQEmitter.prototype)
DrainableMQEmitter.prototype.constructor = DrainableMQEmitter

Object.defineProperty(MQEmitter.prototype, 'length', {
  get: function () {
    return this._messageQueue.length
  },
  enumerable: true
})

Object.defineProperty(DrainableMQEmitter.prototype, 'queuedCount', {
  get: function () {
    return this._messageQueue.length
  },
  enumerable: true
})

MQEmitter.prototype.on = function on (topic, notify, done) {
  assert(topic)
  assert(notify)
  this._matcher.add(topic, notify)

  if (done) {
    setImmediate(done)
  }

  return this
}

MQEmitter.prototype.removeListener = function removeListener (topic, notify, done) {
  assert(topic)
  assert(notify)
  const that = this
  setImmediate(function () {
    that._matcher.remove(topic, notify)
    if (done) {
      done()
    }
  })
  return this
}

MQEmitter.prototype.removeAllListeners = function removeAllListeners (topic, done) {
  assert(topic)
  this._matcher.remove(topic)

  if (done) {
    setImmediate(done)
  }

  return this
}

MQEmitter.prototype.emit = function emit (message, cb) {
  assert(message)

  cb = cb || noop

  if (this.closed) {
    return cb(new Error('mqemitter is closed'))
  }

  if (this.concurrency > 0 && this.current >= this.concurrency) {
    this._messageQueue.push(message)
    this._messageCallbacks.push(cb)
    if (!this._doing) {
      process.emitWarning('MqEmitter leak detected', { detail: 'For more info check: https://github.com/mcollina/mqemitter/pull/94' })
      this._released()
    }
  } else {
    this._do(message, cb)
  }

  return this
}

MQEmitter.prototype.close = function close (cb) {
  this.closed = true
  setImmediate(cb)

  return this
}

MQEmitter.prototype._do = function _do (message, callback) {
  this._doing = true
  const matches = this._matcher.match(message.topic)

  this.current++
  this._parallel(this, matches, message, callback)

  return this
}

MQEmitter.prototype._afterReleased = noop

DrainableMQEmitter.prototype.drain = function drain (cb) {
  assert(cb)

  if (this.queuedCount === 0) {
    setImmediate(cb)
  } else {
    this._drainCallbacks.push(cb)
  }

  return this
}

DrainableMQEmitter.prototype._afterReleased = function _afterReleased () {
  if (this.queuedCount !== 0) {
    return
  }

  const callbacks = this._drainCallbacks.splice(0)

  for (const callback of callbacks) {
    setImmediate(callback)
  }
}

function released () {
  this.current--

  const message = this._messageQueue.shift()
  const callback = this._messageCallbacks.shift()

  if (message) {
    this._do(message, callback)
  } else {
    this._doing = false
  }

  this._afterReleased()
}

function noop () { }

module.exports = MQEmitter
module.exports.MQEmitter = MQEmitter
module.exports.DrainableMQEmitter = DrainableMQEmitter
