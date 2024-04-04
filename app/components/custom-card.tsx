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
  const fetcher = useFetcher();
  return (
    <Card>
      <CardHeader>
        <div className="w-full justify-between flex">
          <CardTitle className="capitalize my-auto">{name}</CardTitle>
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
        </div>

        <CardDescription>Invite your team members to collaborate.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 ">
        <div className="flex items-center justify-between space-x-4 rounded">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium leading-none">{userEmail}</p>
            </div>
          </div>
        </div>
        {projectId ? (
          <div className={ownerId === userId ? 'flex justify-between' : 'w-full'}>
            <Link
              to={$path('/app/workplace/:workplaceId/projects/:projectId', {
                projectId: projectId || '',
                workplaceId: workplaceId
              })}
            >
              <Button className="w-full" variant="secondary">
                Enter project
              </Button>
            </Link>

            {ownerId === userId ? (
              <Link
                to={$path('/app/workplace/:workplaceId/projects/:projectId/settings', {
                  projectId: projectId || '',
                  workplaceId: workplaceId
                })}
              >
                <Button className="w-full">Project settings</Button>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="w-full">
            <Link
              to={$path('/app/workplace/:workplaceId', {
                workplaceId: workplaceId
              })}
            >
              <Button className="w-full" variant="secondary">
                Enter Workplace
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
