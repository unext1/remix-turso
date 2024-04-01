import { useRef } from 'react';
import { Form, useSubmit } from '@remix-run/react';

import { CancelButton, SaveButton } from './editible-text';
import { Textarea } from '../ui/textarea';

export function NewTask({
  columnId,
  nextOrder,
  onComplete,
  onAddCard
}: {
  columnId: number;
  nextOrder: number;
  onComplete: () => void;
  onAddCard: () => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const submit = useSubmit();

  return (
    <Form
      method="post"
      className="px-2 py-1 border-t-2 border-b-2 border-transparent"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        submit(formData, {
          method: 'post',
          fetcherKey: 'task',
          navigate: false,
          unstable_flushSync: true
        });

        if (!textAreaRef.current) throw Error('No Text Area');
        textAreaRef.current.value = '';
        onAddCard();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete();
        }
      }}
    >
      <input type="hidden" name="intent" value="createTask" />
      <input type="hidden" name="columnId" value={columnId} />
      <input type="hidden" name="order" value={nextOrder} />

      <Textarea
        autoFocus
        required
        ref={textAreaRef}
        name="name"
        placeholder="Enter a title for this task"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            if (!buttonRef.current) {
              throw Error('expected button ref');
            }
            buttonRef.current.click();
          }
          if (event.key === 'Escape') {
            onComplete();
          }
        }}
      />
      <div className="flex justify-between mt-2">
        <SaveButton ref={buttonRef}>Save Task</SaveButton>
        <CancelButton onClick={onComplete}>Cancel</CancelButton>
      </div>
    </Form>
  );
}
