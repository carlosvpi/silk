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
      return style(node, styleName, arg(value => style(node, styleName, value)) ?? undefined);
    default:
      throw new Error(`Invalid argument type for "style": ${typeof arg}`);
  }
}