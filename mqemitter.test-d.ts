import { expectError, expectType } from 'tsd'
import mqEmitter from '../mqemitter'
import type { DrainableMQEmitter, Message, MQEmitter } from '../mqemitter'

expectType<MQEmitter>(mqEmitter())

expectType<MQEmitter>(mqEmitter({ concurrency: 200, matchEmptyLevels: true }))

expectType<MQEmitter>(
  mqEmitter({
    concurrency: 10,
    matchEmptyLevels: true,
    separator: '/',
    wildcardOne: '+',
    wildcardSome: '#',
  })
)

function listener (message: Message, done: () => void) {}

expectType<MQEmitter>(mqEmitter().on('topic', listener))

expectError(mqEmitter().emit(null))

expectType<MQEmitter>(
  mqEmitter().emit({ topic: 'test', prop1: 'prop1', [Symbol.for('me')]: 42 })
)

expectType<MQEmitter>(mqEmitter().emit({ topic: 'test', prop1: 'prop1' }, () => {}))

expectType<MQEmitter>(mqEmitter().removeListener('topic', listener))

expectType<MQEmitter>(mqEmitter().close(() => null))

expectType<DrainableMQEmitter>(new mqEmitter.DrainableMQEmitter())
expectType<number>(new mqEmitter.DrainableMQEmitter().queuedCount)
expectType<DrainableMQEmitter>(new mqEmitter.DrainableMQEmitter().drain(() => {}))
