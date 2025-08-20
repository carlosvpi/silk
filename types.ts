export type Argument<T, A = Accessor<T>, TReturn = void> = T | ((f: A) => TReturn);
export interface Accessor<T> {
  (): T;
  (value: T): Promise<T>;
}
export type RecordArgument<T> = Record<string, Argument<T>> | ((f: RecordAccessor<string, T>) => T | void);
export type RecordAccessor<T, U> = {
  (key: T, value?: Argument<U>): U;
  (value: RecordArgument<U>): U;
  (): T;
};
export type Ref<T = Element> = {
  current: T
}
export type EventHandler<T = any> = ((_: T) => void)