import { useEffect, useRef, useState } from 'react';
import { USER_ID } from '../../api/todos';
import { Todo } from '../../types/Todo';

export const useTodoUpdate = (
  updateTodo: Todo,
  setIsUpdate: (val: boolean) => void,
  onUpdateTodo: (todo: Todo) => Promise<void>,
  onDelete: (id: number) => Promise<void>,
) => {
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

  const handleUpdateTodo = () => {
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

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (inputQuery.trim() === updateTodo.title && !isError) {
      setIsUpdate(false);

      return;
    }

    handleUpdateTodo();
  };

  const handleOnBlur = () => {
    if (isError) {
      focusInput.current?.focus();

      return;
    }

    if (inputQuery.trim() === updateTodo.title) {
      setIsUpdate(false);

      return;
    }

    handleUpdateTodo();
  };

  return {
    handleOnSubmit,
    handleOnBlur,
    setInputQuery,
    inputQuery,
    focusInput,
  };
};
