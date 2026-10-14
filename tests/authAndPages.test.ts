import { describe, it, expect } from 'vitest';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { DEMO_PROFILES } from '@/lib/store';

describe('AKGV Infra City - Auth, Sponsors & Ground Truth Verification', () => {
  it('should have the official corporate details configured', () => {
    expect(COMPANY_DETAILS.phone).toBe('6306917991');
    expect(COMPANY_DETAILS.displayPhone).toBe('+91 6306917991');
    expect(COMPANY_DETAILS.email).toBe('akgvinfacity@gmail.com');
    expect(COMPANY_DETAILS.legalName).toBe('AKGV Infra City Private Limited');
    expect(COMPANY_DETAILS.joiningKitPriceInr).toBe(999);
  });

  it('should include the designated sponsor code AKGV-3498 in demo profiles', () => {
    const sponsorProfile = DEMO_PROFILES.find((p) => p.memberId === 'AKGV-3498');
    expect(sponsorProfile).toBeDefined();
    expect(sponsorProfile?.fullName).toContain('Vikram Singh');
    expect(sponsorProfile?.role).toBe('senior_member');
  });

  it('should cover all three flagship locations in Varanasi', () => {
    const slugs = PROJECT_LOCATIONS.map((l) => l.slug);
    expect(slugs).toContain('rampur');
    expect(slugs).toContain('lahartara');
    expect(slugs).toContain('mirza-murad');
  });

  it('should have sub-admin profile configured for area coordination', () => {
    const subAdmin = DEMO_PROFILES.find((p) => p.role === 'sub_admin');
    expect(subAdmin).toBeDefined();
    expect(subAdmin?.memberId).toBe('AKGV-SUB-101');
  });
});
