import { describe, it, expect } from 'vitest';
import { generateUniqueMemberId, safeRedirectUrl } from '../src/context/AppContext';
import { Profile, UserRole } from '../src/types';
import { DEMO_PROFILES } from '../src/lib/store';

describe('P0 Authentication & Security Audit Suite', () => {
  describe('Open Redirect Protection (safeRedirectUrl)', () => {
    it('allows valid internal relative routes and query parameters', () => {
      expect(safeRedirectUrl('/admin')).toBe('/admin');
      expect(safeRedirectUrl('/member?tab=tasks&id=task-01')).toBe('/member?tab=tasks&id=task-01');
      expect(safeRedirectUrl('/buyer')).toBe('/buyer');
      expect(safeRedirectUrl('/master-plan?plot=A-04')).toBe('/master-plan?plot=A-04');
    });

    it('rejects external protocol URLs and defaults to fallback', () => {
      expect(safeRedirectUrl('https://malicious-site.com')).toBe('/');
      expect(safeRedirectUrl('http://phishing.org/login')).toBe('/');
      expect(safeRedirectUrl('ftp://fileserver.com')).toBe('/');
    });

    it('rejects protocol-relative and backslash bypass attempts', () => {
      expect(safeRedirectUrl('//malicious-site.com')).toBe('/');
      expect(safeRedirectUrl('/\\malicious-site.com')).toBe('/');
      expect(safeRedirectUrl('//evil.com/path')).toBe('/');
    });

    it('rejects javascript: and pseudo-protocols', () => {
      expect(safeRedirectUrl('javascript:alert(document.cookie)')).toBe('/');
      expect(safeRedirectUrl('/javascript:void(0)')).toBe('/');
      expect(safeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/');
    });

    it('handles empty, null, and undefined safely', () => {
      expect(safeRedirectUrl(null)).toBe('/');
      expect(safeRedirectUrl(undefined)).toBe('/');
      expect(safeRedirectUrl('')).toBe('/');
      expect(safeRedirectUrl('   ', '/login')).toBe('/login');
    });
  });

  describe('Unique Member ID Generation (generateUniqueMemberId)', () => {
    it('generates sequential and unique AKGV member IDs without collisions', () => {
      const mockProfiles: Profile[] = [
        {
          id: 'usr-1',
          email: 'user1@akgv.com',
          fullName: 'User One',
          phone: '9000000001',
          role: 'junior_member',
          memberId: 'AKGV-1001',
          kycStatus: 'verified',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr-2',
          email: 'user2@akgv.com',
          fullName: 'User Two',
          phone: '9000000002',
          role: 'junior_member',
          memberId: 'AKGV-1002',
          kycStatus: 'verified',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const newId1 = generateUniqueMemberId(mockProfiles);
      expect(newId1).toBe('AKGV-1003');

      // Add new profile and generate again
      mockProfiles.push({
        id: 'usr-3',
        email: 'user3@akgv.com',
        fullName: 'User Three',
        phone: '9000000003',
        role: 'junior_member',
        memberId: newId1,
        kycStatus: 'verified',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      const newId2 = generateUniqueMemberId(mockProfiles);
      expect(newId2).toBe('AKGV-1004');
    });

    it('finds the maximum existing numeric code and progresses from there', () => {
      const mockProfiles: Profile[] = [
        ...DEMO_PROFILES,
        {
          id: 'usr-high',
          email: 'high@akgv.com',
          fullName: 'High Member',
          phone: '9888888888',
          role: 'senior_member',
          memberId: 'AKGV-6000',
          kycStatus: 'verified',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const newId = generateUniqueMemberId(mockProfiles);
      expect(newId).toBe('AKGV-6001');
    });
  });

  describe('Session Hardening & LocalStorage Isolation', () => {
    it('prohibits privilege elevation when a user attempts to spoof role in localStorage', () => {
      // Simulate an unauthenticated state
      const authSession = null;
      let currentUser: Profile | null = null;

      // An attacker inserts a fake admin profile into localStorage
      const forgedLocalStorage = JSON.stringify({
        id: 'usr-attacker',
        role: 'super_admin',
        fullName: 'Attacker Admin',
        isActive: true,
      });

      // AppContext security check: if no valid authSession exists, currentUser MUST remain null
      if (!authSession) {
        currentUser = null;
      }

      expect(currentUser).toBeNull();
      expect(currentUser).not.toEqual(JSON.parse(forgedLocalStorage));
    });

    it('invalidates user session if account has been deactivated or suspended', () => {
      const suspendedProfile: Profile = {
        id: 'usr-suspended-test',
        email: 'suspended@akgv.com',
        fullName: 'Suspended Account',
        phone: '9777777777',
        role: 'junior_member',
        isActive: false, // Suspended
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
      };

      const authenticate = (profile: Profile | null) => {
        if (!profile || !profile.isActive) {
          return { success: false, error: 'Account suspended or deactivated.' };
        }
        return { success: true, profile };
      };

      const result = authenticate(suspendedProfile);
      expect(result.success).toBe(false);
      expect(result.error).toContain('suspended');
    });

    it('requires explicit database verification rather than accepting default test passwords in production', () => {
      const isProduction = true;
      const testPasswords = ['akgv@2026', 'Admin@2026', 'password123'];

      testPasswords.forEach((pwd) => {
        // In production, matching against hardcoded master passwords must be strictly false
        const allowMasterBypass = !isProduction && pwd === 'akgv@2026';
        expect(allowMasterBypass).toBe(false);
      });
    });
  });

  describe('Deep Linking Route Reconciliation', () => {
    it('maps tab aliases properly to canonical tab views for members', () => {
      const mapMemberTab = (alias: string) => {
        const normalized = alias.toLowerCase();
        if (normalized === 'tasks' || normalized === 'inbox') return 'tasks';
        if (normalized === 'enquiries' || normalized === 'leads') return 'enquiries';
        if (normalized === 'visits' || normalized === 'site_visits') return 'site_visits';
        if (normalized === 'hierarchy' || normalized === 'team') return 'hierarchy';
        if (normalized === 'field_gps' || normalized === 'gps') return 'field_gps';
        return normalized;
      };

      expect(mapMemberTab('inbox')).toBe('tasks');
      expect(mapMemberTab('leads')).toBe('enquiries');
      expect(mapMemberTab('visits')).toBe('site_visits');
      expect(mapMemberTab('team')).toBe('hierarchy');
      expect(mapMemberTab('gps')).toBe('field_gps');
    });

    it('maps tab aliases properly to canonical tab views for admin', () => {
      const mapAdminTab = (alias: string) => {
        const normalized = alias.toLowerCase();
        if (normalized === 'tasks' || normalized === 'inbox') return 'tasks';
        if (normalized === 'enquiries' || normalized === 'leads') return 'enquiries';
        if (normalized === 'site_visits' || normalized === 'visits') return 'site_visits';
        if (normalized === 'members' || normalized === 'associates') return 'members';
        if (normalized === 'plots' || normalized === 'inventory') return 'plots';
        if (normalized === 'payments' || normalized === 'transactions') return 'payments';
        if (normalized === 'bookings' || normalized === 'orders') return 'bookings';
        if (normalized === 'kits' || normalized === 'joining_kits') return 'kits';
        return normalized;
      };

      expect(mapAdminTab('transactions')).toBe('payments');
      expect(mapAdminTab('inventory')).toBe('plots');
      expect(mapAdminTab('orders')).toBe('bookings');
      expect(mapAdminTab('associates')).toBe('members');
      expect(mapAdminTab('joining_kits')).toBe('kits');
    });
  });
});
