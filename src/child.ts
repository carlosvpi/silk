import { Argument } from "../types";
import { noop, observeCalled, ObserveCalled } from "./util";

export type Child = ChildNode | string | number
export type PresenceAccessor = (value?: number | boolean) => number | boolean | Promise<number>;
export type Presence = Argument<number | boolean, PresenceAccessor>

export interface Behaviour {
  onMount: (mount: () => number, presence: number) => (() => void);
  onUnmount: (unmount: () => number, presence: number) => (() => void);
  cancelMount?: () => void;
  cancelUnmount?: () => void;
  currentIndex?: number;
  lastIndexRequest?: number;
}

const defaultBehaviour: Pick<Behaviour, 'onMount' | 'onUnmount'> = {
  onMount: mount => {mount(); return noop},
  onUnmount: unmount => {unmount(); return noop},
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
        behaviour.lastIndexRequest =
          behaviour.currentIndex =
          childNode ? [...node.childNodes].indexOf(childNode) : -1
      }
      if (presence === behaviour.lastIndexRequest) {
        return Promise.resolve(behaviour.currentIndex) // Same request
      }
      const cancel = behaviour!.lastIndexRequest! >= 0 ? behaviour.cancelMount : behaviour.cancelUnmount
      cancel?.()
      behaviour.lastIndexRequest = presence
      if (presence === behaviour.currentIndex) {
        return Promise.resolve(presence) // No change
      }
      return new Promise((resolve) => {
        let isImmediatePass = false
        let cancel: (() => void) | ObserveCalled | undefined
        cancel = (presence as number >= 0 ? behaviour.onMount: behaviour.onUnmount)(() => {
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
          behaviour.currentIndex = presence as number

          if (presence as number >= 0) {
            const addendo = childNode ?? document.createTextNode(`${arg}`)
            if (node.childNodes[presence as number] !== addendo) {
              node.insertBefore(addendo, node.childNodes[presence as number])
              index = childNode ? [...node.childNodes].indexOf(childNode) : -1
            } else {
              index = presence as number
            }
          } else if (childNode && node.contains(childNode)) {
            node.removeChild(childNode)
            index = -1
          } else {
            index = -2
          }
          if (presence as number >= 0 ) {
            behaviour.cancelMount = undefined
          } else {
            behaviour.cancelUnmount = undefined
          }
          resolve(index) // success
          return index // success
        }, presence as number)
        if (isImmediatePass) {
          cancel = undefined
        }
        if (presence as number >= 0) {
          cancel = behaviour.cancelMount = observeCalled(cancel)
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
        _presence(value => {
          const childNode = (typeof arg === 'string' || typeof arg === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
            : arg)
          const index = childNode ? [...node.childNodes].indexOf(childNode) : -1
          resolve(index)
          return child(node, arg, value, specialBehaviour)
        })
      })
    default:
      throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
  }
}
