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

export const notifications = () => {
  return createCookieSessionStorage({
    cookie: cookie('_flash')
  });
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: ['s3cr3t'], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production' // enable this in prod only
  }
});

export const { getSession, commitSession, destroySession } = sessionStorage;
