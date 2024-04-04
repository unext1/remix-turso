import { Link } from '@remix-run/react';
import { Package2 } from 'lucide-react';
import { $path } from 'remix-routes';
import { Button } from './ui/button';

export const Navbar = ({ userId }: { userId?: string }) => {
  return (
    <header className="flex items-center h-14 border-b backdrop-blur-[8px] supports-[backdrop-filter]:bg-background/80 fixed z-50 w-full px-4 lg:h-[60px] lg:px-6">
      {/* TOP MENU */}
      <div className="w-full grid grid-cols-3 container mx-auto items-center">
        <div className="flex justify-start h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-4 w-4" />
            <span className="">Field Service</span>
          </Link>
        </div>
        <div className="flex justify-center">
          <Link to="/">Home</Link>
        </div>
        <div className="flex justify-end">
          <Link to={$path('/login')}>
            <Button variant="default">{userId !== '' ? 'Go To App' : 'Login'}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
