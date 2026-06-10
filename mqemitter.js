'use strict'

const { Qlobber } = require('qlobber')
const assert = require('assert')
const fastparallel = require('fastparallel')

function MQEmitter (opts) {
  if (!(this instanceof MQEmitter)) {
    return new MQEmitter(opts)
  }

  const that = this

  opts = opts || {}
  opts.matchEmptyLevels = opts.matchEmptyLevels === undefined ? true : !!opts.matchEmptyLevels
  opts.separator = opts.separator || '/'
  opts.wildcardOne = opts.wildcardOne || '+'
  opts.wildcardSome = opts.wildcardSome || '#'

  this._messageQueue = []
  this._messageCallbacks = []
  this._parallel = fastparallel({
    results: false,
    released
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
  this._released = released

  function released () {
    that.current--

    const message = that._messageQueue.shift()
    const callback = that._messageCallbacks.shift()

    if (message) {
      that._do(message, callback)
    } else {
      that._doing = false
    }
  }
}

Object.defineProperty(MQEmitter.prototype, 'length', {
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

MQEmitter.prototype.removeAllListeners = function removeListener (topic, done) {
  assert(topic)
  this._matcher.remove(topic)

  if (done) {
    setImmediate(done)
  }

  return this
}

MQEmitter.prototype.emit = function emit (message, cb) {
  cb = cb || noop

  if (message === null || message === undefined) {
    return cb(new TypeError('message cannot be null or undefined'))
  }

  if (typeof message !== 'object') {
    return cb(new TypeError('message must be an object with a topic property'))
  }

  if (this.closed) {
    return cb(new Error('mqemitter is closed'))
  }

  this._do(message, cb)

  return this
}

MQEmitter.prototype.close = function close (cb) {
  this.closed = true
  setImmediate(cb)

  return this
}

MQEmitter.prototype._do = function (message, callback) {
  this._doing = true
  const matches = message && message.topic
    ? this._matcher.match(message.topic)
    : []

  this.current++
  this._parallel(this, matches, message, callback)

  return this
}

function noop () { }

module.exports = MQEmitter
