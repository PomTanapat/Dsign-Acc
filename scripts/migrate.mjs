// Self-bootstrapping production migrator — run on deploy (railway.json).
//
// Why this exists: the production database predates the drizzle/ migrations
// folder (its schema was applied with `drizzle-kit push`). On the first run
// against such a database the baseline migration (full CREATE TABLEs) must
// be SKIPPED, not executed. This script detects that case — pre-existing
// tables and an empty migrations journal — marks the baseline as applied,
// then runs the normal migrator. Against a fresh/empty database it simply
// applies every migration from scratch, so local dev keeps working too.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const migrationsFolder = path.resolve("drizzle");
const sql = postgres(url, { max: 1 });

async function bootstrapBaselineIfNeeded() {
  const journal = JSON.parse(
    readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8"),
  );
  const baseline = journal.entries[0];
  if (!baseline) return;

  const [{ exists: hasCompanies }] = await sql`
    select exists (
      select from information_schema.tables
      where table_schema = 'public' and table_name = 'companies'
    )`;
  if (!hasCompanies) return; // fresh database — let the migrator build it

  // Same DDL shape the drizzle migrator uses, so CREATE IF NOT EXISTS agree.
  await sql`create schema if not exists drizzle`;
  await sql`create table if not exists drizzle.__drizzle_migrations (
    id serial primary key,
    hash text not null,
    created_at numeric
  )`;
  const [{ count }] =
    await sql`select count(*)::int as count from drizzle.__drizzle_migrations`;
  if (count > 0) return; // already bootstrapped

  const file = readFileSync(
    path.join(migrationsFolder, `${baseline.tag}.sql`),
    "utf8",
  );
  const hash = createHash("sha256").update(file).digest("hex");
  await sql`insert into drizzle.__drizzle_migrations (hash, created_at)
            values (${hash}, ${baseline.when})`;
  console.log(
    `Baseline ${baseline.tag} marked as applied (pre-existing schema detected).`,
  );
}

try {
  await bootstrapBaselineIfNeeded();
  await migrate(drizzle(sql), { migrationsFolder });
  console.log("Migrations up to date.");
} finally {
  await sql.end();
}
