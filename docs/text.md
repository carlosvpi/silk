# `text`

Gets or sets the `textContent` of a `Text` node.

## Usage

```typescript
import text from '../src/text';

const node = document.createTextNode('hello');

// Get text content
text(node); // 'hello'

// Set text content
text(node, 'world');

// Set text content with number
text(node, 123);

// Use function argument
text(node, prev => prev ? prev.toUpperCase() : 'default');
```

## Parameters

- `node`: Text
- `arg?`: string | number | ((set: (value: string | number) => any) => any)

## Returns

- The current or updated text content.
  The value to set, or a function to compute the value.

## Returns

- Returns the current or updated `textContent` as a `string`.

## Errors

Throws an error if the argument type is not supported.
