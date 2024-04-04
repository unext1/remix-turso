import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

import { env } from '~/services/env.server';
import * as schema from './schema';
import * as workplaceSchema from './schema-workplace';

const client = createClient({ url: `http://${env.LIBSQL_URL}` });
export const db = drizzle(client, { schema });

export const workplaceDb = (workplaceId: string) => {
  const workplaceClient = createClient({ url: `http://${workplaceId}.${env.LIBSQL_URL}` });

  return drizzle(workplaceClient, { schema: workplaceSchema });
};

export const createDatabase = async (dbName: string) => {
  const result = await fetch(`http://${env.LIBSQL_ADMIN_URL}/v1/namespaces/${dbName}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  // todo: handle errors
  // const message = await result.json();

  // console.log(result);

  return result.status === 200;
};

export const deleteDatabase = async (dbName: string) => {
  const result = await fetch(`http://${env.LIBSQL_ADMIN_URL}/v1/namespaces/${dbName}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  return result.status === 200;
};

export const createWorkplaceDb = async (workplaceId: string) => {
  try {
    const created = await createDatabase(workplaceId);
    console.log(created);
    if (created) {
      return await migrateWorkplaceDb(workplaceId);
    }
  } catch (err) {
    console.error(err);
  }
};

const migrateWorkplaceDb = async (workplaceId: string) => {
  const database = workplaceDb(workplaceId);

  await migrate(database, { migrationsFolder: './app/db/migrations-workplace' });
};
