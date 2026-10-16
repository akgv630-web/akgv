-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED — FORWARD-ONLY MIGRATION
-- Migration: 20261016_zzz_sponsor_integrity_hardening.sql
-- Purpose:
--   1. Authoritative sponsor validation & resolution RPC (public.resolve_and_validate_sponsor)
--   2. Enforce sponsor existence, eligibility, and anti-self-referral in profiles trigger
--   3. Extend trigger to BEFORE INSERT OR UPDATE ON public.profiles to block direct API bypasses
--   4. Strictly prevent client privilege escalation, fake member_id, and verified KYC on INSERT
-- ==============================================================================

BEGIN;

-- 1. Create or replace public.resolve_and_validate_sponsor RPC
CREATE OR REPLACE FUNCTION public.resolve_and_validate_sponsor(
    p_identifier TEXT,
    p_candidate_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_id TEXT;
    v_sponsor RECORD;
    v_candidate_auth_id UUID;
BEGIN
    IF p_identifier IS NULL OR trim(p_identifier) = '' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Sponsor identifier cannot be empty.'
        );
    END IF;

    v_clean_id := trim(p_identifier);

    -- Reject malformed inputs (too short or excessively long)
    IF length(v_clean_id) < 3 OR length(v_clean_id) > 100 THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Invalid sponsor identifier format.'
        );
    END IF;

    -- Lookup candidate auth_user_id if candidate profile/auth id passed
    IF p_candidate_id IS NOT NULL AND trim(p_candidate_id) <> '' THEN
        BEGIN
            v_candidate_auth_id := p_candidate_id::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_candidate_auth_id := NULL;
        END IF;
    END IF;

    -- Find matching active sponsor in profiles
    SELECT id, auth_user_id, member_id, full_name, role, is_active
    INTO v_sponsor
    FROM public.profiles
    WHERE (
        LOWER(member_id) = LOWER(v_clean_id)
        OR id = v_clean_id
        OR (auth_user_id::text = v_clean_id)
        OR (
            member_id IS NOT NULL
            AND REPLACE(LOWER(member_id), '-', '') = REPLACE(LOWER(v_clean_id), '-', '')
        )
    )
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Sponsor identifier does not match any registered member.'
        );
    END IF;

    -- Check if sponsor account is active
    IF v_sponsor.is_active = FALSE THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'The specified sponsor account is suspended or inactive.'
        );
    END IF;

    -- Check eligibility: Only members and administrators may sponsor others (buyers cannot sponsor)
    IF v_sponsor.role NOT IN ('super_admin', 'sub_admin', 'senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member') THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'The specified account is not authorized to sponsor members or clients.'
        );
    END IF;

    -- Anti-self-referral check
    IF p_candidate_id IS NOT NULL AND trim(p_candidate_id) <> '' THEN
        IF v_sponsor.id = trim(p_candidate_id)
           OR (v_candidate_auth_id IS NOT NULL AND v_sponsor.auth_user_id = v_candidate_auth_id)
           OR (v_sponsor.member_id IS NOT NULL AND LOWER(v_sponsor.member_id) = LOWER(trim(p_candidate_id)))
        THEN
            RETURN jsonb_build_object(
                'valid', false,
                'error', 'Self-referral is strictly prohibited.'
            );
        END IF;
    END IF;

    -- Canonical sponsor ID: prefer official member_id (e.g. AKGV-3498), fallback to profile id
    RETURN jsonb_build_object(
        'valid', true,
        'canonical_sponsor_id', COALESCE(v_sponsor.member_id, v_sponsor.id),
        'sponsor_profile_id', v_sponsor.id,
        'sponsor_member_id', v_sponsor.member_id,
        'sponsor_name', v_sponsor.full_name,
        'sponsor_role', v_sponsor.role
    );
END;
$$;

-- Revoke and grant minimal permissions
REVOKE ALL ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_and_validate_sponsor(TEXT, TEXT) TO anon, authenticated, service_role;


-- 2. Upgrade enforce_profile_update_integrity to enforce_profile_integrity (handling both INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
            NEW.updated_at := timezone('utc', now());
        END IF;
        RETURN NEW;
    END IF;

    v_new := to_jsonb(NEW);

    -- =========================================================================
    -- INSERT VALIDATION (Blocks Direct API Bypasses)
    -- =========================================================================
    IF TG_OP = 'INSERT' THEN
        -- Non-admins can strictly only register as 'buyer'
        IF COALESCE(NEW.role, 'buyer') <> 'buyer' THEN
            RAISE EXCEPTION 'Unauthorized: Public registrations are strictly limited to buyer role';
        END IF;

        -- Non-admins cannot assign member_id (MLM associate codes are reserved for staff)
        IF NEW.member_id IS NOT NULL AND trim(NEW.member_id) <> '' THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot assign member_id';
        END IF;

        -- Non-admins cannot self-certify KYC status
        IF COALESCE(NEW.kyc_status, 'pending') NOT IN ('pending', 'submitted') THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot set verified KYC status on registration';
        END IF;

        -- Non-admins cannot grant themselves permissions
        IF NEW.permissions IS NOT NULL AND NEW.permissions <> '{}'::jsonb AND NEW.permissions <> '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": true, "canSubmitFieldReports": true, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot assign elevated permissions';
        END IF;

        -- Non-admins cannot set rank or business volume
        NEW.level := 1;
        NEW.total_business_volume_inr := 0;
        NEW.plots_closed_count := 0;

        -- Validate sponsor_id if provided
        IF NEW.sponsor_id IS NOT NULL AND trim(NEW.sponsor_id) <> '' THEN
            v_sponsor_validation := public.resolve_and_validate_sponsor(NEW.sponsor_id, NEW.id);
            IF (v_sponsor_validation->>'valid')::boolean IS NOT TRUE THEN
                RAISE EXCEPTION 'Invalid sponsor: %', (v_sponsor_validation->>'error');
            END IF;
            -- Canonicalize sponsor_id
            NEW.sponsor_id := (v_sponsor_validation->>'canonical_sponsor_id');
        END IF;

        RETURN NEW;
    END IF;

    -- =========================================================================
    -- UPDATE VALIDATION
    -- =========================================================================
    v_old := to_jsonb(OLD);

    -- Schema column completeness
    IF NOT (v_new ? 'role') OR NOT (v_new ? 'is_active') OR NOT (v_new ? 'kyc_status') OR NOT (v_new ? 'permissions') THEN
        RAISE EXCEPTION 'Schema integrity error: profiles table is missing required security columns';
    END IF;

    -- Primary key id and auth_user_id immutability
    IF (v_new->>'id') IS DISTINCT FROM (v_old->>'id') THEN
        RAISE EXCEPTION 'Integrity violation: Primary key id is immutable';
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

    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

-- 3. Attach trigger to profiles for BOTH INSERT AND UPDATE
DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;

CREATE TRIGGER trg_enforce_profile_update_integrity
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_integrity();

COMMIT;
