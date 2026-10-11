import { describe, it, expect } from 'vitest';
import { COMMISSION_LEVELS_GROUND_TRUTH } from '../src/data/groundTruth';
import { calculateMemberLevel } from '../src/lib/store';

describe('Commission & Rewards Engine (Ground Truth Verification)', () => {
  it('should contain all 11 official brochure levels in sequential order', () => {
    expect(COMMISSION_LEVELS_GROUND_TRUTH).toHaveLength(11);
    for (let i = 0; i < 11; i++) {
      expect(COMMISSION_LEVELS_GROUND_TRUTH[i].levelNumber).toBe(i + 1);
    }
  });

  it('should match exact brochure commission percentages from 4% to 14%', () => {
    const percentages = COMMISSION_LEVELS_GROUND_TRUTH.map((l) => l.commissionPercent);
    expect(percentages).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('should match exact brochure ranks and reward names for key milestones', () => {
    // Level 1: Sales Assistant -> Smartphone
    expect(COMMISSION_LEVELS_GROUND_TRUTH[0].rankTitleEn).toBe('Sales Assistant');
    expect(COMMISSION_LEVELS_GROUND_TRUTH[0].rewardNameEn).toBe('Smartphone');

    // Level 2: Star -> Goa Trip
    expect(COMMISSION_LEVELS_GROUND_TRUTH[1].rankTitleEn).toBe('Star');
    expect(COMMISSION_LEVELS_GROUND_TRUTH[1].rewardNameEn).toBe('Goa Trip');

    // Level 5: Manager -> Swift Dzire
    expect(COMMISSION_LEVELS_GROUND_TRUTH[4].rankTitleEn).toBe('Manager');
    expect(COMMISSION_LEVELS_GROUND_TRUTH[4].rewardNameEn).toContain('Swift Dzire');

    // Level 6: Senior Manager -> Duplex 2 BHK
    expect(COMMISSION_LEVELS_GROUND_TRUTH[5].rankTitleEn).toBe('Senior Manager');
    expect(COMMISSION_LEVELS_GROUND_TRUTH[5].rewardNameEn).toBe('Duplex 2 BHK House');

    // Level 11: Crown Ambassador -> BMW
    expect(COMMISSION_LEVELS_GROUND_TRUTH[10].rankTitleEn).toBe('Crown Ambassador');
    expect(COMMISSION_LEVELS_GROUND_TRUTH[10].rewardNameEn).toContain('BMW');
  });

  it('should calculate correct member level based on business target volume', () => {
    // ₹15 Lakh business -> Level 1 (Sales Assistant, 4%)
    const level1 = calculateMemberLevel(1500000);
    expect(level1.levelNumber).toBe(1);
    expect(level1.commissionPercent).toBe(4);

    // ₹50 Lakh business -> Level 2 (Star, 5%)
    const level2 = calculateMemberLevel(5000000);
    expect(level2.levelNumber).toBe(2);
    expect(level2.commissionPercent).toBe(5);

    // ₹85 Lakh business -> Level 3 (Gold Star, 6%)
    const level3 = calculateMemberLevel(8500000);
    expect(level3.levelNumber).toBe(3);
    expect(level3.commissionPercent).toBe(6);

    // ₹10 Crore business -> Level 6 (Senior Manager, 9%)
    const level6 = calculateMemberLevel(100000000);
    expect(level6.levelNumber).toBe(6);
    expect(level6.commissionPercent).toBe(9);

    // ₹350 Crore business -> Level 11 (Crown Ambassador, 14%)
    const level11 = calculateMemberLevel(3500000000);
    expect(level11.levelNumber).toBe(11);
    expect(level11.commissionPercent).toBe(14);
  });

  it('should calculate accurate commission earnings in INR', () => {
    const saleVolume = 1500000; // Plot A-01 sale of ₹15 Lakh
    const level = calculateMemberLevel(saleVolume);
    const commission = (saleVolume * level.commissionPercent) / 100;
    expect(commission).toBe(60000); // 4% of 15,00,000 = 60,000
  });
});
