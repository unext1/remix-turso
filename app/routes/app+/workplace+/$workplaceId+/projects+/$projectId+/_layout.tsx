import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';

import { workplaceDb } from '~/db';
import { workplaceUser } from '~/db/schema-workplace';
import { requireUser } from '~/services/auth.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const wpUser = await workplaceDb(workplaceId).query.workplaceUser.findMany({
    with: {
      memberOfProject: true
    },
    where: eq(workplaceUser.id, user.id)
  });

  const userProject = wpUser[0].memberOfProject.map((project) => project.projectId);

  if (!userProject.includes(projectId)) {
    throw redirect($path('/app/workplace/:workplaceId/projects', { workplaceId }));
  }

  return {};
};

const ProjectLayout = () => {
  return <Outlet />;
};

export default ProjectLayout;
