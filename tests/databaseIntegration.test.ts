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

    it('resolves valid sponsor by member_id without exposing internal UUID', async () => {
      const res = await db.query<{ res: { valid: boolean; canonical_sponsor_id: string; sponsor_member_id: string; sponsor_name: string; sponsor_role: string; sponsor_profile_id?: string } }>(`
        SELECT public.resolve_and_validate_sponsor('AKGV-3498') AS res;
      `);
      const data = res.rows[0].res;
      expect(data.valid).toBe(true);
      expect(data.canonical_sponsor_id).toBe('AKGV-3498');
      expect(data.sponsor_member_id).toBe('AKGV-3498');
      expect(data.sponsor_name).toBe('Sponsor Patel');
      expect(data.sponsor_role).toBe('senior_member');
      // Must not leak private internal database UUID
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
  });
});
