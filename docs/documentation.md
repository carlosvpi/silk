# Silk

The `silk` function builds an HTML element.

## Creating text nodes

### silk(str: string)

Builds an HTML text node with the content `str`.

```javascript
silk('Hello, world')
```

Creates a textNode with textContent `'Hello, world'`.

### silk(f: function)

Builds an HTML text node **Node** and calls `f(set)`, where `set(str: string)` updates the text content of **Node** to `str` and returns a promise to be resolved immediately with **Node**.

The return value of `f` is taken to be the first text content of the **Node** created by `silk(f: function)`.

`set(str)` returns a promise resolved with the created **Node**

```javascript
silk(set => {
  let count = 0
  // Before creating the TextNode
  setInterval(async () => {
    // Before setting the textContent
    console.log(await set(`Seconds ${count++}`)) // Prints the textNode created
    // After setting the textContent
  }, 1000)
  return 'Start!' // The first textContent the TextNode takes
})
```

Creates a textNode that increments is value every second.

`set` can also be called with a function, recursively, with `set(f)` = `f(set)`

### silk(textNode: TextNode)

Returns a function:

#### silk(textNode: TextNode)(str: string)

Sets the textContent of `textNode` to `str`.

```javascript
const emptyTextNode = silk('')
silk(emptyTextNode)('Hello, world')
```

Sets the text content of `emptyTextNode` to `'Hello, world'`

#### silk(textNode: TextNode)(f: function)

Calls `f(set)` passing `textNode` as context (the `this` keyword), where `set(str: string)` updates the text content of `textNode` to `str` and returns a promise to be resolved immediately with `textNode`.

The return value of `f` is immediately assigned to `textNode`.

`set(str)` returns a promise resolved with `textNode`.

```javascript
const emptyTextNode = silk('')
silk(emptyTextNode)(set => {
  let count = 0
  // Before creating the TextNode
  setInterval(async () => {
    // Before setting the textContent
    console.log(await set(`Seconds ${count++}`)) // Prints the textNode created
    // After setting the textContent
  }, 1000)
  return 'Start!' // The first textContent the TextNode takes
})
```

Increments the value of `emptyTextNode` every second.

`set` can also be called with a function, recursively, with `set(f)` = `f(set)`

### silk(tagName: string, props: function | object, children: function | Node[])

Creates an HtmlElement **htmlElement** with tagname `tagName` and then it performs:

```javascript
_silk = silk(htmlElement)
_silk.props(props)
_silk.children(children)
return _silk.value`.
```

### silk(htmlElement: HtmlElement)

Creates a `Silk` instance whose value is `htmlElement`.

## class Silk

The class `Silk` helps defining the function `silk`. Instances of `Silk` are refered to as `_silk` in this documentation.

#### _silk.value

Is the HtmlElement contained by `_silk`.

#### _silk.props

#### _silk.props()

Returns a hash with the currently set props of `_silk.value`.

#### _silk.props(f: function)

Calls `f(_silk.prop)`, and returns `_silk`.

#### _silk.props(hash: object)

Performs `_silk.prop(attr, value)` for each `[attr, value]` pair in `Object.entries(hash)`, and returns `_silk`.

### _silk.prop

#### _silk.prop(eventName: EventName)

Returns the function currently set as a listener for the event `eventName`.

#### _silk.prop(eventName: EventName, f: function)

Adds an event listener to `_silk.value` and sets `f` as the function.

#### _silk.prop(attr: string not 'classed')

Returns the current value of the `attr` attribute of `_silk.value`.

#### _silk.prop(attr: string not 'classed', value: not a function)

Sets the value of the `attr` attribute of the htmlElement to `value`, and returns `_silk`.

#### _silk.prop(attr: string not 'classed', f: function)

Calls `f(value => _silk.prop(attr))` and returns `_silk`.

#### _silk.prop('classed')

Returns the classList array of `_silk.value`.

#### _silk.prop('classed', value: string)

Adds the value as a class of `_silk.value`.

#### _silk.prop('classed', values: string[])

Calls `values.forEach(value => _silk.prop('classed', value))`

#### _silk.prop('classed', values: object)

Calls `Object.entries(values).forEach(([className, value]) => _silk.classed(className, value))`

#### _silk.prop('classed', f: function)

Calls `f(_silk.classed)`

### _silk.classed

#### _silk.classed(className: string)

Returns a boolean indicating if `_silk.value` has the class `className`

#### _silk.classed(className: string, value: boolean)

Adds or removes the `className` from the classList of `_silk.value` according to `value`.

#### _silk.classed(className: string, f: function)

Calls `f(value => _silk.classed(className, value))`.

### _silk.children

#### _silk.children()

Returns all the childNodes of `_silk.value`.

#### _silk.children(node: TextNode | HtmlElement)

Removes all children from `_silk.value` and inserts `node` as child.

#### _silk.children(nodes: (TextNode | HtmlElement)[])

Removes all children from `_silk.value` and inserts, in order, each node in `nodes` as children.

#### _silk.children(f: function)

Calls `f(_silk.addChild, _silk.removeChild, _silk.sortChildren)`.

### _silk.addChild

#### _silk.addChild(node: TextNode | HtmlElement)

Adds the node `node` as a child of `_silk.value`.

#### _silk.addChild(node: TextNode | HtmlElement, behaviours: Behaviours)

Runs the behaviours.

### _silk.removeChild

#### _silk.removeChild(node: TextNode | HtmlElement)

Removes the node `node` as a child of `_silk.value`.

### _silk.sortChildren

#### _silk.sortChildren(sortBy)

Sorts the children according to `sortBy`.

## Behaviours

Behaviours control the way an element is inserted and removed as a child of another element.

The behaviours hash contains the following keys:
* `child`: contains the child node.
* `key`: Identifies the child. Each child must have its own key.
* `presence`: indicates whether the node should be actually inserted or not as a child of another node.
* `onMount`: indicates the actions to take when `presence` becomes `true`.
* `onUnmount`: indicates the actions to take when `presence` becomes `false`.
* `onCancelMount`: indicates the actions to take when `presence` becomes `false` but `onMount` is still running.
* `onCancelUnmount`: indicates the actions to take when `presence` becomes `true` but `onUnmount` is still running.
* `mountRequestGenerator`: asynchronous generator that yields every time `presence` is `true`.
* `unmountRequestGenerator`: asynchronous generator that yields every time `presence` is `false`.

An instance of a Behaviours hash will be refered to as `_behaviours`

### presence(f: function)

Calls `f(setPresence)`, where

* `setPresene(true)` makes `_behaviours.mountRequestGenerator` yield a `mount` function, and sets `_behaviours.mountRequested = true`. If `_behaviours.unmountRequested = true`, it is set to `false` and `_behaviour.onCancelUnmount()` is called.
* `setPresene(false)` makes `_behaviours.unmountRequestGenerator` yield an `unmount` function, and sets `_behaviours.unmountRequested = true`. If `_behaviours.mountRequested = true`, it is set to `false` and `_behaviour.onCancelMount()` is called.

### onMount(f: function)

Calls `f(_behaviours.mountRequestGenerator)`.

### onUnmount(f: function)

Calls `f(_behaviours.unmountRequestGenerator)`.

### _behaviours.mountRequestGenerator

Asynchronous generator that yields unique `mount` functions.

`mount()` signals Silk to insert `_behaviours.child` as a child of `_behaviours.parent` (according to the parent's `sortBy` function), and returns a promise that resolves to the current value of `_behaviours.mountRequested`, just before setting it to `false`.

### _behaviours.unmountRequestGenerator

Asynchronous generator that yields unique `unmount` functions.

`unmount()` signals Silk to insert `_behaviours.child` as a child of `_behaviours.parent` (according to the parent's `sortBy` function), and returns a promise that resolves to the current value of `_behaviours.unmountRequested`, just before setting it to `false`.
