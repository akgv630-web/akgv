-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — COMPLETE ENTERPRISE RLS & DATA INTEGRITY HARDENING
-- Migration: 20261016_complete_enterprise_rls_hardening.sql
-- Description:
--   1. Re-establish and harden least-privilege RLS policies dropped in prior pass:
--      commission_ledger, kit_issues, receipts, support_tickets, ticket_messages, reward_claims.
--   2. Harden field_gps_evidence INSERT policy (prevent pre-approved status or forging member ID).
--   3. Harden bookings INSERT policy (prevent pre-confirmed status).
--   4. Harden payment_records INSERT policy (prevent zero/negative amounts, pre-verified status, or pre-filled receipts).
--   5. Maintain strict idempotency.
-- ==============================================================================

-- Ensure underlying enterprise tables exist before applying policies
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

CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

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

ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Defensive Column Upgrades (Ensures existing tables have all policy-required columns)
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

DO $$
BEGIN
    -- Drop existing versions of policies to allow clean idempotent re-creation
    DROP POLICY IF EXISTS "Members view own commission" ON commission_ledger;
    DROP POLICY IF EXISTS "Admins manage commission ledger" ON commission_ledger;

    DROP POLICY IF EXISTS "Members view own kit issue" ON kit_issues;
    DROP POLICY IF EXISTS "Admins manage kit issues" ON kit_issues;

    DROP POLICY IF EXISTS "Payers can view own receipts" ON receipts;
    DROP POLICY IF EXISTS "Admins can issue receipts" ON receipts;
    DROP POLICY IF EXISTS "Admins manage receipts" ON receipts;

    DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;

    DROP POLICY IF EXISTS "Users can view customer-visible messages" ON ticket_messages;
    DROP POLICY IF EXISTS "Users can reply to own tickets" ON ticket_messages;
    DROP POLICY IF EXISTS "Admins manage all ticket messages" ON ticket_messages;

    DROP POLICY IF EXISTS "Members view own reward claims" ON reward_claims;
    DROP POLICY IF EXISTS "Members submit reward claims" ON reward_claims;
    DROP POLICY IF EXISTS "Admins manage reward claims" ON reward_claims;

    DROP POLICY IF EXISTS "Authenticated insert gps evidence" ON field_gps_evidence;
    DROP POLICY IF EXISTS "Buyer create booking" ON bookings;
    DROP POLICY IF EXISTS "Payer create payment" ON payment_records;
EXCEPTION
    WHEN undefined_object THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;

-- 1. COMMISSION LEDGER POLICIES
CREATE POLICY "Members view own commission" ON commission_ledger
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR member_id IN (
            SELECT p.member_id FROM profiles p 
            WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins manage commission ledger" ON commission_ledger
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. JOINING KIT ISSUES POLICIES
CREATE POLICY "Members view own kit issue" ON kit_issues
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR member_id IN (
            SELECT p.member_id FROM profiles p 
            WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins manage kit issues" ON kit_issues
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. RECEIPTS POLICIES
CREATE POLICY "Payers can view own receipts" ON receipts
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR booking_id IN (
            SELECT b.id FROM bookings b 
            WHERE b.buyer_id = auth.uid()::text
        )
        OR payment_record_id IN (
            SELECT p.id FROM payment_records p 
            WHERE p.payer_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins manage receipts" ON receipts
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. SUPPORT TICKETS POLICIES
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR user_id = auth.uid()::text
        OR user_id IN (
            SELECT p.id FROM profiles p 
            WHERE p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            (user_id = auth.uid()::text OR user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid()))
            AND status = 'open'
        )
    );

CREATE POLICY "Admins can manage tickets" ON support_tickets
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. TICKET MESSAGES POLICIES
CREATE POLICY "Users can view customer-visible messages" ON ticket_messages
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR (
            ticket_id IN (
                SELECT t.id FROM support_tickets t 
                WHERE t.user_id = auth.uid()::text OR t.user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid())
            )
            AND is_internal_note = FALSE
        )
    );

CREATE POLICY "Users can reply to own tickets" ON ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            ticket_id IN (
                SELECT t.id FROM support_tickets t 
                WHERE t.user_id = auth.uid()::text OR t.user_id IN (SELECT p.id FROM profiles p WHERE p.auth_user_id = auth.uid())
            )
            AND is_internal_note = FALSE
            AND sender_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins manage all ticket messages" ON ticket_messages
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. REWARD CLAIMS POLICIES
CREATE POLICY "Members view own reward claims" ON reward_claims
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR member_id IN (
            SELECT p.member_id FROM profiles p 
            WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
        )
    );

CREATE POLICY "Members submit reward claims" ON reward_claims
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            member_id IN (
                SELECT p.member_id FROM profiles p 
                WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
            )
            AND status = 'pending'
        )
    );

CREATE POLICY "Admins manage reward claims" ON reward_claims
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. HARDEN FIELD GPS EVIDENCE INSERT
CREATE POLICY "Authenticated insert gps evidence" ON field_gps_evidence
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            captured_by_member_id IN (
                SELECT p.member_id FROM profiles p 
                WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
            )
            AND status IN ('pending', 'pending_review')
            AND reviewed_by IS NULL
            AND reviewed_at IS NULL
        )
    );

-- 8. HARDEN BOOKINGS INSERT
CREATE POLICY "Buyer create booking" ON bookings
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            buyer_id = auth.uid()::text
            AND status IN ('pending', 'hold')
            AND (paid_amount_inr IS NULL OR paid_amount_inr = 0)
        )
    );

-- 9. HARDEN PAYMENT RECORDS INSERT
CREATE POLICY "Payer create payment" ON payment_records
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (
            payer_id = auth.uid()::text
            AND status IN ('pending', 'under_review')
            AND amount_inr > 0
            AND receipt_number IS NULL
            AND verified_by IS NULL
            AND verified_at IS NULL
        )
    );
