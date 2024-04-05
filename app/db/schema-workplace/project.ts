import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { abstractTable } from '../abstract-table';
import { workplaceUser } from '.';
import { relations, sql } from 'drizzle-orm';
import { projectColumnTable } from './project-column';
import { projectTaskTable } from './project-task';
import { projectMemberTable } from './project-member';

//Board
export const projectTable = abstractTable('project', {
  name: text('name'),
  ownerId: text('owner_id').references(() => workplaceUser.id)
});

export const projectRelations = relations(projectTable, ({ one, many }) => ({
  owner: one(workplaceUser, {
    fields: [projectTable.ownerId],
    references: [workplaceUser.id]
  }),
  columns: many(projectColumnTable),
  tasks: many(projectTaskTable),
  members: many(projectMemberTable)
}));
