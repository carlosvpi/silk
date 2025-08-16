// This file is an alternative implementation for addChild.ts

import { Argument } from "../types";
import { noop, observeCalled, ObserveCalled } from "./util";

export type Child = ChildNode | string | number
export type AddAccessor<T> = (value?: T) => T | Promise<PresenceResolution>;
export interface PresenceResolution {
  presence: number;
  response?: string;
}

export interface Behaviour {
  onMount: (mount: () => PresenceResolution, presence: number) => (() => void);
  onUnmount: (unmount: () => PresenceResolution, presence: number) => (() => void);
  cancelMount?: () => void;
  cancelUnmount?: () => void;
  currentIndex?: number;
  lastIndexRequest?: number;
}

const defaultBehaviour: Pick<Behaviour, 'onMount' | 'onUnmount'> = {
  onMount: mount => {mount(); return noop},
  onUnmount: unmount => {unmount(); return noop},
}

export default function add(
  node: HTMLElement | SVGElement,
  child: Child,
  presence?: Argument<number | boolean, AddAccessor<number | boolean>>,
  behaviour?: Behaviour
): number | Promise<PresenceResolution> {
  behaviour ||= {...defaultBehaviour}
  const childNode = typeof child === 'string' || typeof child === 'number'
    ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
    : child
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
        return Promise.resolve({ presence, response: 'SAME REQUEST' })
      }
      const cancel = behaviour!.lastIndexRequest! >= 0 ? behaviour.cancelMount : behaviour.cancelUnmount
      cancel?.()
      behaviour.lastIndexRequest = presence
      if (presence === behaviour.currentIndex) {
        return Promise.resolve({ presence, response: 'NO CHANGE' })
      }
      return new Promise(resolve => {
        let isImmediatePass = false
        let cancel: (() => void) | ObserveCalled | undefined
        cancel = (presence as number >= 0 ? behaviour.onMount: behaviour.onUnmount)(() => {
          isImmediatePass = true
          if (observeCalled.hasBeenCalled(cancel as ObserveCalled)) {
            resolve({ presence: presence as number, response: 'CANCELLED' })
            return { presence: presence as number, response: 'CANCELLED' }
          }
          behaviour.currentIndex = presence as number

          const childNode = (typeof child === 'string' || typeof child === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
            : child)
          if (presence as number >= 0) {
            const addendo = childNode ?? document.createTextNode(`${child}`)
            if (node.childNodes[presence as number] !== addendo) {
              node.insertBefore(addendo, node.childNodes[presence as number])
            }
          } else if (childNode && node.contains(childNode)) {
            node.removeChild(childNode)
          }
          resolve({ presence: presence as number, response: 'OK' })
          if (presence as number >= 0 ) {
            behaviour.cancelMount = undefined
          } else {
            behaviour.cancelUnmount = undefined
          }
          return { presence: presence as number, response: 'OK' }
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
      const specialBehaviour = {
        ...behaviour,
        currentIndex: -1,
        lastIndexRequest: -1,
        cancelMount: undefined,
        cancelUnmount: undefined
      }
      const value = presence(value => {
        return add(node, child, value, specialBehaviour)
      }) ?? undefined
      if (value === undefined) {
        const childNode = (typeof child === 'string' || typeof child === 'number'
          ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
          : child)
        const index = childNode ? [...node.childNodes].indexOf(childNode) : -1
        return Promise.resolve({ presence: index })
      }
      return add(node, child, value, behaviour)
    default:
      throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
  }
}



/*

add(node, child)                // number, current position of child in node children
add(node, child, true)          // Promise<number>, puts it at the end if it isnt there
add(node, child, false)         // Promise<number>
add(node, child, -1)            // Promise<number>, removes it
add(node, child, 0)             // Promise<number>, puts it at the beginning
add(node, child, n)             // Promise<number>, puts it at position n
add(node, child, presence => {
  presence()                    // number, current position of child in node children
  presence(true)                // Promise<number>
  presence(false)               // Promise<number>
  presence(-1)                  // Promise<number>
  presence(0)                   // Promise<number>
  presence(n)                   // Promise<number>
  return false                  // or number, or void. If the last setting of presence is "false" or "-1", it clears memory
})


add(node, child, p => setInterval(p(!p()), 1000), {
  onMount: (mount) => {
    silk(child, { class: 'adding' })
    ;(async () => {
      await wait()
      const index = mount()
      if (index >= 0) {
        // Success
      } else {
        // Failure
      }
    })();
    return () => {
      // this mount was cancelled, what to do
    }
  },
  onUnmount: async (unmount) => {
    silk(child, { class: 'removing' })
    ;(async () => {
      await wait(1000)
      const index = unmount()
      if (index >= 0) {
        // Failure
      } else {
        // Success
      }
    })()
    return () => {
      // this unmount was cancelled, what to do
    }
  },
})

 */
