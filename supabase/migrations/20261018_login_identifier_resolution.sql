-- Migration: 20261018_login_identifier_resolution.sql
-- Description: Adds invitation tracking columns to public.profiles and creates the SECURITY DEFINER RPC
-- resolve_login_identifier(p_identifier TEXT) to permit secure credential resolution (Member ID or Phone -> Email)
-- for unauthenticated logins under strict Row Level Security.

-- 1. Ensure Invitation Tracking Columns Exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Index for phone and member_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_member_id_upper ON public.profiles(UPPER(member_id));

-- 3. Secure Identifier Resolution Function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.resolve_login_identifier(p_identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean TEXT := trim(p_identifier);
    v_digits TEXT;
    v_email TEXT;
BEGIN
    IF v_clean IS NULL OR v_clean = '' THEN
        RETURN NULL;
    END IF;

    -- If identifier contains '@', it is already an email address.
    IF v_clean LIKE '%@%' THEN
        RETURN lower(v_clean);
    END IF;

    -- Extract numerical digits for phone comparisons
    v_digits := regexp_replace(v_clean, '[^0-9]', '', 'g');

    -- Attempt 1: Match by member_id (case-insensitive)
    SELECT lower(email) INTO v_email
    FROM public.profiles
    WHERE member_id ILIKE v_clean
    LIMIT 1;

    IF v_email IS NOT NULL THEN
        RETURN v_email;
    END IF;

    -- Attempt 2: Match by exact phone string
    SELECT lower(email) INTO v_email
    FROM public.profiles
    WHERE phone = v_clean
    LIMIT 1;

    IF v_email IS NOT NULL THEN
        RETURN v_email;
    END IF;

    -- Attempt 3: Match by normalized digits (e.g. 10 digit Indian mobile)
    IF length(v_digits) >= 10 THEN
        SELECT lower(email) INTO v_email
        FROM public.profiles
        WHERE regexp_replace(phone, '[^0-9]', '', 'g') = v_digits
           OR regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%' || right(v_digits, 10)
        LIMIT 1;

        IF v_email IS NOT NULL THEN
            RETURN v_email;
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

-- 4. Grant Execution Permissions (Revoke from anon to block public email enumeration)
REVOKE EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) TO authenticated, service_role;

COMMENT ON FUNCTION public.resolve_login_identifier(TEXT) IS
'Resolves a login identifier (Member ID, Phone, or Email) to its canonical email address. Restricted to trusted service role and authenticated sessions to eliminate public email enumeration.';
