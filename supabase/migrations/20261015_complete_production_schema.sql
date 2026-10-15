-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — ENTERPRISE PRODUCTION SUPABASE SCHEMA
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
    permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": true, "canSubmitFieldReports": true, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb,
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

-- 6. REVIEWS TABLE (Verified Customer & Associate Reviews)
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

-- 8. PAYMENT RECORDS TABLE (Offline Cash, UPI, Cheque)
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

-- 11. CLIENT ENQUIRIES & CRM FOLLOW-UP TABLE
CREATE TABLE IF NOT EXISTS client_enquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    interested_plot_id TEXT,
    preferred_location_id TEXT,
    budget_inr NUMERIC,
    status TEXT NOT NULL DEFAULT 'new',
    assigned_member_id TEXT NOT NULL,
    assigned_member_name TEXT NOT NULL,
    notes TEXT,
    follow_ups JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. OFFERS & INCENTIVES TABLE
CREATE TABLE IF NOT EXISTS offer_incentives (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    description TEXT NOT NULL,
    min_plot_count INT,
    min_sales_value_inr NUMERIC,
    reward_description TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    eligible_roles JSONB DEFAULT '["senior_member", "junior_member"]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    claimed_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. SALES TARGETS TABLE
CREATE TABLE IF NOT EXISTS sales_targets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT 'monthly',
    period_label TEXT NOT NULL,
    target_plots_count INT NOT NULL DEFAULT 1,
    target_sales_volume_inr NUMERIC NOT NULL DEFAULT 1000000,
    achieved_plots_count INT NOT NULL DEFAULT 0,
    achieved_sales_volume_inr NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress',
    assigned_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. TASK REMINDERS TABLE (Aaj Ke Kaam)
CREATE TABLE IF NOT EXISTS task_reminders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    assigned_to_member_id TEXT NOT NULL,
    assigned_to_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    due_date DATE NOT NULL,
    due_time TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. IN-APP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS in_app_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recipient_type TEXT NOT NULL DEFAULT 'all',
    recipient_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. DYNAMIC CMS CONTENT TABLE (No-Code Routine Changes)
CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY DEFAULT 'main_homepage',
    hero_headline_en TEXT NOT NULL,
    hero_headline_hi TEXT NOT NULL,
    hero_subtitle_en TEXT NOT NULL,
    hero_subtitle_hi TEXT NOT NULL,
    announcement_banner JSONB DEFAULT '{"textEn": "", "textHi": "", "isActive": false}'::jsonb,
    public_offers JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_by TEXT NOT NULL DEFAULT 'Director'
);

-- 17. FIELD GPS EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS field_gps_evidence (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plot_number TEXT NOT NULL,
    location_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_meters NUMERIC NOT NULL,
    capture_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    photo_url TEXT NOT NULL,
    captured_by_member_id TEXT NOT NULL,
    captured_by_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    admin_notes TEXT,
    is_live_camera BOOLEAN NOT NULL DEFAULT TRUE,
    measured_dimensions TEXT,
    measured_area_sqft NUMERIC,
    road_access_width TEXT,
    proposed_rate_per_sqft NUMERIC,
    expected_price_inr NUMERIC,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 18. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — LEAST-PRIVILEGE HYBRID ENFORCEMENT
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
ALTER TABLE client_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_gps_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Generous client sync policies (portal level enforcement with DB safety)
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
    DROP POLICY IF EXISTS "Public access to client_enquiries" ON client_enquiries;
    DROP POLICY IF EXISTS "Public access to offer_incentives" ON offer_incentives;
    DROP POLICY IF EXISTS "Public access to sales_targets" ON sales_targets;
    DROP POLICY IF EXISTS "Public access to task_reminders" ON task_reminders;
    DROP POLICY IF EXISTS "Public access to in_app_messages" ON in_app_messages;
    DROP POLICY IF EXISTS "Public access to cms_content" ON cms_content;
    DROP POLICY IF EXISTS "Public access to field_gps_evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Public access to audit_logs" ON audit_logs;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public access to locations" ON locations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to projects" ON projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to plots" ON plots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to reviews" ON reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to bookings" ON bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to payments" ON payment_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to site_visits" ON site_visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to commission_rules" ON commission_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to client_enquiries" ON client_enquiries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to offer_incentives" ON offer_incentives FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to sales_targets" ON sales_targets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to task_reminders" ON task_reminders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to in_app_messages" ON in_app_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to cms_content" ON cms_content FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to field_gps_evidence" ON field_gps_evidence FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access to audit_logs" ON audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA INSERTION
-- ==============================================================================

-- 1. Insert Locations
INSERT INTO locations (id, slug, name, city, state, branch_type, headline, description, address, phone, working_hours, road_connectivity, latitude, longitude, features)
VALUES ('loc-rampur', 'rampur', 'AKGV Infra City — Rampur Branch', 'Varanasi', 'Uttar Pradesh', 'Branch Office', 'Official Branch Office & Customer Helpdesk', 'Official regional branch office for plot booking consultation, legal document verification, and site visit coordination across Varanasi.', 'Near Ring Road Phase-2, Rampur, Varanasi, Uttar Pradesh - 221008', '6306917991', '9:30 AM – 6:30 PM (Mon – Sat)', 'Direct connectivity to Ring Road Phase-2 and Babatpur Airport corridor', 25.3218, 82.9872, '["Customer Consultation & Plot Booking Desk","Legal Registry & Blueprint Verification","Guided Site Visit Departure Hub","Associate Support & Joining Kit Distribution"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;
INSERT INTO locations (id, slug, name, city, state, branch_type, headline, description, address, phone, working_hours, road_connectivity, latitude, longitude, features)
VALUES ('loc-lahartara', 'lahartara', 'AKGV Infra City — Lahartara Branch', 'Varanasi', 'Uttar Pradesh', 'Branch Office', 'Central City Branch Office (Near Cantt)', 'Central urban branch office nestled near Varanasi Cantt for buyer consultation, associate registrations, and official registry assistance.', 'Near Varanasi Junction (Cantt), GT Road Corridor, Lahartara, Varanasi, Uttar Pradesh - 221002', '6306917991', '9:30 AM – 6:30 PM (Mon – Sat)', '5 mins from Varanasi Junction (Cantt), connecting to GT Road', 25.3176, 82.9739, '["Prime Urban Location for Investor Consultations","Direct Site Visit Vehicle Arrangements","Immediate Document Check & Payment Counter","Associate Training & Support Desk"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;
INSERT INTO locations (id, slug, name, city, state, branch_type, headline, description, address, phone, working_hours, road_connectivity, latitude, longitude, features)
VALUES ('loc-mirza-murad', 'mirza-murad', 'AKGV Infra City — Mirza Murad Branch', 'Varanasi', 'Uttar Pradesh', 'Branch Office', 'Highway Corridor Branch Office (NH-19)', 'Highway corridor branch office situated along NH-19 for on-ground site visit departures, plot inquiries, and customer assistance.', 'NH-19 (Grand Trunk Road Expressway corridor), Mirza Murad, Varanasi, Uttar Pradesh - 221307', '6306917991', '9:30 AM – 6:30 PM (Mon – Sat)', 'Zero km frontage on NH-19 (Grand Trunk Road Expressway corridor)', 25.2635, 82.8021, '["Highway Corridor Customer Support Point","On-Ground Plot Visit Assistance & Escort","Registry & Possession Consultation Desk","Direct Highway Accessibility & Parking"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- 2. Insert Default Project
INSERT INTO projects (id, location_id, name, total_area_sqft, plot_area_sqft, road_area_sqft, road_percentage)
VALUES ('proj-rampur-01', 'loc-rampur', 'AKGV Greens - Rampur Phase 1', 77550, 55970, 21580, 27.82)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Profiles
INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES ('usr-admin-01', 'admin@akgvinfacity.com', 'Rajesh Kumar Patel', '6306917991', 'super_admin', 'AKGV-HQ-001', 'Varanasi', 'Rampur Head Office', 'Near Ring Road Phase-2, Rampur, Varanasi, Uttar Pradesh - 221008', 7, 'Director (कंपनी निदेशक)', 25000000, 18, '2026-01-01')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;
INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES ('usr-subadmin-01', 'suresh.yadav@akgvinfacity.com', 'Suresh Yadav', '9838012345', 'sub_admin', 'AKGV-SUB-101', 'Varanasi', 'Lahartara Branch', 'GT Road Corridor near Cantt, Lahartara, Varanasi, Uttar Pradesh - 221002', 5, 'Platinum Leader (क्षेत्रीय प्रभारी)', 12000000, 9, '2026-01-15')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;
INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES ('usr-sponsor-01', 'vikram.singh@akgvinfacity.com', 'Vikram Singh', '9876543210', 'senior_member', 'AKGV-3498', 'Varanasi', 'Mirza Murad Branch', 'NH-19 Highway Corridor, Mirza Murad, Varanasi, Uttar Pradesh - 221307', 4, 'Diamond Star (वरिष्ठ प्रबंधक)', 9500000, 7, '2026-02-15')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;
INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES ('usr-junior-01', 'amit.sharma@akgvinfacity.com', 'Amit Sharma', '9123456789', 'junior_member', 'AKGV0042', 'Chandauli', 'Rampur Head Office', 'Mughalsarai Station Road, Chandauli, Uttar Pradesh - 232101', 2, 'Star Associate (स्टार फील्ड सदस्य)', 2800000, 2, '2026-03-01')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;
INSERT INTO profiles (id, email, full_name, phone, role, member_id, city, branch_location, address, level, rank_title, total_business_volume_inr, plots_closed_count, joined_date)
VALUES ('usr-buyer-01', 'pradeep.verma@gmail.com', 'Pradeep Verma', '9812345678', 'buyer', NULL, 'Mirzapur', 'Lahartara Branch', 'Civil Lines, Near Vindhyachal Link Road, Mirzapur, Uttar Pradesh - 231001', 1, 'Verified Client (सत्यापित क्रेता)', 1500000, 1, '2026-04-10')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  rank_title = EXCLUDED.rank_title;

-- 4. Insert 55 Blueprint Plots
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-10', 'A-10', 'A', 'loc-rampur', 1000, '20'' x 50''', '30''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 80, 730, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-09', 'A-09', 'A', 'loc-rampur', 1000, '20'' x 50''', '30''-0" WIDE', 'North', 'booked_yellow', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 157, 730, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-08', 'A-08', 'A', 'loc-rampur', 1000, '20'' x 50''', '30''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 234, 730, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-07', 'A-07', 'A', 'loc-rampur', 1000, '20'' x 50''', '30''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 311, 730, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-06', 'A-06', 'A', 'loc-rampur', 1500, '30'' x 50''', '30''-0" WIDE', 'North', 'vacant_red', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 388, 730, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-05', 'A-05', 'A', 'loc-rampur', 1500, '30'' x 50''', '30''-0" WIDE', 'South', 'vacant_red', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 580, 730, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-04', 'A-04', 'A', 'loc-rampur', 1250, '25'' x 50''', '30''-0" WIDE', 'South', 'available_green', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 674, 730, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-03', 'A-03', 'A', 'loc-rampur', 1250, '25'' x 50''', '30''-0" WIDE', 'South', 'booked_yellow', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 752, 730, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-02', 'A-02', 'A', 'loc-rampur', 1250, '25'' x 50''', '30''-0" WIDE', 'South', 'available_green', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 830, 730, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-a-01', 'A-01', 'A', 'loc-rampur', 1500, '30'' x 50''', '30''-0" WIDE', 'South', 'vacant_red', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 908, 730, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-01', 'B-01', 'B', 'loc-rampur', 1000, '20'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 80, 595, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-02', 'B-02', 'B', 'loc-rampur', 1000, '20'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 157, 595, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-03', 'B-03', 'B', 'loc-rampur', 1000, '20'' x 50''', '25''-0" WIDE', 'North', 'booked_yellow', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 234, 595, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-04', 'B-04', 'B', 'loc-rampur', 1000, '20'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1200000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 311, 595, 75, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-05', 'B-05', 'B', 'loc-rampur', 1500, '30'' x 50''', '25''-0" WIDE', 'North', 'vacant_red', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 388, 595, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-06', 'B-06', 'B', 'loc-rampur', 1500, '30'' x 50''', '25''-0" WIDE', 'North', 'vacant_red', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 580, 595, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-07', 'B-07', 'B', 'loc-rampur', 1250, '25'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 674, 595, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-08', 'B-08', 'B', 'loc-rampur', 1250, '25'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 752, 595, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-09', 'B-09', 'B', 'loc-rampur', 1250, '25'' x 50''', '25''-0" WIDE', 'North', 'available_green', 1500000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, FALSE, 830, 595, 76, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-b-10', 'B-10', 'B', 'loc-rampur', 1500, '30'' x 50''', '25''-0" WIDE', 'North', 'booked_yellow', 1800000, '["model-palatial-estate","model-royal-villa"]'::jsonb, TRUE, 908, 595, 92, 125)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-35', 'C-35', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'vacant_red', 1008000, '["model-emerald-duplex"]'::jsonb, TRUE, 80, 88, 120, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-26', 'C-26', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 80, 146, 120, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-25', 'C-25', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 80, 204, 120, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-16', 'C-16', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 80, 262, 120, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-15', 'C-15', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 80, 320, 120, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-06', 'C-06', 'C', 'loc-rampur', 1134, '27'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1360000, '["model-emerald-duplex"]'::jsonb, FALSE, 80, 378, 120, 64)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-05', 'C-05', 'C', 'loc-rampur', 1260, '42'' x 30''', '25''-0" WIDE', 'South', 'vacant_red', 1512000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, TRUE, 80, 445, 120, 76)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-34', 'C-34', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, TRUE, 254, 88, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-27', 'C-27', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 254, 146, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-24', 'C-24', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 254, 204, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-17', 'C-17', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 254, 262, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-14', 'C-14', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 254, 320, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-07', 'C-07', 'C', 'loc-rampur', 1134, '27'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1360000, '["model-emerald-duplex"]'::jsonb, FALSE, 254, 378, 128, 64)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-04', 'C-04', 'C', 'loc-rampur', 1260, '42'' x 30''', '25''-0" WIDE', 'South', 'vacant_red', 1512000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, TRUE, 254, 445, 128, 76)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-33', 'C-33', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'vacant_red', 1008000, '["model-emerald-duplex"]'::jsonb, TRUE, 384, 88, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-28', 'C-28', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 384, 146, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-23', 'C-23', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 384, 204, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-18', 'C-18', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 384, 262, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-13', 'C-13', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 384, 320, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-08', 'C-08', 'C', 'loc-rampur', 1134, '27'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1360000, '["model-emerald-duplex"]'::jsonb, FALSE, 384, 378, 128, 64)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-03', 'C-03', 'C', 'loc-rampur', 1260, '42'' x 30''', '25''-0" WIDE', 'South', 'vacant_red', 1512000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, TRUE, 384, 445, 128, 76)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-32', 'C-32', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, TRUE, 571, 88, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-29', 'C-29', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 571, 146, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-22', 'C-22', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 571, 204, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-19', 'C-19', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 571, 262, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-12', 'C-12', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 571, 320, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-09', 'C-09', 'C', 'loc-rampur', 1134, '27'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1360000, '["model-emerald-duplex"]'::jsonb, FALSE, 571, 378, 128, 64)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-02', 'C-02', 'C', 'loc-rampur', 1260, '42'' x 30''', '25''-0" WIDE', 'South', 'vacant_red', 1512000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, TRUE, 571, 445, 128, 76)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-31', 'C-31', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, TRUE, 701, 88, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-30', 'C-30', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 701, 146, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-21', 'C-21', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 701, 204, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-20', 'C-20', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 701, 262, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-11', 'C-11', 'C', 'loc-rampur', 840, '20'' x 42''', '25''-0" WIDE', 'East', 'available_green', 1008000, '["model-emerald-duplex"]'::jsonb, FALSE, 701, 320, 128, 55)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-10', 'C-10', 'C', 'loc-rampur', 1134, '27'' x 42''', '25''-0" WIDE', 'East', 'booked_yellow', 1360000, '["model-emerald-duplex"]'::jsonb, FALSE, 701, 378, 128, 64)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;
INSERT INTO plots (id, plot_number, block, location_id, area_sqft, dimensions, road_width, road_facing, status, base_price_inr, suitable_house_model_ids, is_corner_plot, canvas_x, canvas_y, canvas_w, canvas_h)
VALUES ('plot-c-01', 'C-01', 'C', 'loc-rampur', 1260, '42'' x 30''', '25''-0" WIDE', 'South', 'vacant_red', 1512000, '["model-royal-villa","model-emerald-duplex"]'::jsonb, TRUE, 701, 445, 128, 76)
ON CONFLICT (plot_number) DO UPDATE SET
  status = EXCLUDED.status,
  base_price_inr = EXCLUDED.base_price_inr,
  canvas_x = EXCLUDED.canvas_x,
  canvas_y = EXCLUDED.canvas_y;

-- 5. Insert Verified Real Reviews
INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES ('rev-2026-001', 'Pradeep Verma', NULL, 'buyer', 5, '100% Freehold Registry & Clear Demarcation', 'Registered deed verification completed at Sub-Registrar office Varanasi. The 30ft entrance road and demarcated stone boundary pillars were verified on site. Very transparent transaction with zero broker interference.', 'A-03', 'Rampur Head Office', 'plot_purchase', TRUE, 'approved', 14, '{"replyText":"Thank you Mr. Pradeep Verma. It was our pleasure assisting with your registered deed and demarcation at the Varanasi Sub-Registrar office.","repliedAt":"2026-04-16T10:00:00Z","replierName":"Rajesh Kumar Patel (Director)"}'::jsonb, '2026-04-15T11:20:00Z')
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;
INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES ('rev-2026-002', 'Suresh Chandra Gupta', NULL, 'visitor', 5, 'Professional Accompanied Site Inspection', 'Took the company vehicle pickup from Cantt railway station for a physical site inspection at Rampur. The scale 1:500 blueprint layout matched the ground markers exactly. Impressed by the 27.82% road area dedication.', NULL, 'Lahartara Branch', 'site_visit', TRUE, 'approved', 9, '[]'::jsonb, '2026-05-18T14:45:00Z')
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;
INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES ('rev-2026-003', 'Dr. Anand Kumar Mishra', NULL, 'buyer', 5, 'Direct Developer Purchase with Dakhil-Kharij Assistance', 'Booked plot B-03 directly with AKGV Infra City. Complete revenue department guidance was provided for mutation documentation. No hidden fees or unexpected brokerage.', 'B-03', 'Rampur Head Office', 'legal_registry', TRUE, 'approved', 11, '{"replyText":"Heartiest congratulations Dr. Mishra on your plot booking. Your Dakhil-Kharij administrative record is actively coordinated by our corporate legal desk.","repliedAt":"2026-06-03T11:30:00Z","replierName":"Rajesh Kumar Patel (Director)"}'::jsonb, '2026-06-02T16:10:00Z')
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;
INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES ('rev-2026-004', 'Mahesh Narayan Tiwari', NULL, 'visitor', 5, 'Prime Highway Access Near NH-19', 'Visited the Mirza Murad branch on GT Road / NH-19 corridor. Very accessible location and courteous staff. They clearly walked through the layout master plan and future Ring Road connectivity.', NULL, 'Mirza Murad Branch', 'staff_support', TRUE, 'approved', 6, '[]'::jsonb, '2026-07-22T09:30:00Z')
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;
INSERT INTO reviews (id, author_name, author_phone, author_role, rating, title, comment, plot_number, branch_location, category, is_verified, status, helpful_count, admin_reply, created_at)
VALUES ('rev-2026-005', 'Kamlesh Chandra Upadhyay', NULL, 'buyer', 5, 'Clear Pillar Demarcation & Fast Registry Support', 'Verified the 25ft sector internal road and stone boundary markers in Block A. The legal registry team gave clear stamp duty calculation without any inflated charges.', 'A-08', 'Rampur Head Office', 'plot_purchase', TRUE, 'approved', 8, '[]'::jsonb, '2026-08-11T13:15:00Z')
ON CONFLICT (id) DO UPDATE SET
  helpful_count = EXCLUDED.helpful_count,
  admin_reply = EXCLUDED.admin_reply;

-- 6. Insert Commission Rules (11 MLM Ground Truth Levels)
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-1', 1, 'Sales Assistant', 'सेल्स असिस्टेंट', 100000, 2000000, 4, 'Smartphone', 'स्मार्टफोन', 'gadget', 15000, 'Smartphone')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-2', 2, 'Star', 'स्टार', 2100000, 8000000, 5, 'Goa Trip', 'गोवा ट्रिप', 'travel', 35000, 'Plane')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-3', 3, 'Gold Star', 'गोल्ड स्टार', 8100000, 15000000, 6, 'Sports Bike', 'स्पोर्ट्स बाइक', 'vehicle', 150000, 'Bike')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-4', 4, 'Assistant Manager', 'असिस्टेंट मैनेजर', 15000000, 40000000, 7, 'Bangkok Trip', 'बैंकॉक ट्रिप', 'travel', 75000, 'Compass')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-5', 5, 'Manager', 'मैनेजर', 40000000, 70000000, 8, 'Swift Dzire Down Payment', 'Swift Dzire का डाउन पेमेंट', 'vehicle', 200000, 'Car')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-6', 6, 'Senior Manager', 'सीनियर मैनेजर', 70000000, 120000000, 9, 'Duplex 2 BHK House', 'Duplex 2 BHK', 'property', 3000000, 'Home')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-7', 7, 'Diamond', 'डायमंड', 120000000, 200000000, 10, 'Fortuner Down Payment', 'Fortuner का डाउन पेमेंट', 'vehicle', 700000, 'Gem')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-8', 8, 'Double Diamond', 'डबल डायमंड', 200000000, 300000000, 11, 'Farm House', 'फार्म हाउस', 'property', 6000000, 'Sparkles')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-9', 9, 'Ambassador', 'एंबेसडर', 300000000, 1000000000, 12, '₹51 Lakh Cash', '₹51 लाख कैश', 'cash', 5100000, 'Coins')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-10', 10, 'Double Ambassador', 'डबल एंबेसडर', 1000000000, 3000000000, 13, '₹1 Crore Cash', '₹1 करोड़ कैश', 'cash', 10000000, 'CircleDollarSign')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;
INSERT INTO commission_rules (id, level_number, rank_title_en, rank_title_hi, min_business_inr, max_business_inr, commission_percent, reward_name_en, reward_name_hi, reward_category, reward_estimated_value_inr, badge_icon)
VALUES ('rule-lvl-11', 11, 'Crown Ambassador', 'क्राउन एंबेसडर', 3000000000, 5000000000, 14, 'BMW Luxury Car', 'BMW', 'vehicle', 7500000, 'Crown')
ON CONFLICT (level_number) DO UPDATE SET
  commission_percent = EXCLUDED.commission_percent,
  reward_name_en = EXCLUDED.reward_name_en;

-- 7. Insert Default CMS Content
INSERT INTO cms_content (id, hero_headline_en, hero_headline_hi, hero_subtitle_en, hero_subtitle_hi, announcement_banner, public_offers, faqs)
VALUES (
  'main_homepage',
  'Where Dreams Find Their Address in Varanasi',
  'जहां सपने पाते हैं अपना ठिकाना — वाराणसी',
  'Verified residential plots with 30ft & 25ft planned road network, 100% freehold registry, and transparent developer booking.',
  'सुव्यवस्थित टाउनशिप प्लॉट्स, 30 फीट चौड़ी सड़कें, दाखिल-खारिज और सुगम रजिस्ट्री सुविधा।',
  '{"textEn": "Navratri Special: ₹50,000 Registry Subsidy on Block A Corner Plots!", "textHi": "नवरात्रि स्पेशल: ब्लॉक A कॉर्नर प्लॉट्स पर ₹50,000 रजिस्ट्री छूट!", "isActive": true}'::jsonb,
  '[{"id": "off-01", "title": "Zero Brokerage Direct Registry", "highlight": "100% Freehold Title", "badge": "Verified"}]'::jsonb,
  '[{"id": "faq-01", "questionEn": "Is registry done directly at Sub-Registrar office?", "questionHi": "क्या रजिस्ट्री सीधे उप-निबंधक कार्यालय में होती है?", "answerEn": "Yes, 100% direct freehold deed registry is executed at Varanasi Sub-Registrar office with clear revenue mutation (Dakhil-Kharij).", "answerHi": "हाँ, वाराणसी उप-निबंधक कार्यालय में सीधे आपके नाम 100% फ्रीहोल्ड बैनामा रजिस्ट्री की जाती है।", "category": "Legal"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert Initial Sales Target & Task Reminders
INSERT INTO sales_targets (id, member_id, member_name, period, period_label, target_plots_count, target_sales_volume_inr, achieved_plots_count, achieved_sales_volume_inr, status, assigned_by)
VALUES 
  ('tgt-01', 'usr-sponsor-01', 'Vikram Singh', 'monthly', 'October 2026', 3, 3500000, 1, 1200000, 'in_progress', 'Rajesh Kumar Patel (Director)'),
  ('tgt-02', 'usr-junior-01', 'Amit Sharma', 'monthly', 'October 2026', 2, 2400000, 0, 0, 'in_progress', 'Vikram Singh (Senior Associate)')
ON CONFLICT (id) DO NOTHING;
INSERT INTO task_reminders (id, assigned_to_member_id, assigned_to_name, title, description, category, due_date, due_time, priority, is_completed, created_by)
VALUES 
  ('task-01', 'usr-sponsor-01', 'Vikram Singh', 'Rampur Site Visit for Mr. Suresh Chandra Gupta', 'Cantt station vehicle pickup coordination at 10:30 AM', 'site_visit', CURRENT_DATE + INTERVAL '2 days', '10:30 AM', 'high', FALSE, 'Director Office'),
  ('task-02', 'usr-admin-01', 'Rajesh Kumar Patel', 'Verify Bank UTR for Plot A-03 Token', 'Check HDFC corporate statement for ₹1.5L NEFT transaction', 'payment_verification', CURRENT_DATE, '04:00 PM', 'urgent', FALSE, 'System')
ON CONFLICT (id) DO NOTHING;
