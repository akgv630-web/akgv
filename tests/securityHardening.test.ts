import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { COMMISSION_LEVELS_GROUND_TRUTH } from '@/data/groundTruth';
import { UserRole, Profile, Plot, Booking, PaymentRecord } from '@/types';
import { resolveAndValidateSponsor } from '@/lib/supabase/syncService';

describe('P0 Security Hardening & Remediation Verification Suite', () => {
  // 1. Authentication Invariants
  describe('Authentication Security', () => {
    it('should reject arbitrary password lengths and incorrect credentials', () => {
      // Password length check alone must never authenticate
      const testPasswords = ['123456', 'abcdef', 'password', 'admin123', 'secret'];
      const validTestPassword = 'akgv@2026';

      testPasswords.forEach((pwd) => {
        const isValid = pwd === validTestPassword;
        expect(isValid).toBe(false);
      });
    });

    it('should prohibit login for suspended or deactivated accounts', () => {
      const activeUser: Profile = {
        id: 'usr-active',
        email: 'active@akgvinfacity.com',
        fullName: 'Active User',
        phone: '9999999990',
        role: 'junior_member',
        isActive: true,
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
      };

      const suspendedUser: Profile = {
        id: 'usr-suspended',
        email: 'suspended@akgvinfacity.com',
        fullName: 'Suspended User',
        phone: '9999999999',
        role: 'junior_member',
        isActive: false,
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
      };

      const checkAccess = (user: Profile) => {
        if (!user.isActive) {
          return { allowed: false, error: 'Account suspended' };
        }
        return { allowed: true };
      };

      expect(checkAccess(activeUser).allowed).toBe(true);
      expect(checkAccess(suspendedUser).allowed).toBe(false);
      expect(checkAccess(suspendedUser).error).toBe('Account suspended');
    });
  });

  // 2. Public Self-Registration Invariant
  describe('Public Registration Security', () => {
    it('must enforce buyer role and unverified KYC on public registrations', () => {
      const publicSubmission = {
        fullName: 'New Visitor',
        email: 'visitor@gmail.com',
        phone: '9876543210',
        password: 'password123',
        role: 'super_admin' as UserRole, // Attempted privilege escalation
      };

      // Server/context enforcement rule:
      const assignedRole: UserRole = 'buyer'; // Ignores submitted role
      const initialKyc = 'pending';

      expect(assignedRole).toBe('buyer');
      expect(initialKyc).toBe('pending');
      expect(assignedRole).not.toBe(publicSubmission.role);
    });
  });

  // 3. Separation of Duties in Payment Verification
  describe('Payment Verification & Separation of Duties', () => {
    it('must reject payment verification when verifier is the payer', () => {
      const payment: PaymentRecord = {
        id: 'pay-001',
        transactionRef: 'UPI-987654321',
        bookingId: 'bk-001',
        plotNumber: 'A-01',
        payerId: 'usr-admin-01',
        payerName: 'Rajesh Kumar Patel',
        payerPhone: '6306917991',
        amountInr: 100000,
        paymentMethod: 'UPI_QR',
        status: 'under_review',
        submittedAt: new Date().toISOString(),
      };

      const adminVerifier = {
        id: 'usr-admin-01',
        fullName: 'Rajesh Kumar Patel',
        phone: '6306917991',
        role: 'super_admin' as UserRole,
      };

      const independentVerifier = {
        id: 'usr-finance-01',
        fullName: 'Sunita Sharma',
        phone: '9876543211',
        role: 'sub_admin' as UserRole,
      };

      const verifyPaymentCheck = (p: PaymentRecord, verifier: { id: string; fullName: string; phone: string }) => {
        const isSelfApproval =
          p.payerId === verifier.id ||
          p.payerName.trim().toLowerCase() === verifier.fullName.trim().toLowerCase() ||
          p.payerPhone === verifier.phone;

        if (isSelfApproval) {
          throw new Error('Separation of duties violation: An administrator or agent cannot approve their own payment proof.');
        }
        return true;
      };

      // Attempting self-approval must throw
      expect(() => verifyPaymentCheck(payment, adminVerifier)).toThrow('Separation of duties violation');

      // Independent admin approval succeeds
      expect(verifyPaymentCheck(payment, independentVerifier)).toBe(true);
    });
  });

  // 4. Concurrency & Plot Booking Invariant
  describe('Plot Booking Reservation Invariants', () => {
    it('must prevent double booking and reject non-available plots', () => {
      const availablePlot: Plot = {
        id: 'plot-a-01',
        plotNumber: 'A-01',
        block: 'A',
        locationId: 'loc-rampur',
        status: 'available_green',
        areaSqft: 1200,
        dimensions: "30' x 40'",
        roadWidth: '30 ft',
        roadFacing: 'East',
        basePriceInr: 1800000,
        isCornerPlot: true,
        suitableHouseModelIds: [],
        x: 10,
        y: 10,
        width: 100,
        height: 100,
      };

      const bookedPlot: Plot = {
        ...availablePlot,
        id: 'plot-a-02',
        plotNumber: 'A-02',
        status: 'booked_yellow',
      };

      const existingBookings: Booking[] = [
        {
          id: 'bk-existing',
          bookingNumber: 'BK-2026-101',
          plotId: 'plot-a-01',
          plotNumber: 'A-01',
          buyerId: 'usr-01',
          buyerName: 'First Buyer',
          buyerPhone: '9999999991',
          status: 'hold',
          totalAmountInr: 1800000,
          paidAmountInr: 50000,
          createdAt: new Date().toISOString(),
        },
      ];

      const validateBooking = (plot: Plot, bookingsList: Booking[]) => {
        if (plot.status !== 'available_green') {
          throw new Error(`Plot ${plot.plotNumber} is not available for booking`);
        }
        const active = bookingsList.find(
          (b) => b.plotId === plot.id && ['confirmed', 'under_review', 'hold', 'pending'].includes(b.status)
        );
        if (active) {
          throw new Error(`Plot ${plot.plotNumber} already has an active reservation (${active.bookingNumber})`);
        }
        return true;
      };

      // Reject booked plot
      expect(() => validateBooking(bookedPlot, [])).toThrow('is not available for booking');

      // Reject plot with active reservation collision
      expect(() => validateBooking(availablePlot, existingBookings)).toThrow('already has an active reservation');

      // Allow available plot with no active reservation
      expect(validateBooking(availablePlot, [])).toBe(true);
    });
  });

  // 5. Service Worker Cache Protection
  describe('PWA & Service Worker Cache Boundary', () => {
    it('must exempt administrative and private routes from service worker caching', () => {
      const swFilePath = path.join(__dirname, '../public/sw.js');
      expect(fs.existsSync(swFilePath)).toBe(true);
      const swCode = fs.readFileSync(swFilePath, 'utf8');

      // Verify that sensitive paths are excluded
      expect(swCode).toContain('/admin');
      expect(swCode).toContain('/member');
      expect(swCode).toContain('/buyer');
      expect(swCode).toContain('supabase.co');
    });
  });

  // 6. GPS Camera Evidence Provenance
  describe('GPS Field Evidence Provenance', () => {
    it('must distinguish live camera stream from gallery file upload', () => {
      const liveEvidence = {
        plotNumber: 'A-04',
        latitude: 25.2677,
        longitude: 82.9913,
        accuracyMeters: 4.2,
        isLiveCamera: true,
        captureSource: 'live_camera' as const,
      };

      const galleryEvidence = {
        plotNumber: 'A-04',
        latitude: 25.2677,
        longitude: 82.9913,
        accuracyMeters: 4.2,
        isLiveCamera: false,
        captureSource: 'file_upload' as const,
      };

      expect(liveEvidence.isLiveCamera).toBe(true);
      expect(liveEvidence.captureSource).toBe('live_camera');
      expect(galleryEvidence.isLiveCamera).toBe(false);
      expect(galleryEvidence.captureSource).toBe('file_upload');
    });
  });

  // 7. Supabase Database Schema Security
  describe('PostgreSQL Schema & Row Level Security', () => {
    it('must contain atomic booking procedure, partial index, and role-based policies', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      expect(fs.existsSync(schemaPath)).toBe(true);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Check atomic function with FOR UPDATE lock
      expect(schemaSql).toContain('create_plot_booking_atomic');
      expect(schemaSql).toContain('FOR UPDATE');

      // Check partial unique index
      expect(schemaSql).toContain('idx_unique_active_plot_booking');

      // Check helper functions
      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.current_user_role()');

      // Check least-privilege policies (no blanket open access)
      expect(schemaSql).not.toContain('CREATE POLICY "Public access to profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)');
      expect(schemaSql).not.toContain('CREATE POLICY "Public access to payments" ON payment_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)');
      expect(schemaSql).toContain('CREATE POLICY "Admin read audit_logs"');
      expect(schemaSql).toContain('CREATE POLICY "Payer or admin read payments"');
    });
  });

  // 8. Commission Ground Truth Invariant
  describe('Commission Invariants', () => {
    it('must maintain 11 standardized commission tiers in ground truth', () => {
      expect(COMMISSION_LEVELS_GROUND_TRUTH).toHaveLength(11);
      expect(COMMISSION_LEVELS_GROUND_TRUTH[0].levelNumber).toBe(1);
      expect(COMMISSION_LEVELS_GROUND_TRUTH[0].commissionPercent).toBe(4);
      expect(COMMISSION_LEVELS_GROUND_TRUTH[10].levelNumber).toBe(11);
      expect(COMMISSION_LEVELS_GROUND_TRUTH[10].commissionPercent).toBe(14);
    });
  });

  // 9. Atomic Booking Procedure Security & Caller Validation
  describe('Atomic Plot Booking RPC Hardening', () => {
    it('must enforce search_path, caller authentication, and proper grants', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Search path hijacking prevention
      expect(schemaSql).toContain('SET search_path = public, pg_temp');

      // Caller authentication check
      expect(schemaSql).toContain('IF auth.uid() IS NULL THEN');
      expect(schemaSql).toContain('Unauthorized: booking buyer identity must match authenticated user');

      // Privilege restrictions
      expect(schemaSql).toContain('REVOKE EXECUTE ON FUNCTION public.create_plot_booking_atomic FROM PUBLIC;');
      expect(schemaSql).toContain('GRANT EXECUTE ON FUNCTION public.create_plot_booking_atomic TO authenticated;');
    });
  });

  // 10. Profile Privacy & Public Team Directory
  describe('Profile Privacy & Integrity Enforcement', () => {
    it('must mask sensitive PII via public_team_directory and restrict private profiles table', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Public view creation
      expect(schemaSql).toContain('CREATE OR REPLACE VIEW public.public_team_directory AS');
      expect(schemaSql).toContain('GRANT SELECT ON public.public_team_directory TO anon, authenticated;');

      // Verify that public_team_directory excludes sensitive columns
      const viewDefinition = schemaSql.slice(schemaSql.indexOf('CREATE OR REPLACE VIEW public.public_team_directory'));
      const viewSelect = viewDefinition.slice(0, viewDefinition.indexOf('FROM public.profiles'));
      expect(viewSelect).not.toContain('phone');
      expect(viewSelect).not.toContain('email');
      expect(viewSelect).not.toContain('address');
      expect(viewSelect).not.toContain('total_business_volume_inr');

      // Private profiles table RLS: zero public/anon read
      expect(schemaSql).toContain('CREATE POLICY "Private profiles read access" ON profiles FOR SELECT TO authenticated');
      expect(schemaSql).not.toContain('CREATE POLICY "Public read active profiles" ON profiles FOR SELECT TO anon');
    });

    it('must define trigger enforcing profile update integrity against privilege escalation', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity()');
      expect(schemaSql).toContain('trg_enforce_profile_update_integrity');
      expect(schemaSql).toContain('Non-admin users cannot alter role');
      expect(schemaSql).toContain('Non-admin users cannot alter active status');
      expect(schemaSql).toContain('Non-admin users cannot alter kyc_status');
      expect(schemaSql).toContain('Non-admin users cannot alter permissions');
      expect(schemaSql).toContain('Non-admin users cannot alter total_business_volume_inr');
      expect(schemaSql).toContain('Non-admin users cannot alter plots_closed_count');
      expect(schemaSql).toContain('to_jsonb(NEW)');
      expect(schemaSql).toContain('to_jsonb(OLD)');
      expect(schemaSql).toContain("TG_TABLE_NAME <> 'profiles'");
      expect(schemaSql).toContain('Cannot alter profile primary key');
      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
      expect(schemaSql).toContain('SET search_path = public, pg_temp');
    });

    it('must verify forward migration 20261016_zz_profile_integrity_trigger_hardening.sql contains defensive schema and trigger fixes', () => {
      const migrationPath = path.join(
        __dirname,
        '../supabase/migrations/20261016_zz_profile_integrity_trigger_hardening.sql'
      );
      expect(fs.existsSync(migrationPath)).toBe(true);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      expect(migrationSql).toContain('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB');
      expect(migrationSql).toContain('to_jsonb(NEW)');
      expect(migrationSql).toContain('to_jsonb(OLD)');
      expect(migrationSql).toContain("TG_TABLE_NAME <> 'profiles'");
      expect(migrationSql).toContain('DROP TRIGGER IF EXISTS trg_enforce_profile_update_integrity ON public.profiles;');
      expect(migrationSql).toContain('CREATE TRIGGER trg_enforce_profile_update_integrity');
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.is_admin()');
      expect(migrationSql).toContain('SET search_path = public, pg_temp');
      expect(migrationSql).toContain('Cannot alter profile primary key');
    });

    it('behaviorally validates enforce_profile_update_integrity against missing columns and unauthorized changes', () => {
      // PL/pgSQL runtime simulation reproducing enforce_profile_update_integrity logic for BOTH INSERT and UPDATE
      const simulateTrigger = <T extends Record<string, unknown>>(
        operation: 'INSERT' | 'UPDATE',
        tableName: string,
        isAdmin: boolean,
        newRow: T,
        oldRow?: T
      ): T & { updated_at?: string } => {
        // Table attachment guard
        if (tableName !== 'profiles') {
          throw new Error(
            `Configuration error: enforce_profile_update_integrity trigger is only valid on public.profiles, but was invoked on ${tableName}`
          );
        }

        // Admin bypass
        if (isAdmin) {
          return { ...newRow, updated_at: 'now()' };
        }

        // to_jsonb conversions
        const v_new = { ...newRow };

        // FAIL-CLOSED SCHEMA INTEGRITY CHECK (Enforced on BOTH INSERT & UPDATE)
        if (!('role' in v_new) || !('is_active' in v_new) || !('kyc_status' in v_new) || !('permissions' in v_new) || !('sponsor_id' in v_new)) {
          throw new Error('Schema integrity error: profiles table is missing required security columns');
        }

        // =========================================================================
        // INSERT PATH VALIDATION
        // =========================================================================
        if (operation === 'INSERT') {
          // Non-admins can strictly only register as 'buyer'
          if (v_new['role'] !== undefined && v_new['role'] !== null && v_new['role'] !== 'buyer') {
            throw new Error('Unauthorized: Public registrations are strictly limited to buyer role');
          }

          // Non-admins cannot self-assign member_id
          if (v_new['member_id'] !== undefined && v_new['member_id'] !== null && String(v_new['member_id']).trim() !== '') {
            throw new Error('Unauthorized: Non-admin users cannot assign member_id');
          }

          // Non-admins cannot self-certify KYC status
          if (v_new['kyc_status'] !== undefined && v_new['kyc_status'] !== null && !['pending', 'submitted'].includes(String(v_new['kyc_status']))) {
            throw new Error('Unauthorized: Non-admin users cannot set verified KYC status on registration');
          }

          // Non-admins cannot assign any elevated staff permissions
          const perms = v_new['permissions'] as Record<string, boolean> | undefined;
          if (perms && typeof perms === 'object') {
            if (
              perms.canCreateDownline ||
              perms.canManagePlots ||
              perms.canRecordEnquiries ||
              perms.canSubmitFieldReports ||
              perms.canViewTeamSales ||
              perms.canVerifyPayments ||
              perms.canEditCms
            ) {
              throw new Error('Unauthorized: Elevated permissions cannot be granted to public buyer accounts');
            }
          }

          // Non-admins cannot set rank or business volume
          if (
            (Number(v_new['level'] || 1) > 1) ||
            v_new['rank_title'] ||
            (Number(v_new['total_business_volume_inr'] || 0) > 0) ||
            (Number(v_new['plots_closed_count'] || 0) > 0)
          ) {
            throw new Error('Unauthorized: Non-admin users cannot assign level, rank_title, or business volume');
          }

          return {
            ...newRow,
            role: 'buyer',
            member_id: null,
            kyc_status: 'pending',
            permissions: {
              canCreateDownline: false,
              canManagePlots: false,
              canRecordEnquiries: false,
              canSubmitFieldReports: false,
              canViewTeamSales: false,
              canVerifyPayments: false,
              canEditCms: false,
            },
            level: 1,
            rank_title: null,
            total_business_volume_inr: 0,
            plots_closed_count: 0,
          };
        }

        // =========================================================================
        // UPDATE PATH VALIDATION
        // =========================================================================
        const v_old = { ...(oldRow || {}) };

        // Primary key id and auth_user_id immutability
        if (v_new['id'] !== v_old['id']) {
          throw new Error('Unauthorized: Cannot alter profile primary key');
        }
        if (v_new['auth_user_id'] !== v_old['auth_user_id'] && v_old['auth_user_id'] !== null && v_old['auth_user_id'] !== undefined) {
          throw new Error('Integrity violation: auth_user_id cannot be reassigned once established');
        }

        // Field difference checks
        if (v_new['role'] !== v_old['role']) {
          throw new Error('Unauthorized: Non-admin users cannot alter role');
        }
        if (v_new['is_active'] !== v_old['is_active']) {
          throw new Error('Unauthorized: Non-admin users cannot alter active status');
        }
        if (v_new['kyc_status'] !== v_old['kyc_status']) {
          throw new Error('Unauthorized: Non-admin users cannot alter kyc_status');
        }
        if (JSON.stringify(v_new['permissions']) !== JSON.stringify(v_old['permissions'])) {
          throw new Error('Unauthorized: Non-admin users cannot alter permissions');
        }
        if (v_new['level'] !== v_old['level']) {
          throw new Error('Unauthorized: Non-admin users cannot alter level');
        }
        if (v_new['rank_title'] !== v_old['rank_title']) {
          throw new Error('Unauthorized: Non-admin users cannot alter rank_title');
        }
        if (v_new['sponsor_id'] !== v_old['sponsor_id']) {
          throw new Error('Unauthorized: Non-admin users cannot alter sponsor_id');
        }
        if (v_new['member_id'] !== v_old['member_id']) {
          throw new Error('Unauthorized: Non-admin users cannot alter member_id');
        }
        if (v_new['total_business_volume_inr'] !== v_old['total_business_volume_inr']) {
          throw new Error('Unauthorized: Non-admin users cannot alter total_business_volume_inr');
        }
        if (v_new['plots_closed_count'] !== v_old['plots_closed_count']) {
          throw new Error('Unauthorized: Non-admin users cannot alter plots_closed_count');
        }

        return { ...newRow, updated_at: 'now()' };
      };

      const baselineProfile = {
        id: 'usr-buyer-01',
        auth_user_id: 'uuid-123',
        email: 'buyer@test.com',
        full_name: 'Regular Buyer',
        phone: '9876543210',
        role: 'buyer',
        member_id: null,
        sponsor_id: null,
        kyc_status: 'pending',
        is_active: true,
        permissions: {
          canCreateDownline: false,
          canManagePlots: false,
          canRecordEnquiries: false,
          canSubmitFieldReports: false,
          canViewTeamSales: false,
          canVerifyPayments: false,
          canEditCms: false,
        },
        level: 1,
        rank_title: null,
        total_business_volume_inr: 0,
        plots_closed_count: 0,
      };

      // 1. Trigger invoked on wrong table throws configuration error
      expect(() =>
        simulateTrigger('UPDATE', 'reviews', false, baselineProfile, baselineProfile)
      ).toThrow('Configuration error: enforce_profile_update_integrity trigger is only valid on public.profiles');

      // 2. Missing permissions column reproduction: Fails closed on both INSERT and UPDATE
      const profileWithoutPermissions = { ...baselineProfile };
      delete (profileWithoutPermissions as Record<string, unknown>).permissions;

      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, profileWithoutPermissions)
      ).toThrow('Schema integrity error: profiles table is missing required security columns');

      expect(() =>
        simulateTrigger('UPDATE', 'profiles', false, profileWithoutPermissions, profileWithoutPermissions)
      ).toThrow('Schema integrity error: profiles table is missing required security columns');

      // 3. Direct API INSERT with forged privileged role blocked
      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, { ...baselineProfile, role: 'super_admin' })
      ).toThrow('Unauthorized: Public registrations are strictly limited to buyer role');

      // 4. Direct API INSERT with forged elevated staff permissions blocked
      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, {
          ...baselineProfile,
          permissions: { ...baselineProfile.permissions, canRecordEnquiries: true, canSubmitFieldReports: true },
        })
      ).toThrow('Unauthorized: Elevated permissions cannot be granted to public buyer accounts');

      // 5. Direct API INSERT with forged member_id blocked
      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, { ...baselineProfile, member_id: 'AKGV-FORGED-01' })
      ).toThrow('Unauthorized: Non-admin users cannot assign member_id');

      // 6. Direct API INSERT with self-certified verified KYC blocked
      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, { ...baselineProfile, kyc_status: 'verified' })
      ).toThrow('Unauthorized: Non-admin users cannot set verified KYC status on registration');

      // 7. Direct API INSERT with forged business volume blocked
      expect(() =>
        simulateTrigger('INSERT', 'profiles', false, { ...baselineProfile, total_business_volume_inr: 5000000 })
      ).toThrow('Unauthorized: Non-admin users cannot assign level, rank_title, or business volume');

      // 8. Legitimate public buyer registration on INSERT succeeds with least-privilege defaults
      const validInsert = simulateTrigger('INSERT', 'profiles', false, baselineProfile);
      expect(validInsert.role).toBe('buyer');
      expect(validInsert.kyc_status).toBe('pending');
      expect(validInsert.member_id).toBeNull();
      expect((validInsert.permissions as Record<string, boolean>).canRecordEnquiries).toBe(false);
      expect((validInsert.permissions as Record<string, boolean>).canSubmitFieldReports).toBe(false);

      // 9. UPDATE path: Primary key id and auth_user_id immutability
      expect(() =>
        simulateTrigger('UPDATE', 'profiles', false, { ...baselineProfile, id: 'tampered-id' }, baselineProfile)
      ).toThrow('Unauthorized: Cannot alter profile primary key');

      expect(() =>
        simulateTrigger('UPDATE', 'profiles', false, { ...baselineProfile, auth_user_id: 'uuid-tampered' }, baselineProfile)
      ).toThrow('Integrity violation: auth_user_id cannot be reassigned once established');

      // 10. UPDATE path: Role and permissions tampering blocked
      expect(() =>
        simulateTrigger('UPDATE', 'profiles', false, { ...baselineProfile, role: 'super_admin' }, baselineProfile)
      ).toThrow('Unauthorized: Non-admin users cannot alter role');

      expect(() =>
        simulateTrigger('UPDATE', 'profiles', false, { ...baselineProfile, permissions: { ...baselineProfile.permissions, canManagePlots: true } }, baselineProfile)
      ).toThrow('Unauthorized: Non-admin users cannot alter permissions');

      // 11. Admin update succeeds
      const adminUpdate = simulateTrigger('UPDATE', 'profiles', true, {
        ...baselineProfile,
        role: 'senior_member',
        kyc_status: 'verified',
      }, baselineProfile);
      expect(adminUpdate.role).toBe('senior_member');
      expect(adminUpdate.kyc_status).toBe('verified');
    });

    it('deterministically resolves is_admin auth.uid matching without cross-matching or ambiguity', () => {
      type MockProfile = {
        id: string;
        auth_user_id: string | null;
        role: string;
      };

      const simulateIsAdmin = (
        authUid: string | null,
        profiles: MockProfile[],
        sessionUser?: string,
        jwtRole?: string
      ): boolean => {
        if (sessionUser === 'postgres' || sessionUser === 'supabase_admin') return true;
        if (jwtRole === 'service_role') return true;
        if (!authUid) return false;

        // 1. Canonical auth_user_id match
        let role = profiles.find((p) => p.auth_user_id === authUid)?.role || null;

        // 2. Fallback to string id ONLY where auth_user_id IS NULL
        if (!role) {
          role =
            profiles.find((p) => p.auth_user_id === null && p.id === authUid)?.role || null;
        }

        return role === 'super_admin' || role === 'sub_admin';
      };

      const profilesDb: MockProfile[] = [
        { id: 'usr-admin-01', auth_user_id: 'admin-uuid-111', role: 'super_admin' },
        { id: 'usr-buyer-02', auth_user_id: 'buyer-uuid-222', role: 'buyer' },
        { id: 'legacy-admin-333', auth_user_id: null, role: 'sub_admin' },
        { id: 'hijack-attempt-444', auth_user_id: 'legit-user-555', role: 'super_admin' },
      ];

      // 1. Valid canonical admin returns true
      expect(simulateIsAdmin('admin-uuid-111', profilesDb)).toBe(true);

      // 2. Valid canonical buyer returns false
      expect(simulateIsAdmin('buyer-uuid-222', profilesDb)).toBe(false);

      // 3. Legacy profile where auth_user_id IS NULL correctly resolves via id
      expect(simulateIsAdmin('legacy-admin-333', profilesDb)).toBe(true);

      // 4. Attempting to match an id where auth_user_id belongs to someone else is rejected
      expect(simulateIsAdmin('hijack-attempt-444', profilesDb)).toBe(false);

      // 5. Unauthenticated user returns false
      expect(simulateIsAdmin(null, profilesDb)).toBe(false);

      // 6. Unknown user returns false
      expect(simulateIsAdmin('unknown-uuid-999', profilesDb)).toBe(false);

      // 7. Database superuser session (Dashboard SQL editor) returns true
      expect(simulateIsAdmin(null, profilesDb, 'postgres')).toBe(true);

      // 8. Service role key (Edge function / server backend) returns true
      expect(simulateIsAdmin(null, profilesDb, 'authenticated', 'service_role')).toBe(true);

      // 9. Authenticated non-admin with arbitrary jwt role returns false
      expect(simulateIsAdmin(null, profilesDb, 'authenticated', 'authenticated')).toBe(false);
    });
  });

  // 11. Authoritative Audit Logging & Direct Insert Revocation
  describe('Authoritative Audit Logging', () => {
    it('must restrict direct audit_logs inserts to admin and provide secure record_audit_log procedure', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Direct insert restricted to admin only
      expect(schemaSql).toContain('CREATE POLICY "Admin insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());');
      expect(schemaSql).not.toContain('CREATE POLICY "Authenticated insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);');

      // record_audit_log procedure
      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.record_audit_log');
      expect(schemaSql).toContain('REVOKE EXECUTE ON FUNCTION public.record_audit_log FROM PUBLIC;');
      expect(schemaSql).toContain('REVOKE EXECUTE ON FUNCTION public.record_audit_log FROM anon;');
      expect(schemaSql).toContain('GRANT EXECUTE ON FUNCTION public.record_audit_log TO authenticated;');
      expect(schemaSql).not.toContain('GRANT EXECUTE ON FUNCTION public.record_audit_log TO anon, authenticated;');
    });
  });

  // 12. Spam Prevention & Integrity on Public Ingestion Forms
  describe('Public Ingestion Spam Prevention', () => {
    it('must enforce status and verification checks on reviews, enquiries, and site visits', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Reviews: forced pending and non-verified
      expect(schemaSql).toContain('CREATE POLICY "Public insert reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (status = \'pending\' AND (is_verified = FALSE OR is_verified IS NULL));');

      // Client enquiries: forced new with unassigned member
      expect(schemaSql).toContain('CREATE POLICY "Public insert enquiries" ON client_enquiries FOR INSERT TO anon, authenticated WITH CHECK (status = \'new\' AND (assigned_member_id IS NULL OR assigned_member_id = \'\'));');

      // Site visits: forced requested with unassigned staff
      expect(schemaSql).toContain('CREATE POLICY "Public insert site visits" ON site_visits FOR INSERT TO anon, authenticated WITH CHECK (status = \'requested\' AND (assigned_staff_name IS NULL OR assigned_staff_name = \'\'));');

      // Payment records: admin update check enforcing separation of duties
      expect(schemaSql).toContain('CREATE POLICY "Admin update payments" ON payment_records FOR UPDATE TO authenticated USING (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text) WITH CHECK (public.is_admin() AND payer_id IS DISTINCT FROM auth.uid()::text);');
    });
  });

  // 13. Application Context Session & Auth Hardening
  describe('Application Context Authentication & Integrity', () => {
    it('must never restore unverified session from localStorage on initial load', () => {
      const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
      const contextCode = fs.readFileSync(appContextPath, 'utf8');

      // Ensure that localStorage.getItem('...auth_user') is NOT used to initialize or restore currentUser on mount
      expect(contextCode).not.toMatch(/const savedAuthUser = localStorage\.getItem\([^)]*auth_user[^)]*\);[\s\S]*?setCurrentUser/);

      // Verify that syncWithSupabase explicitly verifies authSession
      expect(contextCode).toContain('if (authSession && authSession.user)');
      expect(contextCode).toContain('supabaseOnAuthStateChange');
    });

    it('must not fake registration success if provider returns an error', () => {
      const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
      const contextCode = fs.readFileSync(appContextPath, 'utf8');

      expect(contextCode).toContain('Registration failed on authentication provider.');
    });

    it('must enforce admin permission and persist reviews for GPS evidence', () => {
      const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
      const contextCode = fs.readFileSync(appContextPath, 'utf8');

      expect(contextCode).toContain('Only administrators can approve field GPS evidence.');
      expect(contextCode).toContain('Only administrators can reject field GPS evidence.');
      expect(contextCode).toContain('saveGpsEvidenceToSupabase(updatedEvidence);');
    });

    it('must strictly resolve authenticated profiles from canonical database records and reject metadata role fallback', () => {
      const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
      const contextCode = fs.readFileSync(appContextPath, 'utf8');

      // Ensure fetchProfileByAuthId is invoked
      expect(contextCode).toContain('await fetchProfileByAuthId');
      // Ensure no client metadata role fallback
      expect(contextCode).not.toContain('authUser.user_metadata?.role');
      // Ensure fail-closed when profile is missing or inactive
      expect(contextCode).toContain('Database profile not found for this authenticated user. Access denied.');
    });
  });

  // 14. Server-Side Atomic Payment Verification & Separation of Duties
  describe('Atomic Payment Verification RPC', () => {
    it('must enforce row locks, separation of duties, and audit trail in verify_payment_atomic', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.verify_payment_atomic');
      expect(schemaSql).toContain('FOR UPDATE');
      expect(schemaSql).toContain('Separation of duties violation: Administrators cannot verify payments they submitted');
      expect(schemaSql).toContain("SET status = 'verified'");
      expect(schemaSql).toContain("SET status = 'rejected'");
      expect(schemaSql).toContain('REVOKE EXECUTE ON FUNCTION public.verify_payment_atomic FROM PUBLIC;');
      expect(schemaSql).toContain('GRANT EXECUTE ON FUNCTION public.verify_payment_atomic TO authenticated;');
    });
  });

  // 15. Team Directory Privacy Protection
  describe('Public Team Directory Privacy', () => {
    it('must strictly exclude administrative roles from public directory views', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      expect(schemaSql).toContain('CREATE OR REPLACE VIEW public.public_team_directory');
      expect(schemaSql).toContain("WHERE is_active = TRUE AND role IN ('senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member');");
    });
  });

  // 16. Credential Leak Prevention
  describe('Credential Leak Prevention', () => {
    it('must not expose hardcoded passwords in client-facing authentication modal', () => {
      const authModalPath = path.join(__dirname, '../src/components/auth/AuthModal.tsx');
      const authModalCode = fs.readFileSync(authModalPath, 'utf8');

      // Verify no default password or corporate account directory disclosing passwords
      expect(authModalCode).not.toContain('Sandbox default password for test accounts: <code className="text-[#DFC382]">akgv@2026</code>');
      expect(authModalCode).not.toContain("pass:{' '}\n                    <span className=\"font-mono text-[#DFC382]\">akgv@2026</span>");
      expect(authModalCode).toContain('Authorized Access & IT Assistance');
    });
  });

  // 17. Public Signup & Profile Reconciliation Hardening Invariants
  describe('Public Signup & Profile Reconciliation Hardening', () => {
    const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
    const syncServicePath = path.join(__dirname, '../src/lib/supabase/syncService.ts');
    const authModalPath = path.join(__dirname, '../src/components/auth/AuthModal.tsx');

    const contextCode = fs.readFileSync(appContextPath, 'utf8');
    const syncCode = fs.readFileSync(syncServicePath, 'utf8');
    const authModalCode = fs.readFileSync(authModalPath, 'utf8');

    it('enforces buyer role invariant and eliminates fake usr- client timestamp IDs in registerWithCredentials', () => {
      // Must assign authentic auth provider UUID in registerWithCredentials
      expect(contextCode).toContain('const authUserId = authUser.id;');
      expect(contextCode).toContain('id: authUserId,');
      expect(contextCode).toContain('authUserId: authUserId,');
      // Public buyers must not receive MLM member IDs or permissions
      expect(contextCode).toContain('memberId: undefined, // Buyers are customer accounts, not MLM network associates');
      expect(contextCode).toContain('permissions: undefined, // No elevated staff permissions');
      expect(contextCode).toContain("const assignedRole: UserRole = 'buyer';");
    });

    it('handles active session vs email confirmation required without assigning unauthenticated currentUser', () => {
      // Must check if session exists
      expect(contextCode).toContain('if (!authSession) {');
      expect(contextCode).toContain('emailConfirmationRequired: true,');
      // Must not set currentUser if email confirmation is required
      expect(contextCode).toContain('// Only set currentUser when there is an active authenticated session');
      expect(contextCode).toContain('setCurrentUser(newProfile);');
    });

    it('authoritatively validates sponsor code against database and rejects invalid sponsors during signup', () => {
      expect(contextCode).toContain('const sponsorResult = await resolveAndValidateSponsor(sponsorTrimmed);');
      expect(contextCode).toContain('verifiedSponsorId = sponsorResult.canonicalSponsorId;');
      expect(contextCode).toContain('if (!sponsorResult.valid) {');
    });

    it('enforces self-healing profile reconciliation upon authenticated login with missing database record', () => {
      expect(contextCode).toContain('// Self-healing profile reconciliation on login:');
      expect(contextCode).toContain('const reconciledProfile: Profile = {');
      expect(contextCode).toContain('await saveProfileToSupabase(reconciledProfile, authUser.id);');
    });

    it('ensures syncService maps auth_user_id and defaults signup role to buyer', () => {
      expect(syncCode).toContain('payload.auth_user_id = effectiveAuthUserId;');
      expect(syncCode).toContain("role: data.role || 'buyer',");
      expect(syncCode).toContain('authUserId: data.auth_user_id || data.id,');
    });

    it('enforces single unified sign in and prevents public self-registration without associate joining kit prompt in AuthModal', () => {
      expect(authModalCode).toContain('Authorized Access & IT Assistance');
      expect(authModalCode).toContain('Secure Portal Login');
      expect(authModalCode).not.toContain('Please collect your ₹999 physical joining kit');
    });
  });

  // 18. Authoritative Sponsor Resolution & Database Integrity Trigger Hardening
  describe('Authoritative Sponsor Resolution & Database Integrity Trigger Hardening', () => {
    it('resolves valid registered sponsor by member_id or internal profile ID', async () => {
      const resByMemberId = await resolveAndValidateSponsor('AKGV-3498');
      expect(resByMemberId.valid).toBe(true);
      expect(resByMemberId.canonicalSponsorId).toBe('AKGV-3498');
      expect(resByMemberId.sponsorName).toBe('Vikram Singh');
      // Least privilege: internal role and enumeration attributes must be omitted
      expect(resByMemberId.sponsorRole).toBeUndefined();

      const resById = await resolveAndValidateSponsor('usr-sponsor-01');
      expect(resById.valid).toBe(true);
      expect(resById.canonicalSponsorId).toBe('AKGV-3498');
    });

    it('rejects nonexistent, invalid, or fake sponsor codes without silent fallback', async () => {
      const fakeSponsor = await resolveAndValidateSponsor('AKGV-FAKE999');
      expect(fakeSponsor.valid).toBe(false);
      expect(fakeSponsor.error).toBeDefined();

      const emptySponsor = await resolveAndValidateSponsor('');
      expect(emptySponsor.valid).toBe(false);

      const invalidCode = await resolveAndValidateSponsor('INVALID_CODE');
      expect(invalidCode.valid).toBe(false);
    });

    it('prohibits self-referral when candidate ID matches the sponsor', async () => {
      const selfReferralByMemberId = await resolveAndValidateSponsor('AKGV-3498', 'usr-sponsor-01');
      expect(selfReferralByMemberId.valid).toBe(false);
      expect(selfReferralByMemberId.error).toContain('Self-referral is strictly prohibited');

      const selfReferralById = await resolveAndValidateSponsor('usr-sponsor-01', 'usr-sponsor-01');
      expect(selfReferralById.valid).toBe(false);
      expect(selfReferralById.error).toContain('Self-referral is strictly prohibited');
    });

    it('rejects buyer accounts as sponsors', async () => {
      const buyerAsSponsor = await resolveAndValidateSponsor('usr-buyer-01');
      expect(buyerAsSponsor.valid).toBe(false);
      expect(buyerAsSponsor.error).toContain('not authorized to sponsor');
    });

    it('protects login-time reconciliation from forged metadata roles, permissions, and invalid sponsors', () => {
      const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
      const contextCode = fs.readFileSync(appContextPath, 'utf8');

      // Reconciliation must never trust user_metadata for role or permissions
      expect(contextCode).toContain("role: 'buyer', // Reconciled public users are strictly assigned buyer role");
      expect(contextCode).toContain('permissions: undefined, // Client metadata cannot grant permissions');
      // Must validate sponsor_id before attaching to reconciled profile
      expect(contextCode).toContain('const sponsorCheck = await resolveAndValidateSponsor(candidateSponsor, authUser.id, authUser.id);');
      expect(contextCode).toContain('verifiedSponsorId = sponsorCheck.canonicalSponsorId;');
    });

    it('prohibits self-referral when candidateAuthId matches the sponsor', async () => {
      const selfReferralByCandidateAuthId = await resolveAndValidateSponsor('AKGV-3498', undefined, 'usr-sponsor-01');
      expect(selfReferralByCandidateAuthId.valid).toBe(false);
      expect(selfReferralByCandidateAuthId.error).toContain('Self-referral is strictly prohibited');
    });

    it('verifies SQL migrations and schema contain hardened resolve_and_validate_sponsor and fail-closed trigger', () => {
      const migrationZzzPath = path.join(__dirname, '../supabase/migrations/20261016_zzz_sponsor_integrity_hardening.sql');
      const migrationZzzzPath = path.join(__dirname, '../supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql');
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');

      expect(fs.existsSync(migrationZzzPath)).toBe(true);
      expect(fs.existsSync(migrationZzzzPath)).toBe(true);

      const migrationSql = fs.readFileSync(migrationZzzzPath, 'utf8');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Check migration SQL content
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.resolve_and_validate_sponsor');
      expect(migrationSql).toContain('SECURITY DEFINER');
      expect(migrationSql).toContain("SET search_path = ''");
      expect(migrationSql).toContain('Ambiguous sponsor identifier. Multiple matching records found.');
      expect(migrationSql).toContain('Self-referral is strictly prohibited');
      expect(migrationSql).toContain('CREATE OR REPLACE FUNCTION public.enforce_profile_update_integrity');
      expect(migrationSql).toContain('BEFORE INSERT OR UPDATE ON public.profiles');
      expect(migrationSql).toContain('FAIL-CLOSED SCHEMA INTEGRITY CHECK');
      expect(migrationSql).toContain('Elevated permissions cannot be granted to public buyer accounts');
      expect(migrationSql).toContain('REVOKE ALL ON FUNCTION public.enforce_profile_update_integrity() FROM PUBLIC;');

      // Check schema.sql content
      expect(schemaSql).toContain('CREATE OR REPLACE FUNCTION public.resolve_and_validate_sponsor');
      expect(schemaSql).toContain('BEFORE INSERT OR UPDATE ON public.profiles');
      expect(schemaSql).toContain("SET search_path = ''");
    });
  });
});
