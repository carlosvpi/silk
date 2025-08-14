export type Argument<T, A = Accessor<T>> = T | ((f: A) => T | void);
export type Accessor<T> = (value?: T) => T;
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