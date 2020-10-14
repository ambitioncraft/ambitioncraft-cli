import {setTimeout} from 'timers'

export class CanceledError extends Error {
  constructor() {
    super('throttled invocation was canceled')
    this.name = 'CanceledError'
  }
}

class Delay {
  ready: Promise<void>
  effect: Promise<void> | void
  timeout!: NodeJS.Timeout

  constructor(lastInvocationDone: Promise<any>, wait: number) {
    this.effect = new Promise(resolve => {
      this.timeout = setTimeout(resolve, wait)
    })
    this.ready = lastInvocationDone.then(() => this.effect)
  }

  flush() {
    clearTimeout(this.timeout)
    this.effect = undefined
  }

  cancel() {
    clearTimeout(this.timeout)
    this.effect = Promise.reject(new CanceledError())
    this.effect.catch(() => {
      // stuff
    })
  }
}

export default function throttle(
  fn: (...args: any) => Promise<any>,
  _wait: number,
  options: {
    getNextArgs?: (args0: any, args1: any) => any;
  } = {}
): {
  (...args: any): Promise<any>;
  cancel: () => Promise<void>;
  flush: () => Promise<void>;
  } {
  const wait = _wait !== null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0
  const getNextArgs = options.getNextArgs || ((prev, next) => next)

  let nextArgs: any
  let lastInvocationDone: Promise<any> = Promise.resolve()
  let delay: Delay = new Delay(lastInvocationDone, 0)
  let nextInvocation: Promise<any> | null = null

  function invoke(): Promise<any> {
    const args = nextArgs
    if (!args) throw new Error('unexpected error: nextArgs is null')
    nextInvocation = null
    nextArgs = null
    const result = fn(...args)
    lastInvocationDone = result.catch(() => {
      // ignore
    })
    delay = new Delay(lastInvocationDone, wait)
    return result
  }

  function wrapper(...args: any): Promise<any> {
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null')
    if (!nextInvocation) nextInvocation = delay.ready.then(invoke)
    return nextInvocation
  }

  wrapper.cancel = async (): Promise<void> => {
    const _lastInvocationDone = lastInvocationDone
    delay.cancel()
    nextInvocation = null
    nextArgs = null
    lastInvocationDone = Promise.resolve()
    delay = new Delay(lastInvocationDone, 0)
    await _lastInvocationDone
  }

  wrapper.flush = async (): Promise<void> => {
    delay.flush()
    await lastInvocationDone
  }

  return wrapper
}

throttle.CanceledError = CanceledError
