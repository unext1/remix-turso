import { migrate } from 'drizzle-orm/libsql/migrator';

import { db, workplaceDb } from './index';

const MIGRATION_FOLDER = './app/db/migrations-workplace';

const migrateAllWorkplaceDbs = async () => {
  const getAllWorkplaces = await db.query.workplaceTable.findMany();

  const workpalceIds = getAllWorkplaces.map((w) => w.id);

  console.log('migrating...');
  for (const workplaceId of workpalceIds) {
    await migrate(workplaceDb(workplaceId), { migrationsFolder: MIGRATION_FOLDER });
  }
  console.log('migration done');
};

void migrateAllWorkplaceDbs();
