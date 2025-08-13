class Phant {
  constructor (value) {
    this.value = value;
    this.subscriptions = new Set([])
  }

  subscribe (f) {
    if (!this.subscriptions) return this
    this.subscriptions.add(f)
    f(this.value, null)
    return () => {
      this.subscriptions.delete(f)
      return this
    }
  }

  next (value) {
    if (!this.subscriptions) return this
    if (typeof value === 'function') {
      value = value(this.value)
    }
    const oldValue = this.value
    this.value = value
    this.subscriptions.forEach(subscription => {
      subscription(this.value, oldValue)
    })
    return this
  }

  getValue () {
    return this.value
  }

  end () {
    this.subscriptions = null
  }

  static combine(...phants) {
    const result = new Phant(phants.map(phant => phant.getValue()))
    phants.forEach((phant, index) => {
      phant.subscribe(value => {
        result.next(values => [...values.slice(0, index),value,...values.slice(index+1)])
      })
    })
    return result
  }
}