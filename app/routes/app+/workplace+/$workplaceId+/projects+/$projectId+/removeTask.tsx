import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { workplaceDb } from '~/db';
import { projectTaskTable } from '~/db/schema-workplace';

import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser({ request, params });

  const { workplaceId, projectId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const formData = await request.formData();
  const taskId = String(formData.get('taskId') || 0);

  await workplaceDb(workplaceId).delete(projectTaskTable).where(eq(projectTaskTable.id, taskId));
  return redirect($path('/app/workplace/:workplaceId/projects/:projectId', { projectId, workplaceId }));
}
