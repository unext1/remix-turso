import { workplaceDb } from '~/db';
import { type SessionUser } from './auth.server';

export const getAllProjects = async ({ user, workplaceId }: { user: SessionUser; workplaceId: string }) => {
  // Todo check if member of project

  //   const memberOfProject = user?.memberOfProject.map((project) => project.projectId);

  //   if (!memberOfProject || memberOfProject.length <= 0) {
  //     return [];
  //   }

  const projects = await workplaceDb(workplaceId).query.projectTable.findMany({
    with: {
      user: true,
      columns: true,
      tasks: true
    }
  });

  console.log(projects);

  return projects;
};
