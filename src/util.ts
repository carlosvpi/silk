export interface ObserveCalled<T = never, U = void> {
  (...args: T[]): U;
  hasBeenCalled: boolean;
}
export const observeCalled = <T, U>(f?: (...args: T[]) => U): ObserveCalled<T, U> | undefined => {
  if (!f) return undefined
  const _ = function (...args: T[]) {
    _.hasBeenCalled = true
    _.timesCalled++
    return f(...args)
  }
  _.hasBeenCalled = false
  _.timesCalled = 0
  _.id = Math.floor(Math.random() * 100)
  return _
}
observeCalled.hasBeenCalled = <T, U>(f: undefined | ObserveCalled<T, U>) => {
  return typeof f === 'function' && f !== null && f.hasBeenCalled
}

export const noop = () => {}
