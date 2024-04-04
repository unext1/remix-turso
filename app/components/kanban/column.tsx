import { useSubmit } from '@remix-run/react';
import { PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { EditableText } from './editible-text';
import { NewTask } from './new-task';
import RemoveColumn from './remove-column';
import Task from './task';

export interface TaskType {
  id: string;
  name: string;
  order: number;
  content: string | null;
  columnId: string;
  projectId: string;
  ownerId: string | null;
}

interface ColumnProps {
  name: string;
  columnId: string;
  tasks: TaskType[];
  order: number;
}

const Column = ({ name, columnId, tasks }: ColumnProps) => {
  const submit = useSubmit();

  const listRef = useRef<HTMLUListElement>(null);
  const [edit, setEdit] = useState(false);
  const [acceptDrop, setAcceptDrop] = useState(false);

  function scrollList() {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  return (
    <Card
      draggable="true"
      className={
        'flex-shrink-0 flex flex-col  max-h-full w-80 p-6 ' + (acceptDrop ? 'outline outline-2 outline-primary' : '')
      }
      onDragOver={(event) => {
        if (tasks.length === 0 && event.dataTransfer.types.includes('application/remix-card')) {
          event.preventDefault();
          setAcceptDrop(true);
        }
      }}
      onDragLeave={() => {
        setAcceptDrop(false);
      }}
      onDrop={(event) => {
        const transfer = JSON.parse(event.dataTransfer.getData('application/remix-card'));
        if (!transfer.id) throw Error('missing card Id');
        if (!transfer.name) throw Error('missing name');

        const mutation: TaskType = {
          order: 1,
          columnId: columnId,
          id: transfer.id,
          name: transfer.name,
          ownerId: transfer.ownerId,
          projectId: transfer.projectId,
          content: ''
        };

        submit(
          { ...mutation, intent: 'moveTask' },
          {
            method: 'post',
            navigate: false,
            fetcherKey: `card:${transfer.id}`
          }
        );

        setAcceptDrop(false);
      }}
    >
      <div className="flex justify-between space-x-4 bg-background p-2 rounded-md">
        <EditableText
          fieldName="name"
          value={name}
          inputLabel="Edit column name"
          buttonLabel={`Edit column "${name}" name`}
        >
          <input type="hidden" name="intent" value="updateColumn" />
          <input type="hidden" name="columnId" value={columnId} />
        </EditableText>

        <RemoveColumn columnId={columnId} />
      </div>
      <ul ref={listRef} className="flex-grow mb-4 mt-6">
        {tasks
          .sort((a, b) => a.order - b.order)
          .map((task, index, tasks) => (
            <Task
              key={task.id}
              name={task.name}
              content={task.content}
              id={task.id}
              order={task.order}
              columnId={columnId}
              projectId={task.projectId}
              ownerId={task.ownerId}
              previousOrder={tasks[index - 1] ? tasks[index - 1].order : 0}
              nextOrder={tasks[index + 1] ? tasks[index + 1].order : task.order + 1}
            />
          ))}
      </ul>

      {edit ? (
        <NewTask
          columnId={columnId}
          nextOrder={tasks.length === 0 ? 1 : tasks[tasks.length - 1].order + 1}
          onAddCard={() => scrollList()}
          onComplete={() => setEdit(false)}
        />
      ) : (
        <div className="p-2 ">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              flushSync(() => {
                setEdit(true);
              });
              scrollList();
            }}
            className="w-full"
          >
            <PlusIcon className="w-4 h-4" /> Add a task
          </Button>
        </div>
      )}
    </Card>
  );
};

export default Column;
