import type { ArgumentRecord } from '../types';
import style from './style';

export default function styles(node: HTMLElement | SVGElement, arg?: string | ArgumentRecord<string | number>) {
  switch (typeof arg) {
    case 'undefined':
      return node.style.cssText;
    case 'string':
      return node.style.cssText = arg;
    case 'object':
      for (const [key, value] of Object.entries(arg)) {
        style(node, key as keyof CSSStyleDeclaration, value);
      }
      return node.style.cssText;
    case 'function':
      arg(((key?: string, value?: any) => {
        if (key === undefined) {
          return node.style.cssText;
        }
        return style(node, key as keyof CSSStyleDeclaration, value);
      }) as any);
      return node.style.cssText;
    default:
      throw new Error('Invalid styles argument');
  }
}
