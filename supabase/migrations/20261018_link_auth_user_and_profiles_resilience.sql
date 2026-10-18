-- ==============================================================================
-- AKGV INFRA CITY — AUTH USER LINKING & PROFILES RESILIENCE MIGRATION
-- Migration: 20261018_link_auth_user_and_profiles_resilience.sql
-- Description: Establishes the authoritative SECURITY DEFINER RPC `link_current_auth_user`
--              and hardens profiles RLS policies to eliminate profile-lookup race
--              conditions, duplicate email collisions, and chicken-and-egg lockouts.
-- ==============================================================================

-- 1. Create SECURITY DEFINER RPC for seamless profile linking upon authenticated login
CREATE OR REPLACE FUNCTION public.link_current_auth_user()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_email TEXT;
    v_profile RECORD;
BEGIN
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session is unauthenticated');
    END IF;

    -- Extract verified email from auth.users or JWT claims
    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
    IF v_email IS NULL THEN
        BEGIN
            v_email := (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email');
        EXCEPTION WHEN OTHERS THEN
            v_email := NULL;
        END;
    END IF;

    -- Attempt 1: Match profile by existing auth_user_id or text id
    SELECT * INTO v_profile FROM public.profiles 
    WHERE auth_user_id = v_uid OR id = v_uid::text
    LIMIT 1;

    -- Attempt 2: If not found and verified email is available, match by email
    IF v_profile.id IS NULL AND v_email IS NOT NULL THEN
        SELECT * INTO v_profile FROM public.profiles 
        WHERE lower(email) = lower(v_email)
        ORDER BY CASE WHEN role IN ('super_admin', 'sub_admin') THEN 0 ELSE 1 END
        LIMIT 1;

        -- If profile found by email, link canonical auth_user_id now
        IF v_profile.id IS NOT NULL THEN
            UPDATE public.profiles
            SET auth_user_id = v_uid,
                updated_at = timezone('utc', now())
            WHERE id = v_profile.id;
        END IF;
    END IF;

    -- If profile was found or newly linked, return fresh record
    IF v_profile.id IS NOT NULL THEN
        SELECT * INTO v_profile FROM public.profiles WHERE id = v_profile.id;
        RETURN jsonb_build_object(
            'success', true,
            'profile', to_jsonb(v_profile)
        );
    END IF;

    -- Attempt 3: Auto-provision primary Admin profile if logging in as known administrator
    IF lower(v_email) IN ('yadavpreetrajesh@gmail.com', 'admin@akgv.com', 'admin@akgvinfacity.com') THEN
        INSERT INTO public.profiles (
            id,
            auth_user_id,
            email,
            full_name,
            phone,
            role,
            member_id,
            kyc_status,
            is_active,
            city,
            branch_location,
            address,
            level,
            rank_title,
            total_business_volume_inr,
            plots_closed_count,
            joined_date,
            created_at,
            updated_at
        ) VALUES (
            'usr-admin-01',
            v_uid,
            lower(v_email),
            'Preet Yadav',
            '6306917991',
            'super_admin',
            'AKGV-HQ-001',
            'verified',
            TRUE,
            'Varanasi',
            'Rampur Head Office',
            'Near Ring Road Phase-2, Rampur, Varanasi, Uttar Pradesh - 221008',
            7,
            'Director (कंपनी निदेशक)',
            25000000,
            18,
            '2026-01-01',
            timezone('utc', now()),
            timezone('utc', now())
        ) ON CONFLICT (id) DO UPDATE SET
            auth_user_id = v_uid,
            email = lower(v_email),
            role = 'super_admin',
            is_active = TRUE,
            updated_at = timezone('utc', now())
        RETURNING * INTO v_profile;

        RETURN jsonb_build_object(
            'success', true,
            'profile', to_jsonb(v_profile)
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Database profile not found for authenticated user');
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.link_current_auth_user() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.link_current_auth_user() FROM anon, public;

-- 2. Update RLS Policy on public.profiles to permit self-read by verified email
DROP POLICY IF EXISTS "Private profiles read access" ON public.profiles;

CREATE POLICY "Private profiles read access" ON public.profiles 
FOR SELECT TO authenticated USING (
    public.is_admin() 
    OR auth_user_id = auth.uid() 
    OR id = auth.uid()::text
    OR lower(email) = lower(coalesce(
        (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email'),
        ''
    ))
    OR sponsor_id = (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) LIMIT 1)
    OR member_id = (SELECT p.sponsor_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) LIMIT 1)
);

-- 3. Pre-link existing auth.users record for Preet Yadav if it exists
DO $$
DECLARE
    v_admin_uuid UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        SELECT id INTO v_admin_uuid FROM auth.users WHERE lower(email) = 'yadavpreetrajesh@gmail.com' LIMIT 1;
        IF v_admin_uuid IS NOT NULL THEN
            UPDATE public.profiles
            SET auth_user_id = v_admin_uuid,
                role = 'super_admin',
                is_active = TRUE
            WHERE id = 'usr-admin-01' OR lower(email) = 'yadavpreetrajesh@gmail.com';
        END IF;
    END IF;
END $$;
