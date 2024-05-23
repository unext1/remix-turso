import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { and, eq } from 'drizzle-orm';
import { $getRoot, $getSelection } from 'lexical';
import { EllipsisVerticalIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';
import { CustomForm } from '~/components/custom-form';
import { EditableText } from '~/components/kanban/editible-text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { H4, P } from '~/components/ui/typography';
import { useToast } from '~/components/ui/use-toast';
import { workplaceDb } from '~/db';
import { projectTaskTable, taskAssigneesTable } from '~/db/schema-workplace';
import { taskCommentTable } from '~/db/schema-workplace/task-comments';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

const removeUserSchema = z.object({
  invitedUser: z.string()
});

const updateTaskSchema = z.object({
  taskId: z.string(),
  name: z.string()
});

const insertCommentSchema = z.object({
  description: z.string()
});
const removeCommentSchema = z.object({
  commentId: z.string()
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await requireUser({ request, params });

  const { workplaceId, taskId } = $params('/app/workplace/:workplaceId/projects/:projectId/:taskId', params);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'updateTask') {
    const submission = parseWithZod(formData, { schema: updateTaskSchema });

    if (submission.status !== 'success') {
      return json(submission.reply(), {
        status: submission.status === 'error' ? 400 : 200
      });
    }

    return await workplaceDb(workplaceId)
      .update(projectTaskTable)
      .set({
        name: submission.value.name
      })
      .where(eq(projectTaskTable.id, taskId));
  }

  if (intent === 'insertComment') {
    const submission = parseWithZod(formData, { schema: insertCommentSchema });

    if (submission.status !== 'success') {
      return json(submission.reply(), {
        status: submission.status === 'error' ? 400 : 200
      });
    }

    return await workplaceDb(workplaceId).insert(taskCommentTable).values({
      taskId: taskId,
      description: submission.value.description,
      userId: user.id
    });
  }

  if (intent === 'removeComment') {
    const submission = parseWithZod(formData, { schema: removeCommentSchema });

    if (submission.status !== 'success') {
      return json(submission.reply(), {
        status: submission.status === 'error' ? 400 : 200
      });
    }

    return await workplaceDb(workplaceId)
      .delete(taskCommentTable)
      .where(and(eq(taskCommentTable.id, submission.value.commentId), eq(taskCommentTable.userId, user.id)));
  }

  const submission = parseWithZod(formData, { schema: removeUserSchema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  const invitedUser = JSON.parse(submission.value.invitedUser);

  await workplaceDb(workplaceId).insert(taskAssigneesTable).values({
    taskId: taskId,
    userId: invitedUser.id
  });

  return json(submission.reply());
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser({ request, params });

  const { projectId, workplaceId, taskId } = $params('/app/workplace/:workplaceId/projects/:projectId/:taskId', params);

  const task = await workplaceDb(workplaceId).query.projectTaskTable.findFirst({
    with: {
      timesheets: true,
      assigness: true,
      column: true,
      comments: true,
      project: {
        with: {
          members: true
        }
      }
    },
    where: eq(projectTaskTable.id, taskId)
  });

  if (!task) {
    throw redirect(
      $path('/app/workplace/:workplaceId/projects/:projectId', {
        workplaceId,
        projectId
      })
    );
  }

  const isMember = task.project.members.find((i) => i.userId);
  if (!isMember) {
    throw redirect(
      $path('/app/workplace/:workplaceId/projects/:projectId', {
        workplaceId,
        projectId
      })
    );
  }

  return json({ task: task, user, projectId, workplaceId, taskId });
}

const TaskRoute = () => {
  const { task, user, projectId, workplaceId, taskId } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const $form = useRef<HTMLFormElement>(null);

  const fetcher = useFetcher();

  const workplaceData = useAppDashboardData();

  const lastResult = useActionData<typeof action>();

  const [form, { invitedUser }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: removeUserSchema }),
    constraint: getZodConstraint(removeUserSchema),
    shouldRevalidate: 'onBlur'
  });

  const isStartedForUser = task.timesheets.find((sheet) => sheet.userId === user.id && !sheet.stopTime);

  const exsistingUsersIds = task?.assigness.map((member) => member.userId);
  const inviteUsers = workplaceData?.workplaceMembers
    ?.filter((member) => !exsistingUsersIds?.includes(member.userId))
    .map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email
    }));

  const allAssignessIds = task.assigness.map((i) => i.userId);

  useEffect(() => {
    if (lastResult?.initialValue) {
      console.log(lastResult.initialValue);
      $form.current?.reset();
      toast({
        title: 'User Assigned',
        description: `Your have assigned ${JSON.parse(lastResult.initialValue.invitedUser as string).name} to the task.`
      });
    }
  }, [lastResult, toast]);

  return (
    <div>
      <div className="flex justify-between">
        <H4 className="mb-6 capitalize tracking-wide">Project / Task / {task.name}</H4>
        <div className="flex gap-4">
          {task.ownerId === user.id ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  Manage Users
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Manage Users</DialogTitle>
                  <DialogDescription>Manage your task users.</DialogDescription>
                </DialogHeader>
                <div>
                  <CustomForm {...getFormProps(form)} method="post" ref={$form} className="space-y-4">
                    <Combobox
                      {...getInputProps(invitedUser, { type: 'text' })}
                      items={
                        inviteUsers?.map((user) => ({
                          label: user.name || user.email,
                          value: JSON.stringify(user)
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

                  <div className="flex mt-8">
                    {task.assigness
                      ? task.assigness.map((assignee) => {
                          const taskUser = workplaceData?.workplaceMembers?.find(
                            (member) => member.userId === assignee.userId
                          )?.user;

                          return (
                            <div key={assignee.taskId} className="flex">
                              <button className="text-xs text-muted-foreground">
                                <Avatar>
                                  <AvatarImage
                                    src={taskUser ? taskUser.imageUrl || '' : assignee.userId || ''}
                                    alt="avatar"
                                  />
                                  <AvatarFallback>{taskUser && taskUser.name ? taskUser.name[0] : ''}</AvatarFallback>
                                </Avatar>
                              </button>
                              {task.ownerId === user.id ? (
                                <div className="flex justify-end">
                                  <fetcher.Form
                                    method="post"
                                    action={$path('/app/workplace/:workplaceId/projects/:projectId/removeUser', {
                                      projectId,
                                      workplaceId
                                    })}
                                  >
                                    <input type="hidden" value={assignee.userId} name="userId" />
                                    <Button type="submit" variant="ghost" size="sm">
                                      X
                                    </Button>
                                  </fetcher.Form>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          {allAssignessIds.includes(user.id) && (
            <fetcher.Form
              method="post"
              action={$path('/app/workplace/:workplaceId/projects/:projectId/manage', {
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
                      action={$path('/app/workplace/:workplaceId/projects/:projectId/manage', {
                        projectId,
                        workplaceId
                      })}
                    >
                      <input type="hidden" name="taskId" value={taskId} />
                      <input type="hidden" name="startTime" value={new Date().toUTCString()} />
                      <input type="hidden" name="stopTime" value={new Date().toUTCString()} />

                      <div className="tems-center gap-4">
                        <Label className="text-right col-span-2 text-sm whitespace-nowrap w-fit">Description</Label>
                        <Textarea
                          placeholder="Tell what you have done..."
                          className="col-span-4 my-2"
                          name="description"
                        />
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
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div>
          <P className="text-xs text-muted-foreground">{task.createdAt}</P>
          <div className="flex gap-6 mt-4 items-center justify-between">
            <EditableText
              size="lg"
              fieldName="name"
              value={task.name}
              inputLabel="Edit column name"
              buttonLabel={`Edit column "${task.name}" name`}
            >
              <input type="hidden" name="intent" value="updateTask" />
              <input type="hidden" name="taskId" value={task.id} />
            </EditableText>
            {user.id === task.ownerId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVerticalIcon className="h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-20">
                  <DropdownMenuLabel>Task Control</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <fetcher.Form
                      method="post"
                      action={$path('/app/workplace/:workplaceId/projects/:projectId/removeTask', {
                        workplaceId,
                        projectId
                      })}
                      className="my-auto"
                    >
                      <input type="hidden" name="intent" value="removeTask" />
                      <input type="hidden" name="taskId" value={task.id} />
                      <button aria-label="Delete Task" type="submit" className="w-full">
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </button>
                    </fetcher.Form>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
          <div className="flex items-center gap-6 mt-4 text-muted-foreground text-xs">
            <div>Status</div>
            <div>{task.column.name}</div>
          </div>
          <div className="flex items-center gap-6 mt-2 text-muted-foreground text-xs">
            <P>Assignees </P>
            <div className="flex gap-2 flex-wrap">
              {task.assigness.map((i) => {
                const user = workplaceData?.workplaceMembers?.find((member) => member.userId === i.userId)?.user;
                return (
                  <div key={i.userId} className="flex items-center gap-1">
                    <Avatar>
                      <AvatarImage src={user?.imageUrl || ''} alt="avatar" />
                      <AvatarFallback>{user && user.name ? user?.name[0] : null}</AvatarFallback>
                    </Avatar>
                    <div>{user?.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <P className="text-sm mb-4 mt-6">Content</P>

        <P className="text-sm">{task.content}</P>

        <div className="mt-8">
          <Tabs defaultValue="timesheets">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="timesheets">
              <div className="mt-4">
                {task.timesheets
                  ? task.timesheets
                      .sort((a, b) => {
                        const dateA = new Date(a.startTime);
                        const dateB = new Date(b.startTime);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((timesheet) => {
                        const timesheetUser = workplaceData?.workplaceMembers?.find(
                          (member) => member.userId === timesheet.userId
                        )?.user;

                        return (
                          <Card className="p-6 mb-2" key={timesheet.startTime}>
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                              {timesheetUser ? (
                                <Avatar>
                                  <AvatarImage src={timesheetUser.imageUrl || ''} alt="avatar" />
                                  <AvatarFallback>
                                    {timesheetUser && timesheetUser.name ? timesheetUser.name[0] : ''}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                timesheet.userId
                              )}
                              <p>New Timesheet</p>
                              <p>{timesheet.startTime}</p>
                              {'-'}
                              <p>{timesheet.stopTime ? timesheet.stopTime : null}</p>
                            </div>
                            <div className="text-sm mt-2">{timesheet.description}</div>
                          </Card>
                        );
                      })
                  : null}
              </div>
            </TabsContent>
            <TabsContent value="comments">
              <Form className="mb-2 mt-4" method="post">
                <Card className="p-6">
                  <span className="text-xs font-semibold ">Comment</span>
                  <div className="mt-2 gap-2 flex w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl || ''} alt="avatar" />
                      <AvatarFallback className="text-muted-foreground">
                        {user && user.name ? user.name[0] : ''}
                      </AvatarFallback>
                    </Avatar>
                    <Textarea name="description" rows={2} />
                    <input type="hidden" name="intent" value="insertComment" />
                  </div>
                  <div className="flex justify-end">
                    <Button className="mt-2" variant="outline" size="sm">
                      Post
                    </Button>
                  </div>
                </Card>
              </Form>
              <div className="mt-4">
                {task.comments
                  ? task.comments.map((comment) => {
                      const commentUser = workplaceData?.workplaceMembers?.find(
                        (member) => member.userId === comment.userId
                      )?.user;

                      return (
                        <Card className="p-6 mb-2" key={comment.id}>
                          <div className="flex justify-between">
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                              {commentUser ? (
                                <Avatar>
                                  <AvatarImage src={commentUser.imageUrl || ''} alt="avatar" />
                                  <AvatarFallback>
                                    {commentUser && commentUser.name ? commentUser.name[0] : ''}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                comment.userId
                              )}
                              <p>New Comment</p>
                              <p>{new Date(comment.createdAt).toUTCString()}</p>
                            </div>

                            {user.id === comment.userId ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <EllipsisVerticalIcon className="h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-20">
                                  <DropdownMenuLabel>Comment</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <Form method="post" className="my-auto">
                                      <input type="hidden" name="intent" value="removeComment" />
                                      <input type="hidden" name="commentId" value={comment.id} />
                                      <button aria-label="Remove comment" type="submit" className="w-full">
                                        <DropdownMenuItem>Remove</DropdownMenuItem>
                                      </button>
                                    </Form>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : null}
                          </div>

                          <div className="text-sm mt-2">{comment.description}</div>
                        </Card>
                      );
                    })
                  : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TaskRoute;
