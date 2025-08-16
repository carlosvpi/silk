;(async () => {
  function wait(ms) {
    return new Promise(resolve => {
      const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
    });
  }

  const observeCalled = (f) => {
    if (!f) return undefined
    const _ = function (...args) {
      _.hasBeenCalled = true
      _.timesCalled++
      return f(...args)
    }
    _.hasBeenCalled = false
    _.timesCalled = 0
    _.id = Math.floor(Math.random() * 100)
    return _
  }
  observeCalled.hasBeenCalled = (f) => {
    return typeof f === 'function' && f !== null && f.hasBeenCalled
  }

  let currentIndex = 0
  let lastIndexRequest = 0
  let cancelMount
  let cancelUnmount
  const mount = (index) => {
    if (index === lastIndexRequest) {
      return Promise.resolve({ index, response: 'SAME REQUEST' })
    }
    const cancel = lastIndexRequest >= 0 ? cancelMount : cancelUnmount
    cancel?.()
    lastIndexRequest = index
    if (index === currentIndex) {
      return Promise.resolve({ index, response: 'NO CHANGE' })
    }
    return new Promise(resolve => {
      let isImmediatePass = false
      let cancel
      cancel = (index >= 0 ? onMount: onUnmount)(() => {
        isImmediatePass = true
        if (observeCalled.hasBeenCalled(cancel)) {
          resolve({ index, response: 'CANCELLED' })
          return { index, response: 'CANCELLED' }
        }
        currentIndex = index
        resolve({ index, response: 'OK' })
        if (index>= 0 ) {
          cancelMount = undefined
        } else {
          cancelUnmount = undefined
        }
        return { index, response: 'OK' }
      }, index)
      if (isImmediatePass) {
        cancel = undefined
      }
      if (index >= 0) {
        cancel = cancelMount = observeCalled(cancel)
      } else {
        cancel = cancelUnmount = observeCalled(cancel)
      }
    })
  }

  let onMount = (mount, index) => {
    ;(async () => {
      await new Promise(resolve => window.resolve.set(index, [...(window.resolve.get(index) || []), resolve]))
      mount()
    })();
    return () => {
      console.log('cancelled mount for ', index)
    }
  }
  let onUnmount = (unmount, index) => {
    ;(async () => {
      await new Promise(resolve => window.resolve.set(index, [...(window.resolve.get(index) || []), resolve]))
      unmount()
    })();
    return () => {
      console.log('cancelled unmount for ', index)
    }
  }

  window.resolve = new Map([])
  // ;(async () => console.group('mounting 3') || console.log(await mount(3)) || console.groupEnd())();
  // // await wait(10)
  // // ;(async () => console.group('mounting 2') || console.log(await mount(true)) || console.groupEnd())();
  // await wait(10)
  // ;(async () => console.group('unmounting -1') || console.log(await mount(-1)) || console.groupEnd())();
  // await wait(10)
  // ;(async () => console.group('mounting 2') || console.log(await mount(2)) || console.groupEnd())();
  // await wait(10)
  // ;(async () => console.group('unmounting -1 again') || console.log(await mount(-1)) || console.groupEnd())();
  window.mount = mount
  window.getIndex = () => currentIndex
})()