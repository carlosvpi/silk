import type { Argument } from '../types';

export default function attr(
  node: HTMLElement | SVGElement,
  attrName: string,
  arg?: Argument<string | null | boolean>
): string | null | boolean {
  switch (typeof arg) {
    case 'undefined':
      return node.getAttribute(attrName);
    case 'string':
      node.setAttribute(attrName, arg);
      return arg;
    case 'object':
      if (arg === null) {
        node.removeAttribute(attrName);
        return null;
      }
      throw new Error(`Invalid argument type for "attr": object not null`);
    case 'boolean':
      if (arg === true) {
        node.setAttribute(attrName, 'true');
      } else {
        node.removeAttribute(attrName);
      }
      return arg;
    case 'function':
      const result = arg(value => attr(node, attrName, value));
      if (result !== undefined) {
        if (result === true) {
          node.setAttribute(attrName, 'true')
        } else if (result === false || result === null) {
          node.removeAttribute(attrName)
        } else {
          node.setAttribute(attrName, result as string)
        }
      }
      return node.getAttribute(attrName);
    default:
      throw new Error(`Invalid argument type for "attr": ${typeof arg}`);
  }
}