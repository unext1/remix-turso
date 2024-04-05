import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/sqlite-core';
import { workplaceUser } from '.';
import { abstractTable } from '../abstract-table';
import { projectColumnTable } from './project-column';
import { projectMemberTable } from './project-member';
import { projectTaskTable } from './project-task';

//Board
export const projectTable = abstractTable('project', {
  name: text('name'),
  ownerId: text('owner_id').references(() => workplaceUser.id, { onDelete: 'set null' })
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
