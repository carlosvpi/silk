import type { Accessor, Argument } from '../types';

function classed(node: HTMLElement | SVGElement, className: string): boolean;
function classed(node: HTMLElement | SVGElement, className: string, arg: Argument<boolean>): Promise<boolean>;

function classed(
  node: HTMLElement | SVGElement,
  className: string,
  arg?: Argument<boolean>
): boolean | Promise<boolean> {
  switch (typeof arg) {
    case 'undefined':
      return node.classList.contains(className);
    case 'boolean':
      if (arg) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);
      }
      return Promise.resolve(arg);
    case 'function':
      return new Promise(resolve => {
        arg(((value?: boolean) => {
          if (value === undefined) return classed(node, className)
          const promise = classed(node, className, value)
          return promise.then(promiseValue => {
            resolve(promiseValue)
            return promiseValue
          })
        }) as Accessor<boolean>);
      })
    default:
      throw new Error(`Invalid argument type for "classed": ${typeof arg}`);
  }
}

export default classed;
