-- Migration: 20261018_database_member_id_and_booking_hardening.sql
-- Description:
--   1. Anti-Enumeration: Revoke anonymous EXECUTE on resolve_login_identifier() to eliminate email enumeration.
--   2. Concurrency-Safe Member ID sequence and trigger (assign_database_member_id) on public.profiles.
--   3. Authoritative Pricing & Server-Side Sponsor Attribution in create_plot_booking_atomic().

BEGIN;

-- 1. Anti-Enumeration: Revoke anon execute on resolve_login_identifier if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'resolve_login_identifier'
    ) THEN
        REVOKE EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) FROM anon, public;
        GRANT EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) TO authenticated, service_role;
    END IF;
END $$;

-- 2. Concurrency-Safe Member ID Generation Sequence and Trigger
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1000 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.assign_database_member_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_next_val BIGINT;
    v_candidate_id TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Only auto-assign if member_id was not explicitly provided or is blank, and role is an associate or administrative role
    IF (NEW.member_id IS NULL OR trim(NEW.member_id) = '') AND NEW.role IN ('junior_member', 'senior_member', 'sub_admin', 'super_admin', 'member') THEN
        -- Advisory lock prevents concurrent sequence check collisions
        PERFORM pg_advisory_xact_lock(7429103);
        LOOP
            v_next_val := nextval('public.member_id_seq');
            v_candidate_id := 'AKGV-' || LPAD(v_next_val::TEXT, 4, '0');
            SELECT EXISTS(SELECT 1 FROM public.profiles WHERE UPPER(member_id) = UPPER(v_candidate_id)) INTO v_exists;
            IF NOT v_exists THEN
                NEW.member_id := v_candidate_id;
                EXIT;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_member_id ON public.profiles;
CREATE TRIGGER trg_assign_member_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_database_member_id();

-- Helper function to retrieve next sequence value safely (for pre-flight validation if desired)
CREATE OR REPLACE FUNCTION public.peek_next_member_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_val BIGINT;
BEGIN
    SELECT last_value INTO v_val FROM public.member_id_seq;
    RETURN 'AKGV-' || LPAD((COALESCE(v_val, 999) + 1)::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.peek_next_member_id() TO authenticated, service_role;

-- 3. Hardened Atomic Plot Booking with Authoritative Pricing & Server-Side Sponsor Attribution
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
    v_authoritative_price NUMERIC;
    v_sponsor_res JSONB;
    v_canonical_sponsor_id TEXT := NULL;
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

    -- 1. Lock the plot row FOR UPDATE to prevent concurrency race conditions
    SELECT * INTO v_plot FROM public.plots WHERE id = p_plot_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Plot not found');
    END IF;

    -- 2. Check plot availability
    IF v_plot.status NOT IN ('available_green') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Plot is not available for booking (status: ' || v_plot.status || ')');
    END IF;

    -- 3. Check for existing active booking/hold
    SELECT * INTO v_existing_booking FROM public.bookings 
    WHERE plot_id = p_plot_id AND status IN ('confirmed', 'under_review', 'hold', 'pending')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'An active reservation or booking already exists for this plot');
    END IF;

    -- 4. Authoritative Pricing Derivation & Validation
    IF v_plot.base_price_inr IS NOT NULL AND v_plot.base_price_inr > 0 THEN
        v_authoritative_price := v_plot.base_price_inr;
        -- Validate caller-supplied amount is not less than the authoritative base price
        IF p_total_amount IS NOT NULL AND p_total_amount < v_authoritative_price THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Submitted booking amount (' || p_total_amount || ') cannot be less than the approved plot base price (' || v_authoritative_price || ')'
            );
        END IF;
    ELSE
        v_authoritative_price := COALESCE(p_total_amount, 1500000);
    END IF;

    -- 5. Server-side Sponsor / Sales Attribution Validation
    IF p_sponsor_id IS NOT NULL AND trim(p_sponsor_id) <> '' THEN
        v_sponsor_res := public.resolve_and_validate_sponsor(trim(p_sponsor_id), p_buyer_id);
        IF (v_sponsor_res->>'valid')::BOOLEAN = FALSE THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Invalid sponsor attribution: ' || COALESCE(v_sponsor_res->>'error', 'Sponsor not found or ineligible')
            );
        END IF;
        v_canonical_sponsor_id := v_sponsor_res->>'member_id';
    END IF;

    -- 6. Generate booking record
    v_new_booking_id := 'bk-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_booking_number := 'BK-2026-' || floor(100 + random() * 900)::text;
    v_hold_expires := now() + interval '72 hours';

    INSERT INTO public.bookings (
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
        v_canonical_sponsor_id,
        'pending',
        p_house_model_id,
        v_authoritative_price,
        0,
        v_hold_expires,
        now()
    );

    -- 7. Mark plot status as hold_pending
    UPDATE public.plots 
    SET status = 'hold_pending', updated_at = now() 
    WHERE id = p_plot_id;

    -- 8. Authoritative audit log
    PERFORM public.record_audit_log(
        'CREATE_PLOT_BOOKING',
        'bookings',
        v_new_booking_id,
        jsonb_build_object(
            'plot_id', p_plot_id,
            'plot_number', v_plot.plot_number,
            'booking_number', v_booking_number,
            'total_amount', v_authoritative_price,
            'sponsor_id', v_canonical_sponsor_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_new_booking_id,
        'booking_number', v_booking_number,
        'plot_number', v_plot.plot_number,
        'total_amount_inr', v_authoritative_price,
        'sponsor_id', v_canonical_sponsor_id,
        'hold_expires_at', v_hold_expires
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_plot_booking_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_plot_booking_atomic TO authenticated;

COMMIT;
