import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { videos, waitlist } from "./schema";
import { ensureDataDirs, getPaths } from "./storage";

type Schema = { videos: typeof videos; waitlist: typeof waitlist };

let dbInstance: BetterSQLite3Database<Schema> | undefined;

function ensureWaitlistColumns(sqlite: Database.Database) {
  const cols = new Set(
    sqlite.prepare("PRAGMA table_info(waitlist)").all().map((row) => (row as { name: string }).name),
  );
  const needed: Record<string, string> = {
    survey_step: "INTEGER NOT NULL DEFAULT 0",
    use_case: "TEXT",
    use_case_other: "TEXT",
    current_tool: "TEXT",
    current_tool_other: "TEXT",
    frustration: "TEXT",
    frustration_other: "TEXT",
    share_with: "TEXT",
    price: "TEXT",
  };
  for (const [name, definition] of Object.entries(needed)) {
    if (!cols.has(name)) {
      sqlite.exec(`ALTER TABLE waitlist ADD COLUMN ${name} ${definition}`);
    }
  }
}

export function db() {
  if (dbInstance) {
    return dbInstance;
  }
  ensureDataDirs();
  const paths = getPaths();
  mkdirSync(paths.dataDir, { recursive: true });
  const sqlite = new Database(paths.db, { timeout: 5000 });
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      duration_sec INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      platform TEXT NOT NULL,
      survey_step INTEGER NOT NULL DEFAULT 0,
      use_case TEXT,
      use_case_other TEXT,
      current_tool TEXT,
      current_tool_other TEXT,
      frustration TEXT,
      frustration_other TEXT,
      share_with TEXT,
      price TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_platform ON waitlist (email, platform);
  `);
  ensureWaitlistColumns(sqlite);
  dbInstance = drizzle(sqlite, { schema: { videos, waitlist } });
  return dbInstance;
}
