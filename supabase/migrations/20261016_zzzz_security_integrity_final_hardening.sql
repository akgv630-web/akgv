-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — FORWARD-ONLY MIGRATION
-- Migration: 20261016_zzzz_security_integrity_final_hardening.sql
-- Purpose:
--   1. Ensure all security columns exist on public.profiles with least-privilege buyer defaults
--   2. Detach trigger during migration maintenance to prevent self-blocking
--   3. Cleanse any existing buyer accounts to zero elevated staff permissions
--   4. Safely revoke and drop obsolete 2-argument resolve_and_validate_sponsor(TEXT, TEXT) overload
--   5. Create authoritative, search_path-isolated, ambiguity-safe 3-argument sponsor resolution RPC
--      using valid standard SQL expressions (COALESCE, NULLIF) and pg_catalog.btrim
--   6. Fail-closed schema-column checking for BOTH INSERT and UPDATE trigger branches
--   7. Least-privilege buyer role & permission enforcement on direct API INSERTs
--   8. Anti-self-referral checking for profile ID, Auth user ID, and authenticated session
-- ==============================================================================

BEGIN;

-- 1. Idempotently establish all security columns with least-privilege buyer defaults
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sponsor_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_business_volume_inr NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plots_closed_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Temporarily detach legacy trigger during migration maintenance to prevent self-blocking
DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;

-- 3. Cleanse any existing buyer accounts to ensure zero elevated staff permissions
UPDATE public.profiles
SET permissions = '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb
WHERE role = 'buyer'
  AND permissions IS DISTINCT FROM '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb;

-- 4. Safely drop obsolete 2-argument sponsor resolution overload to eliminate function ambiguity
DROP FUNCTION IF EXISTS public.resolve_and_validate_sponsor(TEXT, TEXT);

-- 5. Create authoritative, search_path-isolated sponsor validation RPC (3 arguments)
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

    -- Return sanitized public advisor information without exposing internal UUIDs
    RETURN pg_catalog.jsonb_build_object(
        'valid', true,
        'canonical_sponsor_id', COALESCE(v_sponsor.member_id, v_sponsor.id),
        'sponsor_member_id', v_sponsor.member_id,
        'sponsor_name', v_sponsor.full_name,
        'sponsor_role', v_sponsor.role
    );
END;
$$;

-- Ensure roles exist for portable database execution
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role;
  END IF;
END $$;

-- Revoke public permissions and grant minimal execution
REVOKE ALL ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;


-- 6. Upgrade enforce_profile_update_integrity with fail-closed schema checks on BOTH INSERT & UPDATE
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

    -- Primary key id and auth_user_id immutability
    IF (v_new->>'id') IS DISTINCT FROM (v_old->>'id') THEN
        RAISE EXCEPTION 'Unauthorized: Cannot alter profile primary key';
    END IF;

    IF (v_new->>'auth_user_id') IS DISTINCT FROM (v_old->>'auth_user_id') AND (v_old->>'auth_user_id') IS NOT NULL THEN
        RAISE EXCEPTION 'Integrity violation: auth_user_id cannot be reassigned once established';
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

-- 7. Re-attach trigger on public.profiles
CREATE TRIGGER trg_enforce_profile_update_integrity
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_integrity();

-- 8. Revoke direct execute on trigger function from PUBLIC
REVOKE ALL ON FUNCTION public.enforce_profile_update_integrity() FROM PUBLIC;

COMMIT;
