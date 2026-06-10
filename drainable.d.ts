import mqemitter = require('./mqemitter')

interface DrainableMQEmitterOptions {
  concurrency?: number
  matchEmptyLevels?: boolean
  separator?: string
  wildcardOne?: string
  wildcardSome?: string
}

declare namespace drainable {
  export interface DrainableMQEmitter extends mqemitter.MQEmitter {
    readonly queuedCount: number
    drain(callback: () => void): this
  }

  export interface DrainableMQEmitterConstructor {
    new (options?: DrainableMQEmitterOptions): DrainableMQEmitter
    (options?: DrainableMQEmitterOptions): DrainableMQEmitter
  }
}

declare const DrainableMQEmitter: drainable.DrainableMQEmitterConstructor

export = DrainableMQEmitter