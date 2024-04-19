import { Link, NavLink } from '@remix-run/react';
import { Package2 } from 'lucide-react';
import { $path } from 'remix-routes';
import { Button } from './ui/button';
import { cn } from '~/utils';

export const Navbar = ({ userId }: { userId?: string | null }) => {
  return (
    <div className="flex flex-col w-full fixed z-50 backdrop-blur-[8px] supports-[backdrop-filter]:bg-background/80 ">
      <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1 flex items-center">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-4 w-4" />
            <span className="">Field Service</span>
          </Link>
          <div className="pl-8 gap-6 flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn({
                  'text-muted-foreground text-sm hover:text-primary': true,
                  'text-white-content': isActive
                })
              }
            >
              Home
            </NavLink>
          </div>
        </div>
        <Button>
          <Link to={$path('/app')}>{userId ? 'Go To App' : 'Login'}</Link>
        </Button>
      </header>
    </div>
  );
};
