import { createCookieSessionStorage } from '@remix-run/node';
import { CSRF } from 'remix-utils/csrf/server';
import { createTypedCookie } from 'remix-utils/typed-cookie';
import { z } from 'zod';

import { cookie } from './shared';
import { env } from './env.server';

export const csrf = new CSRF({
  cookie: cookie('_csrf'),
  secret: env.CSRF_SECRET
});

export const sessionCookie = createTypedCookie({
  cookie: cookie('_session'),
  schema: z.string()
});

export const notifications = createCookieSessionStorage({
  cookie: cookie('_flash')
});
