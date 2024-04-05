import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { BookIcon, LayoutDashboard, MailIcon, UserIcon, UsersIcon } from 'lucide-react';
import { $params } from 'remix-routes';

import { AppLayout as Layout } from '~/components/layout';
import { db } from '~/db';
import { requireUser } from '~/services/auth.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);

  const workplaceData = await db.query.workplaceTable.findFirst({
    with: {
      workplaceMembers: {
        with: {
          user: true,
          workplace: true
        }
      },
      owner: true,
      invitations: true
    },
    where: (workplace, { eq }) => eq(workplace.id, workplaceId)
  });

  return json({ user, workplaceData: { ...workplaceData, isOwner: workplaceData?.ownerId === user.id } });
};

const appLinks = [
  { icon: LayoutDashboard, label: 'Overview', href: '/app' },
  { icon: MailIcon, label: 'Invitations', href: '/app/invitations' },
  { icon: UserIcon, label: 'Profile', href: '/app/profile' }
];

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '' },
  { icon: UsersIcon, label: 'Team', href: 'team' },
  { icon: BookIcon, label: 'Projects', href: 'projects' }
];

const AppLayout = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Layout user={user} navLinks={navLinks} appLinks={appLinks}>
      <Outlet />
    </Layout>
  );
};

export default AppLayout;
