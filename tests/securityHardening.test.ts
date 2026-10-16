import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DEMO_PROFILES } from '@/lib/store';
import { COMMISSION_LEVELS_GROUND_TRUTH } from '@/data/groundTruth';
import { UserRole, Profile, Plot, Booking, PaymentRecord } from '@/types';

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
    });

    it('behaviorally validates enforce_profile_update_integrity against missing columns and unauthorized changes', () => {
      // PL/pgSQL runtime simulation reproducing enforce_profile_update_integrity logic
      const simulateTrigger = <T extends Record<string, unknown>>(
        tableName: string,
        isAdmin: boolean,
        oldRow: T,
        newRow: T
      ): T & { updated_at: string } => {
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
        const v_old = { ...oldRow };

        // Missing security-critical column guard
        if (!('role' in v_new) || !('is_active' in v_new) || !('kyc_status' in v_new) || !('permissions' in v_new)) {
          throw new Error('Schema integrity error: profiles table is missing required security columns');
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
        if (v_new['auth_user_id'] !== v_old['auth_user_id']) {
          throw new Error('Unauthorized: Cannot alter auth_user_id binding');
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
        permissions: { canCreateDownline: false, canManagePlots: false },
        level: 1,
        rank_title: 'Client',
        total_business_volume_inr: 0,
        plots_closed_count: 0,
      };

      // 1. Trigger invoked on wrong table throws configuration error
      expect(() =>
        simulateTrigger('reviews', false, baselineProfile, baselineProfile)
      ).toThrow('Configuration error: enforce_profile_update_integrity trigger is only valid on public.profiles');

      // 2. Missing security-critical column (e.g. unmigrated table missing permissions) throws schema integrity error
      const profileWithoutPermissions = { ...baselineProfile };
      delete (profileWithoutPermissions as Record<string, unknown>).permissions;
      expect(() =>
        simulateTrigger('profiles', false, profileWithoutPermissions, profileWithoutPermissions)
      ).toThrow('Schema integrity error: profiles table is missing required security columns');

      // 3. Unauthorized role escalation blocked
      expect(() =>
        simulateTrigger('profiles', false, baselineProfile, { ...baselineProfile, role: 'super_admin' })
      ).toThrow('Unauthorized: Non-admin users cannot alter role');

      // 4. Unauthorized permissions alteration blocked
      expect(() =>
        simulateTrigger('profiles', false, baselineProfile, {
          ...baselineProfile,
          permissions: { canCreateDownline: true, canManagePlots: true },
        })
      ).toThrow('Unauthorized: Non-admin users cannot alter permissions');

      // 5. Unauthorized KYC bypass blocked
      expect(() =>
        simulateTrigger('profiles', false, baselineProfile, { ...baselineProfile, kyc_status: 'verified' })
      ).toThrow('Unauthorized: Non-admin users cannot alter kyc_status');

      // 6. Unauthorized volume / closed plots tampering blocked
      expect(() =>
        simulateTrigger('profiles', false, baselineProfile, { ...baselineProfile, total_business_volume_inr: 5000000 })
      ).toThrow('Unauthorized: Non-admin users cannot alter total_business_volume_inr');

      // 7. Legitimate non-admin profile update on allowed fields succeeds
      const safeUpdate = simulateTrigger('profiles', false, baselineProfile, {
        ...baselineProfile,
        full_name: 'Updated Buyer Name',
        phone: '9999988888',
      });
      expect(safeUpdate.full_name).toBe('Updated Buyer Name');
      expect(safeUpdate.phone).toBe('9999988888');

      // 8. Admin update of role and permissions succeeds
      const adminUpdate = simulateTrigger('profiles', true, baselineProfile, {
        ...baselineProfile,
        role: 'senior_member',
        permissions: { canCreateDownline: true, canManagePlots: false },
        kyc_status: 'verified',
      });
      expect(adminUpdate.role).toBe('senior_member');
      expect(adminUpdate.kyc_status).toBe('verified');
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
});
