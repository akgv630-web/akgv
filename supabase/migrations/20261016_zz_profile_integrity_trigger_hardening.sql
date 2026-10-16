-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — PROFILE INTEGRITY TRIGGER & SCHEMA HARDENING
-- Migration: 20261016_zz_profile_integrity_trigger_hardening.sql
-- Description:
--   1. Ensure profiles table possesses all intended columns (permissions, level, rank_title, etc.).
--   2. Ensure plots and locations tables possess all intended layout/branch columns.
--   3. Upgrade enforce_profile_update_integrity() to use to_jsonb(NEW) and to_jsonb(OLD).
--   4. Strictly enforce table attachment validation (TG_TABLE_NAME = 'profiles').
--   5. Validate that security-critical columns exist rather than silently bypassing them.
--   6. Re-bind trg_enforce_profile_update_integrity trigger idempotently on public.profiles.
-- ==============================================================================

-- 1. Ensure profiles table possesses all intended columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": true, "canSubmitFieldReports": true, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_business_volume_inr NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plots_closed_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joined_date TEXT;

-- 2. Ensure plots and locations have all intended schema extensions
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS canvas_x INT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS canvas_y INT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS canvas_w INT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS canvas_h INT;

ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS branch_type TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS working_hours TEXT;

-- 3. Harden is_admin() and get_current_user_role() with search_path safety and unambiguous auth resolution
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

CREATE OR REPLACE FUNCTION public.get_current_user_role()
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

REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, anon, service_role;

-- 4. Upgrade enforce_profile_update_integrity function
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new jsonb;
    v_old jsonb;
BEGIN
    -- Ensure trigger is strictly attached to profiles table
    IF TG_TABLE_NAME <> 'profiles' THEN
        RAISE EXCEPTION 'Configuration error: enforce_profile_update_integrity trigger is only valid on public.profiles, but was invoked on %', TG_TABLE_NAME;
    END IF;

    -- Administrators retain full management authority
    IF public.is_admin() THEN
        NEW.updated_at := timezone('utc', now());
        RETURN NEW;
    END IF;

    v_new := to_jsonb(NEW);
    v_old := to_jsonb(OLD);

    -- Do not silently ignore missing security-critical columns on profiles
    IF NOT (v_new ? 'role') OR NOT (v_new ? 'is_active') OR NOT (v_new ? 'kyc_status') OR NOT (v_new ? 'permissions') THEN
        RAISE EXCEPTION 'Schema integrity error: profiles table is missing required security columns';
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

    IF (v_new->>'auth_user_id') IS DISTINCT FROM (v_old->>'auth_user_id') THEN
        RAISE EXCEPTION 'Unauthorized: Cannot alter auth_user_id binding';
    END IF;

    IF (v_new->>'id') IS DISTINCT FROM (v_old->>'id') THEN
        RAISE EXCEPTION 'Unauthorized: Cannot alter profile primary key';
    END IF;

    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

-- 4. Idempotently bind trigger exclusively to public.profiles
DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_integrity
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_integrity();
