import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "dev.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

const globalForDb = globalThis as unknown as { migrated?: boolean };

if (!globalForDb.migrated) {
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  globalForDb.migrated = true;
}
