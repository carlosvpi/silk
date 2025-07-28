silk = silk.default;
const BehaviorSubject = rxjs.BehaviorSubject;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

addEventListener("load", () => {
  const app = document.getElementById('app');
  if (!app) {
    console.error("App element not found");
    return;
  }
  const filterSubj = new BehaviorSubject('all');
  const todosSubj = new BehaviorSubject([]);
  const newTodoSubj = new BehaviorSubject();
  const addTodo = (value) => {
    const todo = { text: value, statusSubj: new BehaviorSubject('todo') };
    todosSubj.next([...todosSubj.getValue(), todo]);
    newTodoSubj.next(todo);
    return todo;
  }
  const todoDelMap = new Map();
  const deleteDoneTodos = () => {
    const todos = todosSubj.getValue().filter(t => t.statusSubj.getValue() !== 'done');
    const todosToDel = todosSubj.getValue().filter(t => t.statusSubj.getValue() === 'done');
    todosSubj.next(todos);
    todosToDel.forEach(todo => {
      if (todo.statusSubj.getValue() === 'done') {
        const del = todoDelMap.get(todo);
        if (del) {
          del();
          todoDelMap.delete(todo)
        }
      }
    });
  }
  const deleteTodo = (todo) => {
    const todos = todosSubj.getValue().filter(t => t !== todo);
    todosSubj.next(todos);
    const del = todoDelMap.get(todo);
    if (del) {
      del();
      todoDelMap.delete(todo)
    }
  }
  const newTodoInput = { current: null}
  const addTodoFromInput = () => {
    addTodo(newTodoInput.current.value);
    newTodoInput.current.value = '';
  }
  const todo = silk('div', null,
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
        onClick: () => filterSubj.next('all')
      }, 'All'),
      silk('button', {
        disabled: disabled => {filterSubj.subscribe(filter => disabled(filter === 'todo')); return false},
        onClick: () => filterSubj.next('todo')
      }, 'To do'),
      silk('button', {
        disabled: disabled => {filterSubj.subscribe(filter => disabled(filter === 'done')); return false},
        onClick: () => filterSubj.next('done')
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
      onClick: () => {
        deleteDoneTodos();
      }
    }, 'Clear Completed Tasks'),
    silk('ul', null, add => {
      newTodoSubj.subscribe(todo => {
        if (!todo) return;
        let del;
        const child = silk('li', { class: { todo: true } }, 
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
            }
          }, 'Delete'),
        );
        del = add(child, {
          onMount: (mount) => {
            silk(child, { class: { collapse: true}});
            mount();
            setTimeout(() => {
              silk(child, { class: { collapse: false}});
            }, 0);
          },
          onUnmount: (unmount) => {
            silk(child, { class: { collapse: true}});
            setTimeout(unmount, 3000);
          },
          onCancelUnmount: () => {
            silk(child, { class: { collapse: false}});
          },
          presence: presence => {
            filterSubj.subscribe(filter => {
              if (filter !== 'all' && todo.statusSubj.getValue() !== filter) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
            });
            todo.statusSubj.subscribe(status => {
              if (filterSubj.getValue() !== 'all' && status !== filterSubj.getValue()) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
            });
          }
        });
        todoDelMap.set(todo, del);
      });
    })
  );
  silk(app, null, todo);

  // ;(async() => {
  //   await wait(1000);
  //   filterSubj.next('todo')
  //   await wait(1000);
  //   const tasks = [];
  //   for (let i = 0; i < 10000; i++) {
  //     tasks.push(addTodo(`Task ${i + 1}`));
  //     if (tasks.length > 10) tasks[tasks.length - 10].statusSubj.next('done');
  //     if (tasks.length > 100) deleteTodo(tasks.shift());
  //     await wait(5);
  //   }
  // })();
});
