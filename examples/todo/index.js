silk = silk.default;
const BehaviorSubject = rxjs.BehaviorSubject;

addEventListener("load", () => {
  const app = document.getElementById('app');
  if (!app) {
    console.error("App element not found");
    return;
  }
  const filterSubj = new BehaviorSubject('all');
  const todosSubj = new BehaviorSubject([]);
  const newTodoSubj = new BehaviorSubject();
  const addTodo = () => {
    if (newTodoInput.current.value === '') {
      return;
    }
    const todo = { text: newTodoInput.current.value, statusObj: new BehaviorSubject('todo') };
    todosSubj.next([...todosSubj.getValue(), todo]);
    newTodoSubj.next(todo);
    newTodoInput.current.value = '';
  }
  const deleteTodo = (todo) => {
    const todos = todosSubj.getValue().filter(t => t !== todo);
    todosSubj.next(todos);
  }
  const newTodoInput = { current: null}
  const todo = silk('div', null,
    silk('h1', null, 'To-Do app'),
    silk('div', null, 
      silk('input', {
        ref: newTodoInput,
        type: 'text',
        placeholder: 'Add a new task',
        onKeyDown: (e) => {
          if (e.key !== 'Enter') { return; }
          addTodo();
        }
      }),
      silk('button', { onClick: () => { addTodo() }}, 'Add Task'),
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
      silk('strong', null, silk(text => {todosSubj.subscribe(todos => text(todos.length)); return '0'; })),
      ' tasks'
    ),
    silk('ul', null, add => {
      newTodoSubj.subscribe(todo => {
        if (!todo) return;
        let del;
        const child = silk('li', { class: { todo: true } }, 
          silk('span', null, todo.text),
          ' ',
          silk('button', {
            onClick: () => todo.statusObj.next(todo.statusObj.getValue() === 'done' ? 'todo' : 'done')
          }, silk(text => {
            todo.statusObj.subscribe(status => text(status === 'done' ? 'Undo' : 'Done'));
            return 'Done';
          })),
          ' ',
          silk('button', {
            onClick: () => {
              deleteTodo(todo)
              del(child);
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
              if (filter !== 'all' && todo.statusObj.getValue() !== filter) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
            });
            todo.statusObj.subscribe(status => {
              if (filterSubj.getValue() !== 'all' && status !== filterSubj.getValue()) {
                presence(false);
              } else {
                presence(todosSubj.getValue().indexOf(todo));
              }
            });
          }
        });
      });
    })
  );
  silk(app, null, todo);
});