import type { Accessor, Argument } from '../types';

export type AttrType = string | null | boolean | number

function attr(node: HTMLElement | SVGElement, attrName: string): AttrType;
function attr(node: HTMLElement | SVGElement, attrName: string, arg?: Argument<AttrType>): Promise<string | null>;

function attr(
  node: HTMLElement | SVGElement,
  attrName: string,
  arg?: Argument<AttrType>
): AttrType | Promise<string | null> {
  switch (typeof arg) {
    case 'undefined':
      return node.getAttribute(attrName);
    case 'string':
    case 'number':
      node.setAttribute(attrName, `${arg}`);
      return Promise.resolve(`${arg}`);
    case 'object':
      if (arg === null) {
        node.removeAttribute(attrName);
        return Promise.resolve(null);
      }
      throw new Error(`Invalid argument type for "attr": object not null`);
    case 'boolean':
      if (arg === true) {
        node.setAttribute(attrName, 'true');
      } else {
        node.removeAttribute(attrName);
      }
      return Promise.resolve(arg ? 'true' : null);
    case 'function':
      return new Promise(resolve => {
        arg(((value?: AttrType) => {
          if (value === undefined) return attr(node, attrName)
          const promise = attr(node, attrName, value)
          return promise.then(promiseValue => {
            resolve(promiseValue)
            return promiseValue
          })
        }) as Accessor<AttrType>);
      })
    default:
      throw new Error(`Invalid argument type for "attr": ${typeof arg}`);
  }
}

export default attr
