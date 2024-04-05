import { primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { abstractTable } from '../abstract-table';
import { userTable } from './user';
import { relations } from 'drizzle-orm';

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

export const workplaceInvitationTable = abstractTable(
  'invitation',
  {
    email: text('email').notNull(),
    workplaceId: text('workplace_id').references(() => workplaceTable.id, { onDelete: 'cascade', onUpdate: 'restrict' })
  },
  (table) => {
    return {
      invitationWorkplaceIdEmailKey: unique('invitation_unique_workplace_id_email_key').on(
        table.workplaceId,
        table.email
      )
    };
  }
);

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
