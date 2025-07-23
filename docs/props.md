# `props`

Gets or sets multiple properties, attributes, classes, styles, refs, or event handlers on an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import props from '../src/props';

const div = document.createElement('div');

// Set class, style, ref, attributes, and events
const ref = { current: null };
props(div, {
  class: { foo: true },
  style: { color: 'red' },
  ref,
  id: 'bar',
  onClick: () => alert('clicked')
});

// Use function argument
props(div, set => {
  set({ id: 'baz', class: { bar: true } });
});

// Get all attributes as a record
props(div); // { id: 'baz', ... }
```

## Parameters

- `node`: HTMLElement | SVGElement
- `arg?`: object | function

## Returns

- The current attributes as a record, or string for some usages.
