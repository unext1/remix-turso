import { type ActionFunctionArgs } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { $params } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';
import { workplaceDb } from '~/db';
import { taskAssigneesTable } from '~/db/schema-workplace';

import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const { userId } = await zx.parseForm(request, {
    userId: z.string().min(1)
  });

  // TODO: check if user is owner and check if owner is not remving himself

  return await workplaceDb(workplaceId).delete(taskAssigneesTable).where(eq(taskAssigneesTable.userId, userId));
}
