import type { ArgumentRecord } from '../types';
import classed from './classed';

export default function classes(
  node: HTMLElement | SVGElement,
  arg?: string | string[] | ArgumentRecord<boolean>
): string[] {
  switch (typeof arg) {
    case 'undefined':
      break;
    case 'string':
      node.setAttribute('class', arg);
      break;
    case 'object':
      if (Array.isArray(arg)) {
        arg.forEach(className => node.classList.add(className))
      } else {
        for (const [key, value] of Object.entries(arg)) {
          classed(node, key, value);
        }
      }
      break;
    case 'function':
      arg(((key?: string, value?: any) => {
        if (key === undefined) {
          return node.className;
        }
        return classed(node, key, value);
      }) as any);
      break;
    default:
      throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
  }
  return [...node.classList];
}