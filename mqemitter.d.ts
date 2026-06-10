/// <reference types="node" />

interface MQEmitterOptions {
  concurrency?: number
  matchEmptyLevels?: boolean
  separator?: string
  wildcardOne?: string
  wildcardSome?: string
}

declare namespace mqemitter {
  export type Message = Record<string, any> & { topic: string }

  export interface MQEmitter {
    current: number
    concurrency: number
    length: number
    closed: boolean
    on(topic: string, listener: (message: Message, done: () => void) => void, callback?: () => void): this
    emit(message: Message, callback?: (error?: Error) => void): void
    removeListener(topic: string, listener: (message: Message, done: () => void) => void, callback?: () => void): void
    removeAllListeners(topic: string, callback?: () => void): this
    close(callback: () => void): void
  }

  export interface DrainableMQEmitter extends MQEmitter {
    queuedCount: number
    drain(callback: () => void): this
  }
}

declare function mqemitter (options?: MQEmitterOptions): mqemitter.MQEmitter

declare namespace mqemitter {
  export function DrainableMQEmitter (options?: MQEmitterOptions): mqemitter.DrainableMQEmitter
}

export = mqemitter
