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
    kyc_status TEXT NOT NULL DEFAULT 'pending',
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
    permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb,
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
    author_id TEXT,
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
    status TEXT NOT NULL DEFAULT 'pending',
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
    payer_id TEXT,
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
    buyer_id TEXT,
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
    assigned_member_id TEXT,
    assigned_member_name TEXT,
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

-- 19. COMMISSION LEDGER TABLE
CREATE TABLE IF NOT EXISTS commission_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id TEXT NOT NULL,
    source_booking_id TEXT,
    sale_amount_inr NUMERIC NOT NULL DEFAULT 0,
    commission_percent NUMERIC NOT NULL DEFAULT 0,
    commission_earned_inr NUMERIC NOT NULL DEFAULT 0,
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_reason TEXT,
    payout_status TEXT NOT NULL DEFAULT 'calculated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    paid_at TIMESTAMPTZ
);

-- 20. JOINING KIT INVENTORY TABLE
CREATE TABLE IF NOT EXISTS kit_inventory (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_name TEXT UNIQUE NOT NULL,
    stock_count INT NOT NULL DEFAULT 0,
    unit_cost_inr NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 21. JOINING KIT ISSUES TABLE
CREATE TABLE IF NOT EXISTS kit_issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    receipt_number TEXT UNIQUE NOT NULL,
    member_id TEXT NOT NULL,
    amount_received_inr NUMERIC NOT NULL DEFAULT 999,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    collector_staff_id TEXT,
    collector_staff_name TEXT NOT NULL,
    items_included JSONB NOT NULL DEFAULT '{"bag": true, "pen": true, "diary": true, "file": true}'::jsonb,
    delivery_status TEXT NOT NULL DEFAULT 'issued',
    recipient_ack_signature TEXT,
    audit_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 22. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    receipt_number TEXT UNIQUE NOT NULL,
    booking_id TEXT,
    payment_record_id TEXT,
    payer_name TEXT,
    amount_inr NUMERIC NOT NULL,
    issued_by TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 23. REWARD CLAIMS TABLE
CREATE TABLE IF NOT EXISTS reward_claims (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id TEXT NOT NULL,
    level_number INT NOT NULL,
    reward_name TEXT NOT NULL,
    business_volume_achieved_inr NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'eligible',
    claim_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    fulfilled_date TIMESTAMPTZ,
    admin_notes TEXT
);

-- 24. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_staff_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 25. TICKET MESSAGES TABLE
CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NOT NULL,
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
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Defensive Column Upgrades (Ensures existing tables have all policy-required columns)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": true, "canSubmitFieldReports": true, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_business_volume_inr NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plots_closed_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch_location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS joined_date TEXT;
ALTER TABLE plots ADD COLUMN IF NOT EXISTS canvas_x INT;
ALTER TABLE plots ADD COLUMN IF NOT EXISTS canvas_y INT;
ALTER TABLE plots ADD COLUMN IF NOT EXISTS canvas_w INT;
ALTER TABLE plots ADD COLUMN IF NOT EXISTS canvas_h INT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS branch_type TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS buyer_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS buyer_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sponsor_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS payer_id TEXT;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE field_gps_evidence ADD COLUMN IF NOT EXISTS captured_by_member_id TEXT;
ALTER TABLE field_gps_evidence ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE field_gps_evidence ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE client_enquiries ADD COLUMN IF NOT EXISTS assigned_member_id TEXT;

-- Helper Functions for Role-Based Row Level Security
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'visitor';
    END IF;

    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    IF v_role IS NULL THEN
        SELECT role INTO v_role
        FROM public.profiles
        WHERE auth_user_id IS NULL AND id = auth.uid()::text
        LIMIT 1;
    END IF;

    RETURN COALESCE(v_role, 'visitor');
END;
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_role TEXT;
    v_jwt_role TEXT;
BEGIN
    -- 1. Direct superuser / database administrator session check (e.g. Supabase Dashboard SQL editor)
    IF session_user IN ('postgres', 'supabase_admin') THEN
        RETURN TRUE;
    END IF;

    -- 2. Supabase service_role key check (e.g. backend Edge functions / server-side admin client)
    BEGIN
        v_jwt_role := (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role');
        IF v_jwt_role = 'service_role' THEN
            RETURN TRUE;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_jwt_role := NULL;
    END;

    -- 3. Unauthenticated sessions exit immediately
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 4. Query canonical auth_user_id first
    SELECT role INTO v_role
    FROM public.profiles
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    -- 5. Fallback to string id only for legacy/seed profiles where auth_user_id IS NULL
    IF v_role IS NULL THEN
        SELECT role INTO v_role
        FROM public.profiles
        WHERE auth_user_id IS NULL AND id = auth.uid()::text
        LIMIT 1;
    END IF;

    RETURN COALESCE(v_role IN ('super_admin', 'sub_admin'), FALSE);
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- Partial Unique Index on Active Bookings (Prevents Double Bookings and Race Conditions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_plot_booking 
ON bookings (plot_id) 
WHERE status IN ('confirmed', 'under_review', 'hold', 'pending');

-- Atomic Plot Booking Function with Row-Level Locking, Search Path Protection & Caller Validation
CREATE OR REPLACE FUNCTION create_plot_booking_atomic(
    p_plot_id TEXT,
    p_buyer_id TEXT,
    p_buyer_name TEXT,
    p_buyer_phone TEXT,
    p_total_amount NUMERIC,
    p_sponsor_id TEXT DEFAULT NULL,
    p_house_model_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_plot RECORD;
    v_existing_booking RECORD;
    v_new_booking_id TEXT;
    v_booking_number TEXT;
    v_hold_expires TIMESTAMPTZ;
BEGIN
    -- 0. Caller authentication & identity verification
    IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required to create a booking');
    END IF;

    IF NOT public.is_admin() AND auth.uid()::text <> p_buyer_id AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE (auth_user_id = auth.uid() OR id = auth.uid()::text) AND (id = p_buyer_id OR auth_user_id::text = p_buyer_id)
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: booking buyer identity must match authenticated user');
    END IF;

    -- 1. Lock the plot row FOR UPDATE
    SELECT * INTO v_plot FROM plots WHERE id = p_plot_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Plot not found');
    END IF;

    -- 2. Check availability
    IF v_plot.status NOT IN ('available_green') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Plot is not available for booking (status: ' || v_plot.status || ')');
    END IF;

    -- 3. Check existing active booking
    SELECT * INTO v_existing_booking FROM bookings 
    WHERE plot_id = p_plot_id AND status IN ('confirmed', 'under_review', 'hold', 'pending')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'An active reservation or booking already exists for this plot');
    END IF;

    -- 4. Create booking
    v_new_booking_id := 'bk-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_booking_number := 'BK-2026-' || floor(100 + random() * 900)::text;
    v_hold_expires := now() + interval '72 hours';

    INSERT INTO bookings (
        id,
        booking_number,
        plot_id,
        plot_number,
        buyer_id,
        buyer_name,
        buyer_phone,
        sponsor_id,
        status,
        house_model_id,
        total_amount_inr,
        paid_amount_inr,
        hold_expires_at,
        created_at
    ) VALUES (
        v_new_booking_id,
        v_booking_number,
        p_plot_id,
        v_plot.plot_number,
        p_buyer_id,
        p_buyer_name,
        p_buyer_phone,
        p_sponsor_id,
        'pending',
        p_house_model_id,
        p_total_amount,
        0,
        v_hold_expires,
        now()
    );

    -- 5. Mark plot status as hold_pending
    UPDATE plots 
    SET status = 'hold_pending', updated_at = now() 
    WHERE id = p_plot_id;

    -- 6. Authoritative audit log
    PERFORM public.record_audit_log(
        'CREATE_PLOT_BOOKING',
        'bookings',
        v_new_booking_id,
        jsonb_build_object(
            'plot_id', p_plot_id,
            'plot_number', v_plot.plot_number,
            'booking_number', v_booking_number,
            'total_amount', p_total_amount
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_new_booking_id,
        'booking_number', v_booking_number,
        'plot_number', v_plot.plot_number,
        'hold_expires_at', v_hold_expires
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_plot_booking_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_plot_booking_atomic TO authenticated;

-- Authoritative Atomic Payment Verification Procedure with Row Locks & Separation of Duties
CREATE OR REPLACE FUNCTION public.verify_payment_atomic(
    p_payment_id TEXT,
    p_approved BOOLEAN,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_payment RECORD;
    v_booking RECORD;
    v_plot RECORD;
    v_receipt_number TEXT;
    v_admin_id TEXT;
    v_admin_name TEXT;
BEGIN
    -- 0. Authorization check: only administrators can verify payments
    IF auth.uid() IS NULL OR NOT public.is_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only administrators can verify payments');
    END IF;

    -- 1. Lock payment record FOR UPDATE
    SELECT * INTO v_payment FROM payment_records WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment record not found');
    END IF;

    -- Separation of duties: admin cannot verify payments they submitted
    IF v_payment.payer_id = auth.uid()::text OR EXISTS (
        SELECT 1 FROM profiles WHERE (auth_user_id = auth.uid() OR id = auth.uid()::text) AND (id = v_payment.payer_id OR member_id = v_payment.payer_id)
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Separation of duties violation: Administrators cannot verify payments they submitted');
    END IF;

    -- Check if already processed
    IF v_payment.status IN ('verified', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment has already been processed (status: ' || v_payment.status || ')');
    END IF;

    -- Lock booking record FOR UPDATE
    SELECT * INTO v_booking FROM bookings WHERE id = v_payment.booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Associated booking not found');
    END IF;

    -- Lock plot record FOR UPDATE
    SELECT * INTO v_plot FROM plots WHERE id = v_booking.plot_id FOR UPDATE;

    SELECT COALESCE(full_name, 'Admin') INTO v_admin_name FROM profiles WHERE auth_user_id = auth.uid() OR id = auth.uid()::text LIMIT 1;
    v_admin_id := auth.uid()::text;

    IF p_approved THEN
        v_receipt_number := 'REC-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 6));

        -- Update payment record
        UPDATE payment_records
        SET status = 'verified',
            verified_by = COALESCE(v_admin_name, 'Admin'),
            verified_at = timezone('utc', now()),
            receipt_number = v_receipt_number,
            rejection_reason = NULL,
            updated_at = timezone('utc', now())
        WHERE id = p_payment_id;

        -- Update booking paid amount and status
        UPDATE bookings
        SET paid_amount_inr = COALESCE(paid_amount_inr, 0) + v_payment.amount_inr,
            status = 'confirmed',
            updated_at = timezone('utc', now())
        WHERE id = v_booking.id;

        -- Update plot status to booked_yellow
        IF v_plot.id IS NOT NULL THEN
            UPDATE plots
            SET status = 'booked_yellow',
                updated_at = timezone('utc', now())
            WHERE id = v_plot.id;
        END IF;

        -- Create receipt row in receipts table if exists
        BEGIN
            INSERT INTO receipts (
                id,
                receipt_number,
                booking_id,
                payment_record_id,
                amount_inr,
                issued_by,
                created_at
            ) VALUES (
                'rec-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text,
                v_receipt_number,
                v_booking.id,
                p_payment_id,
                v_payment.amount_inr,
                v_admin_id,
                timezone('utc', now())
            ) ON CONFLICT DO NOTHING;
        EXCEPTION
            WHEN undefined_table THEN NULL;
        END;

        -- Authoritative audit log
        PERFORM public.record_audit_log(
            'ADMIN_PAYMENT_VERIFIED',
            'payment_records',
            p_payment_id,
            jsonb_build_object(
                'amount_inr', v_payment.amount_inr,
                'booking_id', v_booking.id,
                'plot_id', v_plot.id,
                'receipt_number', v_receipt_number
            )
        );

        RETURN jsonb_build_object(
            'success', true,
            'payment_id', p_payment_id,
            'status', 'verified',
            'receipt_number', v_receipt_number,
            'booking_status', 'confirmed',
            'plot_status', 'booked_yellow'
        );
    ELSE
        -- Rejected
        UPDATE payment_records
        SET status = 'rejected',
            verified_by = COALESCE(v_admin_name, 'Admin'),
            verified_at = timezone('utc', now()),
            rejection_reason = COALESCE(p_reason, 'Verification failed by administrator'),
            updated_at = timezone('utc', now())
        WHERE id = p_payment_id;

        PERFORM public.record_audit_log(
            'ADMIN_PAYMENT_REJECTED',
            'payment_records',
            p_payment_id,
            jsonb_build_object(
                'reason', p_reason,
                'booking_id', v_booking.id
            )
        );

        RETURN jsonb_build_object(
            'success', true,
            'payment_id', p_payment_id,
            'status', 'rejected',
            'reason', p_reason
        );
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_payment_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_payment_atomic TO authenticated;

-- Public Team Directory View (Masks sensitive contact details and downline financials for non-admins; excludes super_admin and sub_admin)
CREATE OR REPLACE VIEW public.public_team_directory AS
SELECT 
    id,
    full_name,
    role,
    member_id,
    avatar_url,
    city,
    branch_location,
    rank_title,
    joined_date
FROM public.profiles
WHERE is_active = TRUE AND role IN ('senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member');

GRANT SELECT ON public.public_team_directory TO anon, authenticated;

-- Authoritative Sponsor Validation & Resolution RPC
CREATE OR REPLACE FUNCTION public.resolve_and_validate_sponsor(
    p_identifier TEXT,
    p_candidate_profile_id TEXT DEFAULT NULL,
    p_candidate_auth_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_id TEXT;
    v_sponsor RECORD;
    v_cand_profile_id TEXT;
    v_cand_auth_id TEXT;
    v_parsed_cand_auth_uuid UUID;
    v_session_auth_uid UUID;
    v_match_count INT;
BEGIN
    IF p_identifier IS NULL OR pg_catalog.btrim(p_identifier) = '' THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'Sponsor identifier cannot be empty.'
        );
    END IF;

    v_clean_id := pg_catalog.btrim(p_identifier);

    -- Reject malformed inputs (too short or excessively long)
    IF pg_catalog.length(v_clean_id) < 3 OR pg_catalog.length(v_clean_id) > 100 THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'Invalid sponsor identifier format.'
        );
    END IF;

    -- Normalize candidate identifiers using standard SQL NULLIF and COALESCE with pg_catalog.btrim
    v_cand_profile_id := NULLIF(pg_catalog.btrim(COALESCE(p_candidate_profile_id, '')), '');
    v_cand_auth_id := NULLIF(pg_catalog.btrim(COALESCE(p_candidate_auth_id, '')), '');

    -- Safely parse candidate auth UUID
    IF v_cand_auth_id IS NOT NULL THEN
        BEGIN
            v_parsed_cand_auth_uuid := v_cand_auth_id::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_parsed_cand_auth_uuid := NULL;
        END;
    END IF;

    IF v_parsed_cand_auth_uuid IS NULL AND v_cand_profile_id IS NOT NULL THEN
        BEGIN
            v_parsed_cand_auth_uuid := v_cand_profile_id::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_parsed_cand_auth_uuid := NULL;
        END;
    END IF;

    -- Safely inspect session auth.uid()
    BEGIN
        v_session_auth_uid := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_session_auth_uid := NULL;
    END;

    -- Count distinct matching sponsor records to detect ambiguity
    SELECT pg_catalog.count(DISTINCT id)
    INTO v_match_count
    FROM public.profiles
    WHERE (
        pg_catalog.lower(member_id) = pg_catalog.lower(v_clean_id)
        OR id = v_clean_id
        OR (auth_user_id IS NOT NULL AND auth_user_id::text = v_clean_id)
        OR (
            member_id IS NOT NULL
            AND pg_catalog.replace(pg_catalog.lower(member_id), '-', '') = pg_catalog.replace(pg_catalog.lower(v_clean_id), '-', '')
        )
    );

    IF v_match_count = 0 THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'Sponsor identifier does not match any registered member.'
        );
    END IF;

    IF v_match_count > 1 THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'Ambiguous sponsor identifier. Multiple matching records found.'
        );
    END IF;

    -- Fetch the unambiguous single matching sponsor record
    SELECT id, auth_user_id, member_id, full_name, role, is_active
    INTO v_sponsor
    FROM public.profiles
    WHERE (
        pg_catalog.lower(member_id) = pg_catalog.lower(v_clean_id)
        OR id = v_clean_id
        OR (auth_user_id IS NOT NULL AND auth_user_id::text = v_clean_id)
        OR (
            member_id IS NOT NULL
            AND pg_catalog.replace(pg_catalog.lower(member_id), '-', '') = pg_catalog.replace(pg_catalog.lower(v_clean_id), '-', '')
        )
    )
    LIMIT 1;

    -- Reject suspended, inactive, or NULL active status
    IF v_sponsor.is_active IS NOT TRUE THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'The specified sponsor account is suspended or inactive.'
        );
    END IF;

    -- Reject ineligible sponsor roles (Buyers and NULL roles are strictly ineligible)
    IF v_sponsor.role IS NULL OR v_sponsor.role NOT IN (
        'super_admin', 'sub_admin', 'senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member'
    ) THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'The specified account is not authorized to sponsor members or clients.'
        );
    END IF;

    -- Anti-self-referral validation: Check against candidate profile ID, Auth user ID, and current caller session
    IF (v_cand_profile_id IS NOT NULL AND (
            v_sponsor.id = v_cand_profile_id
            OR (v_sponsor.member_id IS NOT NULL AND pg_catalog.lower(v_sponsor.member_id) = pg_catalog.lower(v_cand_profile_id))
            OR (v_sponsor.auth_user_id IS NOT NULL AND v_sponsor.auth_user_id::text = v_cand_profile_id)
        ))
        OR (v_cand_auth_id IS NOT NULL AND (
            v_sponsor.id = v_cand_auth_id
            OR (v_sponsor.member_id IS NOT NULL AND pg_catalog.lower(v_sponsor.member_id) = pg_catalog.lower(v_cand_auth_id))
            OR (v_sponsor.auth_user_id IS NOT NULL AND v_sponsor.auth_user_id::text = v_cand_auth_id)
        ))
        OR (v_parsed_cand_auth_uuid IS NOT NULL AND v_sponsor.auth_user_id IS NOT NULL AND v_sponsor.auth_user_id = v_parsed_cand_auth_uuid)
        OR (v_session_auth_uid IS NOT NULL AND v_sponsor.auth_user_id IS NOT NULL AND v_sponsor.auth_user_id = v_session_auth_uid)
        OR (v_session_auth_uid IS NOT NULL AND v_sponsor.id = v_session_auth_uid::text)
    THEN
        RETURN pg_catalog.jsonb_build_object(
            'valid', false,
            'error', 'Self-referral is strictly prohibited.'
        );
    END IF;

    -- Return sanitized public advisor information without exposing internal UUIDs or roles
    RETURN pg_catalog.jsonb_build_object(
        'valid', true,
        'canonical_sponsor_id', COALESCE(v_sponsor.member_id, v_sponsor.id),
        'sponsor_name', v_sponsor.full_name
    );
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- Trigger to enforce profile update integrity (Prevents non-admin role escalation and tampering with sensitive metrics)
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_new jsonb;
    v_old jsonb;
    v_sponsor_validation jsonb;
BEGIN
    -- Ensure trigger is strictly attached to profiles table
    IF TG_TABLE_NAME <> 'profiles' THEN
        RAISE EXCEPTION 'Configuration error: enforce_profile_update_integrity trigger is only valid on public.profiles, but was invoked on %', TG_TABLE_NAME;
    END IF;

    -- Administrators retain full management authority
    IF public.is_admin() THEN
        IF TG_OP = 'UPDATE' THEN
            NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
        END IF;
        RETURN NEW;
    END IF;

    -- Convert NEW record to JSONB for schema-existence-safe inspection
    v_new := pg_catalog.to_jsonb(NEW);

    -- =========================================================================
    -- FAIL-CLOSED SCHEMA INTEGRITY CHECK (Enforced for BOTH INSERT and UPDATE)
    -- =========================================================================
    IF NOT (v_new ? 'role')
       OR NOT (v_new ? 'is_active')
       OR NOT (v_new ? 'kyc_status')
       OR NOT (v_new ? 'permissions')
       OR NOT (v_new ? 'sponsor_id')
       OR NOT (v_new ? 'member_id')
    THEN
        RAISE EXCEPTION 'Schema integrity error: profiles table is missing required security columns';
    END IF;

    -- =========================================================================
    -- INSERT VALIDATION (Least-Privilege Non-Admin Registration)
    -- =========================================================================
    IF TG_OP = 'INSERT' THEN
        -- Non-admins cannot forge or hijack another user's auth_user_id
        IF auth.uid() IS NULL THEN
            IF (v_new->>'auth_user_id') IS NOT NULL AND pg_catalog.btrim(v_new->>'auth_user_id') <> '' THEN
                RAISE EXCEPTION 'Unauthorized: Unauthenticated clients cannot bind a profile to an auth_user_id';
            END IF;
            NEW.auth_user_id := NULL;
        ELSE
            IF (v_new->>'auth_user_id') IS NOT NULL AND (v_new->>'auth_user_id')::uuid <> auth.uid() THEN
                RAISE EXCEPTION 'Unauthorized: Profile auth_user_id must match authenticated session identity';
            END IF;
            IF (v_new->>'id') IS NOT NULL AND (v_new->>'id') <> auth.uid()::text THEN
                RAISE EXCEPTION 'Unauthorized: Profile id must match authenticated session identity';
            END IF;
            NEW.auth_user_id := auth.uid();
            NEW.id := auth.uid()::text;
        END IF;

        -- Non-admins can strictly only register as 'buyer'
        IF (v_new->>'role') IS NOT NULL AND (v_new->>'role') <> 'buyer' THEN
            RAISE EXCEPTION 'Unauthorized: Public registrations are strictly limited to buyer role';
        END IF;
        NEW.role := 'buyer';

        -- Non-admins cannot self-assign member_id (reserved for company associates)
        IF (v_new->>'member_id') IS NOT NULL AND pg_catalog.btrim(v_new->>'member_id') <> '' THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot assign member_id';
        END IF;
        NEW.member_id := NULL;

        -- Non-admins cannot self-certify KYC status
        IF (v_new->>'kyc_status') IS NOT NULL AND (v_new->>'kyc_status') NOT IN ('pending', 'submitted') THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot set verified KYC status on registration';
        END IF;
        NEW.kyc_status := 'pending';

        -- Non-admins cannot self-assign any elevated staff permissions
        IF v_new ? 'permissions' AND v_new->'permissions' IS NOT NULL THEN
            IF (v_new->'permissions'->>'canCreateDownline')::boolean IS TRUE
               OR (v_new->'permissions'->>'canManagePlots')::boolean IS TRUE
               OR (v_new->'permissions'->>'canRecordEnquiries')::boolean IS TRUE
               OR (v_new->'permissions'->>'canSubmitFieldReports')::boolean IS TRUE
               OR (v_new->'permissions'->>'canViewTeamSales')::boolean IS TRUE
               OR (v_new->'permissions'->>'canVerifyPayments')::boolean IS TRUE
               OR (v_new->'permissions'->>'canEditCms')::boolean IS TRUE
            THEN
                RAISE EXCEPTION 'Unauthorized: Elevated permissions cannot be granted to public buyer accounts';
            END IF;
        END IF;
        -- Enforce least-privilege zero-staff-permission baseline
        NEW.permissions := '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb;

        -- Non-admins cannot self-assign level, rank, or business volume
        IF COALESCE((v_new->>'level')::int, 1) > 1
           OR (v_new->>'rank_title') IS NOT NULL
           OR COALESCE((v_new->>'total_business_volume_inr')::numeric, 0) > 0
           OR COALESCE((v_new->>'plots_closed_count')::int, 0) > 0
        THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot assign level, rank_title, or business volume';
        END IF;
        NEW.level := 1;
        NEW.rank_title := NULL;
        NEW.total_business_volume_inr := 0;
        NEW.plots_closed_count := 0;

        -- Authoritative sponsor validation
        IF (v_new->>'sponsor_id') IS NOT NULL AND pg_catalog.btrim(v_new->>'sponsor_id') <> '' THEN
            v_sponsor_validation := public.resolve_and_validate_sponsor(
                v_new->>'sponsor_id',
                v_new->>'id',
                v_new->>'auth_user_id'
            );
            IF (v_sponsor_validation->>'valid')::boolean IS NOT TRUE THEN
                RAISE EXCEPTION 'Invalid sponsor: %', (v_sponsor_validation->>'error');
            END IF;
            NEW.sponsor_id := (v_sponsor_validation->>'canonical_sponsor_id');
        END IF;

        RETURN NEW;
    END IF;

    -- =========================================================================
    -- UPDATE VALIDATION
    -- =========================================================================
    v_old := pg_catalog.to_jsonb(OLD);

    -- Primary key id immutability
    IF (v_new->>'id') IS DISTINCT FROM (v_old->>'id') THEN
        RAISE EXCEPTION 'Unauthorized: Cannot alter profile primary key';
    END IF;

    -- Cross-user profile update protection: When authenticated, non-admin callers can only update their own profile
    IF auth.uid() IS NOT NULL THEN
        IF (v_old->>'auth_user_id') IS NOT NULL AND (v_old->>'auth_user_id')::uuid <> auth.uid() THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users can only update their own profile';
        END IF;
        IF (v_old->>'auth_user_id') IS NULL AND (v_old->>'id') <> auth.uid()::text THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot claim or modify unlinked profiles belonging to another entity';
        END IF;
    END IF;

    -- auth_user_id binding and integrity protection
    IF (v_new->>'auth_user_id') IS DISTINCT FROM (v_old->>'auth_user_id') THEN
        IF (v_old->>'auth_user_id') IS NOT NULL THEN
            RAISE EXCEPTION 'Integrity violation: auth_user_id cannot be reassigned once established';
        ELSE
            -- Attempting to link an unlinked profile (transition from NULL to non-NULL)
            IF auth.uid() IS NULL THEN
                RAISE EXCEPTION 'Unauthorized: Unauthenticated callers cannot assign auth_user_id';
            END IF;

            IF (v_new->>'auth_user_id') IS NULL OR (v_new->>'auth_user_id')::uuid <> auth.uid() THEN
                RAISE EXCEPTION 'Unauthorized: Profile auth_user_id must match authenticated session identity';
            END IF;

            IF (v_old->>'id') <> auth.uid()::text THEN
                RAISE EXCEPTION 'Unauthorized: Non-admin users cannot claim unlinked profiles belonging to another entity';
            END IF;
        END IF;
    END IF;

    -- Non-admin callers cannot alter sensitive identity, role, or financial tracking attributes
    IF (v_new->>'role') IS DISTINCT FROM (v_old->>'role') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter role';
    END IF;

    IF (v_new->>'is_active') IS DISTINCT FROM (v_old->>'is_active') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter active status';
    END IF;

    IF (v_new->>'kyc_status') IS DISTINCT FROM (v_old->>'kyc_status') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter kyc_status';
    END IF;

    IF (v_new->'permissions') IS DISTINCT FROM (v_old->'permissions') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter permissions';
    END IF;

    IF (v_new->>'level') IS DISTINCT FROM (v_old->>'level') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter level';
    END IF;

    IF (v_new->>'rank_title') IS DISTINCT FROM (v_old->>'rank_title') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter rank_title';
    END IF;

    IF (v_new->>'sponsor_id') IS DISTINCT FROM (v_old->>'sponsor_id') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter sponsor_id';
    END IF;

    IF (v_new->>'member_id') IS DISTINCT FROM (v_old->>'member_id') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter member_id';
    END IF;

    IF (v_new->>'total_business_volume_inr') IS DISTINCT FROM (v_old->>'total_business_volume_inr') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter total_business_volume_inr';
    END IF;

    IF (v_new->>'plots_closed_count') IS DISTINCT FROM (v_old->>'plots_closed_count') THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter plots_closed_count';
    END IF;

    NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_integrity
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_integrity();

REVOKE ALL ON FUNCTION public.enforce_profile_update_integrity() FROM PUBLIC;

-- Authoritative Audit Logging Procedure (Derives actor from auth.uid() securely)
CREATE OR REPLACE FUNCTION public.record_audit_log(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_actor_id TEXT;
    v_actor_name TEXT;
    v_actor_role TEXT;
    v_clean_details JSONB;
BEGIN
    -- Require authenticated caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: audit logging requires authenticated session';
    END IF;

    SELECT 
        COALESCE(p.id, auth.uid()::text),
        COALESCE(p.full_name, 'Authenticated User'),
        COALESCE(p.role, 'buyer')
    INTO v_actor_id, v_actor_name, v_actor_role
    FROM profiles p
    WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text
    LIMIT 1;

    IF v_actor_id IS NULL THEN
        v_actor_id := auth.uid()::text;
        v_actor_name := 'Authenticated User';
        v_actor_role := 'buyer';
    END IF;

    -- Block non-admin callers from recording administrative or system actions
    IF (p_action LIKE 'ADMIN_%' OR p_action LIKE 'SYSTEM_%') AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: non-administrators cannot record administrative or system audit events';
    END IF;

    -- Sanitize details to prevent sensitive data leakage (passwords, tokens, secret keys)
    v_clean_details := p_details - 'password' - 'token' - 'secret' - 'apiKey' - 'access_token';

    INSERT INTO audit_logs (
        id,
        actor_id,
        actor_name,
        actor_role,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        created_at
    ) VALUES (
        'log-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text,
        v_actor_id,
        v_actor_name,
        v_actor_role,
        p_action,
        p_entity_type,
        p_entity_id,
        v_clean_details,
        p_ip_address,
        timezone('utc', now())
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_audit_log FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_audit_log FROM anon;
GRANT EXECUTE ON FUNCTION public.record_audit_log TO authenticated;

-- Drop obsolete and legacy policies
DO $$
BEGIN
    -- Drop 20261011 legacy policies that could bypass fine-grained checks via PostgreSQL OR
    DROP POLICY IF EXISTS "Public can book site visits" ON site_visits;
    DROP POLICY IF EXISTS "Staff can view site visits" ON site_visits;
    DROP POLICY IF EXISTS "Staff can update site visits" ON site_visits;
    DROP POLICY IF EXISTS "Members upload gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Members view own gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Admins manage gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
    DROP POLICY IF EXISTS "Public can view plots" ON plots;
    DROP POLICY IF EXISTS "Admins can modify plots" ON plots;
    DROP POLICY IF EXISTS "Buyers can view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Buyers can create booking requests" ON bookings;
    DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;
    DROP POLICY IF EXISTS "Payer can view own payment records" ON payment_records;
    DROP POLICY IF EXISTS "Payers can submit payments" ON payment_records;
    DROP POLICY IF EXISTS "Admins can verify payments" ON payment_records;
    DROP POLICY IF EXISTS "Members view own commission" ON commission_ledger;
    DROP POLICY IF EXISTS "Admins manage commission ledger" ON commission_ledger;
    DROP POLICY IF EXISTS "Members view own kit issue" ON kit_issues;
    DROP POLICY IF EXISTS "Admins manage kit issues" ON kit_issues;
    DROP POLICY IF EXISTS "Payers can view own receipts" ON receipts;
    DROP POLICY IF EXISTS "Admins can issue receipts" ON receipts;
    DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can view customer-visible messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Users can reply to own tickets" ON ticket_messages;
    DROP POLICY IF EXISTS "Admins manage all ticket messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Members view own reward claims" ON reward_claims;
    DROP POLICY IF EXISTS "Members submit reward claims" ON reward_claims;
    DROP POLICY IF EXISTS "Admins manage reward claims" ON reward_claims;
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

    DROP POLICY IF EXISTS "Public read locations" ON locations;
    DROP POLICY IF EXISTS "Admin write locations" ON locations;
    DROP POLICY IF EXISTS "Public read projects" ON projects;
    DROP POLICY IF EXISTS "Admin write projects" ON projects;
    DROP POLICY IF EXISTS "Public read plots" ON plots;
    DROP POLICY IF EXISTS "Admin write plots" ON plots;
    DROP POLICY IF EXISTS "Public read cms_content" ON cms_content;
    DROP POLICY IF EXISTS "Admin write cms_content" ON cms_content;
    DROP POLICY IF EXISTS "Public read commission_rules" ON commission_rules;
    DROP POLICY IF EXISTS "Admin write commission_rules" ON commission_rules;
    DROP POLICY IF EXISTS "Public read offer_incentives" ON offer_incentives;
    DROP POLICY IF EXISTS "Admin write offer_incentives" ON offer_incentives;
    DROP POLICY IF EXISTS "Read approved reviews" ON reviews;
    DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
    DROP POLICY IF EXISTS "Admin or author update reviews" ON reviews;
    DROP POLICY IF EXISTS "Admin delete reviews" ON reviews;
    DROP POLICY IF EXISTS "Public insert enquiries" ON client_enquiries;
    DROP POLICY IF EXISTS "Admin or assigned read enquiries" ON client_enquiries;
    DROP POLICY IF EXISTS "Admin update enquiries" ON client_enquiries;
    DROP POLICY IF EXISTS "Admin delete enquiries" ON client_enquiries;
    DROP POLICY IF EXISTS "Public insert site visits" ON site_visits;
    DROP POLICY IF EXISTS "Buyer or admin read site visits" ON site_visits;
    DROP POLICY IF EXISTS "Admin update site visits" ON site_visits;
    DROP POLICY IF EXISTS "Admin delete site visits" ON site_visits;
    DROP POLICY IF EXISTS "Public read active profiles" ON profiles;
    DROP POLICY IF EXISTS "Private profiles read access" ON profiles;
    DROP POLICY IF EXISTS "Authenticated create profile" ON profiles;
    DROP POLICY IF EXISTS "Self or admin update profile" ON profiles;
    DROP POLICY IF EXISTS "Admin delete profile" ON profiles;
    DROP POLICY IF EXISTS "Buyer or sponsor or admin read bookings" ON bookings;
    DROP POLICY IF EXISTS "Buyer create booking" ON bookings;
    DROP POLICY IF EXISTS "Admin update bookings" ON bookings;
    DROP POLICY IF EXISTS "Admin delete bookings" ON bookings;
    DROP POLICY IF EXISTS "Payer or admin read payments" ON payment_records;
    DROP POLICY IF EXISTS "Payer create payment" ON payment_records;
    DROP POLICY IF EXISTS "Admin update payments" ON payment_records;
    DROP POLICY IF EXISTS "Admin delete payments" ON payment_records;
    DROP POLICY IF EXISTS "Member or admin read targets" ON sales_targets;
    DROP POLICY IF EXISTS "Admin write targets" ON sales_targets;
    DROP POLICY IF EXISTS "Assigned or admin read tasks" ON task_reminders;
    DROP POLICY IF EXISTS "Assigned or admin update tasks" ON task_reminders;
    DROP POLICY IF EXISTS "Admin delete tasks" ON task_reminders;
    DROP POLICY IF EXISTS "Admin create tasks" ON task_reminders;
    DROP POLICY IF EXISTS "Recipient or admin read messages" ON in_app_messages;
    DROP POLICY IF EXISTS "Admin write messages" ON in_app_messages;
    DROP POLICY IF EXISTS "Read gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Authenticated insert gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Admin update gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Admin delete gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Admin read audit_logs" ON audit_logs;
    DROP POLICY IF EXISTS "Authenticated insert audit_logs" ON audit_logs;
    DROP POLICY IF EXISTS "Admin insert audit_logs" ON audit_logs;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Fine-grained Least-Privilege RLS Policies
CREATE POLICY "Public read locations" ON locations FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admin write locations" ON locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read projects" ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write projects" ON projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read plots" ON plots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write plots" ON plots FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read cms_content" ON cms_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write cms_content" ON cms_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read commission_rules" ON commission_rules FOR SELECT TO anon, authenticated USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admin write commission_rules" ON commission_rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read offer_incentives" ON offer_incentives FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write offer_incentives" ON offer_incentives FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Read approved reviews" ON reviews FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.is_admin() OR author_id = auth.uid()::text);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND (is_verified = FALSE OR is_verified IS NULL));
CREATE POLICY "Admin or author update reviews" ON reviews FOR UPDATE TO authenticated USING (public.is_admin() OR author_id = auth.uid()::text);
CREATE POLICY "Admin delete reviews" ON reviews FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Public insert enquiries" ON client_enquiries FOR INSERT TO anon, authenticated WITH CHECK (status = 'new' AND (assigned_member_id IS NULL OR assigned_member_id = ''));
CREATE POLICY "Admin or assigned read enquiries" ON client_enquiries FOR SELECT TO authenticated USING (public.is_admin() OR assigned_member_id = auth.uid()::text);
CREATE POLICY "Admin update enquiries" ON client_enquiries FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete enquiries" ON client_enquiries FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Public insert site visits" ON site_visits FOR INSERT TO anon, authenticated WITH CHECK (status = 'requested' AND (assigned_staff_name IS NULL OR assigned_staff_name = ''));
CREATE POLICY "Buyer or admin read site visits" ON site_visits FOR SELECT TO authenticated USING (public.is_admin() OR buyer_id = auth.uid()::text);
CREATE POLICY "Admin update site visits" ON site_visits FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete site visits" ON site_visits FOR DELETE TO authenticated USING (public.is_admin());

-- Private profiles are restricted to Admins, self, downline team, and direct sponsor (Anonymous has zero read access to private profiles; public queries public_team_directory view)
CREATE POLICY "Private profiles read access" ON profiles FOR SELECT TO authenticated USING (
    public.is_admin() 
    OR auth_user_id = auth.uid() 
    OR id = auth.uid()::text
    OR sponsor_id = (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) LIMIT 1)
    OR member_id = (SELECT p.sponsor_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) LIMIT 1)
);
CREATE POLICY "Authenticated create profile" ON profiles FOR INSERT TO authenticated WITH CHECK (
    public.is_admin()
    OR (
        auth_user_id = auth.uid()
        AND id = auth.uid()::text
        AND role = 'buyer'
    )
);
CREATE POLICY "Self or admin update profile" ON profiles FOR UPDATE TO authenticated USING (
    public.is_admin()
    OR (auth_user_id = auth.uid())
    OR (auth_user_id IS NULL AND id = auth.uid()::text)
) WITH CHECK (
    public.is_admin()
    OR (
        (auth_user_id = auth.uid() OR (auth_user_id IS NULL AND id = auth.uid()::text))
        AND role = (
            SELECT p2.role
            FROM public.profiles p2
            WHERE (p2.auth_user_id = auth.uid() OR (p2.auth_user_id IS NULL AND p2.id = auth.uid()::text))
            LIMIT 1
        )
    )
);
CREATE POLICY "Admin delete profile" ON profiles FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Buyer or sponsor or admin read bookings" ON bookings FOR SELECT TO authenticated USING (public.is_admin() OR buyer_id = auth.uid()::text OR sponsor_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Buyer create booking" ON bookings FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (buyer_id = auth.uid()::text AND status IN ('pending', 'hold') AND (paid_amount_inr IS NULL OR paid_amount_inr = 0)));
CREATE POLICY "Admin update bookings" ON bookings FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete bookings" ON bookings FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Payer or admin read payments" ON payment_records FOR SELECT TO authenticated USING (public.is_admin() OR payer_id = auth.uid()::text OR booking_id IN (SELECT b.id FROM bookings b WHERE b.buyer_id = auth.uid()::text));
CREATE POLICY "Payer create payment" ON payment_records FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (payer_id = auth.uid()::text AND status IN ('pending', 'under_review') AND amount_inr > 0 AND receipt_number IS NULL AND verified_by IS NULL AND verified_at IS NULL));
CREATE POLICY "Admin update payments" ON payment_records FOR UPDATE TO authenticated USING (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text) WITH CHECK (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text);
CREATE POLICY "Admin delete payments" ON payment_records FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Members view own commission" ON commission_ledger FOR SELECT TO authenticated USING (public.is_admin() OR member_id IN (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)));
CREATE POLICY "Admins manage commission ledger" ON commission_ledger FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members view own kit issue" ON kit_issues FOR SELECT TO authenticated USING (public.is_admin() OR member_id IN (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)));
CREATE POLICY "Admins manage kit issues" ON kit_issues FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Payers can view own receipts" ON receipts FOR SELECT TO authenticated USING (public.is_admin() OR booking_id IN (SELECT b.id FROM bookings b WHERE b.buyer_id = auth.uid()::text) OR payment_record_id IN (SELECT p.id FROM payment_records p WHERE p.payer_id = auth.uid()::text));
CREATE POLICY "Admins manage receipts" ON receipts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid()::text OR user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid()));
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR ((user_id = auth.uid()::text OR user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid())) AND status = 'open'));
CREATE POLICY "Admins can manage tickets" ON support_tickets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can view customer-visible messages" ON ticket_messages FOR SELECT TO authenticated USING (public.is_admin() OR (ticket_id IN (SELECT t.id FROM support_tickets t WHERE t.user_id = auth.uid()::text OR t.user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid())) AND is_internal_note = FALSE));
CREATE POLICY "Users can reply to own tickets" ON ticket_messages FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (ticket_id IN (SELECT t.id FROM support_tickets t WHERE t.user_id = auth.uid()::text OR t.user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid())) AND is_internal_note = FALSE AND sender_id = auth.uid()::text));
CREATE POLICY "Admins manage all ticket messages" ON ticket_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members view own reward claims" ON reward_claims FOR SELECT TO authenticated USING (public.is_admin() OR member_id IN (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)));
CREATE POLICY "Members submit reward claims" ON reward_claims FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (member_id IN (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)) AND status = 'pending'));
CREATE POLICY "Admins manage reward claims" ON reward_claims FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Member or admin read targets" ON sales_targets FOR SELECT TO authenticated USING (public.is_admin() OR member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Admin write targets" ON sales_targets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Assigned or admin read tasks" ON task_reminders FOR SELECT TO authenticated USING (public.is_admin() OR assigned_to_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Assigned or admin update tasks" ON task_reminders FOR UPDATE TO authenticated USING (public.is_admin() OR assigned_to_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Admin delete tasks" ON task_reminders FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin create tasks" ON task_reminders FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Recipient or admin read messages" ON in_app_messages FOR SELECT TO authenticated USING (recipient_type = 'all' OR public.is_admin() OR recipient_id = auth.uid()::text);
CREATE POLICY "Admin write messages" ON in_app_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Read gps evidence" ON field_gps_evidence FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.is_admin() OR captured_by_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Authenticated insert gps evidence" ON field_gps_evidence FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (captured_by_member_id IN (SELECT p.member_id FROM profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)) AND status IN ('pending', 'pending_review') AND reviewed_by IS NULL AND reviewed_at IS NULL));
CREATE POLICY "Admin update gps evidence" ON field_gps_evidence FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete gps evidence" ON field_gps_evidence FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admin read audit_logs" ON audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Storage bucket for field GPS inspection evidence (Private bucket)
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'evidence',
        'evidence',
        false,
        10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = false,
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

    DROP POLICY IF EXISTS "Authenticated members upload evidence" ON storage.objects;
    DROP POLICY IF EXISTS "Users and admins view evidence" ON storage.objects;
    DROP POLICY IF EXISTS "Admins delete evidence" ON storage.objects;

    CREATE POLICY "Authenticated members upload evidence" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'evidence'
    );

    CREATE POLICY "Users and admins view evidence" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidence'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin()
        )
    );

    CREATE POLICY "Admins delete evidence" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'evidence'
        AND public.is_admin()
    );
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

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

-- 9. Insert Initial Offer Incentives
INSERT INTO offer_incentives (id, title_en, title_hi, description, min_plot_count, min_sales_value_inr, reward_description, reward_type, start_date, end_date, eligible_roles, status, claimed_count)
VALUES ('off-navratri-2026', 'Navratri Mahotsav: Freehold Registry Subsidy', 'नवरात्रि महोत्सव: ₹50,000 निःशुल्क रजिस्ट्री छूट', 'Special corporate festival incentive: Instant ₹50,000 registry fee subsidy on direct token booking of any Block A or Block B residential plot.', NULL, NULL, '₹50,000 Registry Stamp Duty Adjustment Voucher', 'cash_bonus', '2026-10-01', '2026-10-31', '["senior_member","junior_member","buyer"]'::jsonb, 'active', 4)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_hi = EXCLUDED.title_hi,
  reward_description = EXCLUDED.reward_description,
  status = EXCLUDED.status;
INSERT INTO offer_incentives (id, title_en, title_hi, description, min_plot_count, min_sales_value_inr, reward_description, reward_type, start_date, end_date, eligible_roles, status, claimed_count)
VALUES ('off-star-bike-2026', 'Mega Associate Volume Challenge', 'मेगा एसोसिएट वॉल्यूम चैलेंज (Sports Bike)', 'Achieve ₹1.5 Crore cumulative team sales volume in Q4 2026 and receive an official company-funded Sports Bike experience reward.', 12, 15000000, 'Sports Bike / ₹1.5 Lakh Cash Equivalent', 'vehicle', '2026-10-01', '2026-12-31', '["senior_member","junior_member"]'::jsonb, 'active', 1)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_hi = EXCLUDED.title_hi,
  reward_description = EXCLUDED.reward_description,
  status = EXCLUDED.status;
