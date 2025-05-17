function _indexBy(sortBy, array, item, left, right) {
  if (left === right) {
    return left
  }
  if (left + 1 === right) {
    const sort = sortBy(item, array[left])
    if (sort < 0) {
      return left
    }
    if (sort > 0) {
      return right
    }
    return left
  }
  const middle = Math.floor((left + right)/2)
  const sort = sortBy(item, array[middle])
  if (sort < 0) {
    return _indexBy(sortBy, array, item, left, middle)
  }
  if (sort > 0) {
    return _indexBy(sortBy, array, item, middle, right)
  }
  return middle
}
function indexBy(sortBy, array, item) {
  if (array.length === 0) {
    return 0
  }
  if (sortBy(item, array[0]) < 0) {
    return 0
  }
  if (sortBy(item, array[array.length - 1]) > 0) {
    return array.length
  }
  return _indexBy(sortBy, array, item, 0, array.length - 1)
}

class Silk { 
  constructor(el) {
    this.value = el
    this.prop = this.prop.bind(this)
    this.classed = this.classed.bind(this)
    this.addChild = this.addChild.bind(this)
    this.removeChild = this.removeChild.bind(this)
    this.sortChildren = this.sortChildren.bind(this)
    this.childBehaviours = new Map([])
    this.sortBy = () => {}
  }
  props(props) {
    if (!props) {
      return this.value.getAttributeNames().reduce((acc, attr) => ({...acc, [attr]: this.value.getAttribute(attr)}), {})
    }
    if (props instanceof Function) {
      props(this.prop)
      return this
    }
    for (const [key, value] of Object.entries(props)) {
      this.prop(key, value)
    }
    return this
  }
  prop(attr, value) {
    if (attr.startsWith('on')) {
      if (value) {
        this[attr] ||= new Set([])
        this[attr].add(value)
        this.value.addEventListener(attr.slice(2).toLowerCase(), value)
        return this
      }
      return this[attr]
    } else if (attr === 'classed') {
      if (!value) {
        return this.value.classList
      }
      if (typeof value === 'string') {
        this.value.classList.forEach(cl => this.value.classList.remove(cl))
        this.value.classList.add(value)
        return this
      }
      if (typeof value === 'object') {
        Object.entries(value).forEach(([className, value]) => this.classed(className, value))
        return this
      }
      if (typeof value === 'function') {
        this.classed(value(this.classed))
        return this
      }
    } else {
      if (typeof value === 'function') {
        value(v => this.prop(attr, v))
        return this
      }
      if (value === undefined) {
        return this.value.getAttribute(attr)
      }
      if (value) {
        this.value.setAttribute(attr, value)
        return this
      }
      this.value.removeAttribute(attr)
      return this
    }
  }
  classed(className, isClassed) {
    if (isClassed === undefined) {
      return this.value.classList.contains(className)
    }
    if (typeof isClassed === 'function') {
      this.classed(className, isClassed(value => this.classed(className, value)))
      return this
    }
    if (isClassed) {
      this.value.classList.add(className)
    } else {
      this.value.classList.remove(className)
    }
    return this
  }
  children(children, ...moreChildren) {
    if (!children) {
      return this.value.childNodes
    }
    if (typeof children === 'function') {
      children.call(this, this.addChild, this.removeChild, this.sortChildren)
      return this
    }
    this.childBehaviours.forEach(childBehaviour => childBehaviour.remove())
    children = Array.isArray(children) ? [...children, ...moreChildren] : [children, ...moreChildren]
    children.forEach(child => this.addChild(child))
    return this
  }
  addChild(child, behaviour) {
    if (!behaviour) {
      if (typeof child === 'string' || typeof child === 'function') {
        child = silk(child)
      }
      this.value.appendChild(child)
      return this
    }
    behaviour.resolveUnmount = () => {}
    behaviour.resolveMount = () => {}
    behaviour.mountRequested = false
    behaviour.unmountRequested = false
    behaviour.done = false
    behaviour.isMounted = false
    behaviour.child = child
    behaviour.remove = () => {
      behaviour.done = true
      behaviour.resolveMount(() => -1)
      behaviour.resolveUnmount(() => -1)
      this.childBehaviours.delete(behaviour.key || child)
      this.value.removeChild(child)
    }
    behaviour.mountRequestGenerator = (async function* () {
      while (!behaviour.done) {
        const value = await new Promise(resolve => behaviour.resolveMount = resolve)
        if (behaviour.isMounted) {
          continue
        }
        yield value
      }
    })()
    behaviour.unmountRequestGenerator = (async function* () {
      while (!behaviour.done) {
        const value = await new Promise(resolve => behaviour.resolveUnmount = resolve)
        if (!behaviour.isMounted) {
          continue
        }
        yield value
      }
    })()
    this.childBehaviours.set(behaviour.key || child, behaviour)
    behaviour.onMount ||= async mountRequestGenerator => {
      for await (let mount of mountRequestGenerator) {
        mount()
      }
    }
    behaviour.onUnmount ||= async unmountRequestGenerator => {
      for await (let unmount of unmountRequestGenerator) {
        unmount()
      }
    }
    behaviour.onMount(behaviour.mountRequestGenerator)
    behaviour.onUnmount(behaviour.unmountRequestGenerator)

    if (!behaviour.presence) {
      if (typeof child === 'string' || typeof child === 'function') {
        child = silk(child)
      }
      behaviour.resolveMount(() => {
        const index = this.sortBy
          ? indexBy(this.sortBy, this.value.children, child)
          : null
        this.value.insertBefore(child, this.value.children.length ? this.value.children[index] || null : null)
        return 1
      })
    }
    behaviour.presence?.(present => {
      if (present) {
        behaviour.mountRequested = true
        if (behaviour.unmountRequested) {
          behaviour.onCancelUnmount?.()
          behaviour.unmountRequested = false
        }
        behaviour.resolveMount(() => {
          const success = behaviour.mountRequested
          if (!success) {
            return 0
          }
          const index = this.sortBy
            ? indexBy(this.sortBy, this.value.children, child)
            : null
          if (!behaviour.isMounted || this.value.children[index] !== child) {
            this.value.insertBefore(child, this.value.children.length ? this.value.children[index] || null : null)
          }
          behaviour.mountRequested = false
          behaviour.isMounted = true
          return 1
        })
        return this
      }
      behaviour.unmountRequested = true
      if (behaviour.mountRequested) {
        behaviour.onCancelMount?.()
        behaviour.mountRequested = false
      }
      behaviour.resolveUnmount(() => {
        const success = behaviour.unmountRequested
        if (!success) {
          return 0
        }
        this.value.removeChild(child)
        behaviour.unmountRequested = false
        behaviour.isMounted = false
        return 1
      })
      return this
    })
    return this
  }
  removeChild(childOrKey) {
    const childBehaviour = this.childBehaviours.get(childOrKey)
    if (childBehaviour) {
      childBehaviour.remove()
      return this
    }
    this.value.removeChild(childOrKey)
    return this
  }
  sortChildren(sortBy) {
    this.sortBy = sortBy
    const childrenArray = [...this.value.children].sort(sortBy)
    childrenArray.forEach((child, index) => {
      this.value.insertBefore(child, this.value.children[index] || null)
    })
    return this
  }
}

const setTextContent = (textNode, textContent) => {
  if (typeof textContent === 'string') {
    if (!textNode) {
      return document.createTextNode(textContent)
    }
    textNode.textContent = textContent
    return textNode
  }
  if (typeof textContent === 'function') {
    if (!textNode) {
      return textNode = document.createTextNode(textContent(datum => {
        return setTextContent(textNode, datum)
      }))
    }
    textContent.call(textNode, datum => {
      return setTextContent(textNode, datum)
    })
    return textNode
  }
  throw new Error(`Invalid argument type "${typeof textContent}" for silk(Text)`)
}
const silk = window.silk = (tag, props, children, ...moreChildren) => {
  if (tag instanceof HTMLElement) {
    return new Silk(tag)
  }
  if (typeof tag === 'string' && props === undefined) {
    return document.createTextNode(tag)
  }
  if (tag instanceof Text) {
    return arg => setTextContent(tag, arg)
  }
  if (tag instanceof Function) {
    return setTextContent(undefined, tag)
  }
  if (typeof tag !== 'string') {
    throw new Error(`Invalid argument type "${typeof tag}" for silk`)
  }
  const el = silk(document.createElement(tag))
  el.props(props)
  el.children(children, ...moreChildren)
  return el.value
}

if (typeof window !== 'undefined') {
  window.silk = silk
}
