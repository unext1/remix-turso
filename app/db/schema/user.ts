import { text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

import { abstractTable } from "../abstract-table";
import {
  workplaceInvitationTable,
  workplaceMemberTable,
  workplaceTable,
} from "./workplace";

export const userTable = abstractTable("user", {
  name: text("name"),
  email: text("email").unique().notNull(),
  imageUrl: text("image_url"),
});

export const userRelations = relations(userTable, ({ many }) => ({
  ownerOfWorkplace: many(workplaceTable),
  memberOfWorkplace: many(workplaceMemberTable),
  invitations: many(workplaceInvitationTable),
}));
