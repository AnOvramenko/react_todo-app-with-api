import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../types/Todo';
interface Props {
  setErrorMessage: (msg: ErrorMessage) => void;
  onAddTodo: (todo: string) => Promise<void>;
  isFocusAddForm: boolean;
}

export const AddTodoForm: React.FC<Props> = ({
  onAddTodo,
  setErrorMessage,
  isFocusAddForm,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isDisableInput, setIsDisableInput] = useState(false);

  const focusInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (focusInput.current) {
          focusInput.current.blur();
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    focusInput.current?.focus();
  }, [isFocusAddForm]);

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputQuery.trim()) {
      setErrorMessage(ErrorMessage.TITLE_EMPTY);

      return;
    }

    setIsDisableInput(true);
    onAddTodo(inputQuery)
      .then(() => {
        setInputQuery('');
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.TODO_ADD);
      })
      .finally(() => {
        setIsDisableInput(false);
      });
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <input
        data-cy="NewTodoField"
        type="text"
        value={inputQuery}
        onChange={event => setInputQuery(event.target.value)}
        className="todoapp__new-todo"
        placeholder="What needs to be done?"
        disabled={isDisableInput}
        ref={focusInput}
      />
    </form>
  );
};
