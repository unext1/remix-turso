import { workplaceDb } from '~/db';
import { type SessionUser } from './auth.server';

export const getAllMyProjects = async ({ user, workplaceId }: { user: SessionUser; workplaceId: string }) => {
  const projects = await workplaceDb(workplaceId).query.projectMemberTable.findMany({
    columns: {},
    with: {
      project: true
    },
    where: (member, { eq }) => eq(member.userId, user.id)
  });

  return projects.map((p) => p.project);
};
