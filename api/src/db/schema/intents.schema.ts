import { randomUUID } from "crypto";
import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const intents = mysqlTable("intents", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Intent = typeof intents.$inferSelect;
export type NewIntent = typeof intents.$inferInsert;
