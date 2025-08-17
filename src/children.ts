import { Argument } from "../types";
import child, { Child, Behaviour, AddAccessor } from "./child";

type PresentialBehaviour = Behaviour & {
  presence: Argument<number | boolean, AddAccessor<number | boolean>>
}
export type BehavedChild = Child | PresentialBehaviour & {
  child: Child;
}

export type AddChildType = (value?: Child, presence?: Argument<number | boolean, AddAccessor<number | boolean>>, behaviour?: Behaviour) => ReturnType<typeof child> | ChildNode[];
export type DelChildType = (child: Child) => void;

export type Children = BehavedChild[] | ((add: AddChildType, del?: DelChildType) => void);

export default function children(
  node: HTMLElement | SVGElement,
  args?: Children
): ChildNode[] {
  switch (typeof args) {
    case 'undefined':
      return [...node.childNodes];
    case 'object':
      if (!Array.isArray(args)) {
        throw new Error('Invalid children argument: object not array');
      }
      args.forEach(value => {
        if (typeof value === 'object' && 'child' in value) {
          child(node, value.child, value.presence, value);
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
      });
      return [...node.childNodes];
    case 'function':
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