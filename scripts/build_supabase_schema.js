const fs = require('fs');
const path = require('path');

const storeContent = fs.readFileSync(path.join(__dirname, '../src/lib/store.ts'), 'utf8');
const gtContent = fs.readFileSync(path.join(__dirname, '../src/data/groundTruth.ts'), 'utf8');

const matchPlots = gtContent.match(/export const INITIAL_PLOTS: Plot\[\] = (\[[\s\S]*?\n\];)/);
const plots = matchPlots ? eval(matchPlots[1]) : [];

const matchRev = storeContent.match(/export const INITIAL_REVIEWS: ReviewRecord\[\] = (\[[\s\S]*?\n\];)/);
const reviews = matchRev ? eval(matchRev[1]) : [];

const matchOffers = storeContent.match(/export const INITIAL_OFFERS: OfferIncentive\[\] = (\[[\s\S]*?\n\];)/);
const offers = matchOffers ? eval(matchOffers[1]) : [];

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

-- Helper Functions for Role-Based Row Level Security
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() OR id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin', 'sub_admin') FROM public.profiles WHERE auth_user_id = auth.uid() OR id = auth.uid()::text LIMIT 1),
    FALSE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

-- Trigger to enforce profile update integrity (Prevents non-admin role escalation and tampering with sensitive metrics)
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Administrators retain full management authority
    IF public.is_admin() THEN
        NEW.updated_at := timezone('utc', now());
        RETURN NEW;
    END IF;

    -- Non-admin callers cannot alter sensitive identity, role, or financial tracking attributes
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter role';
    END IF;

    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter active status';
    END IF;

    IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter kyc_status';
    END IF;

    IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter permissions';
    END IF;

    IF NEW.level IS DISTINCT FROM OLD.level THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter level';
    END IF;

    IF NEW.rank_title IS DISTINCT FROM OLD.rank_title THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter rank_title';
    END IF;

    IF NEW.sponsor_id IS DISTINCT FROM OLD.sponsor_id THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter sponsor_id';
    END IF;

    IF NEW.member_id IS DISTINCT FROM OLD.member_id THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter member_id';
    END IF;

    IF NEW.total_business_volume_inr IS DISTINCT FROM OLD.total_business_volume_inr THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter total_business_volume_inr';
    END IF;

    IF NEW.plots_closed_count IS DISTINCT FROM OLD.plots_closed_count THEN
        RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter plots_closed_count';
    END IF;

    IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot alter auth_user_id binding';
    END IF;

    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_integrity
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_integrity();

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
CREATE POLICY "Authenticated create profile" ON profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR ((auth_user_id = auth.uid() OR id = auth.uid()::text) AND role = 'buyer'));
CREATE POLICY "Self or admin update profile" ON profiles FOR UPDATE TO authenticated USING (public.is_admin() OR auth_user_id = auth.uid() OR id = auth.uid()::text) WITH CHECK (public.is_admin() OR ((auth_user_id = auth.uid() OR id = auth.uid()::text) AND role = (SELECT p2.role FROM profiles p2 WHERE p2.auth_user_id = auth.uid() OR p2.id = auth.uid()::text LIMIT 1)));
CREATE POLICY "Admin delete profile" ON profiles FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Buyer or sponsor or admin read bookings" ON bookings FOR SELECT TO authenticated USING (public.is_admin() OR buyer_id = auth.uid()::text OR sponsor_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Buyer create booking" ON bookings FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR buyer_id = auth.uid()::text);
CREATE POLICY "Admin update bookings" ON bookings FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete bookings" ON bookings FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Payer or admin read payments" ON payment_records FOR SELECT TO authenticated USING (public.is_admin() OR payer_id = auth.uid()::text OR booking_id IN (SELECT b.id FROM bookings b WHERE b.buyer_id = auth.uid()::text));
CREATE POLICY "Payer create payment" ON payment_records FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR payer_id = auth.uid()::text);
CREATE POLICY "Admin update payments" ON payment_records FOR UPDATE TO authenticated USING (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text) WITH CHECK (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text);
CREATE POLICY "Admin delete payments" ON payment_records FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Member or admin read targets" ON sales_targets FOR SELECT TO authenticated USING (public.is_admin() OR member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Admin write targets" ON sales_targets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Assigned or admin read tasks" ON task_reminders FOR SELECT TO authenticated USING (public.is_admin() OR assigned_to_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Assigned or admin update tasks" ON task_reminders FOR UPDATE TO authenticated USING (public.is_admin() OR assigned_to_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Admin delete tasks" ON task_reminders FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin create tasks" ON task_reminders FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Recipient or admin read messages" ON in_app_messages FOR SELECT TO authenticated USING (recipient_type = 'all' OR public.is_admin() OR recipient_id = auth.uid()::text);
CREATE POLICY "Admin write messages" ON in_app_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Read gps evidence" ON field_gps_evidence FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.is_admin() OR captured_by_member_id = (SELECT p.member_id FROM profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text LIMIT 1));
CREATE POLICY "Authenticated insert gps evidence" ON field_gps_evidence FOR INSERT TO authenticated WITH CHECK (true);
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

sql += `\n-- 7. Insert Default CMS Content\n`;
sql += `INSERT INTO cms_content (id, hero_headline_en, hero_headline_hi, hero_subtitle_en, hero_subtitle_hi, announcement_banner, public_offers, faqs)
VALUES (
  'main_homepage',
  'Where Dreams Find Their Address in Varanasi',
  'जहां सपने पाते हैं अपना ठिकाना — वाराणसी',
  'Verified residential plots with 30ft & 25ft planned road network, 100% freehold registry, and transparent developer booking.',
  'सुव्यवस्थित टाउनशिप प्लॉट्स, 30 फीट चौड़ी सड़कें, दाखिल-खारिज और सुगम रजिस्ट्री सुविधा।',
  '{"textEn": "Navratri Special: ₹50,000 Registry Subsidy on Block A Corner Plots!", "textHi": "नवरात्रि स्पेशल: ब्लॉक A कॉर्नर प्लॉट्स पर ₹50,000 रजिस्ट्री छूट!", "isActive": true}'::jsonb,
  '[{"id": "off-01", "title": "Zero Brokerage Direct Registry", "highlight": "100% Freehold Title", "badge": "Verified"}]'::jsonb,
  '[{"id": "faq-01", "questionEn": "Is registry done directly at Sub-Registrar office?", "questionHi": "क्या रजिस्ट्री सीधे उप-निबंधक कार्यालय में होती है?", "answerEn": "Yes, 100% direct freehold deed registry is executed at Varanasi Sub-Registrar office with clear revenue mutation (Dakhil-Kharij).", "answerHi": "हाँ, वाराणसी उप-निबंधक कार्यालय में सीधे आपके नाम 100% फ्रीहोल्ड बैनामा रजिस्ट्री की जाती है।", "category": "Legal"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;\n`;

sql += `\n-- 8. Insert Initial Sales Target & Task Reminders\n`;
sql += `INSERT INTO sales_targets (id, member_id, member_name, period, period_label, target_plots_count, target_sales_volume_inr, achieved_plots_count, achieved_sales_volume_inr, status, assigned_by)
VALUES 
  ('tgt-01', 'usr-sponsor-01', 'Vikram Singh', 'monthly', 'October 2026', 3, 3500000, 1, 1200000, 'in_progress', 'Rajesh Kumar Patel (Director)'),
  ('tgt-02', 'usr-junior-01', 'Amit Sharma', 'monthly', 'October 2026', 2, 2400000, 0, 0, 'in_progress', 'Vikram Singh (Senior Associate)')
ON CONFLICT (id) DO NOTHING;\n`;

sql += `INSERT INTO task_reminders (id, assigned_to_member_id, assigned_to_name, title, description, category, due_date, due_time, priority, is_completed, created_by)
VALUES 
  ('task-01', 'usr-sponsor-01', 'Vikram Singh', 'Rampur Site Visit for Mr. Suresh Chandra Gupta', 'Cantt station vehicle pickup coordination at 10:30 AM', 'site_visit', CURRENT_DATE + INTERVAL '2 days', '10:30 AM', 'high', FALSE, 'Director Office'),
  ('task-02', 'usr-admin-01', 'Rajesh Kumar Patel', 'Verify Bank UTR for Plot A-03 Token', 'Check HDFC corporate statement for ₹1.5L NEFT transaction', 'payment_verification', CURRENT_DATE, '04:00 PM', 'urgent', FALSE, 'System')
ON CONFLICT (id) DO NOTHING;\n`;

sql += `\n-- 9. Insert Initial Offer Incentives\n`;
offers.forEach((off) => {
  sql += `INSERT INTO offer_incentives (id, title_en, title_hi, description, min_plot_count, min_sales_value_inr, reward_description, reward_type, start_date, end_date, eligible_roles, status, claimed_count)
VALUES (${escapeSql(off.id)}, ${escapeSql(off.titleEn)}, ${escapeSql(off.titleHi)}, ${escapeSql(off.description)}, ${off.minPlotCount || 'NULL'}, ${off.minSalesValueInr || 'NULL'}, ${escapeSql(off.rewardDescription)}, ${escapeSql(off.rewardType)}, ${escapeSql(off.startDate)}, ${escapeSql(off.endDate)}, ${escapeJson(off.eligibleRoles)}, ${escapeSql(off.status)}, ${off.claimedCount || 0})
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_hi = EXCLUDED.title_hi,
  reward_description = EXCLUDED.reward_description,
  status = EXCLUDED.status;
`;
});

fs.writeFileSync(path.join(__dirname, '../supabase/schema.sql'), sql, 'utf8');
fs.writeFileSync(path.join(__dirname, '../supabase/migrations/20261015_complete_production_schema.sql'), sql, 'utf8');
console.log('Successfully regenerated schema.sql with 18 enterprise tables!');
