-- Findora Campus Lost & Found — Neon PostgreSQL Schema
-- Run via: psql "$DATABASE_URL" -f src/db/schema.sql (or npm run db:seed)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  campus_email VARCHAR(180) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'staff', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lost_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  campus_zone VARCHAR(80) NOT NULL,
  location VARCHAR(160) NOT NULL,
  date_lost DATE NOT NULL,
  public_description TEXT NOT NULL,
  private_identifying_details TEXT,
  image_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'claim_requested', 'under_verification', 'approved', 'recovered', 'archived')),
  submission_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS found_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  campus_zone VARCHAR(80) NOT NULL,
  location VARCHAR(160) NOT NULL,
  date_found DATE NOT NULL,
  public_description TEXT NOT NULL,
  private_verification_details TEXT,
  additional_notes TEXT,
  image_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'claim_requested', 'under_verification', 'approved', 'recovered', 'archived')),
  submission_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  item_type VARCHAR(10) NOT NULL
    CHECK (item_type IN ('lost', 'found')),
  lost_item_id TEXT REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id TEXT REFERENCES found_items(id) ON DELETE CASCADE,
  claimant_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  claimant_name VARCHAR(120) NOT NULL,
  claimant_email VARCHAR(180),
  approximate_date_lost DATE NOT NULL,
  location_lost VARCHAR(160) NOT NULL,
  verification_details TEXT NOT NULL,
  additional_explanation TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'claim_requested'
    CHECK (status IN ('claim_requested', 'under_verification', 'approved', 'recovered', 'rejected')),
  reviewer_notes TEXT,
  handover_confirmed_at TIMESTAMPTZ,
  submission_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT claims_item_reference_check CHECK (
    (item_type = 'lost' AND lost_item_id IS NOT NULL AND found_item_id IS NULL)
    OR
    (item_type = 'found' AND found_item_id IS NOT NULL AND lost_item_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_campus_zone ON lost_items(campus_zone);
CREATE INDEX IF NOT EXISTS idx_lost_items_date_lost ON lost_items(date_lost DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);

CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_campus_zone ON found_items(campus_zone);
CREATE INDEX IF NOT EXISTS idx_found_items_date_found ON found_items(date_found DESC);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status);

CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_lost_item_id ON claims(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_found_item_id ON claims(found_item_id);
CREATE INDEX IF NOT EXISTS idx_claims_submission_hash ON claims(submission_hash);
