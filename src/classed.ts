import type { Argument } from '../types';

export default function classed(
  node: HTMLElement | SVGElement,
  className: string,
  arg?: Argument<boolean>
): boolean {
  switch (typeof arg) {
    case 'undefined':
      return node.classList.contains(className);
    case 'boolean':
      if (arg) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);
      }
      return arg;
    case 'function':
      const result = arg(value => classed(node, className, value));
      if (result === true) {
        node.classList.add(className);
        return true;
      } else if (result === false) {
        node.classList.remove(className);
        return false;
      } else {
        return node.classList.contains(className);
      }
    default:
      throw new Error(`Invalid argument type for "classed": ${typeof arg}`);
  }
}