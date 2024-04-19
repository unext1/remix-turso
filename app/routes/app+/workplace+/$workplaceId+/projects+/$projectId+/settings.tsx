import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Combobox } from '~/components/ui/combobox';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectMemberTable, projectTable } from '~/db/schema-workplace';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ params, request });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const project = await workplaceDb(workplaceId).query.projectTable.findFirst({
    with: {
      tasks: true,
      owner: true,
      members: true,
      columns: {
        orderBy: (projectColumnTable, { asc }) => [asc(projectColumnTable.order)]
      }
    },
    where: eq(projectTable.id, projectId)
  });

  if (project?.ownerId !== user.id) {
    throw redirect($path('/app/workplace/:workplaceId/projects', { workplaceId: workplaceId }));
  }

  return json({ project });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireUser({ request, params });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);

  const formData = await request.formData();
  const userId = String(formData.get('userId'));

  if (!userId) {
    return json({ success: 'false' });
  }

  await workplaceDb(workplaceId).insert(projectMemberTable).values({
    projectId: projectId,
    userId: userId
  });

  return json({ success: 'true' });
};

const ProjectSettings = () => {
  const { project } = useLoaderData<typeof loader>();
  const workplaceData = useAppDashboardData();

  const exsistingUsersIds = project?.members.map((member) => member.userId);

  const users = workplaceData?.workplaceMembers
    ?.filter((member) => !exsistingUsersIds?.includes(member.userId))
    .map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email
    }));

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
              ? project.columns.map((column) => (
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
              : null}
          </TableBody>
        </Table>
      </Card>

      <H4 className="tracking-wide mb-6 mt-12">Invite Member</H4>

      <Card className="p-6 mt-4">
        <Form method="post" className="space-y-4">
          <Combobox
            items={
              users?.map((user) => ({
                label: user.name || user.email,
                value: user.id.toString()
              })) || []
            }
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
