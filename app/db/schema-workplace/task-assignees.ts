import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { projectTaskTable } from './project-task';
import { workplaceUser } from './user';
import { relations } from 'drizzle-orm';

export const taskAssigneesTable = sqliteTable(
  'task_assigness',
  {
    userId: text('user_id')
      .references(() => workplaceUser.id, { onDelete: 'cascade' })
      .notNull(),
    taskId: text('task_jd')
      .references(() => projectTaskTable.id, { onDelete: 'cascade' })
      .notNull()
  },
  (table) => {
    return {
      projectMemberPkey: primaryKey({
        columns: [table.taskId, table.userId],
        name: 'project_member_pkey'
      })
    };
  }
);

export const taskAssigneesRelations = relations(taskAssigneesTable, ({ one }) => ({
  user: one(workplaceUser, {
    fields: [taskAssigneesTable.userId],
    references: [workplaceUser.id]
  }),
  assginee: one(projectTaskTable, {
    fields: [taskAssigneesTable.taskId],
    references: [projectTaskTable.id]
  })
}));
