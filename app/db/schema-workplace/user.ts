import { relations } from 'drizzle-orm';
import { abstractTable } from '../abstract-table';
import { projectMemberTable, projectTable } from '.';
import { taskTimesheetTable } from './task-timesheet';
import { taskCommentTable } from './task-comments';

export const workplaceUser = abstractTable('user', {});

export const userRelations = relations(workplaceUser, ({ many }) => ({
  memberOfProject: many(projectMemberTable),
  ownerOfProject: many(projectTable),
  taskTimesheets: many(taskTimesheetTable),
  taskComments: many(taskCommentTable)
}));
