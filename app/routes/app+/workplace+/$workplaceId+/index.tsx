import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Activity, ArrowUpRight, CreditCard } from 'lucide-react';

import { $params, $path } from 'remix-routes';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';
import { requireUser } from '~/services/auth.server';
import { getWorkplace } from '~/services/workplace.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  // const userImages = await db.query.imageTable.findMany({
  //   where: eq(imageTable.userId, user.id)
  // });

  const workplace = await getWorkplace({ user, workplaceId });

  return json({ user, workplace });
};

const WorkplacePage = () => {
  const { user, workplace } = useLoaderData<typeof loader>();

  // const location = useLocation();
  // const { state } = useNavigation();
  // const fetcher = useFetcher<typeof imageAction>();

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
                <div className="text-2xl font-bold">62</div>
                <p className="text-xs text-muted-foreground">+64% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last hour</p>
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
                    <TableHead className="hidden xl:table-column">Type</TableHead>
                    <TableHead className="hidden xl:table-column">Status</TableHead>
                    <TableHead className="hidden xl:table-column">Date</TableHead>
                    <TableHead className="text-right">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Project Name</div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">Sale</TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant="outline">
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">2023-06-27</TableCell>
                    <TableCell className="text-right">info@lauva.dev</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        {/* <fetcher.Form method="post" encType="multipart/form-data" action={$path('/api/images')} key={location.key}>
          <Input type="file" required name="image" accept="image/png, image/jpeg" />
          {fetcher.data ? <P className="text-red-400 mt-1">{fetcher.data.error}</P> : null}

          <Button variant="default" type="submit" size="sm" className="mt-2">
            {state === 'submitting' ? 'Uploading...' : 'Upload'}
          </Button>
        </fetcher.Form> */}
      </Card>
      {/* {userImages.length >= 1 ? (
        <Card className="p-6 grid grid-cols-5 gap-6 mt-2">
          {userImages.map((image) => (
            <CustomForm
              method="delete"
              key={image.id}
              action={$path('/api/images/:imageId', { imageId: image.id })}
              navigate={false}
            >
              <input name="imageId" type="hidden" value={image.id} />
              <div className="relative rounded-md h-52">
                <Button className="absolute top-2 z-10 right-2" type="submit" size="sm" variant="destructive">
                  Delete
                </Button>
                <img
                  key={image.id}
                  src={$path('/api/images/:imageId', { imageId: image.id })}
                  alt=""
                  className="h-full object-cover w-full rounded-md"
                />
              </div>
            </CustomForm>
          ))}
        </Card>
      ) : null} */}
    </div>
  );
};
export default WorkplacePage;
