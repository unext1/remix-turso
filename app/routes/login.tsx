import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { $path } from 'remix-routes';
import { Button } from '~/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

import { authenticator } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('google', request, {
    successRedirect: $path('/app'),
    failureRedirect: $path('/login')
  });
}
export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: $path('/app')
  });
  return {};
}

export default function AuthenticationPage() {
  return (
    <div className="mx-auto container flex justify-center items-center flex-1">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form method="post">
              <Button type="submit" className="w-full">
                Google
              </Button>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
