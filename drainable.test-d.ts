import { expectError, expectType } from 'tsd'
import DrainableMQEmitter from './drainable'
import type { DrainableMQEmitter as DMQE } from './drainable'
import type { Message } from './mqemitter'

expectType<DMQE>(DrainableMQEmitter())

expectType<DMQE>(DrainableMQEmitter({ concurrency: 200, matchEmptyLevels: true }))

expectType<DMQE>(
  DrainableMQEmitter({
    concurrency: 10,
    matchEmptyLevels: true,
    separator: '/',
    wildcardOne: '+',
    wildcardSome: '#',
  })
)

function listener (message: Message, done: () => void) {}

expectType<DMQE>(DrainableMQEmitter().on('topic', listener))
expectType<DMQE>(DrainableMQEmitter().on('topic', listener, () => {}))

expectError(DrainableMQEmitter().emit(null))

expectType<void>(
  DrainableMQEmitter().emit({ topic: 'test', prop1: 'prop1', [Symbol.for('me')]: 42 })
)

expectType<void>(DrainableMQEmitter().emit({ topic: 'test', prop1: 'prop1' }, () => {}))

expectType<void>(DrainableMQEmitter().removeListener('topic', listener))
expectType<void>(DrainableMQEmitter().close(() => null))

expectType<number>(DrainableMQEmitter().queuedCount)

expectType<DMQE>(DrainableMQEmitter().drain(() => {}))

const emitter: DMQE = DrainableMQEmitter({ concurrency: 1 })
emitter.drain(() => {
  console.log('drained')
})