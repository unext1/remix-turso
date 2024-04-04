import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, json, useLoaderData, type MetaFunction } from '@remix-run/react';
import { MouseIcon } from 'lucide-react';
import { $path } from 'remix-routes';
import { Navbar } from '~/components/navbar';

import { Button } from '~/components/ui/button';
import { authenticator } from '~/services/auth.server';

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
      <Navbar userId={userId || ''} />
      <section className="space-y-6 h-screen flex justify-center items-center">
        <div className="container flex max-w-[54rem] flex-col items-center gap-5 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Field Service App To Controll
            <span className="pl-2 mr-2 relative bg-gradient-to-r from-red-400 to-red-700 bg-clip-text font-extrabold text-transparent">
              Your Business
            </span>
          </h1>
          <p className="text-muted-foreground tracking-wide text-lg max-w-[42rem]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem recusandae iure labore inventore,
            voluptatibus veritatis
          </p>
          <div className="flex gap-4">
            <Button size="lg">Get Started</Button>
            <Link to={$path('/login')}>
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
          </div>
          <a href="#skills" className="flex animate-bounce text-muted-foreground">
            <MouseIcon className="w-4 my-auto" /> Scroll to see more content
          </a>
        </div>
      </section>
      <section className="space-y-6 pb-12 pt-16 lg:py-52">
        <div className="container flex max-w-[54rem] flex-col items-center gap-5 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Revolutionize Your Financial Management
          </h1>
          <p className="text-muted-foreground tracking-wide text-lg max-w-[42rem]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem recusandae iure labore inventore,
            voluptatibus veritatis
          </p>
        </div>
      </section>
    </div>
  );
}
