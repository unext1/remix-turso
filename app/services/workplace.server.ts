import { redirect } from '@remix-run/node';
import { eq, inArray } from 'drizzle-orm';
import { $path } from 'remix-routes';

import { createWorkplaceDb, db, workplaceDb } from '~/db';
import { workplaceMemberTable, workplaceTable } from '~/db/schema';
import { type SessionUser, type UserType } from './auth.server';
import { workplaceUser } from '~/db/schema-workplace';

export const getWorkplace = async ({ user, workplaceId }: { user: UserType; workplaceId: string }) => {
  const userWorkplaces = user?.memberOfWorkplace.map((workplace) => workplace.workplaceId);

  if (!userWorkplaces?.includes(workplaceId)) {
    throw redirect($path('/app'));
  }

  const workplace = await db.query.workplaceTable.findFirst({
    with: {
      owner: true,
      workplaceMembers: true
    },
    where: eq(workplaceTable.id, workplaceId)
  });

  return workplace;
};

export const getAllWorkplaces = async ({ user }: { user: UserType }) => {
  const memberOfWorkplaces = user?.memberOfWorkplace.map((workplace) => workplace.workplaceId);

  if (!memberOfWorkplaces || memberOfWorkplaces.length <= 0) {
    return [];
  }

  const workplaces = await db.query.workplaceTable.findMany({
    where: inArray(workplaceTable.id, memberOfWorkplaces),
    with: {
      owner: {
        columns: {
          name: true,
          email: true
        }
      }
    }
  });

  return workplaces;
};

export const createWorkplace = async ({
  user,
  submission
}: {
  user: SessionUser;
  submission: { value: { name: string; ownerId: string } };
}) => {
  const workplaceId = await db
    .transaction(async (tx) => {
      const workplace = await tx
        .insert(workplaceTable)
        .values({ ...submission.value })
        .returning({ id: workplaceTable.id });

      await tx.insert(workplaceMemberTable).values({
        workplaceId: workplace[0].id,
        userId: user.id
      });

      return workplace[0].id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  await createWorkplaceDb(workplaceId);

  await workplaceDb(workplaceId).insert(workplaceUser).values({
    id: user.id
  });

  return workplaceId;
};
