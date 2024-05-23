import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { sql } from 'drizzle-orm';
import { ArrowUpRight } from 'lucide-react';

import { $params, $path } from 'remix-routes';
import { Button } from '~/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';
import { workplaceDb } from '~/db';
import { projectTaskTable } from '~/db/schema-workplace';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';
import { getAllMyProjects } from '~/services/project.server';
import { getWorkplace } from '~/services/workplace.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const workplace = await getWorkplace({ user, workplaceId });
  const projects = await getAllMyProjects({ user, workplaceId });
  const totalTaskCount = await workplaceDb(workplaceId)
    .select({ count: sql<number>`count(*)` })
    .from(projectTaskTable)
    .then((result) => result[0].count);

  return json({ user, workplace, projects, totalTaskCount });
};

const WorkplacePage = () => {
  const { user, projects, workplace, totalTaskCount } = useLoaderData<typeof loader>();

  const workplaceData = useAppDashboardData();

  return (
    <div className="flex-1">
      <H4 className="tracking-wide mb-6">Dashboard</H4>
      <Card className="p-6">
        <main className="flex flex-1 flex-col gap-">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTaskCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Projects</CardTitle>
                <CardDescription>Recent projects from your workplace.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to={$path('/app/workplace/:workplaceId/projects', { workplaceId: workplace?.id || '' })}>
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const projectOwner = workplaceData?.workplaceMembers?.find(
                      (member) => member.userId === project.ownerId
                    )?.user;
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.name}</div>
                        </TableCell>
                        <TableCell className="text-right">{projectOwner?.email}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </Card>
    </div>
  );
};
export default WorkplacePage;
