export type Argument<T, TReturn = T> = T | ((f: Accessor<T, TReturn>) => TReturn | void);
export type Accessor<T, TReturn = T> = (value?: T) => TReturn;
export type ArgumentRecord<T> = Record<string, Argument<T>> | ((f: AccessorRecord<string, T>) => T | void);
export type AccessorRecord<T, U> = {
  (key: T, value?: Argument<U>): U;
  (value: ArgumentRecord<U>): U;
  (): T;
};
export type Ref<T = Element> = {
  current: T
}
export type EventHandler<T = any> = ((_: T) => void)