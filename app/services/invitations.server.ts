import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { workplaceInvitationTable } from '~/db/schema';

export const getInvitations = async ({ email }: { email: string }) => {
  const invitations = await db.query.workplaceInvitationTable.findMany({
    with: {
      workplace: true
    },
    where: eq(workplaceInvitationTable.email, email)
  });

  return invitations;
};
