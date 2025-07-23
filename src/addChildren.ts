import { Argument } from "../types";
import addChild, { BehaviourObject } from "./addChild";

export type BehavedChild = string | number | ChildNode | BehaviourObject & {
  child: ChildNode;
}

export type AddChildType = (value?: ChildNode, behaviour?: BehaviourObject) => ReturnType<typeof addChild> | ChildNode[];

export type Children = BehavedChild[] | ((add: AddChildType) => void);

export default function addChildren(
  node: HTMLElement | SVGElement,
  children?: Children
): ChildNode[] {
  switch (typeof children) {
    case 'undefined':
      return [...node.childNodes];
    case 'object':
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'object' && 'child' in child) {
            addChild(node, child.child, child);
          } else if (child instanceof HTMLElement || child instanceof SVGElement || child instanceof Text) {
            node.appendChild(child);
          } else if (typeof child === 'string' || typeof child === 'number') {
            node.appendChild(document.createTextNode(`${child}`));
          } else {
            throw new Error(`Invalid child type: ${typeof child}`);
          }
        });
        return [...node.childNodes];
      }
      throw new Error('Invalid children argument: object not array');
    case 'function':
      children((value, behaviour) => {
        if (value === undefined) {
          return [...node.childNodes];
        }
        return addChild(node, value, behaviour);
      });
      return [...node.childNodes];
   default:
      throw new Error(`Invalid argument type for "addChildren": ${typeof children}`);
  }
}