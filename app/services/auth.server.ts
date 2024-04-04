import { redirect, type Params } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { $params, $path } from 'remix-routes';

import { db } from '~/db';
import { userTable } from '../db/schema';
import { nowUTC } from '../utils/date';
import { env } from './env.server';
import { sessionStorage } from './session.server';

export const authenticator = new Authenticator<string | undefined>(sessionStorage, {
  throwOnError: true
});

export const createOrUpdateUser = async ({
  email,
  name,
  imageUrl
}: {
  email: string;
  name?: string;
  imageUrl?: string;
}) => {
  try {
    const newUser = await db
      .insert(userTable)
      .values({
        email,
        name,
        imageUrl
      })
      .onConflictDoUpdate({ target: [userTable.email], set: { updatedAt: nowUTC() } })
      .returning({ id: userTable.id });

    return newUser[0].id;
  } catch (error) {
    console.error(error);
    return;
  }
};

export type UserType = Awaited<ReturnType<typeof getUser>>;
const getUser = async ({ userId }: { userId: string }) => {
  if (!userId) {
    return undefined;
  }

  const user = await db.query.userTable.findFirst({
    with: {
      memberOfWorkplace: true,
      ownerOfWorkplace: true,
      invitations: true
    },
    where: eq(userTable.id, userId)
  });

  return user;
};

export type SessionUser = Awaited<ReturnType<typeof requireUser>>;

export const requireUser = async ({ request, params }: { request: Request; params: Params }) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) throw redirect($path('/'));

  const sessionUser = await getUser({ userId: userId });
  if (!sessionUser) return await authenticator.logout(request, { redirectTo: $path('/login') });

  const { workplaceId } = $params('/app/workplace/:workplaceId', params);
  if (workplaceId) {
    const userWorkplaces = sessionUser?.memberOfWorkplace.map((workplace) => workplace.workplaceId);

    if (!userWorkplaces?.includes(workplaceId)) {
      throw redirect($path('/app'));
    }
  }

  return sessionUser;
};

const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${env.SITE_URL}/auth/google/callback`
  },
  ({ profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return createOrUpdateUser({
      email: profile.emails[0].value,
      name: profile.name.givenName,
      imageUrl: profile.photos?.[0]?.value
    });
  }
);

authenticator.use(googleStrategy);
