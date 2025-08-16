;(async () => {
  function wait(ms) {
    return new Promise(resolve => {
      const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
    });
  }

  let value = 0
  let cancelMount
  let cancelUnmount
  const mount = () => {
    const current = value
    cancelUnmount?.()
    if (value > 0) {
      ++value
      return Promise.resolve(false)
    }
    return new Promise(resolve => {
      let isImmediatePass = false
      cancelMount = onMount(() => {
        isImmediatePass = true
        const v = [current, ++value]
        resolve(v)
        cancelMount = undefined
        return v
      })
      if (isImmediatePass) {
        cancelMount = undefined
      }
    })
  }
  const unmount = () => {
    const current = value
    cancelMount?.()
    if (value === 0) {
      --value
      return Promise.resolve(false)
    }
    return new Promise(resolve => {
      let isImmediatePass = false
      cancelUnmount = onUnmount(() => {
        isImmediatePass = true
        const v = [current, --value]
        resolve(v)
        cancelUnmount = undefined
        return v
      })
      if (isImmediatePass) {
        cancelUnmount = undefined
      }
    })
  }

  let onMount = (mount) => {
    mount()
    return () => {
      console.log('cancelled mount')
    }
  }
  let onUnmount = (unmount) => {
    const token = setTimeout(unmount, 1000)
    return () => {
      console.log('cancelled unmount')
    }
  }

  mount()
  await wait(10)
  ;(async () => console.log('1st calling unmount', await unmount()))();
  await wait(10)
  mount()
  await wait(10)
  ;(async () => console.log('2nd calling unmount', await unmount()))();
})()