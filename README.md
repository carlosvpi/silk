<div align="center">

![logo](https://github.com/carlosvpi/silk/blob/main/docs/assets/Silk.svg?raw=true)

_Web MVC framework_

Silk

[Documentation](https://github.com/carlosvpi/silk/blob/main/docs/documentation.md)

</div>
# silk


## Install

Currently, silk is only available in the browser

```html
<script src="silk.js"></script>
```

## Example

`silk` is a powerful function used to create TextNode and HTMLElement nodes.

```javascript
// create a TextNode with content `'Hello, world!'`
silk('Hello, world!')
```

```javascript
// create a TextNode with content changing every second
silk(set => {
  let counter = 0
  setInterval(() => set(counter++), 1000)
})
```

```javascript
// create a span with content `'Hello, world'`
silk('span', {}, 'Hello, world')
silk('span', {}, ['Hello, world'])
silk('span', {}, silk('Hello, world'))
silk('span', {}, [silk('Hello, world')])
```

```javascript
// create a span with classes 'class1' and 'class2'
silk('span', {classed: ['class1', 'class2']}, 'Hello, world')
```

```javascript
// create a span with classes 'enter' (to remove in 10 seconds) and 'flash' (to toggle every second)
silk('span', {
  classed: classed => {
    classed('enter', true)
    classed('flash', true)
    setTimeout(() => classed('enter', false), 10000)
    setInterval(() => classed('flash', !classed('flash')), 1000)
  }
}, 'Hello, world')
```

```javascript
// create a div with two child nodes
silk('div', {}, 'Hello', 'world')
silk('div', {}, ['Hello', 'world'])
```

```javascript
// create an input HTMLElement with a placeholder
silk('input', {
  placeholder: 'Type something'
})
```

```javascript
// create an checkbox HTMLElement that toggles its checked state every second
silk('input', {
  type: 'checkbox',
  checked: checked => setInterval(() => checked(!checked()), 1000)
})
```

```javascript
// create an checkbox HTMLElement that toggles its checked state every second
silk('input', {
  type: 'checkbox',
  checked: checked => setInterval(() => checked(!checked()), 1000)
})
```

```javascript
// create button that logs each time it is clicked, that is disabled after 10 seconds
silk('button', {
  onClick: evt => console.log(evt),
  disabled: set => setTimeout(() => set(true), 10000)
}, 'Click me')
```

```javascript
// create a ul with dynamic li items
silk('ul', {}, (add, del, sort) => {
  add('li')
})
```

`silk(set => set('Hello, world!'))` creates a TextNode with content `'Hello, world!'`

## Coming soon

* Creating SVGElement nodes with `silk`
* Typescript
* Installable node module
