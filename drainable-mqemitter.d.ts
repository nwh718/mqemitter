/// <reference types="node" />

import mqemitter = require('./mqemitter')

interface DrainableMQEmitterOptions {
  concurrency?: number
  matchEmptyLevels?: boolean
  separator?: string
  wildcardOne?: string
  wildcardSome?: string
}

declare namespace drainableMqemitter {
  export interface DrainableMQEmitter extends mqemitter.MQEmitter {
    readonly queuedCount: number
    drain(callback: () => void): this
  }
}

declare function drainableMqemitter(options?: DrainableMQEmitterOptions): drainableMqemitter.DrainableMQEmitter

export = drainableMqemitter
