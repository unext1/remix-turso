import { migrate } from "drizzle-orm/libsql/migrator";

import { env } from "~/services/env.server";
import { createDatabase, db } from "./index";

const DEFAULT_DB_NAME = "default";
const MIGRATION_FOLDER = "./app/db/migrations";

const migrateAdminDb = async () => {
  try {
    console.log(`checking if '${DEFAULT_DB_NAME}' db exists`);
    const result = await fetch(
      `http://${env.LIBSQL_ADMIN_URL}/v1/namespaces/${DEFAULT_DB_NAME}/config`
    ).then((res) => res.json());
    if ("error" in result) {
      console.log(`creating '${DEFAULT_DB_NAME}' db`);
      await createDatabase(DEFAULT_DB_NAME);

      console.log(`seeding '${DEFAULT_DB_NAME}' db`);
      await seedAdminDb();
    }

    console.log(`migrating '${DEFAULT_DB_NAME}' db`);
    await migrate(db, { migrationsFolder: MIGRATION_FOLDER });

    console.log("done");
  } catch (err) {
    console.error(err);
  }
};

const seedAdminDb = async () => {
  // todo
};

void migrateAdminDb();
