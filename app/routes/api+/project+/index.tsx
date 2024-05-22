import { type ActionFunctionArgs } from '@remix-run/node';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { zx } from 'zodix';
import { workplaceDb } from '~/db';
import { projectMemberTable } from '~/db/schema-workplace';

import { projectTable } from '~/db/schema-workplace/project';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });

  const { projectId, workplaceId, _action } = await zx.parseForm(request, {
    projectId: z.string().min(1),
    workplaceId: z.string().min(1),
    _action: z.enum(['delete', 'leave'])
  });

  //TODO: check if user is owner of project

  // const ownerofProject = user.projects.map((i) => i.id);
  // if (!ownerofProject.includes(projectId)) {
  //   throw Error('You are not the owner of this project');
  // }

  if (_action === 'leave') {
    return await workplaceDb(workplaceId)
      .delete(projectMemberTable)
      .where(and(eq(projectMemberTable.projectId, projectId), eq(projectMemberTable.userId, user.id)));
  }

  if (_action === 'delete') {
    await workplaceDb(workplaceId).delete(projectMemberTable).where(eq(projectMemberTable.projectId, projectId));

    return await workplaceDb(workplaceId).delete(projectTable).where(eq(projectTable.id, projectId));
  }
}
