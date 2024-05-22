import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useLoaderData, useLocation, useNavigation } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { CustomForm } from '~/components/custom-form';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { useToast } from '~/components/ui/use-toast';
import { db } from '~/db';
import { userTable } from '~/db/schema';

import { requireUser } from '~/services/auth.server';

const schema = z.object({
  name: z.string()
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  return json({ user });
};

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  await db.update(userTable).set({ name: submission.value.name }).where(eq(userTable.id, user.id));

  return json(submission.reply());
}

const ProfilePage = () => {
  const { user } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  const $form = useRef<HTMLFormElement>(null);

  const lastResult = useActionData<typeof action>();

  const [form, { name }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  const navigation = useNavigation();
  const nameChange = navigation.formData?.get('intent') === 'changeName';
  // const fetcher = useFetcher<typeof imageAction>();
  // const imageUpload = fetcher.formData?.get('intent') === 'uploadImage';
  useEffect(() => {
    if (lastResult?.initialValue?.name) {
      $form.current?.reset();
      toast({
        title: 'Name Change',
        description: `Your name has been changed to ${lastResult?.initialValue?.name}`
      });
    }
  }, [lastResult, toast]);

  return (
    <div>
      <H4 className="tracking-wide mb-6">Profile</H4>

      <Card className="p-6">
        <div className="flex space-x-2 mb-6">
          <img
            alt={user.name?.charAt(0) || 'P'}
            src={user.imageUrl || ''}
            className="h-8 w-8 my-auto rounded-full text-center"
          />
          <div className="flex flex-col justify-center">
            <div className="font-semibold capitalize">{user.name}</div>
            <div className="uppercase text-xs">{user.email}</div>
          </div>
        </div>

        <div className="space-y-4 ">
          <CustomForm method="post" {...getFormProps(form)} ref={$form}>
            <input type="hidden" name="intent" value="changeName" />
            <Label className="mb-1" htmlFor="name">
              Name
            </Label>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input {...getInputProps(name, { type: 'text' })} placeholder="Name" className="md:w-fit" required />

              <Button type="submit" variant="default" size="sm">
                {nameChange ? 'Changing...' : 'Change'}
              </Button>
            </div>
            {name.errors && <p className="text-red-400 mt-2 uppercase text-sm">{name.errors}</p>}
          </CustomForm>
          {/* <fetcher.Form
            method="post"
            encType="multipart/form-data"
            action={$path('/api/images/:userId/profile-image', { userId: user.id })}
            key={location.key}
          >
            <input type="hidden" name="intent" value="uploadImage" />

            <Label className="mb-1" htmlFor="image">
              Update Profile Image
            </Label>

            <Input type="file" name="image" accept="image/png, image/jpeg" className="w-1/3" />
            {fetcher.data ? <P className="text-red-400 mt-1">{fetcher.data.error}</P> : null}

            <Button variant="default" type="submit" size="sm" className="mt-2">
              {imageUpload ? 'Uploading...' : 'Upload'}
            </Button>
          </fetcher.Form> */}
        </div>
      </Card>
    </div>
  );
};
export default ProfilePage;
