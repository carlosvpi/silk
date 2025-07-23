# `classes`

Gets or sets multiple classes on an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import classes from '../src/classes';

const div = document.createElement('div');

// Get className
classes(div); // string

// Set className
classes(div, 'foo bar');

// Add classes from array
classes(div, ['foo', 'bar']);

// Add/remove classes from object
classes(div, { foo: true, bar: false });

// Use function argument
classes(div, set => {
  set('foo', true);
  set('bar', false);
});
```

## Parameters

- `node`: HTMLElement | SVGElement
- `arg?`: string | string[] | Record<string, boolean> | ((set: (key: string, value?: boolean) => any) => any)

## Returns

- The current or updated className.
