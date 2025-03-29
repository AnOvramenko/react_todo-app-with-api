import React from 'react';
import { ErrorMessage, Todo } from '../types/Todo';
import cn from 'classnames';
import { TodoForm } from './TodoForm';

interface Props {
  todos: Todo[];
  onCheckAll: () => void;
  onAddTodo: (query: string) => Promise<void>;
  setErrorMessage: (msg: ErrorMessage) => void;
}

export const HeaderTodoApp: React.FC<Props> = ({
  todos,
  onCheckAll,
  onAddTodo,
  setErrorMessage,
}) => {
  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      {!!todos.length && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: todos.every(todo => todo.completed),
          })}
          data-cy="ToggleAllButton"
          hidden={!todos}
          onClick={onCheckAll}
        />
      )}
      <TodoForm
        setErrorMessage={setErrorMessage}
        todos={todos}
        onAddTodo={onAddTodo}
        inputClassName="todoapp__new-todo"
        inputPlaceHolder="What needs to be done?"
        dataCYOption="NewTodoField"
      />
      {/* Add a todo on form submit */}
    </header>
  );
};
