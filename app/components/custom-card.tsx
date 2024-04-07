import { Link, useFetcher } from '@remix-run/react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { $path } from 'remix-routes';

type CardTypes = {
  name?: string | null;
  workplaceId: string;
  projectId?: string;
  ownerId: string;
  userId: string;
  userEmail: string;
};
export const CustomCard = ({ name, workplaceId, projectId, ownerId, userId, userEmail }: CardTypes) => {
  return (
    <Card>
      <CardHeader>
        <div className="w-full justify-between flex">
          <CardTitle className="capitalize my-auto">{name}</CardTitle>
          <CardFormDialog isOwner={ownerId === userId} name={name} projectId={projectId} workplaceId={workplaceId} />
        </div>

        <CardDescription>Invite your team members to collaborate.</CardDescription>
      </CardHeader>
      <CardContent className=" ">
        <div className="flex items-center justify-between space-x-4 rounded">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium leading-none">{userEmail}</p>
            </div>
          </div>
        </div>
        {projectId ? (
          <div className="flex flex-col mt-6">
            <Link
              to={$path('/app/workplace/:workplaceId/projects/:projectId', {
                projectId: projectId || '',
                workplaceId: workplaceId
              })}
            >
              <Button className="w-full" variant="default">
                Enter project
              </Button>
            </Link>

            {ownerId === userId ? (
              <Link
                className="mt-4"
                to={$path('/app/workplace/:workplaceId/projects/:projectId/settings', {
                  projectId: projectId || '',
                  workplaceId: workplaceId
                })}
              >
                <Button className="w-full" variant="secondary">
                  Project settings
                </Button>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="w-full mt-6">
            <Link
              to={$path('/app/workplace/:workplaceId', {
                workplaceId: workplaceId
              })}
            >
              <Button className="w-full" variant="default">
                Enter Workplace
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CardFormDialog = ({
  name,
  projectId,
  workplaceId,
  isOwner
}: {
  name?: string | null;
  projectId?: string;
  workplaceId: string;
  isOwner: boolean;
}) => {
  const fetcher = useFetcher();

  return (
    <>
      {isOwner ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              X
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remove {projectId ? 'Project' : 'Workplace'}</DialogTitle>
              <DialogDescription>Are you really really sure you want to delete {name} ?</DialogDescription>
            </DialogHeader>
            <fetcher.Form method="post" action={$path(projectId ? '/api/project' : '/api/workplace')}>
              {projectId ? <Input type="hidden" name="projectId" value={projectId} /> : null}
              <Input type="hidden" name="workplaceId" value={workplaceId} />
              <Button type="submit" variant="destructive" name="_action" value="delete">
                Remove {projectId ? 'Project' : 'Workplace'}
              </Button>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              X
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Leave {projectId ? 'Project' : 'Workplace'}</DialogTitle>
              <DialogDescription>Are you really really sure you want to leave {name} ?</DialogDescription>
            </DialogHeader>
            <fetcher.Form method="post" action={$path(projectId ? '/api/project' : '/api/workplace')}>
              {projectId ? <Input type="hidden" name="projectId" value={projectId} /> : null}
              <Input type="hidden" name="workplaceId" value={workplaceId} />
              <Button type="submit" variant="destructive" name="_action" value="leave">
                Leave {projectId ? 'Project' : 'Workplace'} 😢
              </Button>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
