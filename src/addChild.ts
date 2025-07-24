import { Argument } from "../types";

export type BehaviourObject = {
  onMount?: (mount: () => boolean) => void;
  onUnmount?: (unmount: () => boolean) => void;
  onCancelMount?: () => void;
  onCancelUnmount?: () => void;
  presence?: Argument<boolean | number>;
  isMounting?: number;
  isUnmounting?: number;
}
export type Behaviour = Argument<boolean | number | BehaviourObject>

export default function addChild(
  node: HTMLElement | SVGElement,
  child: ChildNode | string | number,
  behaviour?: Behaviour
): number | (() => void) {
  const remove = () => {
    const result = child;
    if (typeof child !== 'string' && typeof child !== 'number' && node.contains(child)) {
      node.removeChild(child);
    }
    child = '';
    behaviour = undefined;
    return result;
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
      behaviour((value) => {
        const result = addChild(node, child, value);
        if (typeof result === 'number') {
          return result;
        }
        return value ?? false;
      });
      return remove;
    case 'object':
      const onMount = behaviour.onMount ?? (mount => mount());
      const onUnmount = behaviour.onUnmount ?? (unmount => unmount());
      const onCancelMount = behaviour.onCancelMount ?? (() => {});
      const onCancelUnmount = behaviour.onCancelUnmount ?? (() => {});
      const presence = behaviour.presence ?? true;
      child = typeof child === 'string' || typeof child === 'number' ? document.createTextNode(`${child}`) : child;
      if (presence === true || (typeof presence === 'number' && presence >= 0)) {
        if (behaviour.isUnmounting) {
          onCancelUnmount();
          behaviour.isUnmounting--;
        }
        if (behaviour.isMounting || node.contains(child as ChildNode)) {
          return remove;
        }
        if (typeof behaviour.isMounting !== 'number') {
          behaviour.isMounting = 0;
        }
        behaviour.isMounting++;
        const mountLast = presence === true;
        onMount(() => {
          if (typeof behaviour !== 'object' || !behaviour.isMounting) {
            return false;
          }
          if (mountLast) {
            node.appendChild(child as ChildNode);
          } else {
            node.insertBefore(child as ChildNode, node.childNodes[presence as number] || null);
          }
          behaviour.isMounting--;
          return true;
        })
        return remove;
      } else if (presence === false || presence === -1) {
        if (behaviour.isMounting) {
          onCancelMount();
          behaviour.isMounting--;
        }
        if (behaviour.isUnmounting || !node.contains(child as ChildNode)) {
          return remove;
        }
        if (typeof behaviour.isUnmounting !== 'number') {
          behaviour.isUnmounting = 0;
        }
        behaviour.isUnmounting++;

        onUnmount(() => {
          if (typeof behaviour !== 'object' || !behaviour.isUnmounting) {
            return false;
          }
          behaviour.isUnmounting--;
          if (node.contains(child as ChildNode)) {
            node.removeChild(child as ChildNode);
            return true;
          }
          return false;
        });
        return remove;
      } else if (typeof presence === 'function') {
        presence((value) => {
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
        return remove;;
      }
      return remove;;
    default:
      throw new Error(`Invalid argument type for "addChild": ${typeof behaviour}`);
  }
}