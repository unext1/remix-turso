import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { workplaceUser } from './user';
import { projectTable } from './project';
import { relations } from 'drizzle-orm';

export const projectMemberTable = sqliteTable(
  'project_member',
  {
    userId: text('user_id')
      .references(() => workplaceUser.id, { onDelete: 'cascade' })
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

export const projectMemberRelations = relations(projectMemberTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [projectMemberTable.projectId],
    references: [projectTable.id]
  }),
  member: one(workplaceUser, {
    fields: [projectMemberTable.userId],
    references: [workplaceUser.id]
  })
}));
