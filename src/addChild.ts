import { Accessor, Argument } from "../types";

const caller = (f: () => void) => f()
const noop = () => {}

export type BehaviourObject = {
  onMount?: (mount: () => boolean) => void | (() => void);
  onUnmount?: (unmount: () => boolean) => void | (() => void);
  onCancelMount?: () => void;
  onCancelUnmount?: () => void;
  onDelete?: () => void;
  presence?: Argument<boolean | number>;
  isMounting?: boolean[];
  isUnmounting?: boolean[];
  _onDelete?: (() => void)[];
}
type BehaviourBase = boolean | number | BehaviourObject
export type Behaviour = BehaviourBase | ((f: Accessor<BehaviourBase>, g: RemoveChild) => BehaviourBase | void)
export type RemoveChild = () => number | boolean | Node

export default function addChild(
  node: HTMLElement | SVGElement,
  child: ChildNode | string | number,
  behaviour?: Behaviour
): RemoveChild | ReturnType<RemoveChild> {
  let remove: undefined | RemoveChild = () => {
    if (typeof behaviour === 'object') {
      behaviour?._onDelete?.forEach(fn => fn());
      behaviour = undefined
    }
    const childToRemove = (typeof child === 'string' || typeof child === 'number')
      ? [...node.childNodes].find(node => node instanceof Text && node.textContent === `${child}`)
      : child;
    if (childToRemove !== undefined && node.contains(childToRemove)) {
      if (childToRemove instanceof Element) {
        [...childToRemove.getAttributeNames()].forEach(attr => {
          childToRemove.removeAttribute(attr)
        })
        childToRemove.classList.forEach(cls => childToRemove.classList.remove(cls))
      }
      node.removeChild(childToRemove);
      childToRemove.remove();
      remove = undefined;
    }
    child = '';
    behaviour = undefined;
    return childToRemove ?? false;
  }
  switch (typeof behaviour) {
    case 'undefined':
      if (typeof child === 'string' || typeof child === 'number') {
        return [...node.childNodes].findIndex(node => node instanceof Text && node.textContent === `${child}`);
      } else {
        return [...node.childNodes].indexOf(child);
      }
    case 'boolean':
      if (behaviour) {
        if (typeof child === 'string' || typeof child === 'number') {
          if (![...node.childNodes].find((node: ChildNode) => node instanceof Text && node.textContent === `${child}`)) {
            node.appendChild(document.createTextNode(`${child}`));
          }
        } else if (!node.contains(child)) {
          node.appendChild(child);
        }
        return remove;
      } else {
        if (typeof child === 'string' || typeof child === 'number') {
          const childNodeIndex = [...node.childNodes].findIndex((node: ChildNode) => node instanceof Text && node.textContent === `${child}`)
          const childNode = node.childNodes[childNodeIndex];
          if (!!childNode) {
            node.removeChild(childNode);
          }
          return remove;
        }
        const index = [...node.childNodes].indexOf(child);
        if (node.contains(child)) {
          node.removeChild(child);
        }
        return index;
      }
    case 'number':
      if (typeof child === 'string' || typeof child === 'number') {
        if (behaviour >= 0) {
          const childNode = node.childNodes[behaviour];
          if (childNode instanceof Text && childNode.textContent === `${child}`) {
            return remove;
          }
          node.insertBefore(document.createTextNode(`${child}`), node.childNodes[behaviour] || null);
        } else {
          const childNode = [...node.childNodes].find(node => node instanceof Text && node.textContent === `${child}`);
          if (!childNode) {
            return remove;
          }
          node.removeChild(childNode);
        }
        return remove;
      }

      if (behaviour === [...node.childNodes].indexOf(child)) {
        return remove;
      }
      if (behaviour >= 0) {
        node.insertBefore(child, node.childNodes[behaviour] || null);
      } else if (behaviour < 0) {
        node.removeChild(child);
      }
      return remove;
    case 'function':
      let removeChild: ReturnType<typeof addChild> = false;
      behaviour((value) => {
        if (!behaviour) {
          return removeChild = false;
        }
        removeChild = addChild(node, child, value);
        if (typeof removeChild === 'number') {
          return removeChild;
        }
        return value ?? false;
      }, () => typeof removeChild === 'function' ? removeChild() : removeChild);
      return remove;
    case 'object':
      let onMount = behaviour.onMount ?? caller;
      let onUnmount = behaviour.onUnmount ?? caller;
      let onCancelMount = behaviour.onCancelMount ?? noop;
      let onCancelUnmount = behaviour.onCancelUnmount ?? noop;
      let presence = behaviour.presence ?? true;
      behaviour._onDelete ||= [];
      if (behaviour.onDelete) {
        behaviour._onDelete.push(behaviour.onDelete)
      }
      child = typeof child === 'string' || typeof child === 'number' ? document.createTextNode(`${child}`) : child;
      if (presence === true || (typeof presence === 'number' && presence >= 0)) {
        if (behaviour.isUnmounting && behaviour.isUnmounting.length > 0) {
          onCancelUnmount();
          behaviour.isUnmounting[0] = false;
        }
        if (!Array.isArray(behaviour.isMounting)) {
          behaviour.isMounting = [];
        }
        behaviour.isMounting.unshift(true);
        const cancelMount = onMount(() => {
          if (typeof behaviour !== 'object' || !Array.isArray(behaviour.isMounting) || !behaviour.isMounting.pop()) {
            return false;
          }
          if ((presence === true && !node.contains(child as ChildNode)) || (typeof presence === 'number' && node.children[presence] !== child)) {
            if (presence === true) {
              node.appendChild(child as ChildNode);
            } else {
              node.insertBefore(child as ChildNode, node.childNodes[presence as number] || null);
            }
          }
          return true;
        })
        if (typeof cancelMount === 'function') {
          behaviour._onDelete.push(cancelMount);
        }
        return remove;
      } else if (presence === false || presence === -1) {
        if (behaviour.isMounting && behaviour.isMounting.length > 0) {
          onCancelMount();
          behaviour.isMounting[0] = false;
        }
        if (!Array.isArray(behaviour.isUnmounting)) {
          behaviour.isUnmounting = [];
        }
        behaviour.isUnmounting.unshift(true);
        const cancelUnmount = onUnmount(() => {
          if (typeof behaviour !== 'object' || !Array.isArray(behaviour.isUnmounting) || !behaviour.isUnmounting.pop()) {
            return false;
          }
          if (node.contains(child as ChildNode)) {
            node.removeChild(child as ChildNode);
          }
          return true;
        });
        if (typeof cancelUnmount === 'function') {
          behaviour._onDelete.push(cancelUnmount);
        }
        return remove;
      } else if (typeof presence === 'function') {
        presence((value) => {
          if (!behaviour) {
            onMount = caller;
            onUnmount = caller;
            onCancelMount = noop;
            onCancelUnmount = noop;
            return presence = -1;
          }
          if (child === '') {
            return -1;
          }
          switch (typeof value) {
            case 'undefined':
              break;
            case 'number':
            case 'boolean':
              if (typeof behaviour !== 'object') return false;
              behaviour.presence = value
              addChild(node, child, behaviour);
              break;
            default:
              throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
          }
          return [...node.childNodes].indexOf(child as ChildNode);
        });
        return remove;
      }
      return remove;
    default:
      throw new Error(`Invalid argument type for "addChild": ${typeof behaviour}`);
  }
}