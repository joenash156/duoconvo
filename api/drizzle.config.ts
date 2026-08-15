import { defineConfig } from "drizzle-kit";
import { env } from "./src/configs/env";

if (!env?.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run drizzle-kit commands");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});