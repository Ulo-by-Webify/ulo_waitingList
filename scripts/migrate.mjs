// Applies db/schema.sql to DATABASE_URL. Usage: npm run db:migrate
// The whole file runs as one implicit transaction, so a failure leaves the database unchanged.
import { readFile } from "node:fs/promises";
import pg from "pg";
import { loadLocalEnv, pgConfig } from "./lib/pg-config.mjs";

loadLocalEnv();
const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const client = new pg.Client(pgConfig());

try {
  await client.connect();
  await client.query(sql);
  console.log("Migration applied.");
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
