import type { Argument } from '../types';

export default function text(node: Text, arg?: Argument<string | number>): string {
  switch (typeof arg) {
    case 'undefined':
      return node.textContent ?? '';
    case 'string':
      return node.textContent = arg;
    case 'number':
      return node.textContent = `${arg}`;
    case 'function':
      const result = arg(value => text(node, value));
      return result === undefined
        ? node.textContent ?? ''
        : text(node, result)
    default:
      throw new Error(`Invalid argument type for "text": ${typeof arg}`);
  }
}