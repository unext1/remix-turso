import { type ActionFunctionArgs } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { zx } from 'zodix';

import { db, deleteDatabase } from '~/db';
import { workplaceMemberTable, workplaceTable } from '~/db/schema';
import { projectTable } from '~/db/schema-workplace';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });

  const { workplaceId } = await zx.parseForm(request, {
    workplaceId: z.string().min(1)
  });

  const ownerWorkplaces = user.ownerOfWorkplace.map((i) => i.id);
  if (!ownerWorkplaces.includes(workplaceId)) {
    throw Error('You are not the owner of this workplace');
  }
  //Remove Workplace members
  await db.delete(workplaceMemberTable).where(eq(workplaceMemberTable.workplaceId, workplaceId));

  // remove Project
  await db.delete(projectTable);

  // Remove Workplace
  await db.delete(workplaceTable).where(eq(workplaceTable.id, workplaceId));

  //Remove Db
  return await deleteDatabase(workplaceId);
}
