import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { H4 } from '~/components/ui/typography';

import { requireUser } from '~/services/auth.server';
import { getInvitations } from '~/services/invitations.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const invitations = await getInvitations({ email: user.email });

  return json({ invitations });
};

const InvitationPage = () => {
  const { invitations } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div>
      <H4 className="tracking-wide mb-6">Invitations</H4>

      <Card className="p-6">
        <Table>
          <TableCaption>Your Invitations</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Workplace</TableHead>
              <TableHead> Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations
              ? invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">Pending</TableCell>
                    <TableCell className="font-medium capitalize">{invitation.workplace?.name}</TableCell>
                    <TableCell>{invitation?.email}</TableCell>
                    <TableCell className="flex justify-end">
                      <fetcher.Form method="post" action={$path('/api/workplace/invitation')}>
                        <input type="hidden" name="invitationId" value={invitation.id || ''} />
                        <input type="hidden" name="workplaceId" value={invitation.workplaceId || ''} />
                        <Button variant="default" name="_action" value="accept" className="mr-4" size="sm">
                          √
                        </Button>
                        <Button variant="destructive" name="_action" value="decline" size="sm">
                          X
                        </Button>
                      </fetcher.Form>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default InvitationPage;
