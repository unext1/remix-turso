import { type LoaderFunctionArgs, json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { LayoutDashboard, MailIcon, UserIcon } from 'lucide-react';

import { AppLayout as Layout } from '~/components/layout';
import { requireUser } from '~/services/auth.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser({ request, params });
  return json({ user });
};

const appLinks = [
  { icon: LayoutDashboard, label: 'Overview', href: '/app' },
  { icon: MailIcon, label: 'Invitations', href: '/app/invitations' },
  { icon: UserIcon, label: 'Profile', href: '/app/profile' }
];

const AppLayout = () => {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Layout user={user} appLinks={appLinks}>
      <Outlet />
    </Layout>
  );
};

export default AppLayout;
