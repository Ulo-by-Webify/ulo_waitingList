-- Least-privilege database user for the running app (run once as the `postgres` owner).
-- The app then connects as `ulo_app`; keep the owner URL only for `npm run db:migrate`.
--
--   1. Replace CHANGE_ME with a long random password (e.g. `openssl rand -base64 32`).
--   2. Run this file against the database (Railway → Postgres → Data → Query, or psql).
--   3. Set the app's DATABASE_URL to postgresql://ulo_app:<password>@<host>:<port>/railway
--      and keep the owner URL in a separate MIGRATION_DATABASE_URL for schema changes.

CREATE ROLE ulo_app LOGIN PASSWORD 'CHANGE_ME' NOSUPERUSER NOCREATEDB NOCREATEROLE;

GRANT CONNECT ON DATABASE railway TO ulo_app;
GRANT USAGE ON SCHEMA public TO ulo_app;

-- Read/write data only: no DDL, no TRUNCATE, no access to other schemas.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  waitlist_signups, newsletter_subscribers, admin_users,
  page_views, journal_categories, journal_posts
TO ulo_app;

-- Tables created later by migrations get the same rights automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ulo_app;
