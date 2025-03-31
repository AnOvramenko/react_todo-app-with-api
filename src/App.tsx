/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorMessage, FilterStatus, Todo } from './types/Todo';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { TodoList } from './components/TodoList';
import { HeaderTodoApp } from './components/HeaderTodoApp';
import { FooterTodoApp } from './components/FooterTodoApp';
import { filterTodo, normalizeTodosLoading } from './utils/helpers';
import { TodoError } from './components/TodoError';

export const App: React.FC = () => {
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.DEFAULT,
  );
  const [filterStatus, setFilterStatus] = useState(FilterStatus.DEFAULT);
  // const isFocusAddForm = useRef(false);
  const isFocusAddForm = useRef(false);

  useEffect(() => {
    isFocusAddForm.current = false;
  });

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(ErrorMessage.TODO_LOAD);
      });
  }, []);

  const filteredTodos = useMemo(() => {
    return filterTodo(todos, filterStatus);
  }, [todos, filterStatus]);

  //handlers
  const setErrorDefault = () => {
    setErrorMessage(ErrorMessage.DEFAULT);
  };

  const handleAddTodo = (query: string): Promise<void> => {
    const newTodo = {
      id: 0,
      userId: USER_ID,
      title: query.trim(),
      completed: false,
      loading: true,
    };

    setTempTodo(newTodo);

    return addTodo(newTodo)
      .then(newTodoFS => {
        setTodos([...todos, newTodoFS]);
      })
      .finally(() => {
        setTempTodo(null);
        isFocusAddForm.current = true;
      });
  };

  const handleUpdateTodo = (updatedTodo: Todo): Promise<void> => {
    const todosWithLoading = todos.map(todo =>
      todo.id === updatedTodo.id
        ? { ...todo, loading: true, title: updatedTodo.title }
        : todo,
    );

    setTodos(todosWithLoading);

    return updateTodo(updatedTodo)
      .then(updatedTodoFS => {
        const updatedTodos: Todo[] = todos.map(todo =>
          todo.id === updatedTodoFS.id ? updatedTodo : todo,
        );

        setTodos(updatedTodos);
      })
      .catch(e => {
        setErrorMessage(ErrorMessage.TODO_UPDATE);
        throw new Error(e);
      })
      .finally(() => setTodos(prevTodos => normalizeTodosLoading(prevTodos)));
  };

  // const handleOnChangeTodoStatus = (id: number) => {
  //   const currentTodo = findTodoById(todos, id);

  //   if (currentTodo) {
  //     currentTodo.completed = !currentTodo.completed;
  //     handleUpdateTodo(currentTodo);
  //   }
  // };

  //i'll redo this
  const handleCheckAll = () => {
    if (
      todos.every(todo => todo.completed) ||
      todos.every(todo => !todo.completed)
    ) {
      const todosToChange = todos.map(todo => ({
        ...todo,
        completed: !todo.completed,
      }));
      const todosWithLoading = todos.map(todo => ({ ...todo, loading: true }));

      setTodos(todosWithLoading);

      Promise.all([...todosToChange.map(todo => updateTodo(todo))])
        .then(setTodos)
        .catch(() => setErrorMessage(ErrorMessage.TODO_UPDATE))
        .finally(() => setTodos(prevTodos => normalizeTodosLoading(prevTodos)));
    } else {
      const unCompletedTodos = todos
        .filter(todo => !todo.completed)
        .map(todo => ({ ...todo, completed: !todo.completed }));

      setTodos(
        todos.map(todo => {
          if (!todo.completed) {
            return { ...todo, loading: true };
          }

          return todo;
        }),
      );

      Promise.all([...unCompletedTodos.map(todo => updateTodo(todo))])
        .then(updatedTodosFS => {
          let newTodos: Todo[] = [...todos];

          updatedTodosFS.forEach(todoFS => {
            newTodos = newTodos.map(todo => {
              if (todo.id === todoFS.id) {
                return todoFS;
              }

              return todo;
            });
          });
          setTodos(newTodos);
        })
        .catch(() => setErrorMessage(ErrorMessage.TODO_UPDATE))
        .finally(() => setTodos(prevTodos => normalizeTodosLoading(prevTodos)));
    }
  };

  const handleOnDelete = (todoId: number) => {
    setTodos(prev => {
      const setLoadingTodo = prev.map(todo => {
        if (todo.id === todoId) {
          return { ...todo, loading: true };
        }

        return todo;
      });

      return setLoadingTodo;
    });

    return deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      })
      .catch(e => {
        setErrorMessage(ErrorMessage.TODO_DELETE);
        throw new Error(e);
      })
      .finally(() => {
        setTodos(prevTodos => normalizeTodosLoading(prevTodos));
        isFocusAddForm.current = true;
      });
  };

  const handleClearAllCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      handleOnDelete(todo.id);
    });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <HeaderTodoApp
          onCheckAll={handleCheckAll}
          onAddTodo={handleAddTodo}
          todos={todos}
          isFocusAddForm={isFocusAddForm.current}
          setErrorMessage={setErrorMessage}
        />

        <TodoList
          tempTodo={tempTodo}
          todos={filteredTodos}
          onUpdateTodo={handleUpdateTodo}
          onDelete={handleOnDelete}
        />

        {/* Hide the footer if there are no todos */}
        {!!todos.length && (
          <FooterTodoApp
            todos={todos}
            setFilterStatus={setFilterStatus}
            filterStatus={filterStatus}
            onClearCompleted={handleClearAllCompleted}
          />
        )}
      </div>

      <TodoError
        errorMessage={errorMessage}
        setErrorDefault={setErrorDefault}
      />
    </div>
  );
};
