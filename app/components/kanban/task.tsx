import { Link, useFetcher, useParams, useSubmit } from '@remix-run/react';
import { motion } from 'framer-motion';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { type TaskType } from './column';
import { $params, $path } from 'remix-routes';

const Task = ({
  name,
  content,
  id,
  order,
  columnId,
  createdAt,
  previousOrder,
  ownerId,
  nextOrder
}: TaskType & {
  previousOrder: number;
  nextOrder: number;
}) => {
  const submit = useSubmit();
  const [acceptDrop, setAcceptDrop] = useState<'none' | 'top' | 'bottom'>('none');

  const params = useParams();
  const { workplaceId, projectId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const handleDragStart = (
    e: DragEvent,
    {
      id,
      name,
      columnId,
      ownerId,
      content,
      createdAt
    }: { id: string; name: string; columnId: string; ownerId: string | null; content: string | null; createdAt: string }
  ) => {
    if (!e || !e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/remix-card',
      JSON.stringify({ id, name, columnId, ownerId, projectId, content, createdAt })
    );
  };

  return (
    <li
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(
          'application/remix-card',
          JSON.stringify({ id, name, columnId, ownerId, projectId, content, createdAt })
        );
      }}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('application/remix-card')) {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY <= midpoint ? 'top' : 'bottom');
        }
      }}
      onDragLeave={() => {
        setAcceptDrop('none');
      }}
      onDrop={(event) => {
        event.stopPropagation();

        const transfer = JSON.parse(event.dataTransfer.getData('application/remix-card'));
        if (!transfer.id) throw Error('missing card Id');
        if (!transfer.name) throw Error('missing name');

        const droppedOrder = acceptDrop === 'top' ? previousOrder : nextOrder;
        const moveOrder = (droppedOrder + order) / 2;

        const mutation: TaskType = {
          order: moveOrder,
          columnId: columnId,
          id: transfer.id,
          name: transfer.name,
          ownerId: transfer.ownerId,
          projectId: transfer.projectId,
          content: transfer.content,
          createdAt: transfer.createdAt
        };

        submit(
          { ...mutation, intent: 'moveTask' },
          {
            method: 'post',
            navigate: false,
            fetcherKey: `card:${transfer.id}`
          }
        );

        setAcceptDrop('none');
      }}
      className={
        'border-t-2 border-b-2 -mb-[2px] last:mb-0 cursor-grab active:cursor-grabbing py-1 ' +
        (acceptDrop === 'top'
          ? 'border-t-primary border-b-transparent'
          : acceptDrop === 'bottom'
          ? 'border-b-primary border-t-transparent'
          : 'border-t-transparent border-b-transparent')
      }
    >
      <Link
        to={$path('/app/workplace/:workplaceId/projects/:projectId/:taskId', {
          projectId: projectId,
          workplaceId: workplaceId,
          taskId: id
        })}
      >
        <motion.div
          layout
          layoutId={String(id)}
          className="bg-muted p-2 flex justify-between items-center rounded-md cursor-grab active:cursor-grabbing"
          draggable="true"
          onDragStart={(e: DragEvent) => handleDragStart(e, { name, id, columnId, ownerId, content, createdAt })}
        >
          <div>
            {/* <p className="text-xs uppercase text-gray-400">{createdAt}</p> */}
            <h3 className="flex-1 shrink-0 text-sm font-semibold">{name}</h3>
            <p className="mt-2 text-xs text-gray-400 line-clamp-2">{content}</p>
          </div>
        </motion.div>
      </Link>
    </li>
  );
};

export default Task;
