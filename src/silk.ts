import { Argument } from "../types";
import { default as setChildren, Children, BehavedChild, AddChildType } from "./addChildren";
import { default as setProps, Props } from "./props";
import { default as setText} from "./text";

export default function silk(tag: Node | Argument<string | number>, props: Props, ...children: BehavedChild[] | [((add: AddChildType) => void)]) {
  if (props === undefined) {
    if (typeof tag === 'string') {
      return document.createTextNode(tag);
    } else if (typeof tag === 'function') {
      const node = document.createTextNode('');
      setText(node, tag);
    } else if (tag instanceof Node) {
      return tag;
    }
    throw new Error(`Invalid tag type: ${typeof tag}`);
  }
  const node = typeof tag === 'string' ? document.createElement(tag) : tag as HTMLElement | SVGElement;

  setProps(node, props);
  children = Array.isArray(children[0]) ? children[0] : children;
  if (children.length > 0) {
    setChildren(node, children as Children);
  }
  return node;
}