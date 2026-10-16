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
