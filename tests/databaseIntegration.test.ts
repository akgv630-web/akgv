import { describe, it, expect, beforeEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

describe('Real PostgreSQL Database Integration Suite (PGlite 18 Engine)', () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();

    // 1. Establish auth schema, roles, and session helpers
    await db.exec(`
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

      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.sub', true), ''),
          NULLIF(current_setting('my.session_uid', true), '')
        )::uuid;
      $$;

      -- Base profiles table definition matching canonical schema
      CREATE TABLE public.profiles (
        id TEXT PRIMARY KEY,
        auth_user_id UUID UNIQUE,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'buyer',
        member_id TEXT UNIQUE,
        sponsor_id TEXT,
        kyc_status TEXT NOT NULL DEFAULT 'pending',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        avatar_url TEXT,
        city TEXT,
        branch_location TEXT,
        address TEXT,
        level INT DEFAULT 1,
        rank_title TEXT,
        total_business_volume_inr NUMERIC DEFAULT 0,
        plots_closed_count INT DEFAULT 0,
        joined_date TEXT,
        permissions JSONB DEFAULT '{"canCreateDownline": false, "canManagePlots": false, "canRecordEnquiries": false, "canSubmitFieldReports": false, "canViewTeamSales": false, "canVerifyPayments": false, "canEditCms": false}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
      );

      -- Admin check helper
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      STABLE
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_role TEXT;
      BEGIN
        IF current_setting('my.is_admin', true) = 'true' THEN
          RETURN TRUE;
        END IF;

        IF auth.uid() IS NULL THEN
          RETURN FALSE;
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

        RETURN COALESCE(v_role IN ('super_admin', 'sub_admin'), FALSE);
      END;
      $$;
    `);
  });

  it('successfully applies migration 20261016_zzzz without errors and cleanses buyer permissions', async () => {
    // Insert a buyer profile with legacy elevated permissions before migration
    await db.exec(`
      INSERT INTO public.profiles (
        id, email, full_name, phone, role, permissions, member_id, sponsor_id, is_active
      ) VALUES (
        'usr-legacy-buyer-01', 'buyer01@example.com', 'Legacy Buyer', '9999999999', 'buyer',
        '{"canRecordEnquiries": true, "canSubmitFieldReports": true}'::jsonb, NULL, NULL, TRUE
      );
    `);

    // Read and execute 20261016_zzzz migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    await db.exec(migrationSql);

    // Verify buyer permissions were cleansed to zero staff permissions
    const res = await db.query<{ permissions: Record<string, boolean> }>(`
      SELECT permissions FROM public.profiles WHERE id = 'usr-legacy-buyer-01';
    `);

    expect(res.rows[0].permissions).toEqual({
      canCreateDownline: false,
      canManagePlots: false,
      canRecordEnquiries: false,
      canSubmitFieldReports: false,
      canViewTeamSales: false,
      canVerifyPayments: false,
      canEditCms: false,
    });
  });

  describe('resolve_and_validate_sponsor on real PostgreSQL', () => {
    beforeEach(async () => {
      // Apply migration
      const migrationPath = path.join(__dirname, '../supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await db.exec(migrationSql);

      // Seed test sponsors and members under admin authority
      await db.exec(`
        SET my.is_admin = 'true';

        -- Active Senior Member (Valid sponsor)
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active, kyc_status
        ) VALUES (
          'usr-sponsor-01', '11111111-1111-1111-1111-111111111111'::uuid, 'sponsor@example.com',
          'Sponsor Patel', '9876543210', 'senior_member', 'AKGV-3498', TRUE, 'verified'
        );

        -- Inactive / Suspended Member
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active, kyc_status
        ) VALUES (
          'usr-sponsor-suspended', '22222222-2222-2222-2222-222222222222'::uuid, 'suspended@example.com',
          'Suspended Singh', '9876543211', 'senior_member', 'AKGV-9999', FALSE, 'verified'
        );

        -- Buyer account (Ineligible to sponsor)
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active, kyc_status
        ) VALUES (
          'usr-buyer-01', '33333333-3333-3333-3333-333333333333'::uuid, 'buyer@example.com',
          'Regular Buyer', '9876543212', 'buyer', NULL, TRUE, 'pending'
        );

        -- Duplicate / Collision profiles sharing an identifier (one by member_id, one by id)
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active
        ) VALUES 
        ('usr-dup-01', '44444444-4444-4444-4444-444444444441'::uuid, 'dup1@example.com', 'Dup One', '9876543213', 'senior_member', 'AKGV-COLLIDE', TRUE),
        ('AKGV-COLLIDE', '44444444-4444-4444-4444-444444444442'::uuid, 'dup2@example.com', 'Dup Two', '9876543214', 'senior_member', 'AKGV-UNIQUE-02', TRUE);

        SET my.is_admin = 'false';
      `);
    });

    it('resolves valid sponsor by member_id without exposing internal UUID or roles', async () => {
      const res = await db.query<{ res: { valid: boolean; canonical_sponsor_id: string; sponsor_name: string; sponsor_role?: string; sponsor_member_id?: string; sponsor_profile_id?: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498') AS res;
      `);
      const data = res.rows[0].res;
      expect(data.valid).toBe(true);
      expect(data.canonical_sponsor_id).toBe('AKGV-3498');
      expect(data.sponsor_name).toBe('Sponsor Patel');
      // Must not leak internal roles, unneeded member IDs, or private internal database UUID
      expect(data.sponsor_role).toBeUndefined();
      expect(data.sponsor_member_id).toBeUndefined();
      expect(data.sponsor_profile_id).toBeUndefined();
    });

    it('resolves valid sponsor by profile id', async () => {
      const res = await db.query<{ res: { valid: boolean; canonical_sponsor_id: string } }>(`
        SELECT public.resolve_and_validate_sponsor('usr-sponsor-01') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(true);
      expect(res.rows[0].res.canonical_sponsor_id).toBe('AKGV-3498');
    });

    it('resolves valid sponsor by Auth UUID', async () => {
      const res = await db.query<{ res: { valid: boolean; canonical_sponsor_id: string } }>(`
        SELECT public.resolve_and_validate_sponsor('11111111-1111-1111-1111-111111111111') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(true);
      expect(res.rows[0].res.canonical_sponsor_id).toBe('AKGV-3498');
    });

    it('detects ambiguous sponsor identifiers with multiple matches', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-COLLIDE') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('Ambiguous sponsor identifier. Multiple matching records found.');
    });

    it('rejects unknown sponsor identifier', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-NONEXISTENT') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('Sponsor identifier does not match any registered member.');
    });

    it('rejects inactive or suspended sponsor accounts', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-9999') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('The specified sponsor account is suspended or inactive.');
    });

    it('rejects buyers as sponsors', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('usr-buyer-01') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('The specified account is not authorized to sponsor members or clients.');
    });

    it('prohibits self-referral via candidate_profile_id', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498', 'usr-sponsor-01', NULL) AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('Self-referral is strictly prohibited.');
    });

    it('prohibits self-referral via candidate_auth_id', async () => {
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498', NULL, '11111111-1111-1111-1111-111111111111') AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('Self-referral is strictly prohibited.');
    });

    it('prohibits self-referral via active authenticated session auth.uid()', async () => {
      await db.exec(`SET my.session_uid = '11111111-1111-1111-1111-111111111111';`);
      const res = await db.query<{ res: { valid: boolean; error: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498', NULL, NULL) AS res;
      `);
      expect(res.rows[0].res.valid).toBe(false);
      expect(res.rows[0].res.error).toBe('Self-referral is strictly prohibited.');
      await db.exec(`SET my.session_uid = '';`);
    });

    it('safely handles 1, 2, or 3 arguments without overload ambiguity', async () => {
      // 1 argument call
      const res1 = await db.query<{ res: { valid: boolean } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498') AS res;
      `);
      expect(res1.rows[0].res.valid).toBe(true);

      // 2 argument call
      const res2 = await db.query<{ res: { valid: boolean } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498', 'candidate-other-user') AS res;
      `);
      expect(res2.rows[0].res.valid).toBe(true);

      // 3 argument call
      const res3 = await db.query<{ res: { valid: boolean } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498', 'candidate-other-user', '99999999-9999-9999-9999-999999999999') AS res;
      `);
      expect(res3.rows[0].res.valid).toBe(true);
    });
  });

  describe('enforce_profile_update_integrity trigger on real PostgreSQL', () => {
    beforeEach(async () => {
      const migrationPath = path.join(__dirname, '../supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await db.exec(migrationSql);

      // Active sponsor for tests (provisioned under admin authority)
      await db.exec(`
        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active
        ) VALUES (
          'usr-sponsor-01', '11111111-1111-1111-1111-111111111111'::uuid, 'sponsor@example.com',
          'Sponsor Patel', '9876543210', 'senior_member', 'AKGV-3498', TRUE
        );
        SET my.is_admin = 'false';
      `);
    });

    it('rejects public INSERT attempting to forge privileged role', async () => {
      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            'usr-forged-admin', 'forged@example.com', 'Forged Admin', '9876543210', 'super_admin',
            TRUE, 'pending', '{"canCreateDownline": false}'::jsonb, NULL, NULL
          );
        `)
      ).rejects.toThrow('Unauthorized: Public registrations are strictly limited to buyer role');
    });

    it('rejects public INSERT attempting to forge member_id', async () => {
      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            'usr-forged-member', 'forged2@example.com', 'Forged Member', '9876543210', 'buyer',
            TRUE, 'pending', '{"canCreateDownline": false}'::jsonb, NULL, 'AKGV-FORGED-01'
          );
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot assign member_id');
    });

    it('rejects public INSERT attempting to forge verified KYC status', async () => {
      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            'usr-forged-kyc', 'forged3@example.com', 'Forged KYC', '9876543210', 'buyer',
            TRUE, 'verified', '{"canCreateDownline": false}'::jsonb, NULL, NULL
          );
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot set verified KYC status on registration');
    });

    it('rejects public INSERT attempting to self-grant elevated staff permissions', async () => {
      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            'usr-forged-perm', 'forged4@example.com', 'Forged Perms', '9876543210', 'buyer',
            TRUE, 'pending', '{"canRecordEnquiries": true, "canManagePlots": true}'::jsonb, NULL, NULL
          );
        `)
      ).rejects.toThrow('Unauthorized: Elevated permissions cannot be granted to public buyer accounts');
    });

    it('rejects public INSERT attempting to self-assign business volume or level', async () => {
      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id, total_business_volume_inr
          ) VALUES (
            'usr-forged-vol', 'forged5@example.com', 'Forged Vol', '9876543210', 'buyer',
            TRUE, 'pending', '{"canCreateDownline": false}'::jsonb, NULL, NULL, 5000000
          );
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot assign level, rank_title, or business volume');
    });

    it('allows valid buyer registration with least-privilege defaults and validates sponsor_id', async () => {
      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          'usr-legit-buyer', 'legit@example.com', 'Legit Buyer', '9876543210', 'buyer',
          TRUE, 'pending', NULL, 'AKGV-3498', NULL
        );
      `);

      const res = await db.query<{ role: string; kyc_status: string; member_id: string | null; sponsor_id: string; permissions: Record<string, boolean> }>(`
        SELECT role, kyc_status, member_id, sponsor_id, permissions
        FROM public.profiles
        WHERE id = 'usr-legit-buyer';
      `);

      const buyer = res.rows[0];
      expect(buyer.role).toBe('buyer');
      expect(buyer.kyc_status).toBe('pending');
      expect(buyer.member_id).toBeNull();
      expect(buyer.sponsor_id).toBe('AKGV-3498');
      expect(buyer.permissions).toEqual({
        canCreateDownline: false,
        canManagePlots: false,
        canRecordEnquiries: false,
        canSubmitFieldReports: false,
        canViewTeamSales: false,
        canVerifyPayments: false,
        canEditCms: false,
      });
    });

    it('enforces immutability of primary key id on UPDATE', async () => {
      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          'usr-update-target', 'update@example.com', 'Update User', '9876543210', 'buyer',
          TRUE, 'pending', NULL, NULL, NULL
        );
      `);

      await expect(
        db.exec(`
          UPDATE public.profiles
          SET id = 'usr-tampered-id'
          WHERE id = 'usr-update-target';
        `)
      ).rejects.toThrow('Unauthorized: Cannot alter profile primary key');
    });

    it('blocks non-admin caller from altering role on UPDATE', async () => {
      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          'usr-escalate-target', 'esc@example.com', 'Escalate User', '9876543210', 'buyer',
          TRUE, 'pending', NULL, NULL, NULL
        );
      `);

      await expect(
        db.exec(`
          UPDATE public.profiles
          SET role = 'super_admin'
          WHERE id = 'usr-escalate-target';
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot alter role');
    });

    it('blocks non-admin caller from altering permissions on UPDATE', async () => {
      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          'usr-perm-target', 'perm@example.com', 'Perm User', '9876543210', 'buyer',
          TRUE, 'pending', NULL, NULL, NULL
        );
      `);

      await expect(
        db.exec(`
          UPDATE public.profiles
          SET permissions = '{"canManagePlots": true}'::jsonb
          WHERE id = 'usr-perm-target';
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot alter permissions');
    });

    it('allows permitted non-admin profile attribute updates (e.g. phone, address, city)', async () => {
      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          'usr-editable', 'editable@example.com', 'Editable User', '9876543210', 'buyer',
          TRUE, 'pending', NULL, NULL, NULL
        );
      `);

      await db.exec(`
        UPDATE public.profiles
        SET phone = '9111111111',
            city = 'Varanasi',
            address = 'Rampur Colony'
        WHERE id = 'usr-editable';
      `);

      const res = await db.query<{ phone: string; city: string; address: string }>(`
        SELECT phone, city, address FROM public.profiles WHERE id = 'usr-editable';
      `);

      expect(res.rows[0].phone).toBe('9111111111');
      expect(res.rows[0].city).toBe('Varanasi');
      expect(res.rows[0].address).toBe('Rampur Colony');
    });

    it('rejects public unauthenticated INSERT attempting to set auth_user_id', async () => {
      // Unauthenticated session (auth.uid() is null)
      await db.exec(`SET my.session_uid = '';`);

      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, auth_user_id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            'usr-anon-forged', '55555555-5555-5555-5555-555555555555'::uuid, 'anonforged@example.com',
            'Anon Forged', '9876543210', 'buyer', TRUE, 'pending', NULL, NULL, NULL
          );
        `)
      ).rejects.toThrow('Unauthorized: Unauthenticated clients cannot bind a profile to an auth_user_id');
    });

    it('rejects authenticated INSERT attempting to forge another user auth_user_id', async () => {
      // Authenticated session as user A
      await db.exec(`SET my.session_uid = '66666666-6666-6666-6666-666666666661';`);

      await expect(
        db.exec(`
          INSERT INTO public.profiles (
            id, auth_user_id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
          ) VALUES (
            '66666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666662'::uuid,
            'crossuser@example.com', 'Cross User', '9876543210', 'buyer', TRUE, 'pending', NULL, NULL, NULL
          );
        `)
      ).rejects.toThrow('Unauthorized: Profile auth_user_id must match authenticated session identity');

      await db.exec(`SET my.session_uid = '';`);
    });

    it('binds authenticated buyer profile to session auth.uid() on INSERT', async () => {
      const legitUid = '77777777-7777-7777-7777-777777777777';
      await db.exec(`SET my.session_uid = '${legitUid}';`);

      await db.exec(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, is_active, kyc_status, permissions, sponsor_id, member_id
        ) VALUES (
          '${legitUid}', 'boundbuyer@example.com', 'Bound Buyer', '9876543210', 'buyer',
          TRUE, 'pending', NULL, 'AKGV-3498', NULL
        );
      `);

      const res = await db.query<{ id: string; auth_user_id: string }>(`
        SELECT id, auth_user_id FROM public.profiles WHERE id = '${legitUid}';
      `);

      expect(res.rows[0].id).toBe(legitUid);
      expect(res.rows[0].auth_user_id).toBe(legitUid);

      await db.exec(`SET my.session_uid = '';`);
    });

    it('rejects non-admin UPDATE attempting to claim someone else unlinked profile', async () => {
      // Seed unlinked associate profile under admin
      await db.exec(`
        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active
        ) VALUES (
          'prof-unlinked-associate', NULL, 'unlinked@akgvinfra.com', 'Unlinked Associate', '9876543299', 'senior_member', 'AKGV-UNLINK', TRUE
        );
        SET my.is_admin = 'false';
      `);

      // Attacker authenticated as user 8
      const attackerUid = '88888888-8888-8888-8888-888888888888';
      await db.exec(`SET my.session_uid = '${attackerUid}';`);

      await expect(
        db.exec(`
          UPDATE public.profiles
          SET auth_user_id = '${attackerUid}'::uuid
          WHERE id = 'prof-unlinked-associate';
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users cannot claim or modify unlinked profiles belonging to another entity');

      await db.exec(`SET my.session_uid = '';`);
    });

    it('allows legitimate user to link their own unlinked profile on UPDATE', async () => {
      const userUid = '99999999-9999-9999-9999-999999999999';
      // Seed legacy unlinked profile where id = userUid
      await db.exec(`
        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, is_active
        ) VALUES (
          '${userUid}', NULL, 'legacyself@example.com', 'Legacy Self', '9876543288', 'buyer', TRUE
        );
        SET my.is_admin = 'false';
      `);

      // Caller authenticated as userUid links their own record
      await db.exec(`SET my.session_uid = '${userUid}';`);

      await db.exec(`
        UPDATE public.profiles
        SET auth_user_id = '${userUid}'::uuid
        WHERE id = '${userUid}';
      `);

      const res = await db.query<{ id: string; auth_user_id: string }>(`
        SELECT id, auth_user_id FROM public.profiles WHERE id = '${userUid}';
      `);

      expect(res.rows[0].auth_user_id).toBe(userUid);

      await db.exec(`SET my.session_uid = '';`);
    });

    it('rejects non-admin UPDATE attempting to modify another user profile', async () => {
      // Victim profile
      const victimUid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      await db.exec(`
        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, is_active
        ) VALUES (
          '${victimUid}', '${victimUid}'::uuid, 'victim@example.com', 'Victim User', '9876543277', 'buyer', TRUE
        );
        SET my.is_admin = 'false';
      `);

      // Attacker authenticated as user B
      const attackerUid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      await db.exec(`SET my.session_uid = '${attackerUid}';`);

      await expect(
        db.exec(`
          UPDATE public.profiles
          SET phone = '9999999999'
          WHERE id = '${victimUid}';
        `)
      ).rejects.toThrow('Unauthorized: Non-admin users can only update their own profile');

      await db.exec(`SET my.session_uid = '';`);
    });
  });

  describe('Login Identifier Resolution RPC (20261018_login_identifier_resolution)', () => {
    beforeEach(async () => {
      // Execute 20261018 migration
      const migrationPath = path.join(__dirname, '../supabase/migrations/20261018_login_identifier_resolution.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await db.exec(migrationSql);

      // Seed profiles
      await db.exec(`
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, member_id, is_active
        ) VALUES 
        ('usr-assoc-1', '11111111-1111-1111-1111-111111111111'::uuid, 'vikram@akgv.com', 'Vikram Singh', '9876543210', 'senior_member', 'AKGV-3498', TRUE),
        ('usr-assoc-2', '22222222-2222-2222-2222-222222222222'::uuid, 'amit@akgv.com', 'Amit Sharma', '+91 9123456789', 'junior_member', 'AKGV-0042', TRUE);
      `);
    });

    it('resolves canonical email from Member ID (case-insensitive)', async () => {
      const resUpper = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('AKGV-3498');
      `);
      expect(resUpper.rows[0].resolve_login_identifier).toBe('vikram@akgv.com');

      const resLower = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('akgv-3498');
      `);
      expect(resLower.rows[0].resolve_login_identifier).toBe('vikram@akgv.com');
    });

    it('resolves canonical email from exact and formatted phone numbers', async () => {
      const resExact = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('9876543210');
      `);
      expect(resExact.rows[0].resolve_login_identifier).toBe('vikram@akgv.com');

      const resFormatted = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('9123456789');
      `);
      expect(resFormatted.rows[0].resolve_login_identifier).toBe('amit@akgv.com');
    });

    it('returns lowercase email directly when identifier is already an email', async () => {
      const res = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('Vikram@akgv.COM');
      `);
      expect(res.rows[0].resolve_login_identifier).toBe('vikram@akgv.com');
    });

    it('returns NULL for unknown or empty identifiers without errors', async () => {
      const resUnknown = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('UNKNOWN-9999');
      `);
      expect(resUnknown.rows[0].resolve_login_identifier).toBeNull();

      const resEmpty = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('');
      `);
      expect(resEmpty.rows[0].resolve_login_identifier).toBeNull();
    });

    it('executes safely when called by backend service_role without authenticated user session', async () => {
      await db.exec(`SET my.session_uid = '';`);
      const res = await db.query<{ resolve_login_identifier: string }>(`
        SELECT public.resolve_login_identifier('AKGV-0042');
      `);
      expect(res.rows[0].resolve_login_identifier).toBe('amit@akgv.com');
    });

    it('prohibits anonymous role from executing resolve_login_identifier to eliminate public email enumeration', async () => {
      await db.exec(`SET ROLE anon;`);
      let errorThrown = false;
      try {
        await db.query(`SELECT public.resolve_login_identifier('AKGV-0042');`);
      } catch (err: unknown) {
        errorThrown = true;
        expect((err as Error).message.toLowerCase()).toContain('permission denied');
      } finally {
        await db.exec(`RESET ROLE;`);
      }
      expect(errorThrown).toBe(true);
    });

    it('permits service_role to execute resolve_login_identifier for trusted backend login flow', async () => {
      await db.exec(`SET ROLE service_role;`);
      try {
        const res = await db.query<{ resolve_login_identifier: string }>(`
          SELECT public.resolve_login_identifier('AKGV-0042');
        `);
        expect(res.rows[0].resolve_login_identifier).toBe('amit@akgv.com');
      } finally {
        await db.exec(`RESET ROLE;`);
      }
    });
  });

  describe('Database-Enforced Member ID Sequence & Hardened Booking Integrity (20261018_database_member_id_and_booking_hardening)', () => {
    beforeEach(async () => {
      // 1. Establish tables, audit log helper, and sponsor validator
      await db.exec(`
        CREATE TABLE IF NOT EXISTS public.plots (
          id TEXT PRIMARY KEY,
          plot_number TEXT UNIQUE NOT NULL,
          block TEXT NOT NULL,
          area_sqft NUMERIC NOT NULL,
          dimensions TEXT,
          road_width TEXT,
          road_facing TEXT,
          status TEXT NOT NULL DEFAULT 'available_green',
          base_price_inr NUMERIC,
          suitable_house_model_ids JSONB DEFAULT '[]'::jsonb,
          is_corner_plot BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS public.bookings (
          id TEXT PRIMARY KEY,
          booking_number TEXT UNIQUE NOT NULL,
          plot_id TEXT NOT NULL REFERENCES public.plots(id),
          plot_number TEXT NOT NULL,
          buyer_id TEXT NOT NULL,
          buyer_name TEXT NOT NULL,
          buyer_phone TEXT NOT NULL,
          sponsor_id TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          house_model_id TEXT,
          total_amount_inr NUMERIC NOT NULL,
          paid_amount_inr NUMERIC DEFAULT 0,
          hold_expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now(),
          confirmed_at TIMESTAMPTZ
        );

        CREATE OR REPLACE FUNCTION public.record_audit_log(p_action TEXT, p_entity TEXT, p_id TEXT, p_meta JSONB)
        RETURNS VOID LANGUAGE plpgsql AS $$
        BEGIN
          -- Stub for integration test audit trail
        END;
        $$;
      `);

      // 2. Load sponsor validation and final security integrity migration
      const sponsorMigrationPath = path.join(__dirname, '../supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql');
      const sponsorMigrationSql = fs.readFileSync(sponsorMigrationPath, 'utf8');
      await db.exec(sponsorMigrationSql);

      // 3. Execute 20261018_database_member_id_and_booking_hardening migration
      const migrationPath = path.join(__dirname, '../supabase/migrations/20261018_database_member_id_and_booking_hardening.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await db.exec(migrationSql);
    });

    it('auto-assigns sequential AKGV-xxxx Member IDs via database trigger when not provided', async () => {
      await db.exec(`SET my.is_admin = 'true';`);
      const res1 = await db.query<{ id: string; member_id: string }>(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role
        ) VALUES (
          'usr-new-01', 'newmember1@akgv.com', 'New Member One', '9000000001', 'junior_member'
        ) RETURNING id, member_id;
      `);

      expect(res1.rows[0].member_id).toMatch(/^AKGV-\d{4}$/);
      const firstId = res1.rows[0].member_id;

      const res2 = await db.query<{ id: string; member_id: string }>(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role
        ) VALUES (
          'usr-new-02', 'newmember2@akgv.com', 'New Member Two', '9000000002', 'junior_member'
        ) RETURNING id, member_id;
      `);

      expect(res2.rows[0].member_id).toMatch(/^AKGV-\d{4}$/);
      expect(res2.rows[0].member_id).not.toBe(firstId);
    });

    it('preserves explicitly supplied valid member_id without overwriting', async () => {
      await db.exec(`SET my.is_admin = 'true';`);
      const res = await db.query<{ id: string; member_id: string }>(`
        INSERT INTO public.profiles (
          id, email, full_name, phone, role, member_id
        ) VALUES (
          'usr-manual-01', 'manual@akgv.com', 'Manual Associate', '9000000003', 'senior_member', 'AKGV-9999'
        ) RETURNING id, member_id;
      `);

      expect(res.rows[0].member_id).toBe('AKGV-9999');
    });

    it('enforces authoritative plot price and rejects underpriced booking requests', async () => {
      // Seed a plot with approved base price of 1,800,000 INR
      await db.exec(`
        INSERT INTO public.plots (
          id, plot_number, block, area_sqft, status, base_price_inr
        ) VALUES (
          'plot-premium-01', 'A-01', 'A', 1500, 'available_green', 1800000
        ) ON CONFLICT (id) DO UPDATE SET status = 'available_green', base_price_inr = 1800000;
      `);

      // Mock caller authentication as buyer
      await db.exec(`
        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, is_active
        ) VALUES (
          'buyer-test-01', '33333333-3333-3333-3333-333333333333'::uuid, 'buyer@test.com', 'Rajesh Buyer', '9888888888', 'buyer', TRUE
        ) ON CONFLICT (id) DO NOTHING;

        SET my.is_admin = 'false';
        SET my.session_uid = '33333333-3333-3333-3333-333333333333';
      `);

      // Attempt to book with caller-tampered amount of 100,000 INR (less than 1,800,000 base price)
      const tamperedRes = await db.query<{ create_plot_booking_atomic: any }>(`
        SELECT public.create_plot_booking_atomic(
          'plot-premium-01',
          'buyer-test-01',
          'Rajesh Buyer',
          '9888888888',
          100000
        );
      `);

      expect(tamperedRes.rows[0].create_plot_booking_atomic.success).toBe(false);
      expect(tamperedRes.rows[0].create_plot_booking_atomic.error).toContain('cannot be less than the approved plot base price');

      // Valid booking with compliant amount
      const validRes = await db.query<{ create_plot_booking_atomic: any }>(`
        SELECT public.create_plot_booking_atomic(
          'plot-premium-01',
          'buyer-test-01',
          'Rajesh Buyer',
          '9888888888',
          1800000
        );
      `);

      expect(validRes.rows[0].create_plot_booking_atomic.success).toBe(true);
      expect(validRes.rows[0].create_plot_booking_atomic.total_amount_inr).toBe(1800000);

      // Verify plot status transitioned to hold_pending
      const plotCheck = await db.query<{ status: string }>(`
        SELECT status FROM public.plots WHERE id = 'plot-premium-01';
      `);
      expect(plotCheck.rows[0].status).toBe('hold_pending');

      // Attempt concurrent/double booking: should be rejected
      const doubleBookingRes = await db.query<{ create_plot_booking_atomic: any }>(`
        SELECT public.create_plot_booking_atomic(
          'plot-premium-01',
          'buyer-test-01',
          'Rajesh Buyer',
          '9888888888',
          1800000
        );
      `);
      expect(doubleBookingRes.rows[0].create_plot_booking_atomic.success).toBe(false);
      expect(doubleBookingRes.rows[0].create_plot_booking_atomic.error).toContain('Plot is not available for booking');
    });

    it('validates sponsor attribution server-side and rejects invalid sponsor codes', async () => {
      await db.exec(`
        INSERT INTO public.plots (
          id, plot_number, block, area_sqft, status, base_price_inr
        ) VALUES (
          'plot-sponsor-test', 'B-12', 'B', 1200, 'available_green', 1500000
        ) ON CONFLICT (id) DO UPDATE SET status = 'available_green';

        SET my.is_admin = 'true';
        INSERT INTO public.profiles (
          id, auth_user_id, email, full_name, phone, role, is_active
        ) VALUES (
          'buyer-test-01', '33333333-3333-3333-3333-333333333333'::uuid, 'buyer@test.com', 'Rajesh Buyer', '9888888888', 'buyer', TRUE
        ) ON CONFLICT (id) DO NOTHING;

        SET my.is_admin = 'false';
        SET my.session_uid = '33333333-3333-3333-3333-333333333333';
      `);

      const invalidSponsorRes = await db.query<{ create_plot_booking_atomic: any }>(`
        SELECT public.create_plot_booking_atomic(
          'plot-sponsor-test',
          'buyer-test-01',
          'Rajesh Buyer',
          '9888888888',
          1500000,
          'FAKE-SPONSOR-999'
        );
      `);

      expect(invalidSponsorRes.rows[0].create_plot_booking_atomic.success).toBe(false);
      expect(invalidSponsorRes.rows[0].create_plot_booking_atomic.error).toContain('Invalid sponsor attribution');
    });
  });
});
