import { Argument } from "../types";

export type BehaviourObject = {
  onMount?: (mount: () => boolean) => void;
  onUnmount?: (unmount: () => boolean) => void;
  onCancelMount?: () => void;
  onCancelUnmount?: () => void;
  presence?: Argument<boolean | number>;
  isMounting?: boolean;
  isUnmounting?: boolean;
}
export type Behaviour = Argument<boolean | number | BehaviourObject>

export default function addChild(
  node: HTMLElement | SVGElement,
  child: ChildNode | string | number,
  behaviour?: Behaviour
): number | boolean {
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
          return [...node.childNodes].findIndex(node => node instanceof Text && node.textContent === `${child}`);
        }
        if (!node.contains(child)) {
          node.appendChild(child);
        }
        return [...node.childNodes].indexOf(child);
      } else {
        if (typeof child === 'string' || typeof child === 'number') {
          const childNodeIndex = [...node.childNodes].findIndex((node: ChildNode) => node instanceof Text && node.textContent === `${child}`)
          const childNode = node.childNodes[childNodeIndex];
          if (!!childNode) {
            node.removeChild(childNode);
          }
          return childNodeIndex;
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
            return false;
          }
          node.insertBefore(document.createTextNode(`${child}`), node.childNodes[behaviour] || null);
        } else {
          const childNode = [...node.childNodes].find(node => node instanceof Text && node.textContent === `${child}`);
          if (!childNode) {
            return false;
          }
          node.removeChild(childNode);
        }
        return behaviour
      }

      if (behaviour === [...node.childNodes].indexOf(child)) {
        return false;
      }
      if (behaviour >= 0) {
        node.insertBefore(child, node.childNodes[behaviour] || null);
      } else if (behaviour < 0) {
        node.removeChild(child);
      }
      return behaviour;
    case 'function':
      return addChild(node, child, behaviour((value) => {
        return addChild(node, child, value);
      }) ?? undefined);
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
          behaviour.isUnmounting = false;
        }
        if (behaviour.isMounting) {
          return false;
        }
        behaviour.isMounting = true;
        const mountLast = presence === true;
        onMount(() => {
          if (!behaviour.isMounting) {
            return false;
          }
          if (mountLast) {
            node.appendChild(child as ChildNode);
          } else {
            node.insertBefore(child as ChildNode, node.childNodes[presence as number] || null);
          }
          behaviour.isMounting = false;
          return true;
        })
        return true;
      } else if (presence === false || presence === -1) {
        if (behaviour.isMounting) {
          onCancelMount();
          behaviour.isMounting = false;
        }
        if (behaviour.isUnmounting) {
          return false;
        }
        behaviour.isUnmounting = true;

        onUnmount(() => {
          if (!behaviour.isUnmounting) {
            return false;
          }
          behaviour.isUnmounting = false;
          if (node.contains(child as ChildNode)) {
            node.removeChild(child as ChildNode);
            return true;
          }
          return false;
        });
        return true;
      } else if (typeof presence === 'function') {
        return presence(((behaviour) => (value) => {
          switch (typeof value) {
            case 'undefined':
              return [...node.childNodes].indexOf(child as ChildNode);
            case 'number':
            case 'boolean':
              behaviour.presence = value
              return addChild(node, child, behaviour);
            default:
              throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
          }
        })(behaviour)) ?? true;
      }
      return true;
    default:
      throw new Error(`Invalid argument type for "addChild": ${typeof behaviour}`);
  }
}