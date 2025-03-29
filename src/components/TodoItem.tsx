/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Todo } from '../types/Todo';
import cn from 'classnames';
import { TodoForm } from './TodoForm';

interface Props {
  todo: Todo;
  loading?: boolean;
  onDelete?: (id: number) => void;
  onUpdateTodo?: (todo: Todo) => void;
}

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete = () => {},
  onUpdateTodo = () => {},
}) => {
  const { completed, title, id, loading } = todo;

  const [isUpdate, setIsUpdate] = useState(false);
  const handleOnDeleteTodo = () => {
    onDelete(todo.id);
  };

  return (
    <div
      onDoubleClick={() => setIsUpdate(true)}
      key={id}
      data-cy="Todo"
      className={cn('todo', {
        completed: completed,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onChange={() => onUpdateTodo({ ...todo, completed: !todo.completed })}
          checked={completed}
        />
      </label>

      {isUpdate ? (
        <TodoForm
          key="update"
          inputPlaceHolder="Empty todo will be deleted"
          updateTodo={todo}
          setIsUpdate={setIsUpdate}
          onUpdateTodo={onUpdateTodo}
          inputClassName="todo__title-field"
          onDelete={onDelete}
          dataCYOption="TodoTitleField"
        />
      ) : (
        <>
          <span data-cy="TodoTitle" className="todo__title">
            {title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={handleOnDeleteTodo}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': loading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
