import { DashboardIcon } from '@radix-ui/react-icons';
import { Form, Link, NavLink, useNavigate } from '@remix-run/react';
import { Menu, Package2, Search, type LucideProps, ArrowLeftIcon } from 'lucide-react';
import { type ForwardRefExoticComponent } from 'react';
import { $path } from 'remix-routes';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import { type UserType } from '~/services/auth.server';
import { cn } from '~/utils';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from './ui/breadcrumb';

type navLinksType = {
  icon: ForwardRefExoticComponent<LucideProps>;
  label: string;
  href: string;
}[];

const siteName = 'Field Service';

export const AppLayout = ({
  children,
  user,
  navLinks,
  appLinks
}: {
  children: React.ReactNode;
  user: UserType;
  navLinks?: navLinksType;
  appLinks?: navLinksType;
}) => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  return (
    <div className="grid w-full flex-1 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* DESKTOP SIDEBAR */}

      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-4 w-4" />
              <span className="">{siteName}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLinksComponent appLinks={appLinks} navLinks={navLinks} />
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>Unlock all features and get unlimited access to our support team.</CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          {/* MOBILE SIDEBAR */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-sm font-medium">
                <Link to="/" className="flex items-center mb-4 gap-2 text-md font-semibold">
                  <Package2 className="h-6 w-6" />
                  {siteName}
                </Link>
                <NavLinksComponent appLinks={appLinks} navLinks={navLinks} />
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>Unlock all features and get unlimited access to our support team.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          {/*  */}

          {/* TOP MENU */}
          <div className="w-full flex-1">
            <Button onClick={goBack} variant="default" size="sm">
              <ArrowLeftIcon className="w-3 h-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full uppercase">
                <img src={user?.imageUrl || ''} alt={user?.email.charAt(0) || ''} className="h-8 w-8 rounded-full" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>App</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/app">
                <DropdownMenuItem>Overview</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to={$path('/app/profile')}>
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Form method="post" action={$path('/auth/logout')}>
                  <button type="submit">Logout</button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* MAIN ELEMENT */}
        <main className="flex flex-1 gap-4 p-4 lg:gap-6 lg:p-6 flex-col bg-muted/40 bg-red">{children}</main>
      </div>
    </div>
  );
};

const NavLinksComponent = ({ appLinks, navLinks }: { appLinks?: navLinksType; navLinks?: navLinksType }) => {
  return (
    <>
      {appLinks && <span className="mb-2">App</span>}
      {appLinks
        ? appLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end={true}
              className={({ isActive }) =>
                cn({
                  'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary':
                    true,
                  ' text-white-content bg-secondary': isActive
                })
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))
        : null}

      {navLinks && <span className="mt-6 mb-2 font-semibold uppercase text-xs">Workplace</span>}
      {navLinks
        ? navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === ''}
              className={({ isActive }) =>
                cn({
                  'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary':
                    true,
                  ' text-white-content bg-secondary': isActive
                })
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))
        : null}
    </>
  );
};
