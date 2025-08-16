;(async () => {
  function wait(ms) {
    return new Promise(resolve => {
      const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
    });
  }

  let value = 0
  let cancelMount
  let cancelUnmount
  const mount = (presence) => {
    const current = value
    ;(presence ? cancelUnmount : cancelMount)?.()
    if (presence && value > 0) {
      ++value
      return Promise.resolve(false)
    } else if (!presence && value === 0) {
      --value
      return Promise.resolve(false)
    }
    return new Promise(resolve => {
      let isImmediatePass = false
      let cancel
      cancel = (presence ? onMount: onUnmount)(() => {
        isImmediatePass = true
        const v = [current, presence ? ++value : --value]
        resolve(v)
        cancel = undefined
        return v
      })
      if (isImmediatePass) {
        cancel = undefined
      }
      if (presence) {
        cancelMount = cancel
      } else {
        cancelUnmount = cancel
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

  mount(true)
  await wait(10)
  ;(async () => console.log('1st calling unmount', await mount(false)))();
  await wait(10)
  mount(true)
  await wait(10)
  ;(async () => console.log('2nd calling unmount', await mount(false)))();
})()