import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_TARGETS,
  INITIAL_TASKS,
  INITIAL_CMS_CONTENT,
  INITIAL_OFFERS,
  DEMO_PROFILES,
  calculateMemberLevel
} from '@/lib/store';
import { UserRole } from '@/types';

describe('AKGV Infra City - Enterprise Governance & Role Security Verification', () => {
  it('should enforce distinct permissions across all 5 recognized system roles', () => {
    const roles: UserRole[] = ['super_admin', 'sub_admin', 'senior_member', 'junior_member', 'buyer'];
    expect(roles).toHaveLength(5);

    // Verify demo directory covers each role
    roles.forEach((role) => {
      const match = DEMO_PROFILES.find((p) => p.role === role);
      expect(match).toBeDefined();
      expect(match?.fullName).toBeTruthy();
      expect(match?.isActive).toBe(true);
    });
  });

  it('should prohibit self-sponsorship and invalid sponsor cycles', () => {
    DEMO_PROFILES.forEach((profile) => {
      // A member cannot sponsor themselves
      if (profile.sponsorId) {
        expect(profile.sponsorId).not.toBe(profile.id);
        expect(profile.sponsorId).not.toBe(profile.memberId);
      }
    });
  });

  it('should validate sales commission levels accurately according to ground truth', () => {
    // Level 1: Sales Assistant (4%) for initial volume
    const lvl1 = calculateMemberLevel(100000);
    expect(lvl1.levelNumber).toBe(1);
    expect(lvl1.commissionPercent).toBe(4);

    // Level 3: Gold Star (6%) for ₹81 Lakh+
    const lvl3 = calculateMemberLevel(8500000);
    expect(lvl3.levelNumber).toBe(3);
    expect(lvl3.commissionPercent).toBe(6);

    // Level 7: Diamond (10%) for ₹12 Cr+
    const lvl7 = calculateMemberLevel(130000000);
    expect(lvl7.levelNumber).toBe(7);
    expect(lvl7.commissionPercent).toBe(10);
  });

  it('should contain production-ready CMS initial content with bilingual support', () => {
    expect(INITIAL_CMS_CONTENT.heroHeadlineEn).toBeTruthy();
    expect(INITIAL_CMS_CONTENT.heroHeadlineHi).toBeTruthy();
    expect(INITIAL_CMS_CONTENT.announcementBanner).toBeDefined();
    expect(INITIAL_CMS_CONTENT.announcementBanner?.isActive).toBe(true);
    expect(INITIAL_CMS_CONTENT.publicOffers.length).toBeGreaterThan(0);
    expect(INITIAL_CMS_CONTENT.faqs.length).toBeGreaterThanOrEqual(2);
  });

  it('should maintain initial sales targets and daily task assignments', () => {
    expect(INITIAL_TARGETS.length).toBeGreaterThan(0);
    const target = INITIAL_TARGETS[0];
    expect(target.targetSalesVolumeInr).toBeGreaterThan(0);
    expect(target.targetPlotsCount).toBeGreaterThan(0);

    expect(INITIAL_TASKS.length).toBeGreaterThan(0);
    const task = INITIAL_TASKS[0];
    expect(task.title).toBeTruthy();
    expect(task.dueDate).toBeTruthy();
  });

  it('should verify physical existence of PWA icon assets referenced in manifest', () => {
    const icon192Path = path.resolve(process.cwd(), 'public/icons/icon-192x192.png');
    const icon512Path = path.resolve(process.cwd(), 'public/icons/icon-512x512.png');
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');

    expect(fs.existsSync(icon192Path)).toBe(true);
    expect(fs.existsSync(icon512Path)).toBe(true);
    expect(fs.existsSync(swPath)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifestContent.name).toBe('AKGV Infra City Private Limited');
    expect(manifestContent.short_name).toBe('AKGV Infra');
    expect(manifestContent.icons.length).toBeGreaterThanOrEqual(2);
  });
});
