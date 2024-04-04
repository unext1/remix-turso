import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { $path } from 'remix-routes';
import { z } from 'zod';
import { CustomCard } from '~/components/custom-card';

import { CustomForm } from '~/components/custom-form';
import { Button } from '~/components/ui/button';
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
import { H4 } from '~/components/ui/typography';

import { requireUser } from '~/services/auth.server';
import { createWorkplace, getAllWorkplaces } from '~/services/workplace.server';

const schema = z.object({
  name: z.string(),
  ownerId: z.string()
});

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  const workplaceId = await createWorkplace({ user, submission });

  throw redirect($path('/app/workplace/:workplaceId', { workplaceId }));
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const workplaces = await getAllWorkplaces({ user });

  return json({ user, workplaces });
};

const AppPage = () => {
  const { user, workplaces } = useLoaderData<typeof loader>();

  const lastResult = useActionData<typeof action>();

  const [form, { name, ownerId }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  return (
    <div className="flex-1">
      <div className="flex justify-between">
        <H4 className="tracking-wide mb-6">Workplaces</H4>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              Create Workplace
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Workplace</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            <CustomForm method="post" className="grid gap-4 py-4" {...getFormProps(form)}>
              <div className="grid grid-cols-6 items-center gap-4">
                <Input {...getInputProps(ownerId, { type: 'text' })} type="hidden" value={user.id} />
                <Label htmlFor={name.id} className="text-right col-span-2 text-sm whitespace-nowrap w-fit">
                  Workplace Name
                </Label>
                <Input {...getInputProps(name, { type: 'text' })} placeholder="Workplace Name" className="col-span-4" />
                {name.errors && <p className="text-red-400 mt-2 uppercase text-sm">{name.errors}</p>}
              </div>
              <Button type="submit">Save changes</Button>
            </CustomForm>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {workplaces.map((workplace) => (
          <CustomCard
            name={workplace.name || ''}
            ownerId={workplace.ownerId}
            key={workplace.id}
            userId={user.id}
            workplaceId={workplace.id}
            userEmail={user.email}
          />
        ))}
      </div>
    </div>
  );
};

export default AppPage;
