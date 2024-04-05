import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetchers, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { useRef } from 'react';
import { $params } from 'remix-routes';

import Column from '~/components/kanban/column';
import { NewColumn } from '~/components/kanban/new-column';
import { H4 } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectColumnTable, projectTable, projectTaskTable } from '~/db/schema-workplace';

import { requireUser } from '~/services/auth.server';

export interface RenderedItem {
  id: string;
  name: string;
  order: number;
  content: string | null;
  columnId: string;
  projectId: string;
  ownerId: string | null;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const formData = await request.formData();
  const intent = formData.get('intent');
  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);
  console.log(formData, intent);

  if (!intent) throw Error('Missing intent');

  switch (intent) {
    case 'updateColumn': {
      const name = String(formData.get('name') || '');
      const columnId = String(formData.get('columnId') || '');

      return workplaceDb(workplaceId)
        .update(projectColumnTable)
        .set({
          name
        })
        .where(eq(projectColumnTable.id, columnId));
    }
    case 'createColumn': {
      const name = String(formData.get('name') || '');
      const projectId = String(formData.get('projectId') || '');

      const columnCount = await workplaceDb(workplaceId)
        .select()
        .from(projectColumnTable)
        .where(eq(projectColumnTable.projectId, projectId))
        .all();

      return workplaceDb(workplaceId)
        .insert(projectColumnTable)
        .values({
          name,
          projectId,
          order: columnCount.length + 1
        });
    }
    case 'createTask': {
      const name = String(formData.get('name') || '');
      const columnId = String(formData.get('columnId') || '');
      const order = Number(formData.get('order') || 0);

      console.log(name, columnId, order, projectId, user.id);

      return workplaceDb(workplaceId).insert(projectTaskTable).values({
        columnId,
        name,
        order,
        ownerId: user.id,
        projectId: projectId
      });
    }
    case 'removeColumn': {
      const columnId = String(formData.get('columnId') || 0);

      return workplaceDb(workplaceId).delete(projectColumnTable).where(eq(projectColumnTable.id, columnId));
    }
    case 'removeTask': {
      const taskId = String(formData.get('taskId') || 0);

      return workplaceDb(workplaceId).delete(projectTaskTable).where(eq(projectTaskTable.id, taskId));
    }
    case 'moveTask': {
      const order = Number(formData.get('order') || 0);
      const columnId = String(formData.get('columnId') || 0);
      const id = String(formData.get('id') || 0);

      return workplaceDb(workplaceId)
        .update(projectTaskTable)
        .set({
          columnId,
          order
        })
        .where(eq(projectTaskTable.id, id));
    }
    case 'moveColumn': {
      const order = Number(formData.get('order') || 0);
      const id = String(formData.get('id') || 0);
      return workplaceDb(workplaceId)
        .update(projectColumnTable)
        .set({
          order,
          id
        })
        .where(eq(projectColumnTable.id, id));
    }

    default:
      break;
  }
  return {};
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser({ request, params });
  // const memberOfProject = user?.memberOfProject.map((project) => project.projectId);

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  // if (!memberOfProject.find((i) => i === Number(projectId))) {
  //   throw redirect($path('/app/workplace/:workplaceId/projects', { workplaceId: workplaceId }));
  // }

  const project = await workplaceDb(workplaceId).query.projectTable.findMany({
    with: {
      tasks: true,
      columns: {
        orderBy: (projectColumnTable, { asc }) => [asc(projectColumnTable.order)]
      }
    },
    where: eq(projectTable.id, projectId)
  });

  return json({ project: project[0], user, workplaceId });
}

const ProjectPage = () => {
  const { project, user, workplaceId } = useLoaderData<typeof loader>();

  const tasksById = new Map(project.tasks.map((item) => [item.id, item]));

  const pendingItems = usePendingTasks();
  for (const pendingItem of pendingItems) {
    const item = tasksById.get(pendingItem.id);
    const merged = item ? { ...item, ...pendingItem } : { ...pendingItem, boardId: project.id };
    tasksById.set(pendingItem.id, merged);
  }

  const optAddingColumns = usePendingColumns();
  type Column = (typeof project.columns)[number] | (typeof optAddingColumns)[number];
  type ColumnWithTasks = Column & { tasks: typeof project.tasks };
  const columns = new Map<string, ColumnWithTasks>();
  for (const column of [...project.columns, ...optAddingColumns]) {
    columns.set(column.id, { ...column, tasks: [] });
  }

  const optRemovingColumns = usePendingRemovedColumns();
  for (const columnToRemove of optRemovingColumns) {
    const removedColumnId = columnToRemove.id;
    columns.delete(removedColumnId);
  }

  for (const item of tasksById.values()) {
    const columnId = item.columnId;
    const column = columns.get(columnId);
    if (!column) throw Error('missing column');
    column.tasks.push(item);
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    if (!scrollContainerRef.current) throw Error('no scroll container');
    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
  }

  return (
    <div>
      <H4 className="mb-6 capitalize tracking-wide">Project / {project.name}</H4>
      <div className="h-full flex flex-col overflow-x-scroll" ref={scrollContainerRef}>
        <div className="flex flex-grow h-full items-start gap-4 pb-4">
          {[...columns.values()].map((col, index, cols) => {
            return <Column key={col.id} name={col.name} columnId={col.id} tasks={col.tasks} order={col.order} />;
          })}
          <NewColumn projectId={project.id} onAdd={scrollRight} editInitially={project.columns.length === 0} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;

function usePendingColumns() {
  type CreateColumnFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is CreateColumnFetcher => {
      return fetcher.formData?.get('intent') === 'createColumn';
    })
    .map((fetcher) => {
      const name = String(fetcher.formData.get('name'));
      const id = String(fetcher.formData.get('id'));
      const order = Number(fetcher.formData.get('order'));
      return { name, id, order };
    });
}

function usePendingRemovedColumns() {
  type CreateColumnFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is CreateColumnFetcher => {
      return fetcher.formData?.get('intent') === 'removeColumn';
    })
    .map((fetcher) => {
      const id = String(fetcher.formData.get('columnId'));
      return { id };
    });
}

function usePendingTasks() {
  type PendingItem = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };
  return useFetchers()
    .filter((fetcher): fetcher is PendingItem => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get('intent');
      return intent === 'createTask' || intent === 'moveTask';
    })
    .map((fetcher) => {
      const columnId = String(fetcher.formData.get('columnId'));
      const name = String(fetcher.formData.get('name'));
      const id = String(fetcher.formData.get('id'));
      const order = Number(fetcher.formData.get('order'));
      const projectId = String(fetcher.formData.get('projectId'));
      const ownerId = String(fetcher.formData.get('ownerId'));
      const item: RenderedItem = { name, id, order, columnId, content: '', projectId, ownerId };
      return item;
    });
}
