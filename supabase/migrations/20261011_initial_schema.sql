-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — INITIAL PRODUCTION DATABASE SCHEMA
-- Migration: 20261011_initial_schema.sql
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'sub_admin', 'senior_member', 'junior_member', 'buyer');
CREATE TYPE plot_status AS ENUM ('vacant_red', 'available_green', 'booked_yellow', 'hold_pending');
CREATE TYPE booking_status AS ENUM ('pending', 'hold', 'confirmed', 'cancelled', 'released');
CREATE TYPE payment_status AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'refund_pending', 'refunded');
CREATE TYPE payment_method AS ENUM ('UPI_QR', 'NEFT_RTGS', 'CASH_OFFLINE', 'CHEQUE');
CREATE TYPE site_visit_status AS ENUM ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled');
CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
CREATE TYPE kit_delivery_status AS ENUM ('issued', 'in_transit', 'acknowledged');
CREATE TYPE reward_claim_status AS ENUM ('eligible', 'claimed', 'in_review', 'fulfilled', 'rejected');

-- 1. PROFILES & USERS
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    member_id TEXT UNIQUE, -- e.g. AKGV0001 (generated for company members only)
    sponsor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Parent reporting member
    kyc_status kyc_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Index for fast member ID and hierarchy lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_member_id ON profiles(member_id);
CREATE INDEX idx_profiles_sponsor_id ON profiles(sponsor_id);

-- 2. MEMBER HIERARCHY AUDIT
CREATE TABLE member_hierarchy_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    previous_parent_id UUID REFERENCES profiles(id),
    new_parent_id UUID REFERENCES profiles(id),
    changed_by UUID REFERENCES profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. LOCATIONS
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    total_plots INT NOT NULL DEFAULT 0,
    available_plots INT NOT NULL DEFAULT 0,
    road_connectivity TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    rera_number TEXT, -- Admin-configurable when issued
    total_area_sqft NUMERIC NOT NULL,
    plot_area_sqft NUMERIC NOT NULL,
    road_area_sqft NUMERIC NOT NULL,
    road_percentage NUMERIC NOT NULL,
    blueprint_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. HOUSE MODELS (3D Architecture)
CREATE TABLE house_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    bhk TEXT NOT NULL,
    carpet_area_sqft NUMERIC NOT NULL,
    estimated_cost_inr NUMERIC NOT NULL,
    floors INT NOT NULL DEFAULT 2,
    suitable_blocks JSONB NOT NULL DEFAULT '["A", "B"]'::jsonb,
    min_plot_area_sqft NUMERIC NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    exterior_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
    gltf_model_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. PLOTS (Transcribed from Layout Blueprint)
CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    plot_number TEXT NOT NULL, -- e.g. A-01, B-05, C-12
    block CHAR(1) NOT NULL, -- 'A', 'B', 'C'
    area_sqft NUMERIC NOT NULL,
    dimensions TEXT NOT NULL, -- e.g. "30' x 50'"
    road_width TEXT NOT NULL, -- "30'-0\" WIDE" or "25'-0\" WIDE"
    road_facing TEXT NOT NULL,
    status plot_status NOT NULL DEFAULT 'vacant_red',
    base_price_inr NUMERIC,
    is_corner_plot BOOLEAN NOT NULL DEFAULT FALSE,
    canvas_x INT,
    canvas_y INT,
    canvas_w INT,
    canvas_h INT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_project_plot_number UNIQUE (project_id, plot_number)
);

CREATE INDEX idx_plots_status ON plots(status);
CREATE INDEX idx_plots_block ON plots(block);

-- 7. PLOT STATUS AUDIT HISTORY
CREATE TABLE plot_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    old_status plot_status NOT NULL,
    new_status plot_status NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT UNIQUE NOT NULL, -- e.g. BK-2026-0001
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    sponsor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    house_model_id UUID REFERENCES house_models(id) ON DELETE SET NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount_inr NUMERIC NOT NULL,
    paid_amount_inr NUMERIC NOT NULL DEFAULT 0,
    hold_expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_buyer ON bookings(buyer_id);
CREATE INDEX idx_bookings_plot ON bookings(plot_id);

-- 9. PAYMENT RECORDS (Verification workflow)
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_ref TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount_inr NUMERIC NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'UPI_QR',
    status payment_status NOT NULL DEFAULT 'under_review',
    receipt_number TEXT UNIQUE,
    proof_url TEXT,
    notes TEXT,
    rejection_reason TEXT,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_payments_booking ON payment_records(booking_id);
CREATE INDEX idx_payments_status ON payment_records(status);

-- 10. RECEIPTS
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL REFERENCES payment_records(id) ON DELETE RESTRICT,
    payer_name TEXT NOT NULL,
    amount_inr NUMERIC NOT NULL,
    issued_by UUID NOT NULL REFERENCES profiles(id),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. JOINING KIT CASH LEDGER (Offline ₹999 records)
CREATE TABLE kit_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT UNIQUE NOT NULL,
    stock_count INT NOT NULL DEFAULT 0,
    unit_cost_inr NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE kit_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount_received_inr NUMERIC NOT NULL DEFAULT 999, -- Fixed cash amount
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    collector_staff_id UUID NOT NULL REFERENCES profiles(id),
    collector_staff_name TEXT NOT NULL,
    items_included JSONB NOT NULL DEFAULT '{"bag": true, "pen": true, "diary": true, "file": true}'::jsonb,
    delivery_status kit_delivery_status NOT NULL DEFAULT 'issued',
    recipient_ack_signature TEXT,
    audit_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. COMMISSION RULES & LEDGER
CREATE TABLE commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INT UNIQUE NOT NULL,
    rank_title_en TEXT NOT NULL,
    rank_title_hi TEXT NOT NULL,
    min_business_inr NUMERIC NOT NULL,
    max_business_inr NUMERIC NOT NULL,
    commission_percent NUMERIC NOT NULL,
    reward_name_en TEXT NOT NULL,
    reward_name_hi TEXT NOT NULL,
    reward_category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    source_booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    sale_amount_inr NUMERIC NOT NULL,
    commission_percent NUMERIC NOT NULL,
    commission_earned_inr NUMERIC NOT NULL,
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_reason TEXT,
    payout_status TEXT NOT NULL DEFAULT 'calculated', -- calculated, approved, paid, reversed
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    paid_at TIMESTAMPTZ
);

-- 13. REWARDS & FULFILMENT
CREATE TABLE reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    level_number INT NOT NULL REFERENCES commission_rules(level_number),
    reward_name TEXT NOT NULL,
    business_volume_achieved_inr NUMERIC NOT NULL,
    status reward_claim_status NOT NULL DEFAULT 'eligible',
    claim_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    fulfilled_date TIMESTAMPTZ,
    admin_notes TEXT
);

-- 14. SITE VISITS & CRM
CREATE TABLE site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_email TEXT,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    pickup_required BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_staff_id UUID REFERENCES profiles(id),
    status site_visit_status NOT NULL DEFAULT 'requested',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. FIELD GPS EVIDENCE & CAMERA CAPTURE
CREATE TABLE field_gps_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES plots(id) ON DELETE SET NULL,
    plot_number TEXT NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_meters NUMERIC NOT NULL,
    photo_url TEXT NOT NULL,
    captured_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending_review',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 16. SUPPORT TICKETS & CRM
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_staff_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 17. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 18. APPLICATION SETTINGS
CREATE TABLE application_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_hierarchy_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_gps_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('super_admin', 'sub_admin') FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view own profile; Admins can view all; Members can view their downline
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can update profiles" ON profiles
    FOR ALL USING (is_admin());

-- Plots: Everyone can view plots
CREATE POLICY "Public can view plots" ON plots
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can modify plots" ON plots
    FOR ALL USING (is_admin());

-- Bookings: Buyers can view their own; Admins can view all
CREATE POLICY "Buyers can view own bookings" ON bookings
    FOR SELECT USING (buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Buyers can create booking requests" ON bookings
    FOR INSERT WITH CHECK (buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage bookings" ON bookings
    FOR ALL USING (is_admin());

-- Payments: Payer can view own; Admins can view and verify all
CREATE POLICY "Payer can view own payment records" ON payment_records
    FOR SELECT USING (payer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Payers can submit payments" ON payment_records
    FOR INSERT WITH CHECK (payer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can verify payments" ON payment_records
    FOR ALL USING (is_admin());

-- Commission Ledger: Members can view own; Admins can view all
CREATE POLICY "Members view own commission" ON commission_ledger
    FOR SELECT USING (member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Admins manage commission ledger" ON commission_ledger
    FOR ALL USING (is_admin());

-- Joining Kit: Collector & Admins manage kit; Member can view their own kit receipt
CREATE POLICY "Members view own kit issue" ON kit_issues
    FOR SELECT USING (member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Admins manage kit issues" ON kit_issues
    FOR ALL USING (is_admin());

-- Receipts: Buyers view own receipts; Admins manage all
CREATE POLICY "Payers can view own receipts" ON receipts
    FOR SELECT USING (
        booking_id IN (SELECT id FROM bookings WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
        OR is_admin()
    );

CREATE POLICY "Admins can issue receipts" ON receipts
    FOR ALL USING (is_admin());

-- Support Tickets: Users view/create own; Admins manage all
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage tickets" ON support_tickets
    FOR ALL USING (is_admin());

-- Ticket Messages: Buyers NEVER see is_internal_note = TRUE
CREATE POLICY "Users can view customer-visible messages" ON ticket_messages
    FOR SELECT USING (
        (ticket_id IN (SELECT id FROM support_tickets WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
         AND is_internal_note = FALSE)
        OR is_admin()
    );

CREATE POLICY "Users can reply to own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        ticket_id IN (SELECT id FROM support_tickets WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
        AND is_internal_note = FALSE
    );

CREATE POLICY "Admins manage all ticket messages" ON ticket_messages
    FOR ALL USING (is_admin());

-- Reward Claims: Members view own; Admins manage all
CREATE POLICY "Members view own reward claims" ON reward_claims
    FOR SELECT USING (member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Members submit reward claims" ON reward_claims
    FOR INSERT WITH CHECK (member_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins manage reward claims" ON reward_claims
    FOR ALL USING (is_admin());

-- Site Visits: Anyone can submit booking; Staff/Admin can review
CREATE POLICY "Public can book site visits" ON site_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view site visits" ON site_visits
    FOR SELECT USING (is_admin() OR assigned_staff_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Staff can update site visits" ON site_visits
    FOR UPDATE USING (is_admin());

-- Field GPS Evidence: Members view own uploads; Admins review all
CREATE POLICY "Members view own gps evidence" ON field_gps_evidence
    FOR SELECT USING (captured_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Members upload gps evidence" ON field_gps_evidence
    FOR INSERT WITH CHECK (captured_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins manage gps evidence" ON field_gps_evidence
    FOR ALL USING (is_admin());

