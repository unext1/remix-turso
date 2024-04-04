import { type LoaderFunctionArgs } from '@remix-run/node';
import { $path } from 'remix-routes';
import { authenticator } from '~/services/auth.server';

export function loader({ request }: LoaderFunctionArgs) {
  return authenticator.authenticate('google', request, {
    failureRedirect: $path('/login'),
    successRedirect: $path('/app')
  });
}
