-- Ulô schema. Idempotent: safe to run on a fresh database or re-run on an existing one.
-- `npm run db:migrate` sends this file as one batch, which Postgres runs in a single transaction.
-- All primary keys are UUIDs (gen_random_uuid() is built into PostgreSQL 13+).

-- ---------------------------------------------------------------------------
-- Waitlist & newsletter
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT        NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  email       TEXT        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  country     TEXT        NOT NULL CHECK (char_length(country) BETWEEN 1 AND 80),
  user_type   TEXT        NOT NULL CHECK (user_type IN ('guest', 'host', 'associate')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_email_key ON waitlist_signups (lower(email));
CREATE INDEX IF NOT EXISTS waitlist_signups_created_at_idx ON waitlist_signups (created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key ON newsletter_subscribers (lower(email));

-- ---------------------------------------------------------------------------
-- Admin accounts. Bumping session_version invalidates every existing session.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  full_name           TEXT        CHECK (char_length(full_name) <= 120),
  password_hash       TEXT        NOT NULL,
  session_version     INT         NOT NULL DEFAULT 1,
  password_changed_at TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON admin_users (lower(email));

-- ---------------------------------------------------------------------------
-- Cookieless page-view analytics. visitor_hash is an HMAC of IP + user agent with a
-- daily-rotating salt, so visitors can be counted per day but not tracked across days.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_views (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  path          TEXT        NOT NULL CHECK (char_length(path) BETWEEN 1 AND 512),
  referrer_host TEXT        CHECK (char_length(referrer_host) <= 255),
  utm_source    TEXT        CHECK (char_length(utm_source) <= 100),
  utm_medium    TEXT        CHECK (char_length(utm_medium) <= 100),
  utm_campaign  TEXT        CHECK (char_length(utm_campaign) <= 100),
  device        TEXT        NOT NULL CHECK (device IN ('desktop', 'mobile', 'tablet')),
  browser       TEXT        NOT NULL CHECK (char_length(browser) <= 40),
  os            TEXT        NOT NULL CHECK (char_length(os) <= 40),
  country       TEXT        CHECK (char_length(country) <= 2),
  visitor_hash  TEXT        NOT NULL CHECK (char_length(visitor_hash) = 64),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);

-- ---------------------------------------------------------------------------
-- Journal. Posts reference categories by name: renames cascade, and a category
-- still used by posts cannot be deleted. Posts tagged 'featured' feed the hero.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 60),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS journal_categories_name_lower_key ON journal_categories (lower(name));

CREATE TABLE IF NOT EXISTS journal_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 120),
  title         TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  excerpt       TEXT        NOT NULL CHECK (char_length(excerpt) <= 400),
  content       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  cover_image   TEXT        CHECK (char_length(cover_image) <= 1024),
  category      TEXT        NOT NULL REFERENCES journal_categories (name) ON UPDATE CASCADE ON DELETE RESTRICT,
  author_name   TEXT        NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 120),
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  status        TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_count   INT         NOT NULL DEFAULT 0 CHECK (share_count >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS journal_posts_slug_key ON journal_posts (slug);
CREATE INDEX IF NOT EXISTS journal_posts_published_idx ON journal_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS journal_posts_tags_idx ON journal_posts USING GIN (tags);

-- Likes: one per anonymous visitor per post. visitor_hash is an HMAC of a random cookie id,
-- so the table can't be linked back to a browser without the server secret.
CREATE TABLE IF NOT EXISTS journal_post_likes (
  post_id       UUID        NOT NULL REFERENCES journal_posts (id) ON DELETE CASCADE,
  visitor_hash  TEXT        NOT NULL CHECK (char_length(visitor_hash) = 64),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, visitor_hash)
);

-- Public comments. They show immediately; admins can hide or delete them.
CREATE TABLE IF NOT EXISTS journal_comments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID        NOT NULL REFERENCES journal_posts (id) ON DELETE CASCADE,
  author_name  TEXT        NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 60),
  body         TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status       TEXT        NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_comments_post_idx ON journal_comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS journal_comments_created_idx ON journal_comments (created_at DESC);

-- Editable site content (e.g. page images). One row per setting key; no row means "use the default".
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT        PRIMARY KEY CHECK (char_length(key) <= 64),
  value       TEXT        NOT NULL CHECK (char_length(value) <= 1024),
  updated_by  UUID        REFERENCES admin_users (id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- Upgrades for databases created by earlier versions of this file.
-- ===========================================================================

-- Columns added after admin_users was first created.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name TEXT CHECK (char_length(full_name) <= 120);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
ALTER TABLE journal_posts ADD COLUMN IF NOT EXISTS share_count INT NOT NULL DEFAULT 0 CHECK (share_count >= 0);

-- Category foreign key (earlier databases created journal_posts before categories existed).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'journal_posts'::regclass AND contype = 'f'
  ) THEN
    INSERT INTO journal_categories (name) SELECT DISTINCT category FROM journal_posts ON CONFLICT DO NOTHING;
    ALTER TABLE journal_posts
      ADD CONSTRAINT journal_posts_category_fkey FOREIGN KEY (category)
      REFERENCES journal_categories (name) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

-- BIGSERIAL -> UUID primary keys. No table references another by id, so each converts independently.
-- Existing rows get fresh random UUIDs; the old numeric ids (and their sequences) are dropped.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'waitlist_signups', 'newsletter_subscribers', 'admin_users',
    'page_views', 'journal_categories', 'journal_posts'
  ] LOOP
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = t AND column_name = 'id') = 'bigint' THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN uuid_id UUID NOT NULL DEFAULT gen_random_uuid()', t);
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, t || '_pkey');
      EXECUTE format('ALTER TABLE %I DROP COLUMN id', t);
      EXECUTE format('ALTER TABLE %I RENAME COLUMN uuid_id TO id', t);
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I PRIMARY KEY (id)', t, t || '_pkey');
      RAISE NOTICE 'Converted %.id to UUID', t;
    END IF;
  END LOOP;
END $$;

-- ===========================================================================
-- Auth hardening: roles, 2FA (TOTP), lockout, DB-backed sessions, reset/invite
-- tokens, persistent rate limits and a security audit log.
-- ===========================================================================

-- Roles: owner (everything + team), admin (everything but team), editor (journal + media).
-- Existing admins become owners.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_users_role_check') THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('owner', 'admin', 'editor'));
  END IF;
END $$;

-- 2FA: secrets are AES-256-GCM encrypted with DATA_ENCRYPTION_KEY. totp_last_step blocks code replay.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_secret_enc TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_pending_secret_enc TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_enabled_at TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_last_step BIGINT;

-- Lockout after repeated failures.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Sessions now live in admin_sessions; the per-user version counter is no longer used.
ALTER TABLE admin_users DROP COLUMN IF EXISTS session_version;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID        NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  pending_mfa   BOOLEAN     NOT NULL DEFAULT false,
  ip            TEXT        CHECK (char_length(ip) <= 64),
  user_agent    TEXT        CHECK (char_length(user_agent) <= 512),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS admin_sessions_admin_idx ON admin_sessions (admin_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS admin_recovery_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  code_hash   TEXT        NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_recovery_codes_admin_idx ON admin_recovery_codes (admin_id);

-- Single-use password-reset and invite links. Only a SHA-256 of the token is stored.
CREATE TABLE IF NOT EXISTS admin_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  purpose     TEXT        NOT NULL CHECK (purpose IN ('reset', 'invite')),
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_tokens_admin_idx ON admin_tokens (admin_id);

-- Fixed-window rate limits shared by every app instance and kept across restarts.
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key       TEXT        PRIMARY KEY,
  count     INT         NOT NULL,
  reset_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS security_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        REFERENCES admin_users (id) ON DELETE SET NULL,
  actor_id    UUID        REFERENCES admin_users (id) ON DELETE SET NULL,
  email       TEXT        CHECK (char_length(email) <= 254),
  event       TEXT        NOT NULL CHECK (char_length(event) <= 60),
  detail      TEXT        CHECK (char_length(detail) <= 500),
  ip          TEXT        CHECK (char_length(ip) <= 64),
  user_agent  TEXT        CHECK (char_length(user_agent) <= 512),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS security_events_admin_idx ON security_events (admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_created_idx ON security_events (created_at DESC);

-- ===========================================================================
-- Editable page content (the admin "Experiences" page). One JSON document per page,
-- validated by the app before it is written. Pages without a row use their built-in content.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS page_content (
  slug        TEXT        PRIMARY KEY CHECK (char_length(slug) <= 64),
  content     JSONB       NOT NULL CHECK (pg_column_size(content) <= 262144),
  updated_by  UUID        REFERENCES admin_users (id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
