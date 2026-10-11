import { describe, it, expect } from 'vitest';
import { COMPANY_DETAILS } from '../src/data/groundTruth';
import { INITIAL_KIT_ISSUES } from '../src/lib/store';

describe('Joining Kit Offline Cash Ledger Tests', () => {
  it('should mandate exactly ₹999 offline cash fee', () => {
    expect(COMPANY_DETAILS.joiningKitPriceInr).toBe(999);
  });

  it('should include all 4 mandatory physical items in the joining kit', () => {
    expect(COMPANY_DETAILS.joiningKitItems).toEqual([
      '1 Bag',
      '1 Pen',
      '1 Diary',
      '1 File Folder'
    ]);
  });

  it('should verify each kit issue contains a unique receipt number and acknowledged items', () => {
    expect(INITIAL_KIT_ISSUES.length).toBeGreaterThan(0);
    for (const kit of INITIAL_KIT_ISSUES) {
      expect(kit.receiptNumber).toMatch(/^KIT-RCP-/);
      expect(kit.amountReceivedInr).toBe(999);
      expect(kit.itemsIncluded.bag).toBe(true);
      expect(kit.itemsIncluded.pen).toBe(true);
      expect(kit.itemsIncluded.diary).toBe(true);
      expect(kit.itemsIncluded.file).toBe(true);
      expect(kit.deliveryStatus).toBe('acknowledged');
    }
  });
});
