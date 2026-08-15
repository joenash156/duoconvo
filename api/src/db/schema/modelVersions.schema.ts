import { randomUUID } from "crypto";
import { boolean, float, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const modelVersions = mysqlTable("model_versions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  modelName: varchar("model_name", { length: 150 }).notNull(),
  datasetVersion: varchar("dataset_version", { length: 50 }),
  trainingDate: timestamp("training_date"),
  accuracy: float("accuracy"),
  notes: text("notes"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ModelVersion = typeof modelVersions.$inferSelect;
export type NewModelVersion = typeof modelVersions.$inferInsert;
