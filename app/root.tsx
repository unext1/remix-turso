import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRouteError
} from '@remix-run/react';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';
import { type ReactNode } from 'react';
import { type LoaderFunctionArgs } from '@remix-run/node';

import { csrf } from './services/session.server';
import { getTheme } from './services/theme.server';
import styles from './tailwind.css?url';
import { Toaster } from './components/ui/toaster';

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const [csrfToken, cookieHeader] = await csrf.commitToken(request);
  const colorScheme = await getTheme(request);

  return json({ csrfToken, colorScheme }, { headers: { 'Set-Cookie': cookieHeader || '' } });
};

export default function App() {
  return <Outlet />;
}

export const Layout = ({ children }: { children: ReactNode }) => {
  const { colorScheme, csrfToken } = useLoaderData<typeof loader>() || {};
  return (
    <html
      lang="en"
      style={{ colorScheme }}
      data-theme={colorScheme}
      className="antialiased min-h-screen-safe h-screen-safe"
    >
      <head>
        <title>My App</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen-safe h-screen-safe flex flex-col">
        <AuthenticityTokenProvider token={csrfToken}>
          <Toaster />
          {children}
        </AuthenticityTokenProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="text-center">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  const errorMessage =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'Unknown error';

  return (
    <div className="text-center">
      <h1>Error!</h1>
      <p>{errorMessage}</p>
    </div>
  );
};
