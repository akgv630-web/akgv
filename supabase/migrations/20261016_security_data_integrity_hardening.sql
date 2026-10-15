-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — FORWARD-ONLY SECURITY & DATA INTEGRITY MIGRATION
-- Migration: 20261016_security_data_integrity_hardening.sql
-- Description:
--   1. Explicitly drop all legacy policies from 20261011 that bypass fine-grained checks via PostgreSQL OR.
--   2. Exclude super_admin and sub_admin profiles from public_team_directory view.
--   3. Harden record_audit_log procedure: require authenticated caller, block action forging, sanitize details, revoke anon execute.
--   4. Integrate audit logging into create_plot_booking_atomic.
--   5. Implement verify_payment_atomic with row-level locks, separation of duties, and transactional execution.
--   6. Setup private 'evidence' storage bucket and object policies.
-- ==============================================================================

-- 1. DROP ALL OBSOLETE & LEGACY POLICIES (PREVENT OR BYPASS)
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

    -- Drop older open access policies
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

    -- Drop fine-grained policies before recreation
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

-- 2. HARDEN PUBLIC TEAM DIRECTORY VIEW (SCRUB ADMIN IDENTITIES)
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

-- 3. HARDEN AUDIT LOGGING PROCEDURE (REVOKE ANON & BLOCK SPOOFING)
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

-- 4. HARDEN ATOMIC PLOT BOOKING PROCEDURE
CREATE OR REPLACE FUNCTION public.create_plot_booking_atomic(
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

-- 5. ATOMIC PAYMENT VERIFICATION PROCEDURE (WITH SEPARATION OF DUTIES)
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

-- 6. SETUP PRIVATE STORAGE BUCKET FOR EVIDENCE
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

-- 7. RE-APPLY LEAST PRIVILEGE RLS POLICIES
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
