import { type ActionFunctionArgs } from '@remix-run/node';
import { and, eq } from 'drizzle-orm';
import { $params } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';

import { db, workplaceDb } from '~/db';
import { workplaceMemberTable } from '~/db/schema';
import { workplaceUser } from '~/db/schema-workplace';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  params;

  const { workplaceId } = $params('/app/workplace/:workplaceId/team/manage', params);

  const { userId, _action } = await zx.parseForm(request, {
    userId: z.string().min(1),
    _action: z.enum(['delete'])
  });

  if (_action === 'delete') {
    const ownerWorkplaces = user.ownerOfWorkplace.map((i) => i.id);
    if (!ownerWorkplaces.includes(workplaceId)) {
      throw Error('You are not the owner of this workplace');
    }
    // //Remove Workplace members
    await db
      .delete(workplaceMemberTable)
      .where(and(eq(workplaceMemberTable.workplaceId, workplaceId), eq(workplaceMemberTable.userId, userId)));

    return workplaceDb(workplaceId).delete(workplaceUser).where(eq(workplaceUser.id, userId));
  }
  return {};
}
