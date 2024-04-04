import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigation } from '@remix-run/react';
import { $params } from 'remix-routes';

import { Card } from '~/components/ui/card';
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
    <div>
      <H4 className="tracking-wide mb-6">Dashboard</H4>
      <Card className="p-6">
        <pre>{JSON.stringify(workplace, null, 4)}</pre>
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
