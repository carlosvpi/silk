import type { Argument } from '../types';

export default function style(
  node: HTMLElement | SVGElement,
  styleName: keyof CSSStyleDeclaration,
  arg?: Argument<string | number>
): string | number {
  if (styleName === 'length' || styleName === 'parentRule') {
    throw new Error(`Invalid style name: ${styleName}`);
  }
  switch (typeof arg) {
    case 'undefined':
      return (node.style as any)[styleName];
    case 'string':
      return ((node.style as any)[styleName] = arg);
    case 'number':
      return ((node.style as any)[styleName] = `${arg}`);
    case 'function':
      const result = arg(value => style(node, styleName, value));
      if (result !== undefined) {
        return (node.style as any)[styleName] = result;
      }
      return (node.style as any)[styleName];
    default:
      throw new Error(`Invalid argument type for "style": ${typeof arg}`);
  }
}