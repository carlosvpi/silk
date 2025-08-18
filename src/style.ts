import type { Accessor, Argument } from '../types';

function style(node: HTMLElement | SVGElement, styleName: keyof CSSStyleDeclaration): string;
function style(node: HTMLElement | SVGElement, styleName: keyof CSSStyleDeclaration, arg: Argument<string | number>): Promise<string>;

function style(
  node: HTMLElement | SVGElement,
  styleName: keyof CSSStyleDeclaration,
  arg?: Argument<string | number>
): string | Promise<string> {
  if (styleName === 'length' || styleName === 'parentRule') {
    throw new Error(`Invalid style name: ${styleName}`);
  }
  switch (typeof arg) {
    case 'undefined':
      return (node.style as any)[styleName];
    case 'string':
    case 'number':
      return Promise.resolve(((node.style as any)[styleName] = `${arg}`));
    case 'function':
      return new Promise(resolve => {
        arg(((value?: string | number) => {
          if (value === undefined) return style(node, styleName)
          const promise = style(node, styleName, value)
          return promise.then(promiseValue => {
            resolve(promiseValue)
            return promiseValue
          })
        }) as Accessor<string | number>);
      })
    default:
      throw new Error(`Invalid argument type for "style": ${typeof arg}`);
  }
}

export default style
