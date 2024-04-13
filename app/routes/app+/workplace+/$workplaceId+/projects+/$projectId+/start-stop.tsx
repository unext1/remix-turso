import { type ActionFunctionArgs } from '@remix-run/node';
import { desc, eq } from 'drizzle-orm';
import { $params } from 'remix-routes';
import { z } from 'zod';
import { zx } from 'zodix';

import { workplaceDb } from '~/db';
import { taskTimesheetTable } from '~/db/schema-workplace';
import { requireUser } from '~/services/auth.server';

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const { taskId, startTime, stopTime, description, _action } = await zx.parseForm(request, {
    taskId: z.string().min(1),
    startTime: z.string(),
    description: z.string().nullable(),
    stopTime: z.string(),
    _action: z.enum(['start', 'stop'])
  });

  if (_action === 'start') {
    return await workplaceDb(workplaceId).insert(taskTimesheetTable).values({
      startTime: startTime,
      taskId: taskId,
      userId: user.id
    });
  }

  if (_action === 'stop') {
    // TODO: padaryti transaction.
    const latestStartedTimesheet = await workplaceDb(workplaceId)
      .select()
      .from(taskTimesheetTable)
      .where(eq(taskTimesheetTable.userId, user.id))
      .orderBy(desc(taskTimesheetTable.startTime))
      .get();

    if (!latestStartedTimesheet) throw new Error('No timesheet found');

    return await workplaceDb(workplaceId)
      .update(taskTimesheetTable)
      .set({
        stopTime: stopTime,
        description
      })
      .where(eq(taskTimesheetTable.id, latestStartedTimesheet.id));
  }
  return {};
}
