// This file is an alternative implementation for addChild.ts

import { Argument } from "../types";
import { noop, observeCalled, ObserveCalled } from "./util";

export type Child = ChildNode | string | number
export type AddAccessor<T> = (value?: T) => T | Promise<T>;
export interface Behaviour {
  onMount: (mount: () => number) => (() => void);
  onUnmount: (unmount: () => number) => (() => void);
  onCancelMount: (ObserveCalled<never, void> | undefined)[];
  onCancelUnmount: (ObserveCalled<never, void> | undefined)[];
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
): number | Promise<number> {
  behaviour ||= {...defaultBehaviour, onCancelUnmount: [], onCancelMount: []}
  behaviour.onCancelUnmount ||= []
  behaviour.onCancelMount ||= []
  switch (typeof presence) {
    case 'undefined':
      const childNode = typeof child === 'string' || typeof child === 'number'
        ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
        : child
      return childNode ? [...node.childNodes].indexOf(childNode) : -1
    case 'boolean':
    case 'number':
      return new Promise((resolve) => {
        if (presence === true || (typeof presence === 'number' && presence >= 0)) {
          behaviour.onCancelUnmount.shift()?.();
          // behaviour.onCancelMount.shift()?.();
          const childNode = (typeof child === 'string' || typeof child === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
            : child)
          const failIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
          if (failIndex >= 0) {
            resolve(failIndex)
            return
          }
          const cancelMount = behaviour.onMount(() => {
            const childNode = (typeof child === 'string' || typeof child === 'number'
              ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
              : child)
            if (behaviour.onCancelMount.length > 0 && observeCalled.hasBeenCalled(behaviour.onCancelMount[0])) {
              behaviour.onCancelMount.shift()
              const failIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
              resolve(failIndex)
              return failIndex
            }
            behaviour.onCancelMount[0]?.()
            const addendo = childNode ?? document.createTextNode(`${child}`)
            if (presence === true) {
              if (!node.contains(addendo)) {
                node.appendChild(addendo)
              }
            } else {
              if (node.childNodes[presence as number] !== addendo) {
                node.insertBefore(addendo, node.childNodes[presence as number])
              }
            }
            const index = [...node.childNodes].indexOf(addendo)
            resolve(index)
            return index
          })
          behaviour.onCancelMount.push(observeCalled(cancelMount))
        } else {
          // behaviour.onCancelUnmount.shift()?.();
          behaviour.onCancelMount.shift()?.();
          const childNode = (typeof child === 'string' || typeof child === 'number'
            ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
            : child)
          const failIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
          if (failIndex === -1) {
            resolve(failIndex)
            return
          }
          const cancelUnmount = behaviour.onUnmount(() => {
            const childNode = (typeof child === 'string' || typeof child === 'number'
              ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
              : child)
            if (behaviour.onCancelUnmount.length > 0 && observeCalled.hasBeenCalled(behaviour.onCancelUnmount[0])) {
              behaviour.onCancelUnmount.shift()
              const failIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1
              resolve(failIndex)
              return failIndex
            }
            behaviour.onCancelUnmount[0]?.()
            if (childNode && node.contains(childNode)) {
              node.removeChild(childNode)
            }
            resolve(-1)
            return -1
          })
          const x = observeCalled(cancelUnmount)
          behaviour.onCancelUnmount.push(x)
          console.log((x as unknown as {id: number}).id)
        }
      })
    case 'function':
      const value = presence(value => {
        return add(node, child, value, behaviour)
      }) ?? undefined
      if (value === undefined) {
        const childNode = (typeof child === 'string' || typeof child === 'number'
          ? [...node.childNodes].find(childNode => childNode.textContent === `${child}`)
          : child)
        const index = childNode ? [...node.childNodes].indexOf(childNode) : -1
        return Promise.resolve(index)
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
