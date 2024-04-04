import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';

import { db } from '~/db';
import { workplaceInvitationTable, workplaceMemberTable } from '~/db/schema';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const { workplaceId, invitationId, _action } = await zx.parseForm(request, {
    workplaceId: z.string(),
    invitationId: z.string(),
    _action: z.enum(['accept', 'decline'])
  });

  if (_action === 'decline') {
    await db.delete(workplaceInvitationTable).where(eq(workplaceInvitationTable.id, invitationId));
    return redirect($path('/app'));
  }

  const newMember = await db
    .insert(workplaceMemberTable)
    .values({
      userId: user.id,
      workplaceId: workplaceId
    })
    .onConflictDoNothing({ target: [workplaceMemberTable.userId, workplaceMemberTable.workplaceId] });

  if (!newMember) {
    throw Error('Something went wrong');
  }

  await db.delete(workplaceInvitationTable).where(eq(workplaceInvitationTable.id, invitationId));

  return redirect($path('/app/workplace/:workplaceId', { workplaceId: workplaceId }));
}
