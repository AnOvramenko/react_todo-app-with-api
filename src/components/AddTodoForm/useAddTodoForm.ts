import { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../types/Todo';

export const useAddTodoForm = (
  onAddTodo: (todo: string) => Promise<void>,
  setErrorMessage: (msg: ErrorMessage) => void,
  isFocusAddForm: boolean,
) => {
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

  return {
    setInputQuery,
    handleOnSubmit,
    isDisableInput,
    focusInput,
    inputQuery,
  };
};
