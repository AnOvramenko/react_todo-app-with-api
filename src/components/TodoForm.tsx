import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage, Todo } from '../types/Todo';
import { USER_ID } from '../api/todos';
interface Props {
  inputPlaceHolder: string;
  inputClassName: string;
  dataCYOption: string;
  setErrorMessage?: (msg: ErrorMessage) => void;

  todos?: Todo[];
  onAddTodo?: (todo: string) => Promise<void>;

  updateTodo?: Todo;
  setIsUpdate?: (val: boolean) => void;
  onUpdateTodo?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
}

export const TodoForm: React.FC<Props> = ({
  inputPlaceHolder,
  todos,
  onAddTodo,
  setErrorMessage,
  updateTodo,
  setIsUpdate,
  onUpdateTodo,
  inputClassName,
  onDelete,
  dataCYOption,
}) => {
  const [inputQuery, setInputQuery] = useState(updateTodo?.title || '');
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

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    focusInput.current?.focus();
  }, [isDisableInput, todos]);

  const isAdd = todos && onAddTodo && setErrorMessage;
  const isUpdate = updateTodo && setIsUpdate && onUpdateTodo && onDelete;
  // console.log('render form')
  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isUpdate) {
      if (inputQuery.trim()) {
        const updatedTodo = {
          id: updateTodo.id,
          userId: USER_ID,
          title: inputQuery.trim(),
          completed: updateTodo.completed,
        };
        //mb return promise and after that make available all staff and focus input

        onUpdateTodo(updatedTodo);
        //   .then(() => {
        //     // console.log('response')
        //     setIsUpdate(false);
        //   })
        //   .catch(() => {
        //     // console.log('reject')
        //     focusInput.current?.focus();
        //   });
        // // // .finally(() => console.log('hello'));
      } else {
        onDelete(updateTodo.id);
      }
    }

    if (isAdd) {
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
    }
  };

  const handleOnBlur = () => {
    if (isUpdate) {
      if (inputQuery.trim()) {
        const updatedTodo = {
          id: updateTodo.id,
          userId: USER_ID,
          title: inputQuery.trim(),
          completed: updateTodo.completed,
        };

        if (!pressEsc.current && updateTodo.title !== inputQuery) {
          onUpdateTodo(updatedTodo);
        }
      } else {
        onDelete(updateTodo.id);
      }

      setIsUpdate(false);
    }
  };

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
        onBlur={handleOnBlur}
        data-cy={dataCYOption}
        type="text"
        value={inputQuery}
        onChange={event => setInputQuery(event.target.value)}
        className={inputClassName}
        placeholder={inputPlaceHolder}
        disabled={isDisableInput}
        ref={focusInput}
      />
    </form>
  );
};
