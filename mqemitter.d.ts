/// <reference types="node" />

declare namespace mqemitter {
  export interface MQEmitterOptions {
    concurrency?: number
    matchEmptyLevels?: boolean
    separator?: string
    wildcardOne?: string
    wildcardSome?: string
  }

  export type Message = Record<string, any> & { topic: string }
  export type DoneCallback = () => void
  export type EmitCallback = (error?: Error) => void
  export type MessageListener<TMessage extends Message = Message> = (message: TMessage, done: DoneCallback) => void

  export interface MQEmitter {
    current: number
    concurrency: number
    readonly length: number
    on<TMessage extends Message = Message>(topic: string, listener: MessageListener<TMessage>, callback?: DoneCallback): this
    emit<TMessage extends Message = Message>(message: TMessage, callback?: EmitCallback): this
    removeListener<TMessage extends Message = Message>(topic: string, listener: MessageListener<TMessage>, callback?: DoneCallback): this
    removeAllListeners(topic: string, callback?: DoneCallback): this
    close(callback: DoneCallback): this
  }

  export interface DrainableMQEmitter extends MQEmitter {
    readonly queuedCount: number
    drain(callback: DoneCallback): this
  }

  export interface DrainableMQEmitterConstructor {
    new (options?: MQEmitterOptions): DrainableMQEmitter
    (options?: MQEmitterOptions): DrainableMQEmitter
    readonly prototype: DrainableMQEmitter
  }

  export interface MQEmitterConstructor {
    new (options?: MQEmitterOptions): MQEmitter
    (options?: MQEmitterOptions): MQEmitter
    readonly prototype: MQEmitter
    readonly MQEmitter: MQEmitterConstructor
    readonly DrainableMQEmitter: DrainableMQEmitterConstructor
  }
}

declare const mqemitter: mqemitter.MQEmitterConstructor

export = mqemitter
