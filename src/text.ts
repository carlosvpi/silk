import type { Accessor, Argument } from '../types';

function text(node: Text): string;
function text(node: Text, arg: Argument<string | number>): Promise<string>;

function text(node: Text, arg?: Argument<string | number>): string | Promise<string> {
  switch (typeof arg) {
    case 'undefined':
      return node.textContent ?? '';
    case 'string':
    case 'number':
      return Promise.resolve(node.textContent = `${arg}`);
    case 'function':
      return new Promise(resolve => {
        arg(((value?: string | number) => {
          if (value === undefined) return text(node)
          const promise = text(node, value)
          return promise.then(promiseValue => {
            resolve(promiseValue)
            return promiseValue
          })
        }) as Accessor<string | number>);
      })
    default:
      throw new Error(`Invalid argument type for "text": ${typeof arg}`);
  }
}

export default text
