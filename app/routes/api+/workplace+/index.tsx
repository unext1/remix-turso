import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { and, eq } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';

import { db, deleteDatabase, workplaceDb } from '~/db';
import { workplaceMemberTable, workplaceTable } from '~/db/schema';
import { workplaceUser } from '~/db/schema-workplace';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });

  const { workplaceId, _action } = await zx.parseForm(request, {
    workplaceId: z.string().min(1),
    _action: z.enum(['delete', 'leave'])
  });

  if (_action === 'delete') {
    const ownerWorkplaces = user.ownerOfWorkplace.map((i) => i.id);
    if (!ownerWorkplaces.includes(workplaceId)) {
      throw Error('You are not the owner of this workplace');
    }
    // //Remove Workplace members
    await db.delete(workplaceMemberTable).where(eq(workplaceMemberTable.workplaceId, workplaceId));

    // // Remove Workplace
    await db.delete(workplaceTable).where(eq(workplaceTable.id, workplaceId));

    //Remove Db
    return await deleteDatabase(workplaceId);
  }
  if (_action === 'leave') {
    //Remove Workplace member
    await db
      .delete(workplaceMemberTable)
      .where(and(eq(workplaceMemberTable.userId, user.id), eq(workplaceMemberTable.workplaceId, workplaceId)));

    //Remove myself from the workplace
    await workplaceDb(workplaceId).delete(workplaceUser).where(eq(workplaceUser.id, user.id));

    return redirect($path('/app'));
  }
}
