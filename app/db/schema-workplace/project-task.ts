import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { workplaceUser } from './user';
import { projectTable } from './project';
import { projectColumnTable } from './project-column';

//Task
export const projectTaskTable = sqliteTable('project_task', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
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

export const projectTaskRelations = relations(projectTaskTable, ({ one }) => ({
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
  })
}));
