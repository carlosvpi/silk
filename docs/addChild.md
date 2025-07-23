# `addChild`

Manages the mounting, unmounting, and positioning of a child element within a parent `HTMLElement` or `SVGElement`, with support for advanced behaviors such as transitions and presence logic.

## Usage

```typescript
import addChild from '../src/addChild';

const parent = document.createElement('div');
const child = document.createElement('span');

// Append child (default)
addChild(parent, child);

// Conditionally mount or unmount
addChild(parent, child, true);  // Mounts
addChild(parent, child, false); // Unmounts

// Insert at specific index
addChild(parent, child, 0); // Inserts at index 0

// Use a behaviour object for transitions or presence
addChild(parent, child, {
  onMount: (mount) => { /* custom logic */ return mount(); },
  onUnmount: (unmount) => { /* custom logic */ return unmount(); },
  presence: true
});

// Use a function for dynamic presence
addChild(parent, child, (set) => {
  set(true); // Mount
});
```

## Parameters

- `node`: `HTMLElement | SVGElement`  
  The parent node to which the child will be added or removed.

- `child`: `HTMLElement | SVGElement`  
  The child node to manage.

- `behaviour?`:  
  - `boolean` — mount (`true`) or unmount (`false`)
  - `number` — insert at index, or `-1` to remove
  - `object` — advanced behaviour with optional `onMount`, `onUnmount`, `onCancelMount`, `onCancelUnmount`, and `presence`
  - `function` — dynamic presence logic

- `mountingState?`:  
  Optional object to track mounting/unmounting state for advanced transitions.

## Returns

- `number` — The index at which the child is mounted, or `-1` if unmounted.

## Behaviour Object

- `onMount?: (mount: () => number) => void`
- `onUnmount?: (unmount: () => number) => void`
- `onCancelMount?: () => void`
- `onCancelUnmount?: () => void`
- `presence?: boolean | number | ((set: (value: boolean | number) => void) => void)`

## Notes

- Supports advanced mounting/unmounting scenarios for UI transitions.
- Handles both simple and complex presence logic.
