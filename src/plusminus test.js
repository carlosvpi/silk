;(async () => {
  function wait(ms) {
    return new Promise(resolve => {
      const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
    });
  }
  let now = Date.now()

  function plusminus (plus, minus) {
    let value = 0
    let cancel = { }
    return [
      (...args) => {
        const current = value
        return plus(...args, value, () => [current, ++value], paramCancel => paramCancel ? (cancel.plus = paramCancel) : cancel.minus)
      },
      (...args) => {
        const current = value
        return minus(...args, value, () => [current, --value], paramCancel => paramCancel ? (cancel.minus = paramCancel) : cancel.plus)
      },
    ]
  }

  let [mount, unmount] = plusminus(
    (_, get, cancel) => {
      return new Promise(resolve => {
        cancel(onMount(() => {
          const v = get()
          resolve(v)
          cancel?.()?.()
          return v
        }))
      })
    }, (value, get, cancel) => {
      if (value === 0) return Promise.resolve(false)
      return new Promise(resolve => {
        cancel(onUnmount(() => {
          const v = get()
          resolve(v)
          cancel?.()?.()
          return v
        }))
      })
    }
  )

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