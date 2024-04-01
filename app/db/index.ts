import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import { env } from "~/services/env.server";
import * as orgSchema from "./schema-workplace";
import * as schema from "./schema";

const client = createClient({ url: `http://${env.LIBSQL_URL}` });
export const db = drizzle(client, { schema });

export const orgDb = (organizationId: string) => {
  const orgClient = createClient({
    url: `http://${organizationId}.${env.LIBSQL_URL}`,
  });
  return drizzle(orgClient, { schema: orgSchema });
};

export const createDatabase = async (dbName: string) => {
  const result = await fetch(
    `http://${env.LIBSQL_ADMIN_URL}/v1/namespaces/${dbName}/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
  );
  // todo: handle errors
  // const message = await result.json();
  // console.error(message);

  return result.status === 200;
};

export const createOrgDatabase = async (organizationId: string) => {
  try {
    const created = await createDatabase(organizationId);
    if (created) {
      await migrateOrganizationDb(organizationId);
    }
  } catch (err) {
    console.error(err);
  }
};

const migrateOrganizationDb = async (organizationId: string) => {
  const database = orgDb(organizationId);
  await migrate(database, { migrationsFolder: "./app/db/migrations-org" });
};
