# `classed`

Checks, adds, or removes a class from an `HTMLElement` or `SVGElement`.

## Usage

```typescript
import classed from '../src/classed';

const div = document.createElement('div');

// Check if class is present
classed(div, 'foo'); // boolean

// Add class
classed(div, 'foo', true);

// Remove class
classed(div, 'foo', false);

// Use function argument
classed(div, 'foo', prev => !prev);
```

## Parameters

- `node`: HTMLElement | SVGElement
- `className`: string
- `arg?`: boolean | ((set: (value: boolean) => any) => any)

## Returns

- Boolean indicating class presence or result of operation.
