import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';

import { useActionData, useFetcher, useLoaderData, useNavigation } from '@remix-run/react';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { CustomCard } from '~/components/custom-card';
import { CustomForm } from '~/components/custom-form';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { H4 } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectColumnTable, projectMemberTable, projectTable } from '~/db/schema-workplace';

import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';
import { getAllMyProjects } from '~/services/project.server';

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  ownerId: z.string(),
  defaultColumns: z.boolean().default(false)
});

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  const newProject = await workplaceDb(workplaceId)
    .insert(projectTable)
    .values({
      name: submission.value.name,
      ownerId: submission.value.ownerId
    })
    .returning();

  await workplaceDb(workplaceId).insert(projectMemberTable).values({
    projectId: newProject[0].id,
    userId: user.id
  });

  if (submission.value.defaultColumns) {
    await workplaceDb(workplaceId)
      .insert(projectColumnTable)
      .values([
        {
          name: 'To Do',
          order: 1,
          projectId: newProject[0].id
        },
        {
          name: 'In Progress',
          order: 2,
          projectId: newProject[0].id
        },
        {
          name: 'Done',
          order: 3,
          projectId: newProject[0].id
        }
      ]);
  }

  throw redirect(
    $path('/app/workplace/:workplaceId/projects/:projectId', { workplaceId: workplaceId, projectId: newProject[0].id })
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser({ request, params });
  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const projects = await getAllMyProjects({ user, workplaceId });

  return json({
    user,
    projects,
    workplaceId
  });
}

const ProjectPage = () => {
  const { user, projects, workplaceId } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const workplaceData = useAppDashboardData();

  const projectOwner = workplaceData?.workplaceMembers?.find((i) => i.workplace.ownerId)?.user;

  const fetcher = useFetcher();
  const navigation = useNavigation();
  const isCreating = navigation.state;

  const [form, { name, ownerId }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  return (
    <div>
      <div className="flex justify-between">
        <H4 className="tracking-wide mb-6">Projects</H4>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            <CustomForm method="post" className="grid gap-4 py-4" {...getFormProps(form)}>
              <div className="grid grid-cols-6 items-center gap-x-4 gap-y-2">
                <Input {...getInputProps(ownerId, { type: 'number' })} type="hidden" value={user.id} />
                <Label htmlFor={name.id} className="text-right col-span-2 text-sm whitespace-nowrap w-fit">
                  Project Name
                </Label>

                <Input
                  {...getInputProps(name, { type: 'text' })}
                  placeholder="My awesome project"
                  className="col-span-4"
                />
                {name.errors && <p className="text-red-400 mt-2 uppercase text-sm">{name.errors}</p>}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="defaultColumns" className="text-right col-span-2 text-sm whitespace-nowrap w-fit">
                        Default Columns
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Default columns: Todo, In progress, Done</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Checkbox name="defaultColumns" />
              </div>
              <Button type="submit">{navigation.location ? 'Creating...' : 'Create Project'}</Button>
            </CustomForm>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {' '}
        {projects.length >= 1
          ? projects.map((project) => (
              <CustomCard
                key={project.id}
                ownerId={project.ownerId || ''}
                userId={user.id}
                userEmail={projectOwner?.email || ''}
                workplaceId={workplaceId}
                name={project.name}
                projectId={project.id}
              />
            ))
          : null}
      </div>
    </div>
  );
};

export default ProjectPage;
