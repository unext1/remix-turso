import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { useEffect, useRef } from 'react';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { CustomForm } from '~/components/custom-form';
import { SaveButton } from '~/components/kanban/editible-text';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Combobox } from '~/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';
import { useToast } from '~/components/ui/use-toast';
import { workplaceDb } from '~/db';
import { projectMemberTable, projectTable } from '~/db/schema-workplace';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

const schema = z.object({
  userId: z.string().min(1, 'User is required')
});

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

  return json({ project, projectId, workplaceId });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireUser({ request, params });

  const { projectId, workplaceId } = $params('/app/workplace/:workplaceId/projects/:projectId', params);
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  await workplaceDb(workplaceId).insert(projectMemberTable).values({
    projectId: projectId,
    userId: submission.value.userId
  });

  return json(submission.reply());
};

const ProjectSettings = () => {
  const { project, projectId, workplaceId } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  const { toast } = useToast();

  const $form = useRef<HTMLFormElement>(null);

  const workplaceData = useAppDashboardData();

  const exsistingUsersIds = project?.members.map((member) => member.userId);
  const users = workplaceData?.workplaceMembers
    ?.filter((member) => !exsistingUsersIds?.includes(member.userId))
    .map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email
    }));

  const [form, { userId }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  useEffect(() => {
    if (lastResult?.initialValue?.userId) {
      $form.current?.reset();
      toast({
        title: 'User has been invited'
      });
    }
  }, [lastResult, toast]);

  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  return (
    <div>
      <div className="flex justify-between">
        <H4 className="mb-6 capitalize tracking-wide">Project / {project.name} / Settings</H4>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>Invite member to join your project.</DialogDescription>
              </DialogHeader>

              <CustomForm method="post" className="grid gap-4 py-4" {...getFormProps(form)} ref={$form}>
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
                  {...getInputProps(userId, { type: 'text' })}
                />
                {userId.errors && <p className="text-red-400 mt-2 uppercase text-sm">{userId.errors}</p>}
                <Button type="submit">Invite </Button>
              </CustomForm>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                Create Column
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Column</DialogTitle>
                {/* <DialogDescription>Create Column</DialogDescription> */}
              </DialogHeader>

              <fetcher.Form
                method="post"
                action={$path(
                  '/app/workplace/:workplaceId/projects/:projectId',
                  {
                    projectId,
                    workplaceId
                  },
                  { index: '' }
                )}
              >
                <input type="hidden" name="intent" value="createColumn" />
                <input type="hidden" name="projectId" value={projectId} />
                <Input
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  required
                  ref={inputRef}
                  type="text"
                  name="name"
                />
                <div className="flex justify-between mt-4">
                  <SaveButton type="submit">Save Column</SaveButton>
                </div>
              </fetcher.Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
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
                      <Form
                        method="post"
                        action={$path('/app/workplace/:workplaceId/projects/:projectId/removeProject', {
                          projectId,
                          workplaceId
                        })}
                      >
                        <input type="hidden" name="columnId" value={column.id} />
                        <Button variant="destructive" type="submit" size="sm">
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
    </div>
  );
};
export default ProjectSettings;
