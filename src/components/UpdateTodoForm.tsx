import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import { USER_ID } from '../api/todos';
interface Props {
  updateTodo: Todo;
  setIsUpdate: (val: boolean) => void;
  onUpdateTodo: (todo: Todo) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const UpdateTodoForm: React.FC<Props> = ({
  updateTodo,
  setIsUpdate,
  onUpdateTodo,
  onDelete,
}) => {
  const [inputQuery, setInputQuery] = useState(updateTodo.title);
  const [isError, setIsError] = useState(false);

  const focusInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUpdate(false);
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    focusInput.current?.focus();
  }, [updateTodo]);

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (inputQuery.trim() === updateTodo.title && !isError) {
      setIsUpdate(false);

      return;
    }

    if (inputQuery.trim()) {
      const updatedTodo = {
        id: updateTodo.id,
        userId: USER_ID,
        title: inputQuery.trim(),
        completed: updateTodo.completed,
      };

      onUpdateTodo(updatedTodo)
        .then(() => {
          setIsUpdate(false);
        })
        .catch(() => {
          setIsError(true);
          focusInput.current?.focus();
        });
    } else {
      onDelete(updateTodo.id);
    }
  };

  const handleOnBlur = () => {
    if (isError) {
      focusInput.current?.focus();

      return;
    }

    if (inputQuery.trim()) {
      const updatedTodo = {
        id: updateTodo.id,
        userId: USER_ID,
        title: inputQuery.trim(),
        completed: updateTodo.completed,
      };

      if (inputQuery.trim() === updateTodo.title) {
        setIsUpdate(false);

        return;
      }

      onUpdateTodo(updatedTodo)
        .then(() => {
          setIsUpdate(false);
          setIsError(false);
        })
        .catch(() => {
          focusInput.current?.focus();
          setIsError(true);
        });
    } else {
      onDelete(updateTodo.id).catch(() => {
        setIsError(true);
      });
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <input
        onBlur={handleOnBlur}
        data-cy="TodoTitleField"
        type="text"
        value={inputQuery}
        onChange={event => setInputQuery(event.target.value)}
        className="todo__title-field"
        placeholder="Empty todo will be deleted"
        ref={focusInput}
      />
    </form>
  );
};
