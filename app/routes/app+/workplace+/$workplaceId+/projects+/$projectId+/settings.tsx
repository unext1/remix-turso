import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { and, eq, notInArray } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Combobox } from '~/components/ui/combobox';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectMemberTable, projectTable } from '~/db/schema-workplace';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

const schema = z.object({
  userId: z.string().min(1, 'user is required')
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ params, request });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  // TODO check if owner of project

  // const ownerofProject = user?.ownerOfProject.map((project) => project.id);

  // if (!ownerofProject.find((i) => i === Number(projectId))) {
  //   throw redirect($path('/app/workplace/:workplaceId/projects', { workplaceId: workplaceId }));
  // }

  const project = await workplaceDb(workplaceId).query.projectTable.findMany({
    with: {
      tasks: true,
      columns: {
        orderBy: (projectColumnTable, { asc }) => [asc(projectColumnTable.order)]
      }
    },
    where: eq(projectTable.id, projectId)
  });

  const projectMembers = await workplaceDb(workplaceId).query.projectMemberTable.findMany({
    where: and(eq(projectMemberTable.projectId, projectId)),
    with: {
      user: true
    }
  });

  const usersInProject = projectMembers.map((i) => i.userId);

  // const workplaceMembers = await workplaceDb(workplaceId).query.workplaceMember.findMany({
  //   where: and(notInArray(projectMemberTable.userId, usersInProject)),
  //   with: {
  //     user: {
  //       with: {
  //         memberOfProject: true
  //       }
  //     },
  //     workplace: {
  //       columns: {
  //         ownerId: true
  //       }
  //     }
  //   }
  // });

  // const users = workplaceMembers.map((workplaceMember) => ({
  //   id: workplaceMember.user.id,
  //   email: workplaceMember.user.email,
  //   name: workplaceMember.user.name,
  //   role: workplaceMember.workplace.ownerId === workplaceMember.userId ? 'owner' : 'user'
  // }));

  // TODO Real users.
  const users = [
    {
      id: 'labas',
      email: 'lasd',
      name: 'labas',
      role: 'user'
    }
  ];

  return json({ users, projectMembers, project });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = requireUser({ request, params });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const formData = await request.formData();
  const userId = String(formData.get('userId'));

  if (!userId) {
    return json({ success: 'false' });
  }

  await workplaceDb(workplaceId)
    .insert(projectMemberTable)
    .values({
      projectId: projectId,
      userId: userId
    })
    .returning();

  return json({ success: 'true' });
};

const ProjectSettings = () => {
  const { users, projectMembers, project } = useLoaderData<typeof loader>();
  const data = useAppDashboardData();
  console.log(data?.workplaceData?.workplaceMembers);
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <H4 className="mb-6 capitalize tracking-wide">Project Settings</H4>

      <Card className="p-4 py-6">
        <Table>
          <TableCaption>Project Columns</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project
              ? project.map((project) =>
                  project.columns.map((column) => (
                    <TableRow key={column.id} draggable={true}>
                      <TableCell>{column?.name}</TableCell>
                      <TableCell className="flex justify-end">
                        <Form method="post" action={$path('/api/workplace/invitation')}>
                          <input type="hidden" name="invitationId" value={column.id || ''} />
                          <input type="hidden" name="projectId" value={column.projectId || ''} />
                          <Button variant="destructive" name="_action" value="decline" size="sm">
                            X
                          </Button>
                        </Form>
                      </TableCell>
                    </TableRow>
                  ))
                )
              : null}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 mt-4">
        <Form method="post" className="space-y-4">
          <Combobox
            items={users.map((user) => ({
              label: user.name || user.email,
              value: user.id.toString()
            }))}
            labels={{
              buttonLabel: 'Select user...',
              inputLabel: 'Search user...',
              notFoundLabel: 'No user found.'
            }}
            name="userId"
          />
          <Button type="submit">Invite</Button>
        </Form>
      </Card>
    </div>
  );
};
export default ProjectSettings;
