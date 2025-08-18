import type { Argument } from '../types';
import style from './style';

export interface StylesAccessor {
  (): CSSStyleDeclaration;
  (key: keyof CSSStyleDeclaration): string;
  (key: keyof CSSStyleDeclaration, value: string): Promise<string>;
}

export type StylesArg = Argument<Partial<Record<keyof CSSStyleDeclaration, Argument<string | number>>>, StylesAccessor>

function styles(node: HTMLElement | SVGElement): CSSStyleDeclaration;
function styles(node: HTMLElement | SVGElement, arg: StylesArg): Promise<CSSStyleDeclaration>;

function styles(node: HTMLElement | SVGElement, arg?: StylesArg): CSSStyleDeclaration | Promise<CSSStyleDeclaration> {
  switch (typeof arg) {
    case 'undefined':
      return node.style;
    case 'object':
      if (arg === null) {
        throw new Error('Invalid "null" as paramter of "styles"')
      }
      return new Promise(async resolve => {
        await Promise.all(Object.entries(arg).map(([key, value]) => {
          return style(node, key as keyof CSSStyleDeclaration, value!);
        }))
        resolve(node.style);
      })
    case 'function':
      return new Promise(resolve => {
        arg(((key?: keyof CSSStyleDeclaration, value?: string) => {
          if (key === undefined) return node.style
          if (value === undefined) return style(node, key)
          const promise = style(node, key, value)
          return promise.then(promiseValue => {
            resolve(node.style)
            return promiseValue
          })
        }) as StylesAccessor);
      })
    default:
      throw new Error('Invalid styles argument');
  }
}

export default styles;
