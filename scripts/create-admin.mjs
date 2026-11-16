// Creates an admin, or resets the password if the email already exists.
// Usage:
//   npm run admin:create                      -> seeds ADMIN_EMAIL / ADMIN_PASSWORD from the environment
//   npm run admin:create -- admin@example.com -> generates a strong password and prints it once
// Hash format must match src/lib/server/passwords.ts.
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";
import { loadLocalEnv, pgConfig } from "./lib/pg-config.mjs";

loadLocalEnv();

const MIN_PASSWORD_LENGTH = 12;
const argEmail = process.argv[2]?.trim().toLowerCase();
const useEnv = !argEmail;
const email = argEmail || process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run admin:create -- admin@example.com  (or set ADMIN_EMAIL and ADMIN_PASSWORD)");
  process.exit(1);
}
if (useEnv && (process.env.ADMIN_PASSWORD ?? "").length < MIN_PASSWORD_LENGTH) {
  console.error(`ADMIN_PASSWORD must be set and at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

const N = 16384, R = 8, P = 1, KEY_LENGTH = 64;
const password = useEnv ? process.env.ADMIN_PASSWORD : randomBytes(15).toString("base64url");
const salt = randomBytes(16);
const hash = scryptSync(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
const passwordHash = `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;

const client = new pg.Client(pgConfig());
try {
  await client.connect();
  const existing = await client.query("SELECT id FROM admin_users WHERE lower(email) = $1", [email]);
  if (existing.rowCount) {
    const id = existing.rows[0].id;
    // A CLI reset is the break-glass path: clear lockouts and sign out every existing session.
    await client.query(
      "UPDATE admin_users SET password_hash = $1, password_changed_at = now(), failed_login_count = 0, locked_until = NULL WHERE id = $2",
      [passwordHash, id],
    );
    const revoked = await client.query("UPDATE admin_sessions SET revoked_at = now() WHERE admin_id = $1 AND revoked_at IS NULL", [id]);
    console.log(`Password reset for ${email} (${revoked.rowCount} session(s) signed out)`);
  } else {
    // CLI-created accounts are owners (the role column defaults to 'owner').
    await client.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)", [email, passwordHash]);
    console.log(`Admin created: ${email}`);
  }
  if (useEnv) {
    console.log("Password set from ADMIN_PASSWORD.");
  } else {
    console.log(`Password: ${password}`);
    console.log("Store it in a password manager — it will not be shown again.");
  }
} catch (error) {
  console.error("Failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
