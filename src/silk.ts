import { Argument } from "../types";
import { default as setChildren, Children, BehavedChild, AddChildType } from "./children";
import { default as setProps, Props } from "./props";
import { default as setText} from "./text";

export default function silk(tag: Node | Argument<string | number>, props: null | Props, ...children: BehavedChild[] | [((add: AddChildType) => void)]) {
  if (props === undefined) {
    if (typeof tag === 'string') {
      return document.createTextNode(tag);
    } else if (typeof tag === 'function') {
      const node = document.createTextNode('');
      setText(node, tag);
      return node;
    } else if (tag instanceof Node) {
      return tag;
    }
    throw new Error(`Invalid tag type: ${typeof tag}`);
  }
  const node = typeof tag === 'string' ? document.createElement(tag) : tag as HTMLElement | SVGElement;

  if (props !== null) {
    setProps(node, props);
  }
  const childrenToAdd = typeof children[0] === 'function' ? children[0] : Array.isArray(children[0]) ? children[0] : children;
  if (children.length > 0) {
    setChildren(node, childrenToAdd as Children);
  }
  return node;
}