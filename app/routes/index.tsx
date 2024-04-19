import { TwitterLogoIcon } from '@radix-ui/react-icons';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, json, useLoaderData, type MetaFunction } from '@remix-run/react';
import { MailIcon, MouseIcon } from 'lucide-react';
import { $path } from 'remix-routes';
import { Navbar } from '~/components/navbar';

import { buttonVariants } from '~/components/ui/button';
import { authenticator } from '~/services/auth.server';
import { cn } from '~/utils';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await authenticator.isAuthenticated(request);

  if (userId == '') {
    return await authenticator.logout(request, {
      redirectTo: '/'
    });
  }

  return json({ userId });
};

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  const { userId } = useLoaderData<typeof loader>();
  return (
    <div>
      <Navbar userId={userId || null} />

      <section className="pb-16 pt-36 lg:pt-48 lg:pb-20 ">
        <div
          className="container flex max-w-[54rem] opacity-0 animate-fade-up flex-col items-center gap-5 text-center"
          style={{ animationFillMode: 'forwards' }}
        >
          <Link
            to="https://twitter.com/lauvadev"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), '')}
          >
            Follow us on <TwitterLogoIcon className="w-6 h-4 mt-2 pl-1 my-auto" />
          </Link>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Field Service App To Control{' '}
            <span className="relative bg-gradient-to-r from-red-400 to-red-600 bg-clip-text font-extrabold text-transparent">
              Your Buisness
            </span>
          </h1>

          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae ut aut perferendis repudiandae debitis quidem
            voluptatum pariatur.
          </p>

          <div className="flex justify-center space-x-2 md:space-x-4">
            <Link to="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-4')}>
              <MailIcon className="w-4 h-4" />
              <p className="pl-2">
                <span className="hidden sm:inline-block">Lets explore</span> FS
              </p>
            </Link>
            <Link
              to={userId ? $path('/app') : $path('/login')}
              className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'px-4')}
            >
              <MailIcon className="w-4 h-4" />
              <p className="pl-2 ">{userId ? 'Go to App' : 'Login'}</p>
            </Link>
          </div>
          <a href="#skills" className="flex mt-8 text-sm animate-bounce text-muted-foreground">
            <MouseIcon className="w-4 -mt-0.5" /> Scroll to see more content
          </a>
        </div>
      </section>
      <section className="pb-20">
        <img src="/bg.png" alt="bg of project" className="mx-auto max-w-5xl rounded-xl border-2" />
      </section>
    </div>
  );
}
