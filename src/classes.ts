import type { Argument, RecordArgument } from '../types';
import classed from './classed';

export interface ClassesAccessor {
  (): string[];
  (key: string): boolean;
  (key: string, value: boolean): Promise<boolean>;
}

export type ClassesArg = string | string[] | Argument<Record<string, Argument<boolean>>, ClassesAccessor>

function classes(node: HTMLElement | SVGElement): string[];
function classes(node: HTMLElement | SVGElement, arg?: ClassesArg): Promise<string[]>;

function classes(node: HTMLElement | SVGElement, arg?: ClassesArg): string[] | Promise<string[]> {
  switch (typeof arg) {
    case 'undefined':
      return [...node.classList.values()]
    case 'string':
      node.setAttribute('class', arg);
      return Promise.resolve([...node.classList.values()])
    case 'object':
      if (arg === null) {
        throw new Error('Invalid "null" as paramter of "classes"')
      }
      if (Array.isArray(arg)) {
        arg.forEach(className => node.classList.add(className))
        return Promise.resolve([...node.classList.values()])
      }
      return new Promise(async resolve => {
        await Promise.all(Object.entries(arg).map(([key, value]) => {
          return classed(node, key, value);
        }))
        resolve(Promise.resolve([...node.classList.values()]))
      })
    case 'function':
      return new Promise(resolve => {
        arg(((key?: string, value?: boolean) => {
          if (key === undefined) return [...node.classList.values()]
          if (value === undefined) return classed(node, key)
          const promise = classed(node, key, value)
          return promise.then(promiseValue => {
            resolve([...node.classList.values()])
            return promiseValue
          })
        }) as ClassesAccessor);
      })
    default:
      throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
  }
}

export default classes
