# `text` Function

The `text` function is a utility for reading or updating the `textContent` of a DOM `Text` node.

## Usage

```typescript
import text from '../src/text';

// Get text content
const node = document.createTextNode('hello');
const value = text(node); // 'hello'

// Set text content with a string
text(node, 'world'); // node.textContent === 'world'

// Set text content with a number
text(node, 123); // node.textContent === '123'

// Set text content with a function
text(node, (value) => value() ? value().toUpperCase() : 'default');

// Throws error for invalid argument types
text(node, {} as any); // throws Error
```

## Parameters

- `node: Text`  
  The DOM `Text` node to operate on.

- `arg?: string | number | undefined | ((arg: TextArg) => string)`  
  The value to set, or a function to compute the value.

## Returns

- Returns the current or updated `textContent` as a `string`.

## Errors

Throws an error if the argument type is not supported.
