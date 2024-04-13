import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';
import { CustomForm } from '~/components/custom-form';
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
import { Label } from '~/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { H4, P } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectTaskTable, taskAssigneesTable } from '~/db/schema-workplace';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

const schema = z.object({
  userId: z.string()
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireUser({ request, params });

  const { workplaceId, taskId } = $params('/app/workplace/:workplaceId/projects/:projectId/:taskId', params);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  await workplaceDb(workplaceId).insert(taskAssigneesTable).values({
    taskId: taskId,
    userId: submission.value.userId
  });

  return json(submission.reply({ resetForm: true }));
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser({ request, params });

  const { projectId, workplaceId, taskId } = $params('/app/workplace/:workplaceId/projects/:projectId/:taskId', params);

  const task = await workplaceDb(workplaceId).query.projectTaskTable.findMany({
    with: {
      timesheets: true,
      assigness: true,
      project: {
        with: {
          members: true
        }
      }
    },
    where: eq(projectTaskTable.id, taskId)
  });

  return json({ task: task[0], user, projectId, workplaceId, taskId });
}

const TaskRoute = () => {
  const { task, user, projectId, workplaceId, taskId } = useLoaderData<typeof loader>();
  const workplaceData = useAppDashboardData();

  const lastResult = useActionData<typeof action>();

  const [form, { userId }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  const fetcher = useFetcher();

  const isStartedForUser = task.timesheets.find((sheet) => sheet.userId === user.id && !sheet.stopTime);

  const exsistingUsersIds = task?.assigness.map((member) => member.userId);

  const users = workplaceData?.workplaceMembers
    ?.filter((member) => !exsistingUsersIds?.includes(member.userId))
    .map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email
    }));

  return (
    <div>
      <div className="flex justify-between">
        <H4 className="mb-6 capitalize tracking-wide">Project / Task / {task.name}</H4>
        <fetcher.Form
          method="post"
          action={$path('/app/workplace/:workplaceId/projects/:projectId/start-stop', {
            projectId,
            workplaceId
          })}
        >
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="startTime" value={new Date().toUTCString()} />
          <input type="hidden" name="stopTime" value={new Date().toUTCString()} />
          <input type="hidden" name="description" className="col-span-4" />

          {isStartedForUser ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  Stop Timesheet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Stopping Timesheet</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <fetcher.Form
                  method="post"
                  action={$path('/app/workplace/:workplaceId/projects/:projectId/start-stop', {
                    projectId,
                    workplaceId
                  })}
                >
                  <input type="hidden" name="taskId" value={taskId} />
                  <input type="hidden" name="startTime" value={new Date().toUTCString()} />
                  <input type="hidden" name="stopTime" value={new Date().toUTCString()} />

                  <div className="tems-center gap-4">
                    <Label className="text-right col-span-2 text-sm whitespace-nowrap w-fit">Description</Label>
                    <Textarea placeholder="Tell what you have done..." className="col-span-4 my-2" name="description" />
                  </div>
                  <Button type="submit" name="_action" size="sm" value="stop" className="w-full mt-2">
                    Save Description
                  </Button>
                </fetcher.Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button type="submit" name="_action" size="sm" value="start">
              Start Timesheet
            </Button>
          )}
        </fetcher.Form>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className={`p-6 ${task.ownerId === user.id ? 'col-span-1' : 'col-span-2'}`}>
          <H4>{task.name}</H4>
          <P>{task.content}</P>

          <P className="uppercase text-xs font-semibold mt-6">Assignees:</P>
          <Table className="">
            <TableCaption>Asignees</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.assigness
                ? task.assigness.map((assignee) => {
                    const taskUser = workplaceData?.workplaceMembers?.find(
                      (member) => member.userId === assignee.userId
                    )?.user;

                    return (
                      <TableRow key={assignee.taskId}>
                        <TableCell>{taskUser ? taskUser.name : assignee.userId}</TableCell>
                        {task.ownerId === user.id ? (
                          <TableCell className="flex justify-end">
                            <Button variant="destructive" size="sm">
                              X
                            </Button>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </Card>
        {task.ownerId === user.id ? (
          <Card className="p-6">
            <H4>User Invite</H4>
            <CustomForm {...getFormProps(form)} method="post" className="space-y-4">
              <Combobox
                {...getInputProps(userId, { type: 'text' })}
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
              />
              <Button type="submit">Invite</Button>
            </CustomForm>
          </Card>
        ) : null}

        <Card className="p-6 col-span-2">
          <Table className="mt-4">
            <TableCaption>Timesheets</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Stop Time</TableHead>
                <TableHead className="text-right">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.timesheets
                ? task.timesheets.map((timesheet) => {
                    const user = workplaceData?.workplaceMembers?.find(
                      (member) => member.userId === timesheet.userId
                    )?.user;

                    return (
                      <TableRow key={timesheet.id} draggable={true}>
                        <TableCell>{user ? user.name : timesheet.userId}</TableCell>
                        <TableCell>{timesheet.startTime}</TableCell>
                        <TableCell>{timesheet.stopTime}</TableCell>
                        <TableCell className="flex justify-end">{timesheet.description}</TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default TaskRoute;
