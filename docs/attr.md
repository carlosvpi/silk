# `attr`

Manipulates or retrieves an attribute on an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import attr from '../src/attr';

const div = document.createElement('div');

// Get attribute
attr(div, 'id'); // string | null

// Set attribute
attr(div, 'id', 'foo');

// Remove attribute
attr(div, 'id', null);

// Set boolean attribute
attr(div, 'hidden', true);

// Use function argument
attr(div, 'data-x', prev => prev ? prev + '-1' : 'init');
```

## Parameters

- `node`: HTMLElement | SVGElement
- `attrName`: string
- `arg?`: string | null | boolean | ((set: (value: string | null | boolean) => any) => any)

## Returns

- The current or updated attribute value, or boolean for boolean attributes.
