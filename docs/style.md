# `style`

Gets or sets a single style property on an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import style from '../src/style';

const div = document.createElement('div');

// Get style
style(div, 'color');

// Set style
style(div, 'color', 'red');

// Set style with number
style(div, 'zIndex', 10);

// Use function argument
style(div, 'color', prev => prev === 'red' ? 'blue' : 'red');
```

## Parameters

- `node`: HTMLElement | SVGElement
- `styleName`: keyof CSSStyleDeclaration
- `arg?`: string | number | ((set: (value: string | number) => any) => any)

## Returns

- The current or updated style value.
