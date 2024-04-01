import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { abstractTable } from '../abstract-table';
import { userTable } from './user';

export const workplaceTable = abstractTable('workplace', {
  name: text('name'),
  ownerId: text('user_id')
    .references(() => userTable.id)
    .notNull()
});

export const workplaceMemberTable = sqliteTable(
  'workplace_member',
  {
    userId: text('user_id')
      .references(() => userTable.id)
      .notNull(),
    workplaceId: text('workplace_id')
      .references(() => workplaceTable.id)
      .notNull()
  },
  (table) => {
    return {
      workplaceMemberPkey: primaryKey({
        columns: [table.workplaceId, table.userId],
        name: 'workplace_member_pkey'
      })
    };
  }
);
export const workplaceInvitationTable = abstractTable('invitation', {
  email: text('email'),
  workplaceId: text('workplace_id').references(() => workplaceTable.id)
});
