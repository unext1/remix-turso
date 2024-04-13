import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { projectTaskTable } from './project-task';
import { workplaceUser } from './user';

export const taskTimesheetTable = sqliteTable('task_timesheet', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  description: text('description'),
  startTime: text('startTime').notNull(),
  stopTime: text('stopTime'),
  userId: text('userId').references(() => workplaceUser.id, { onDelete: 'set null' }),
  taskId: text('task_Id')
    .references(() => projectTaskTable.id, { onDelete: 'cascade' })
    .notNull()
});

export const taskTimesheetRelations = relations(taskTimesheetTable, ({ one }) => ({
  user: one(workplaceUser, {
    fields: [taskTimesheetTable.userId],
    references: [workplaceUser.id]
  }),
  task: one(projectTaskTable, {
    fields: [taskTimesheetTable.taskId],
    references: [projectTaskTable.id]
  })
}));
