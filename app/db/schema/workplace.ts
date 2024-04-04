import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { abstractTable } from '../abstract-table';
import { userTable } from './user';
import { relations, sql } from 'drizzle-orm';

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
      workplaceMemberPkey: primaryKey({ columns: [table.workplaceId, table.userId], name: 'workplace_member_pkey' })
    };
  }
);

export const workplaceInvitationTable = sqliteTable('invitation', {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  email: text('email'),
  workplaceId: text('workplace_id').references(() => workplaceTable.id),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const workplaceRelations = relations(workplaceTable, ({ one, many }) => ({
  owner: one(userTable, {
    fields: [workplaceTable.ownerId],
    references: [userTable.id]
  }),
  workplaceMembers: many(workplaceMemberTable),
  invitations: many(workplaceInvitationTable)
}));

export const workplaceInvitationRelation = relations(workplaceInvitationTable, ({ one }) => ({
  user: one(userTable, {
    fields: [workplaceInvitationTable.email],
    references: [userTable.email]
  }),
  workplace: one(workplaceTable, {
    fields: [workplaceInvitationTable.workplaceId],
    references: [workplaceTable.id]
  })
}));

export const workplaceMemberRelations = relations(workplaceMemberTable, ({ one }) => ({
  workplace: one(workplaceTable, {
    fields: [workplaceMemberTable.workplaceId],
    references: [workplaceTable.id]
  }),
  user: one(userTable, {
    fields: [workplaceMemberTable.userId],
    references: [userTable.id]
  })
}));
