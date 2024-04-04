import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionData, useLoaderData } from '@remix-run/react';

import { eq } from 'drizzle-orm';
import { $params } from 'remix-routes';
import { z } from 'zod';

import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/node';
import { CustomForm } from '~/components/custom-form';
import { DataTable } from '~/components/data-table';
import { columns } from '~/components/data-table/columns';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { db } from '~/db';
import { workplaceInvitationTable, workplaceMemberTable } from '~/db/schema';
import { requireUser } from '~/services/auth.server';

const schema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  intent: z.string().min(1, 'Intent is required')
});

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser({ request, params });
  const formData = await request.formData();
  const intent = formData.get('intent');

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

  await db.insert(workplaceInvitationTable).values({
    email: submission.value.email,
    workplaceId: workplaceId
  });

  return json(submission.reply({ resetForm: true }));
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser({ request, params });
  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const workplaceMembers = await db.query.workplaceMemberTable.findMany({
    where: eq(workplaceMemberTable.workplaceId, workplaceId),
    with: {
      user: true,
      workplace: {
        columns: {
          ownerId: true
        }
      }
    }
  });

  const tableUsers = workplaceMembers.map((member) => ({
    name: member.user.name,
    email: member.user.email,
    role: member.workplace.ownerId === member.userId ? 'owner' : 'user'
  }));

  return json({
    users: tableUsers
  });
}

const TeamPage = () => {
  const { users } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  const [form, { email }] = useForm({
    lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onBlur'
  });

  return (
    <div>
      <H4 className="tracking-wide mb-6">Team</H4>

      <Card className="p-6 flex-col space-y-8 flex ">
        <DataTable data={users} columns={columns} />
      </Card>

      <H4 className="tracking-wide mb-6 mt-12">Invite Member</H4>

      <Card className="p-6">
        <CustomForm method="post" className="" {...getFormProps(form)}>
          <div>
            <input type="hidden" name="intent" value="inviteMember" />

            <Label htmlFor={email.id} className="text-xs uppercase">
              email
            </Label>
            <Input {...getInputProps(email, { type: 'text' })} />
            {email.errors && <p className="text-red-400 mt-2 uppercase text-sm">{email.errors}</p>}
          </div>
          <div className="flex mt-4">
            <Button type="submit">Invite</Button>
          </div>
        </CustomForm>
      </Card>
    </div>
  );
};

export default TeamPage;
