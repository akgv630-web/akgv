const fs = require('fs');
const path = require('path');

const storeContent = fs.readFileSync(path.join(__dirname, '../src/lib/store.ts'), 'utf8');
const gtContent = fs.readFileSync(path.join(__dirname, '../src/data/groundTruth.ts'), 'utf8');

const matchPlots = gtContent.match(/export const INITIAL_PLOTS: Plot\[\] = (\[[\s\S]*?\n\];)/);
const plots = matchPlots ? eval(matchPlots[1]) : [];

const matchRev = storeContent.match(/export const INITIAL_REVIEWS: ReviewRecord\[\] = (\[[\s\S]*?\n\];)/);
const reviews = matchRev ? eval(matchRev[1]) : [];

const matchProfiles = storeContent.match(/export const DEMO_PROFILES: Profile\[\] = (\[[\s\S]*?\n\];)/);
const profiles = matchProfiles ? eval(matchProfiles[1]) : [];

const matchLoc = gtContent.match(/export const PROJECT_LOCATIONS: ProjectLocation\[\] = (\[[\s\S]*?\n\];)/);
const locations = matchLoc ? eval(matchLoc[1]) : [];

const matchRules = gtContent.match(/export const COMMISSION_LEVELS_GROUND_TRUTH: CommissionLevelRule\[\] = (\[[\s\S]*?\n\];)/);
const rules = matchRules ? eval(matchRules[1]) : [];

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (obj === null || obj === undefined) return `'[]'::jsonb`;
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — COMPLETE PRODUCTION SUPABASE SCHEMA
-- Generated: 2026-10-15
-- Project URL: https://tkfnboomhunkfjqckehz.supabase.co
-- Company Phone: 6306917991
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    branch_type TEXT,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    working_hours TEXT,
    road_connectivity TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rera_number TEXT,
    total_area_sqft NUMERIC NOT NULL,
    plot_area_sqft NUMERIC NOT NULL,
    road_area_sqft NUMERIC NOT NULL,
    road_percentage NUMERIC NOT NULL,
    blueprint_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    auth_user_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer',
    member_id TEXT UNIQUE,
    sponsor_id TEXT,
    kyc_status TEXT NOT NULL DEFAULT 'verified',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    city TEXT,
    branch_location TEXT,
    address TEXT,
    level INT DEFAULT 1,
    rank_title TEXT,
    total_business_volume_inr NUMERIC DEFAULT 0,
    plots_closed_count INT DEFAULT 0,
    joined_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. PLOTS TABLE
CREATE TABLE IF NOT EXISTS plots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plot_number TEXT UNIQUE NOT NULL,
    block TEXT NOT NULL,
    location_id TEXT,
    area_sqft NUMERIC NOT NULL,
    dimensions TEXT NOT NULL,
    road_width TEXT NOT NULL,
    road_facing TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available_green',
    base_price_inr NUMERIC,
    suitable_house_model_ids JSONB DEFAULT '[]'::jsonb,
    is_corner_plot BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    canvas_x INT,
    canvas_y INT,
    canvas_w INT,
    canvas_h INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. REVIEWS TABLE (100% Verified Customer & Associate Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    author_name TEXT NOT NULL,
    author_phone TEXT,
    author_role TEXT NOT NULL DEFAULT 'visitor',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    plot_number TEXT,
    branch_location TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'plot_purchase',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'approved',
    helpful_count INT NOT NULL DEFAULT 0,
    admin_reply JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_number TEXT UNIQUE NOT NULL,
    plot_id TEXT NOT NULL,
    plot_number TEXT NOT NULL,
    buyer_id TEXT,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    sponsor_id TEXT,
    house_model_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount_inr NUMERIC NOT NULL,
    paid_amount_inr NUMERIC NOT NULL DEFAULT 0,
    hold_expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- 8. PAYMENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS payment_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    transaction_ref TEXT UNIQUE NOT NULL,
    booking_id TEXT NOT NULL,
    plot_number TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    payer_phone TEXT NOT NULL,
    amount_inr NUMERIC NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'UPI_QR',
    status TEXT NOT NULL DEFAULT 'under_review',
    receipt_number TEXT UNIQUE,
    proof_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    rejection_reason TEXT
);

-- 9. SITE VISITS TABLE
CREATE TABLE IF NOT EXISTS site_visits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_email TEXT,
    location_id TEXT NOT NULL,
    location_name TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    pickup_required BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_staff_name TEXT,
    status TEXT NOT NULL DEFAULT 'requested',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. COMMISSION RULES TABLE
CREATE TABLE IF NOT EXISTS commission_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    level_number INT UNIQUE NOT NULL,
    rank_title_en TEXT NOT NULL,
    rank_title_hi TEXT NOT NULL,
    min_business_inr NUMERIC NOT NULL,
    max_business_inr NUMERIC NOT NULL,
    commission_percent NUMERIC NOT NULL,
    reward_name_en TEXT NOT NULL,
    reward_name_hi TEXT NOT NULL,
    reward_category TEXT NOT NULL,
    reward_estimated_value_inr NUMERIC,
    badge_icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — OPEN CLIENT ACCESS FOR PORTAL
-- ==============================================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if already created
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to locations" ON locations;
    DROP POLICY IF EXISTS "Public access to projects" ON projects;
    DROP POLICY IF EXISTS "Public access to profiles" ON profiles;
    DROP POLICY IF EXISTS "Public access to plots" ON plots;
    DROP POLICY IF EXISTS "Public access to reviews" ON reviews;
    DROP POLICY IF EXISTS "Public access to bookings" ON bookings;
    DROP POLICY IF EXISTS "Public access to payments" ON payment_records;
    DROP POLICY IF EXISTS "Public access to site_visits" ON site_visits;
    DROP POLICY IF EXISTS "Public access to commission_rules" ON commission_rules;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create generous policies for portal sync
CREATE POLICY "Public access to locations" ON locations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to projects" ON projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to plots" ON plots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to reviews" ON reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to bookings" ON bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to payments" ON payment_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to site_visits" ON site_visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to commission_rules" ON commission_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA INSERTION
-- ==============================================================================

-- 1. Insert Locations
`;

locations.forEach((loc) => {
  sql += `INSERT INTO locations (id, slug, name, city, state, branch_type, headline, description, address, phone, working_hours, road_connectivity, latitude, longitude, features)
VALUES (${escapeSql(loc.id)}, ${escapeSql(loc.slug)}, ${escapeSql(loc.name)}, ${escapeSql(loc.city)}, ${escapeSql(loc.state)}, ${escapeSql(loc.branchType)}, ${escapeSql(loc.headline)}, ${escapeSql(loc.description)}, ${escapeSql(loc.address)}, ${escapeSql(loc.phone)}, ${escapeSql(loc.workingHours)}, ${escapeSql(loc.roadConnectivity)}, ${loc.coordinates.lat}, ${loc.coordinates.lng}, ${escapeJson(loc.features)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;
`;
});

sql += `\n-- 2. Insert Default Project\n`;
sql += `INSERT INTO projects (id, location_id, name, total_area_sqft, plot_area_sqft, road_area_sqft, road_percentage)
VALUES ('proj-rampur-01', 'loc-rampur', 'AKGV Greens - Rampur Phase 1', 77550, 55970, 21580, 27.82)
ON CONFLICT (id) DO NOTHING;
\n`;

sql += `-- 3. Insert Demo Profiles\n`;
profiles.forEach((p) => {
  sql += `INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.email)}, ${escapeSql(p.fullName)}, ${escapeSql(p.phone)}, ${escapeSql(p.role)}, ${escapeSql(p.memberId)}, ${escapeSql(p.city)}, ${escapeSql(p.branchLocation)}, ${escapeSql(p.address)}, ${p.level || 1}, ${escapeSql(p.rankTitle)}, ${p.totalBusinessVolumeInr || 0}, ${p.plotsClosedCount || 0}, ${escapeSql(p.joinedDate)})
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;
`;
});

sql += `\n-- 4. Insert 55 Blueprint Plots\n`;
plots.forEach((plt) => {
  sql += `INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES (${escapeSql(plt.id)}, ${escapeSql(plt.plotNumber)}, ${escapeSql(plt.block)}, ${escapeSql(plt.locationId)}, ${plt.areaSqft}, ${escapeSql(plt.dimensions)}, ${escapeSql(plt.roadWidth)}, ${escapeSql(plt.roadFacing)}, ${escapeSql(plt.status)}, ${plt.basePriceInr || 'NULL'}, ${escapeJson(plt.suitableHouseModelIds)}, ${plt.isCornerPlot ? 'TRUE' : 'FALSE'}, ${plt.x}, ${plt.y}, ${plt.width}, ${plt.height})
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
`;
});

sql += `\n-- 5. Insert Verified Real Reviews\n`;
reviews.forEach((rev) => {
  sql += `INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES (${escapeSql(rev.id)}, ${escapeSql(rev.authorName)}, ${escapeSql(rev.authorPhone)}, ${escapeSql(rev.authorRole)}, ${rev.rating}, ${escapeSql(rev.title)}, ${escapeSql(rev.comment)}, ${escapeSql(rev.plotNumber)}, ${escapeSql(rev.branchLocation)}, ${escapeSql(rev.category)}, ${rev.isVerified ? 'TRUE' : 'FALSE'}, ${escapeSql(rev.status)}, ${rev.helpfulCount || 0}, ${escapeJson(rev.adminReply)}, ${escapeSql(rev.createdAt)})
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;
`;
});

sql += `\n-- 6. Insert Commission Rules (11 MLM Ground Truth Levels)\n`;
rules.forEach((r) => {
  sql += `INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-${r.levelNumber}', ${r.levelNumber}, ${escapeSql(r.rankTitleEn)}, ${escapeSql(r.rankTitleHi)}, ${r.minBusinessInr}, ${r.maxBusinessInr}, ${r.commissionPercent}, ${escapeSql(r.rewardNameEn)}, ${escapeSql(r.rewardNameHi)}, ${escapeSql(r.rewardCategory)}, ${r.rewardEstimatedValueInr || 0}, ${escapeSql(r.badgeIcon)})
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
`;
});

fs.writeFileSync(path.join(__dirname, '../supabase/schema.sql'), sql, 'utf8');
fs.writeFileSync(path.join(__dirname, '../supabase/migrations/20261015_complete_production_schema.sql'), sql, 'utf8');
console.log('Successfully generated supabase/schema.sql and migration file!');
