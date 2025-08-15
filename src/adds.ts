import { Argument } from "../types";
import add, { Child, Behaviour, AddAccessor } from "./add";

type PresentialBehaviour = Behaviour & {
  presence: Argument<number | boolean, AddAccessor<number | boolean>>
}
export type BehavedChild = Child | PresentialBehaviour & {
  child: Child;
}

export type AddChildType = (value?: Child, presence?: Argument<number | boolean, AddAccessor<number | boolean>>, behaviour?: Behaviour) => ReturnType<typeof add> | ChildNode[];
export type DelChildType = (child: Child) => void;

export type Children = BehavedChild[] | ((add: AddChildType, del?: DelChildType) => void);

export default function adds(
  node: HTMLElement | SVGElement,
  children?: Children
): ChildNode[] {
  switch (typeof children) {
    case 'undefined':
      return [...node.childNodes];
    case 'object':
      if (!Array.isArray(children)) {
        throw new Error('Invalid children argument: object not array');
      }
      children.forEach(child => {
        if (typeof child === 'object' && 'child' in child) {
          add(node, child.child, child.presence, child);
          return
        }
        if (typeof child === 'string' || typeof child === 'number') {
          child = document.createTextNode(`${child}`)
        }
        if (child instanceof HTMLElement || child instanceof SVGElement || child instanceof Text) {
          add(node, child, true);
        } else {
          throw new Error(`Invalid child type: ${typeof child}`);
        }
      });
      return [...node.childNodes];
    case 'function':
      children((value, presence, behaviour) => {
        if (value === undefined) {
          return [...node.childNodes];
        }
        return add(node, value, presence, behaviour);
      });
      return [...node.childNodes];
   default:
      throw new Error(`Invalid argument type for "adds": ${typeof children}`);
  }
}