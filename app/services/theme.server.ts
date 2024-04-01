import { createCookie } from '@remix-run/node';
import { createTypedCookie } from 'remix-utils/typed-cookie';
import { z } from 'zod';

import { YEAR } from './shared';

export const themeSchema = z.enum(['light', 'dark', 'system']).optional();
type Theme = z.infer<typeof themeSchema>;

const themeCookie = createCookie('user-theme', {
  path: '/',
  maxAge: YEAR
});

const userThemeCookie = createTypedCookie({ cookie: themeCookie, schema: themeSchema });

export const getTheme = async (request: Request) => {
  const theme = await userThemeCookie.parse(request.headers.get('Cookie'));
  if (!theme) return 'system';
  return theme;
};

export const setTheme = (theme: Theme) => {
  return userThemeCookie.serialize(theme);
};
