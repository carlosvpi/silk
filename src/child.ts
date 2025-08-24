import { Argument } from "../types";
import { call, noop, observeCalled, ObserveCalled } from "./util";

type LastAction = 'mount' | 'unmount' | 'move' | undefined;

export type Child = ChildNode | string | number
export interface PresenceAccessor<T = number | boolean> {
  (): number;
  (value: T): Promise<number>;
}
export type Presence<T = number | boolean> = Argument<T, PresenceAccessor<T>>

export interface Behaviour {
  onMount?: (mount: () => number, presence: number) => (() => void);
  onUnmount?: (unmount: () => number, presence: number) => (() => void);
  onMove?: (move: () => number, presence: number) => (() => void);
  onDelete?: (deleteNode: () => number, index: number) => (() => void);
  cancelMount?: () => void;
  cancelUnmount?: () => void;
  cancelMove?: () => void;
  currentIndex?: number;
  lastIndexRequest?: number;
  lastAction?: LastAction;
}

const defaultBehaviour: Pick<Behaviour, 'onMount' | 'onUnmount' | 'onMove'> = {
  onMount: mount => {mount(); return noop},
  onUnmount: unmount => {unmount(); return noop},
  onMove: move => {move(); return noop},
}

export default function child(
  node: HTMLElement | SVGElement,
  arg: Child,
  presence?: Presence,
  behaviour?: Behaviour
): number | Promise<number> {
  behaviour ||= {...defaultBehaviour}
  const childNode = typeof arg === 'string' || typeof arg === 'number'
    ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
    : arg
  switch (typeof presence) {
    case 'undefined':
      return childNode ? [...node.childNodes].indexOf(childNode) : -1
    case 'boolean':
    case 'number':
      if (presence === false) {
        presence = -1
      } else if (presence === true) {
        presence = node.childNodes.length
      }
      if (behaviour.currentIndex === undefined) {
        behaviour.currentIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
      }
      if (presence === behaviour.lastIndexRequest) {
        return Promise.resolve(behaviour.currentIndex) // Same request
      }
      switch (behaviour.lastAction) {
        case 'mount':
          behaviour.cancelMount?.();
          break;
        case 'unmount':
          behaviour.cancelUnmount?.();
          break;
        case 'move':
          behaviour.cancelMove?.();
          break;
      }
      behaviour.lastIndexRequest = presence
      if (presence === behaviour.currentIndex) {
        return Promise.resolve(presence) // No change
      }
      return new Promise((resolve) => {
        let isImmediatePass = false
        let cancel: (() => void) | ObserveCalled | undefined
        const action = (behaviour.currentIndex === -1 && (presence as number) >= 0)
          ? 'Mount'
          : (behaviour.currentIndex! >= 0 && (presence as number) === -1) ? 'Unmount'
          : 'Move';
        behaviour.lastAction = action.toLowerCase() as LastAction;
        const behaviourToCall = behaviour[`on${action}`] ?? call;
        cancel = behaviourToCall(() => {
          const childNode = (typeof arg === 'string' || typeof arg === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
            : arg)
          let index: number
          isImmediatePass = true
          if (observeCalled.hasBeenCalled(cancel as ObserveCalled)) {
            index = childNode ? [...node.childNodes].indexOf(childNode) : -1
            resolve(index) // cancelled
            return index
          }

          if (presence as number >= 0) {
            const addendo = childNode ?? document.createTextNode(`${arg}`)
            if (!node.contains(addendo)) {
              node.insertBefore(addendo, node.childNodes[presence as number] ?? null)
            } else if (node.childNodes[presence as number] !== addendo) {
              const newIndex = [...node.childNodes].indexOf(addendo) < (presence as number) ? (presence as number) + 1 : (presence as number)
              node.insertBefore(addendo, node.childNodes[newIndex] ?? null)
            }
            index = [...node.childNodes].indexOf(addendo)
          } else if (childNode && node.contains(childNode)) {
            node.removeChild(childNode)
            index = -1
          } else {
            index = -2
          }

          if (presence as number >= 0 ) {
            behaviour.cancelMount = undefined
            behaviour.cancelMove = undefined
          } else {
            behaviour.cancelUnmount = undefined
          }
          behaviour.currentIndex = index
          resolve(index) // success
          return index // success
        }, presence as number)
        if (isImmediatePass) {
          cancel = undefined
        }
        if (presence as number >= 0) {
          if (childNode && behaviour.currentIndex !== presence) {
            cancel = behaviour.cancelMove = observeCalled(cancel)
          } else {
            cancel = behaviour.cancelMount = observeCalled(cancel)
          }
        } else {
          cancel = behaviour.cancelUnmount = observeCalled(cancel)
        }
      })
    case 'function':
      const currentIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
      const specialBehaviour = {
        ...behaviour,
        currentIndex,
        cancelMount: undefined,
        cancelUnmount: undefined
      }
      const _presence = presence
      return new Promise(resolve => {
        _presence((value => {
          const childNode = (typeof arg === 'string' || typeof arg === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
            : arg)
          const index = childNode ? [...node.childNodes].indexOf(childNode) : -1
          resolve(index)
          return child(node, arg, value, specialBehaviour)
        }) as PresenceAccessor);
      })
    default:
      throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
  }
}
