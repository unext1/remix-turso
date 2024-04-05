import { relations } from 'drizzle-orm';
import { abstractTable } from '../abstract-table';
import { projectMemberTable, projectTable } from '.';

export const workplaceUser = abstractTable('user', {});

export const userRelations = relations(workplaceUser, ({ many }) => ({
  memberOfProject: many(projectMemberTable),
  ownerOfProject: many(projectTable)
}));
