import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { abstractTable } from '../abstract-table';
import { workplaceUser } from '.';
import { relations, sql } from 'drizzle-orm';

//Board
export const projectTable = abstractTable('project', {
  name: text('name'),
  ownerId: text('user_id').references(() => workplaceUser.id)
});

//Column
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

//Task
export const projectTaskTable = sqliteTable('project_task', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  name: text('name').notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  ownerId: text('user_id').references(() => workplaceUser.id),
  projectId: text('project_id')
    .references(() => projectTable.id, { onDelete: 'cascade' })
    .notNull(),
  columnId: text('column_id')
    .references(() => projectColumnTable.id)
    .notNull()
});

//Project members
export const projectMemberTable = sqliteTable(
  'project_member',
  {
    userId: text('user_id')
      .references(() => workplaceUser.id)
      .notNull(),
    projectId: text('project_id')
      .references(() => projectTable.id)
      .notNull()
  },
  (table) => {
    return {
      projectMemberPkey: primaryKey({
        columns: [table.projectId, table.userId],
        name: 'project_member_pkey'
      })
    };
  }
);

export const projectRelations = relations(projectTable, ({ one, many }) => ({
  user: one(workplaceUser, {
    fields: [projectTable.ownerId],
    references: [workplaceUser.id]
  }),
  columns: many(projectColumnTable),
  tasks: many(projectTaskTable)
}));

export const projectColumnRelations = relations(projectColumnTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [projectColumnTable.projectId],
    references: [projectTable.id]
  }),
  tasks: many(projectTaskTable)
}));

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

export const projectMemberRelations = relations(projectMemberTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [projectMemberTable.projectId],
    references: [projectTable.id]
  }),
  user: one(workplaceUser, {
    fields: [projectMemberTable.userId],
    references: [workplaceUser.id]
  })
}));
