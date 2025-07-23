# `styles`

Gets or sets multiple style properties on an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import styles from '../src/styles';

const div = document.createElement('div');

// Set styles with string
styles(div, 'color: red; background: blue;');

// Set styles with object
styles(div, { color: 'green', zIndex: 5 });

// Use function argument
styles(div, set => {
  set('color', 'purple');
  set('zIndex', 10);
});

// Get all styles as cssText
styles(div); // 'color: purple; z-index: 10;'
```

## Parameters

- `node`: HTMLElement | SVGElement
- `arg?`: string | Record<string, string | number> | ((set: (key: string, value?: string | number) => any) => any)

## Returns

- The current or updated `cssText`.
