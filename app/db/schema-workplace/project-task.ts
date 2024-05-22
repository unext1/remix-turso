import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { projectTable } from './project';
import { projectColumnTable } from './project-column';
import { taskAssigneesTable } from './task-assignees';
import { taskTimesheetTable } from './task-timesheet';
import { workplaceUser } from './user';
import { taskCommentTable } from './task-comments';

export const projectTaskTable = sqliteTable('project_task', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  name: text('name').notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  ownerId: text('owner_id').references(() => workplaceUser.id, { onDelete: 'set null' }),
  projectId: text('project_id')
    .references(() => projectTable.id, { onDelete: 'cascade' })
    .notNull(),
  columnId: text('column_id')
    .references(() => projectColumnTable.id)
    .notNull()
});

export const projectTaskRelations = relations(projectTaskTable, ({ one, many }) => ({
  owner: one(workplaceUser, {
    fields: [projectTaskTable.ownerId],
    references: [workplaceUser.id]
  }),
  column: one(projectColumnTable, {
    fields: [projectTaskTable.columnId],
    references: [projectColumnTable.id]
  }),
  project: one(projectTable, {
    fields: [projectTaskTable.projectId],
    references: [projectTable.id]
  }),
  timesheets: many(taskTimesheetTable),
  comments: many(taskCommentTable),
  assigness: many(taskAssigneesTable)
}));
