import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { projectTable } from './project';
import { projectTaskTable } from './project-task';

export const projectColumnTable = sqliteTable('project_column', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  projectId: text('project_id')
    .references(() => projectTable.id, { onDelete: 'cascade' })
    .notNull()
});

export const projectColumnRelations = relations(projectColumnTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [projectColumnTable.projectId],
    references: [projectTable.id]
  }),
  tasks: many(projectTaskTable)
}));
