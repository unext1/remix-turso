import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { projectTaskTable } from './project-task';
import { workplaceUser } from './user';

export const taskCommentTable = sqliteTable('task_comment', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  description: text('description'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: text('userId').references(() => workplaceUser.id, { onDelete: 'set null' }),
  taskId: text('task_Id')
    .references(() => projectTaskTable.id, { onDelete: 'cascade' })
    .notNull()
});

export const taskCommentRelations = relations(taskCommentTable, ({ one }) => ({
  user: one(workplaceUser, {
    fields: [taskCommentTable.userId],
    references: [workplaceUser.id]
  }),
  task: one(projectTaskTable, {
    fields: [taskCommentTable.taskId],
    references: [projectTaskTable.id]
  })
}));
