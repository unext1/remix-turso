import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { $params } from 'remix-routes';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { useToast } from '~/components/ui/use-toast';
import { useEffect, useRef, useState } from 'react';

import { CustomForm } from '~/components/custom-form';
import { DataTable } from '~/components/data-table';
import { columns } from '~/components/data-table/columns';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { H4, P } from '~/components/ui/typography';
import { db } from '~/db';
import { workplaceInvitationTable } from '~/db/schema';
import { useAppDashboardData } from '~/hooks/routes-hooks';
import { requireUser } from '~/services/auth.server';

const schema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  intent: z.string().min(1, 'Intent is required')
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });
  return json({ user });
};

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const formData = await request.formData();

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200
    });
  }

  const ownerWorkplaces = user.ownerOfWorkplace.map((i) => i.id);
  if (!ownerWorkplaces.includes(workplaceId)) {
    throw Error('You are not the owner of this workplace');
  }

  await db
    .insert(workplaceInvitationTable)
    .values({
      email: submission.value.email,
      workplaceId: workplaceId
    })
    .onConflictDoNothing();

  return json(submission.reply());
}

const TeamPage = () => {
  const dashboardData = useAppDashboardData();

  const { toast } = useToast();

  const $form = useRef<HTMLFormElement>(null);

  const tableUsers = dashboardData?.workplaceMembers?.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    role: member.workplace.ownerId === member.userId ? 'owner' : 'user'
  }));

  const lastResult = useActionData<typeof action>();

  const [showError, setShowError] = useState<boolean>(false);
  const usersEmails = dashboardData?.workplaceMembers?.map((workplace) => workplace.user.email);

  const [form, { email }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  useEffect(() => {
    if (lastResult?.initialValue?.email) {
      $form.current?.reset();
      toast({
        title: 'Invited User',
        description: `User with email ${lastResult?.initialValue?.email}, has been invited`
      });
    }
  }, [lastResult, toast]);

  return (
    <div>
      <div className="flex justify-between">
        <H4 className="tracking-wide mb-6">Team</H4>
        {dashboardData?.isOwner ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>Enter email for member you want to add.</DialogDescription>
              </DialogHeader>

              <CustomForm method="post" className="grid gap-4 py-4" {...getFormProps(form)} ref={$form}>
                <div className="grid grid-cols-6 items-center gap-x-4 gap-y-2">
                  <input type="hidden" name="intent" value="inviteMember" />

                  <Label htmlFor={email.id} className="text-right col-span-2 text-sm whitespace-nowrap w-fit">
                    Member Email
                  </Label>

                  <Input
                    {...getInputProps(email, { type: 'text' })}
                    onChange={(e) => setShowError(!!usersEmails?.includes(e.target.value.toLowerCase()))}
                    className="col-span-4"
                  />
                </div>
                {showError ? (
                  <P className="text-destructive -mt-2 uppercase text-sm">This user already exists</P>
                ) : null}
                {email.errors && <p className="text-destructive -mt-2 uppercase text-sm">{email.errors}</p>}
                <Button type="submit" disabled={showError ? true : false}>
                  Invite
                </Button>
              </CustomForm>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Card className="p-6 flex-col space-y-8 flex ">
        <DataTable data={tableUsers ? tableUsers : []} columns={columns} />
      </Card>
    </div>
  );
};

export default TeamPage;
