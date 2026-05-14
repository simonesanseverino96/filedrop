-- ============================================
-- VaultTransfer — Final Schema (v1 + v3 merged)
-- ============================================

-- ============================================
-- Enums
-- ============================================

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'pro', 'business');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Tables
-- ============================================

CREATE TABLE IF NOT EXISTS transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL,
  password_hash   TEXT,
  max_downloads   INT,
  download_count  INT NOT NULL DEFAULT 0,
  message         TEXT,
  sender_email    TEXT,
  total_size      BIGINT NOT NULL DEFAULT 0,
  expiry_notified BOOLEAN NOT NULL DEFAULT FALSE,
  user_id         UUID
);

CREATE TABLE IF NOT EXISTS transfer_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id  UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
  filename     TEXT NOT NULL,
  size         BIGINT NOT NULL,
  mime_type    TEXT NOT NULL DEFAULT 'application/octet-stream',
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  TEXT NOT NULL,
  plan                   plan_type NOT NULL DEFAULT 'free',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT DEFAULT 'inactive',
  subscription_ends_at   TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key from transfers to profiles (added after both tables exist)
DO $$ BEGIN
  ALTER TABLE transfers
    ADD CONSTRAINT transfers_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transfers_token        ON transfers(token);
CREATE INDEX IF NOT EXISTS idx_transfers_expires_at   ON transfers(expires_at);
CREATE INDEX IF NOT EXISTS idx_transfers_user_id      ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_files_transfer_id ON transfer_files(transfer_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE transfers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;

-- ---- transfers policies ----

DROP POLICY IF EXISTS "Service role full access on transfers"   ON transfers;
DROP POLICY IF EXISTS "Public read transfers by token"          ON transfers;

-- Backend API routes use service_role and bypass RLS entirely.
-- The anon policy below enables direct client-side token lookups
-- (e.g. the download page) without exposing rows without a matching token.
CREATE POLICY "Service role full access on transfers"
  ON transfers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public read transfers by token"
  ON transfers FOR SELECT
  USING (auth.role() = 'anon');

-- ---- transfer_files policies ----

DROP POLICY IF EXISTS "Service role full access on transfer_files" ON transfer_files;
DROP POLICY IF EXISTS "Public read transfer_files"                 ON transfer_files;

CREATE POLICY "Service role full access on transfer_files"
  ON transfer_files FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public read transfer_files"
  ON transfer_files FOR SELECT
  USING (auth.role() = 'anon');

-- ---- profiles policies ----

DROP POLICY IF EXISTS "Users can read own profile"          ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"        ON profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Storage bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('filedrop', 'filedrop', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Service role manages filedrop storage" ON storage.objects;

CREATE POLICY "Service role manages filedrop storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'filedrop' AND auth.role() = 'service_role');

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
