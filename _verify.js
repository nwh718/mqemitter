'use strict'
const assert = require('assert')
const mq = require('./mqemitter.js')

let failed = 0

function check (name, fn) {
  try {
    fn()
    console.log('OK ', name)
  } catch (err) {
    failed++
    console.log('FAIL', name, '-', err.message)
  }
}

check('emit(null) with callback does NOT throw and invokes cb with TypeError', () => {
  const e = mq()
  let thrown = null
  let cbErr = null
  try {
    e.emit(null, (err) => { cbErr = err })
  } catch (err) {
    thrown = err
  }
  assert.strictEqual(thrown, null, 'should not throw')
  assert.ok(cbErr instanceof TypeError, 'callback should receive TypeError, got: ' + cbErr)
})

check('emit(undefined) does NOT throw', () => {
  const e = mq()
  let thrown = null
  let cbErr = null
  try {
    e.emit(undefined, (err) => { cbErr = err })
  } catch (err) {
    thrown = err
  }
  assert.strictEqual(thrown, null, 'should not throw')
  assert.ok(cbErr instanceof TypeError, 'callback should receive TypeError, got: ' + cbErr)
})

check('emit(null) without callback does NOT throw', () => {
  const e = mq()
  let thrown = null
  try {
    e.emit(null)
  } catch (err) {
    thrown = err
  }
  assert.strictEqual(thrown, null, 'should not throw')
})

check('emit({ topic: "test" }) still works', () => {
  const e = mq()
  let received = null
  e.on('test', (msg, cb) => { received = msg; cb() })
  e.emit({ topic: 'test', payload: 'hi' }, (err) => {
    assert.strictEqual(err, null)
    assert.strictEqual(received.payload, 'hi')
  })
})

check('emit(123) non-object does NOT throw and returns err via cb', () => {
  const e = mq()
  let thrown = null
  let cbErr = null
  try {
    e.emit(123, (err) => { cbErr = err })
  } catch (err) {
    thrown = err
  }
  assert.strictEqual(thrown, null)
  assert.ok(cbErr instanceof TypeError)
})

console.log('\n' + (failed === 0 ? 'All checks passed' : failed + ' check(s) failed'))
process.exit(failed === 0 ? 0 : 1)
