import type { Accessor, Argument, ArgumentRecord, EventHandler, Ref } from '../types';
import attr from './attr';
import classes from './classes';
import styles from './styles';

export type Props = Argument<
  Record<string, Argument<string | null | boolean>> |
  Record<string, EventHandler> |
  { ref: Ref } |
  { class: ArgumentRecord<boolean> } |
  { style: ArgumentRecord<string | number> }
>

export default function props(
  node: HTMLElement | SVGElement,
  arg?: Props
): Record<string, string> {
  switch (typeof arg) {
    case 'undefined':
      break;
    case 'object':
      for (const [key, value] of Object.entries(arg)) {
        switch (key) {
          case 'class':
            classes(node, value as ArgumentRecord<boolean>);
            break;
          case 'style':
            styles(node, value as ArgumentRecord<string | number>);
            break;
          case 'ref':
            (value as Ref).current = node
            break;
          default:
            if (key.startsWith('on')) {
              if (key.endsWith('Capture')) {
                node.addEventListener(key.slice(2, -7).toLowerCase(), value as EventHandler, { capture: true })
              } else {
                node.addEventListener(key.slice(2).toLowerCase(), value as EventHandler)
              }
            } else {
              attr(node, key, value as Argument<string | null | boolean>);
            }
        }
      }
      break;
    case 'function':
      arg((value) => {
        if (value === undefined) {
          return props(node);
        }
        return props(node, value as Props);
      });
      break;
    default:
      throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
  }
  return Array.from(node.attributes).reduce((acc: Record<string, string>, attribute) => {
    acc[attribute.name] = node.getAttribute(attribute.name) ?? '';
    return acc;
  }, {} as Record<string, string>)
}