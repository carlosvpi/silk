import { Argument } from "../types";
import child, { Child, Behaviour, Presence } from "./child";

export type BehavedChild = Behaviour & {
  presence: Presence<boolean>
  child: Child;
}
export interface AddChildType {
  (): ChildNode[];
  (value: Child): number;
  (value: Child, presence: Presence<boolean>, behaviour?: Behaviour): Promise<number>;
}
export type Children = (Child | BehavedChild)[] | ((add: AddChildType) => void);

function children(node: HTMLElement | SVGElement): ChildNode[];
function children(node: HTMLElement | SVGElement, args: Children): Promise<ChildNode[]>;

function children(
  node: HTMLElement | SVGElement,
  args?: Children
): ChildNode[] | Promise<ChildNode[]> {
  switch (typeof args) {
    case 'undefined':
      return [...node.childNodes];
    case 'object':
      if (!Array.isArray(args)) {
        throw new Error('Invalid children argument: object not array');
      }
      return Promise.all(args.map(value => {
        if (typeof value === 'object' && 'child' in value) {
          (arg?: boolean) => {
            const p = (value as BehavedChild).presence
            return typeof p !== 'function'
              ? p
              : arg === undefined ? p() : p(arg)
          }
          child(node, value.child, () as Presence<boolean>, value);
          return
        }
        if (typeof value === 'string' || typeof value === 'number') {
          value = document.createTextNode(`${value}`)
        }
        if (value instanceof HTMLElement || value instanceof SVGElement || value instanceof Text) {
          child(node, value, true);
        } else {
          throw new Error(`Invalid child type: ${typeof value}`);
        }
      })).then(() => [...node.childNodes]);
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

      args((value, presence, behaviour) => {
        if (value === undefined) {
          return [...node.childNodes];
        }
        return child(node, value, presence, behaviour);
      });
      return [...node.childNodes];
   default:
      throw new Error(`Invalid argument type for "children": ${typeof args}`);
  }
}

export default children;
