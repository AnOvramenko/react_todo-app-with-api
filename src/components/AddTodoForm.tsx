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
  const pressEsc = useRef(false);
  // const handleKeyUpESC = useCallback((event: globalThis.KeyboardEvent) => {
  //   console.log(event.key === 'Escape');

  //   return event.key === 'Escape';
  // }, []);

  // useEffect(() => {
  //   const handleKeyUpESC = (event: KeyboardEvent) => {
  //     if (event.key === 'Escape') {
  //       if (focusInput.current) {
  //         focusInput.current.blur();
  //       }
  //     }
  //   };

  //   window.addEventListener('keyup', handleKeyUpESC);

  //   return () => {
  //     window.removeEventListener('keyup', handleKeyUpESC);
  //   };
  // }, []);

  useEffect(() => {
    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        pressEsc.current = true;

        if (focusInput.current) {
          focusInput.current.blur();
        }
      } else {
        pressEsc.current = false;
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

  // console.log('render form')
  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage(ErrorMessage.DEFAULT);

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

  // const handleOnBlur = () => {
  //   if (isUpdate) {
  //     if (inputQuery.trim()) {
  //       const updatedTodo = {
  //         id: updateTodo.id,
  //         userId: USER_ID,
  //         title: inputQuery.trim(),
  //         completed: updateTodo.completed,
  //       };

  //       if (!pressEsc.current && updateTodo.title !== inputQuery) {
  //         onUpdateTodo(updatedTodo);
  //       }
  //     } else {
  //       onDelete(updateTodo.id);
  //     }

  //     setIsUpdate(false);
  //   }
  // };

  // const handleOnPressEscape = (event: KeyboardEvent) => {
  //   if (event.key === 'Escape' && focusInput.current) {
  //     focusInput.current.blur();
  //     if (isUpdate) {
  //       setInputQuery(updateTodo.title);
  //       setIsUpdate(false);
  //     }
  //   }
  // };

  return (
    <form onSubmit={handleOnSubmit} /*onKeyDown={handleOnPressEscape}*/>
      <input
        // onBlur={handleOnBlur}
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
