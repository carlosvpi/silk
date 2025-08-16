silk = silk.default;

function wait(ms) {
  return new Promise(resolve => {
    const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
  });
}

function memoize(f) {
  const map = new Map([])
  return (arg) => {
    if (!map.has(arg)) {
      map.set(arg, f(arg))
    }
    return map.get(arg)
  }
}

addEventListener("load", () => {
  const app = document.getElementById('app');
  if (!app) {
    console.error("App element not found");
    return;
  }
  const itemsSubj = new Phant('lorem ipsum dolor sit amet consectetur adipiscing elit'.split(' '));
  const selectedSubj = new Phant(null);
  const select = child => {
    selectedSubj.next(child)
  }
  const release = () => {
    selectedSubj.next(null)
  }
  const dragAlong = child => {
    const selectedChild = selectedSubj.getValue()
    if (!selectedChild) return
    if (child === selectedChild) return
    const items = itemsSubj.getValue()
    const newItems = [...items]
    newItems.splice(items.indexOf(selectedChild), 1)
    newItems.splice(items.indexOf(child), 0, selectedChild)
    itemsSubj.next(newItems)
  }
  const getChild = memoize(child => silk('li', {
    onMouseDown: () => {
      select(child)
    },
    onMouseMove: () => {
      dragAlong(child)
    },
    style: {
      cursor: 'pointer',
      color: color => {
        selectedSubj.subscribe(selected => {
          if (selected === child) {
            color('red')
          } else {
            color('black')
          }
        })
      }
    }
  }, silk(child)))
  const reorderApp = silk('div', null,
    silk('h1', null, 'Reorder app'),
    silk('ul', { style: {userSelect: 'none' }}, add => {
      itemsSubj.subscribe((items, oldItems) => {
        items.forEach(item => {
          add(
            getChild(item),
            presence => {
              itemsSubj.subscribe(items => {
                presence(items.indexOf(item))
              })
            }
          )
        })
        // oldItems?.forEach(oldItem => {
        //   if (items.includes(oldItem)) {
        //     return
        //   }
        //   add(getChild(oldItem), false)
        // })
      })
    }),
  );
  silk(app, null, reorderApp);
  window.addEventListener('mouseup', release)
});
