import type { Argument, RecordArgument, EventHandler, Ref } from '../types';
import attr, { AttrType } from './attr';
import classes, { ClassesArg } from './classes';
import styles, { StylesArg } from './styles';

interface PropsAccessor {
  (): Record<string, string>;
  (key: string): AttrType | ClassesArg | StylesArg;
  (args: Props): Promise<Record<string, string>>;
  (key: string, value: AttrType | ClassesArg | StylesArg): Promise<Record<string, string>>;
}

export type Props = Argument<
  Record<string, Argument<AttrType>> |
  Record<string, EventHandler> |
  { ref: Ref } |
  { class: ClassesArg } |
  { style: StylesArg }
, PropsAccessor>

function props(node: HTMLElement | SVGElement): Record<string, string>;
function props(node: HTMLElement | SVGElement, arg: string): string | string[] | CSSStyleDeclaration | null;
function props(node: HTMLElement | SVGElement, arg: Props): Promise<Record<string, string>>;

function props(
  node: HTMLElement | SVGElement,
  arg?: Props | string
): Record<string, string> | Promise<Record<string, string>> | string | string[] | CSSStyleDeclaration | null {
  switch (typeof arg) {
    case 'undefined':
      return Array.from(node.getAttributeNames()).reduce((acc: Record<string, string>, attribute) => {
        acc[attribute] = node.getAttribute(attribute) ?? '';
        return acc;
      }, {} as Record<string, string>)
    case 'string':
      switch (arg) {
        case 'class':
          return classes(node)
        case 'style':
          return styles(node)
        default:
          return node.getAttribute(arg)
      }
    case 'object':
      if (arg === null) {
        throw new Error('Invalid "null" as paramter of "props"')
      }
      return new Promise(async resolve => {
        await Promise.all(Object.entries(arg).map(([key, value]) => {
          switch (key) {
            case 'class':
              return classes(node, value as ClassesArg);
            case 'style':
              return styles(node, value as StylesArg);
            case 'ref':
              return Promise.resolve((value as Ref).current = node)
            default:
              if (key.startsWith('on')) {
                if (key.endsWith('Capture')) {
                  node.addEventListener(key.slice(2, -7).toLowerCase(), value as EventHandler, { capture: true })
                } else {
                  node.addEventListener(key.slice(2).toLowerCase(), value as EventHandler)
                }
                return Promise.resolve({[key]: value})
              }
              return attr(node, key, value as Argument<AttrType>);
          }
        }))
        resolve(Array.from(node.getAttributeNames()).reduce((acc: Record<string, string>, attribute) => {
          acc[attribute] = node.getAttribute(attribute) ?? '';
          return acc;
        }, {} as Record<string, string>))
      })
    case 'function':
      return new Promise(resolve => {
        arg(((key?: string | Props, value?: AttrType | ClassesArg | StylesArg) => {
          if (key === undefined) {
            return Array.from(node.getAttributeNames()).reduce((acc: Record<string, string>, attribute) => {
              acc[attribute] = node.getAttribute(attribute) ?? '';
              return acc;
            }, {} as Record<string, string>)
          }
          if (typeof key !== 'string') {
            const promise = props(node, key)
            return promise.then(promiseValue => {
              resolve(Array.from(node.getAttributeNames()).reduce((acc: Record<string, string>, attribute) => {
                acc[attribute] = node.getAttribute(attribute) ?? '';
                return acc;
              }, {} as Record<string, string>))
              return promiseValue
            })
          }
          if (value === undefined) {
            return props(node, key)
          }
          const promise = props(node, { [key]: value } as Props)
            return promise.then(promiseValue => {
              resolve(Array.from(node.getAttributeNames()).reduce((acc: Record<string, string>, attribute) => {
                acc[attribute] = node.getAttribute(attribute) ?? '';
                return acc;
              }, {} as Record<string, string>))
              return promiseValue
            })
        }) as PropsAccessor);
      })
    default:
      throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
  }
}

export default props
