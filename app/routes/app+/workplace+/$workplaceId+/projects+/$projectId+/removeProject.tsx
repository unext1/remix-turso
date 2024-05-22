import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';
import { workplaceDb } from '~/db';
import { projectColumnTable } from '~/db/schema-workplace';

import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser({ request, params });

  const { workplaceId, projectId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const { columnId } = await zx.parseForm(request, {
    columnId: z.string().min(1)
  });

  // TODO: check if user is owner

  await workplaceDb(workplaceId).delete(projectColumnTable).where(eq(projectColumnTable.id, columnId));

  throw redirect($path('/app/workplace/:workplaceId/projects/:projectId/settings', { workplaceId, projectId }));
}
