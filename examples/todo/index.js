silk = silk.default;

function wait(ms) {
  return new Promise(resolve => {
    const token = setTimeout(() => resolve(() => clearTimeout(token)), ms)
  });
}

addEventListener("load", () => {
  const app = document.getElementById('app');
  if (!app) {
    console.error("App element not found");
    return;
  }
  const filterSubj = new Phant('all');
  const todosSubj = new Phant([]);
  const newTodoSubj = new Phant();
  const addTodo = (value) => {
    const todo = { text: value, statusSubj: new Phant('todo') };
    todosSubj.next([...todosSubj.getValue(), todo]);
    newTodoSubj.next(todo);
    return todo;
  }
  const deleteDoneTodos = () => {
    const todos = todosSubj.getValue().filter(t => t.statusSubj.getValue() !== 'done');
    const todosToDel = todosSubj.getValue().filter(t => t.statusSubj.getValue() === 'done');
    todosSubj.next(todos);
    todosToDel.forEach(todo => {
      if (todo.statusSubj.getValue() === 'done') {
        todo.statusSubj.end()
      }
    });
  }
  const deleteTodo = (todo) => {
    const todos = todosSubj.getValue().filter(t => t !== todo);
    todosSubj.next(todos);
    todo.statusSubj.end()
    delete todo.statusSubj
  }
  const newTodoInput = { current: null}
  const addTodoFromInput = () => {
    if (newTodoInput.current.value === '') {
      return
    }
    addTodo(newTodoInput.current.value);
    newTodoInput.current.value = '';
  }
  const todoApp = silk('div', null,
    silk('h1', null, 'To-Do app'),
    silk('div', null, 
      silk('input', {
        ref: newTodoInput,
        type: 'text',
        placeholder: 'Add a new task',
        onKeyDown: (e) => {
          if (e.key !== 'Enter') { return; }
          addTodoFromInput();
        }
      }),
      silk('button', { onClick: () => { addTodoFromInput() }}, 'Add Task'),
    ),
    silk('div', null,
      silk('button', {
        disabled: disabled => {filterSubj.subscribe(filter => disabled(filter === 'all')); return true},
        onClick: () => console.log('all') || filterSubj.next('all')
      }, 'All'),
      silk('button', {
        disabled: disabled => {filterSubj.subscribe(filter => disabled(filter === 'todo')); return false},
        onClick: () => console.log('todo') || filterSubj.next('todo')
      }, 'To do'),
      silk('button', {
        disabled: disabled => {filterSubj.subscribe(filter => disabled(filter === 'done')); return false},
        onClick: () => console.log('done') || filterSubj.next('done')
      }, 'Done'),
    ),
    silk('p', null,
      silk('strong', null, silk(text => {
        newTodoSubj.subscribe(todo => {
          todo?.statusSubj.subscribe(() => {
            text(todosSubj.getValue().filter(t => t.statusSubj.getValue() === 'todo').length);
          });
        });
        todosSubj.subscribe(todos => text(todos.filter(t => t.statusSubj.getValue() === 'todo').length));
        return 0;
      })),
      ' tasks left!'
    ),
    silk('button', {
      onClick: deleteDoneTodos
    }, 'Clear Completed Tasks'),
    silk('ul', null, add => {
      newTodoSubj.subscribe(todo => {
        if (!todo) return;
        let unsubscribe
        let child = silk('li', { class: { todo: true } }, 
          silk('span', null, todo.text),
          ' ',
          silk('button', {
            onClick: () => todo.statusSubj.next(todo.statusSubj.getValue() === 'done' ? 'todo' : 'done')
          }, silk(text => {
            todo.statusSubj.subscribe(status => text(status === 'done' ? 'Undo' : 'Done'));
            return 'Done';
          })),
          ' ',
          silk('button', {
            onClick: () => {
              deleteTodo(todo)
              add(child, false)
            }
          }, 'Delete'),
        );
        // todo.statusSubj.subscribe((_, { done }) => {
        //   if (!done) return
        //   add(child, false)
        //   unsubscribe?.()
        // })
        add(
          child,
          (presence, deletion) => {
            unsubscribe = filterSubj.subscribe(filter => {
              if (filter !== 'all' && todo.statusSubj.getValue() !== filter) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
            });
            todo.statusSubj.subscribe((status, { done }) => {
              if (filterSubj.getValue() !== 'all' && status !== filterSubj.getValue()) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
              if (done) {
                deletion(true)
                unsubscribe?.()
              }
            });
          },
          {
            onMount: (mount) => {
              silk(child, { class: { collapse: true}});
              mount();
              setTimeout(() => {
                silk(child, { class: { collapse: false}});
              }, 0);
            },
            onUnmount: (unmount) => {
              silk(child, { class: { collapse: true}});
              setTimeout(() => {
                unmount()
              }, 1000);
              return () => {
                silk(child, { class: { collapse: false}});
              }
            },
          }
        );
      });
    })
  );
  silk(app, null, todoApp);
  ;(async () => {
    await wait(3000)
    const todos = []
    for (let i = 0; i < 5000; i++){ todos.push(addTodo(`Task number ${i+1}`)) }
    await wait(3000)
    for (let i = 0; i < 5000; i++){ deleteTodo(todos.pop()) }
  })();
});
