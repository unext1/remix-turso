import { sql, type BuildColumns } from 'drizzle-orm';
import { sqliteTable, text, type SQLiteColumnBuilderBase, type SQLiteTableExtraConfig } from 'drizzle-orm/sqlite-core';

const commonColumns = {
  id: text('id')
    .primaryKey()
    .default(sql`(uuid4())`),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
};

export const publicId = text('public_id')
  .default(sql`(lower(hex(randomblob(4))))`)
  .unique()
  .notNull();

export const abstractTable = <TTableName extends string, ColumnsMap extends Record<string, SQLiteColumnBuilderBase>>(
  name: TTableName,
  columns: ColumnsMap,
  extraConfig?: (self: BuildColumns<TTableName, ColumnsMap & typeof commonColumns, 'sqlite'>) => SQLiteTableExtraConfig
) => {
  return sqliteTable(
    name,
    {
      ...commonColumns,
      ...columns
    },
    extraConfig
  );
};
