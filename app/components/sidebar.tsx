import { Form, Link, NavLink } from '@remix-run/react';
import { BookIcon, LayoutDashboard, UserIcon, UsersIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { type UserType } from '~/services/auth.server';
import { cn } from '~/utils';
import { Button } from './ui/button';

export const Navigation = ({ user }: { user: UserType }) => {
  const navLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '' },
    { icon: UsersIcon, label: 'Team', href: 'team' },
    { icon: BookIcon, label: 'Projects', href: 'projects' },
    { icon: UserIcon, label: 'Profile', href: 'profile' }
  ];
  return (
    <nav className="overflow-auto flex-1 px-4 ">
      <div className="flex flex-col justify-between h-full">
        <div>
          <Link to="/app">
            <h2 className="text-neutral-50 font-bold text-2xl">
              <span className="text-red-400">Lauva</span>
              <span className="text-base">.Dev</span>
            </h2>
          </Link>

          <ul className="rounded-box space-y-1.5 mt-8">
            <li className="text-gray-300 font-semibold mb-4 text-xs uppercase">
              <span>Dashboard</span>
            </li>
            {navLinks.map((item) => {
              return (
                <Button asChild key={item.label}>
                  <NavigationItem href={item.href} end={item.href === ''}>
                    <item.icon aria-hidden="true" />
                    <span className="pl-3 font-semibold">{item.label}</span>
                  </NavigationItem>
                </Button>
              );
            })}
          </ul>
        </div>
        <div className="mb-4">
          <Form action="/auth/logout" method="post">
            <Button type="submit" className="w-full" variant="default">
              Logout
            </Button>
          </Form>
        </div>
      </div>
    </nav>
  );
};

const NavigationItem = ({ href, children, end = false }: { href: string; children?: ReactNode; end?: boolean }) => {
  return (
    <li className="group ">
      <NavLink
        to={href}
        end={end}
        className={({ isActive }) =>
          cn({
            'focus:ring-1 ring-offset-0 ring-white  flex py-2 rounded pl-3 text-sm border-l-4 border-transparent': true,
            ' text-white-content border-l-4 border-primary': isActive
          })
        }
      >
        {children}
      </NavLink>
    </li>
  );
};
