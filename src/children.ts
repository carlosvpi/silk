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
          const behaved = value as BehavedChild
          return (child(node, behaved.child, behaved.presence, behaved) as Promise<number>).then(() => behaved.child as ChildNode);
        }
        if (typeof value === 'string' || typeof value === 'number') {
          value = document.createTextNode(`${value}`)
        }
        if (value instanceof HTMLElement || value instanceof SVGElement || value instanceof Text) {
          return (child(node, value, true) as Promise<number>).then(() => value as ChildNode);
        }
        throw new Error(`Invalid child type: ${typeof value}`);
      })).then(() => [...node.childNodes]);
    case 'function':
      return new Promise(resolve => {
        args(((value?: Child, presence?: Presence, behaviour?: Behaviour) => {
          if (value === undefined) return [...node.childNodes];
          return child(node, value, presence, behaviour);
        }) as AddChildType);
        resolve([...node.childNodes]);
      })
   default:
      throw new Error(`Invalid argument type for "children": ${typeof args}`);
  }
}

export default children;
