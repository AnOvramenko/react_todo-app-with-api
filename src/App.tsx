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
    const getUpdateTodosWithLoading = (prevTodos: Todo[]) =>
      prevTodos.map(todo =>
        todo.id === updatedTodo.id
          ? { ...todo, loading: true, title: updatedTodo.title }
          : todo,
      );

    setTodos(getUpdateTodosWithLoading);

    return updateTodo(updatedTodo)
      .then(updatedTodoFS => {
        const getUpdatedTodos = (prevTodos: Todo[]) =>
          prevTodos.map(todo =>
            todo.id === updatedTodoFS.id ? updatedTodo : todo,
          );

        setTodos(getUpdatedTodos);
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.TODO_UPDATE);
        throw new Error(error);
      })
      .finally(() => setTodos(prevTodos => normalizeTodosLoading(prevTodos)));
  };

  const handleCheckAll = () => {
    if (
      todos.every(todo => todo.completed) ||
      todos.every(todo => !todo.completed)
    ) {
      const todosToChange = todos.map(todo => ({
        ...todo,
        completed: !todo.completed,
      }));

      todosToChange.forEach(todo => {
        handleUpdateTodo(todo);
      });
    } else {
      const unCompletedTodos = todos
        .filter(todo => !todo.completed)
        .map(todo => ({ ...todo, completed: !todo.completed }));

      unCompletedTodos.forEach(todo => {
        handleUpdateTodo(todo);
      });
    }
  };

  const handleOnDelete = (todoId: number) => {
    const getLoadingTodosToDelete = (prevTodos: Todo[]) => {
      return prevTodos.map(todo =>
        todo.id === todoId ? { ...todo, loading: true } : todo,
      );
    };

    setTodos(getLoadingTodosToDelete);

    return deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.TODO_DELETE);
        throw new Error(error);
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
