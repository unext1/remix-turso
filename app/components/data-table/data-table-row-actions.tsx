import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useFetcher, useParams } from '@remix-run/react';
import { type Row } from '@tanstack/react-table';
import { $params, $path } from 'remix-routes';
import { type z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { tableSchema } from '~/utils/team-table';

export type Task = z.infer<typeof tableSchema>;

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const task = tableSchema.parse(row.original);

  const fetcher = useFetcher();

  const params = useParams();
  const { workplaceId } = $params('/app/workplace/:workplaceId/team/manage', params);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <fetcher.Form
          method="post"
          action={$path('/app/workplace/:workplaceId/team/manage', { workplaceId: workplaceId })}
        >
          <input type="hidden" name="userId" value={task.id} />
          <button type="submit" name="_action" value="delete" className="w-full">
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </button>
        </fetcher.Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
