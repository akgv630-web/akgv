-- ==============================================================================
-- AKGV INFRA CITY — PRE-REGISTERED ADMIN & STAFF ACCOUNTS MIGRATION
-- Migration: 20261018_preregister_admin_and_staff_accounts.sql
-- Description: Establishes authoritative pre-registered Admin (Preet Yadav) and
--              staff profiles with linked auth.users credentials, ensuring the
--              system administrator can log in without requiring self-registration.
-- ==============================================================================

-- 1. Ensure pgcrypto is enabled for secure password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Upsert Admin Profile in public.profiles
INSERT INTO public.profiles (
    id,
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
    'yadavpreetrajesh@gmail.com',
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
    email = 'yadavpreetrajesh@gmail.com',
    full_name = 'Preet Yadav',
    phone = '6306917991',
    role = 'super_admin',
    member_id = 'AKGV-HQ-001',
    kyc_status = 'verified',
    is_active = TRUE,
    updated_at = timezone('utc', now());

-- 3. If auth schema exists, pre-register in auth.users and link auth_user_id
DO $$
DECLARE
    v_admin_uuid UUID := '4dd0834d-5f5c-4417-bb85-b5cccf50f3e8';
    v_existing_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Check if user exists in auth.users
        SELECT id INTO v_existing_id FROM auth.users WHERE email = 'yadavpreetrajesh@gmail.com' LIMIT 1;

        IF v_existing_id IS NULL THEN
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                phone,
                phone_confirmed_at,
                confirmation_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                v_admin_uuid,
                'authenticated',
                'authenticated',
                'yadavpreetrajesh@gmail.com',
                crypt('Admin@2026', gen_salt('bf')),
                now(),
                '{"provider": "email", "providers": ["email"]}'::jsonb,
                jsonb_build_object('full_name', 'Preet Yadav', 'phone', '6306917991', 'role', 'super_admin', 'member_id', 'AKGV-HQ-001'),
                now(),
                now(),
                '6306917991',
                now(),
                ''
            );
            v_existing_id := v_admin_uuid;
        END IF;

        -- Bind auth_user_id to public.profiles
        UPDATE public.profiles
        SET auth_user_id = v_existing_id,
            full_name = 'Preet Yadav',
            phone = '6306917991',
            role = 'super_admin'
        WHERE id = 'usr-admin-01' OR email = 'yadavpreetrajesh@gmail.com' OR email = 'admin@akgvinfacity.com';
    END IF;
END $$;
