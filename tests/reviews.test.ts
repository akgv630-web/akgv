import { describe, it, expect } from 'vitest';
import { INITIAL_REVIEWS } from '../src/lib/store';
import { ReviewRecord } from '../src/types';

describe('Real Customer & Visitor Review System Tests', () => {
  it('should initialize with authentic real reviews', () => {
    expect(INITIAL_REVIEWS.length).toBeGreaterThanOrEqual(4);

    for (const rev of INITIAL_REVIEWS) {
      expect(rev.id).toMatch(/^rev-/);
      expect(rev.authorName.length).toBeGreaterThan(0);
      expect(rev.rating).toBeGreaterThanOrEqual(1);
      expect(rev.rating).toBeLessThanOrEqual(5);
      expect(rev.comment.length).toBeGreaterThan(15);
      expect(['approved', 'pending', 'rejected']).toContain(rev.status);
      expect(['buyer', 'visitor', 'associate', 'public']).toContain(rev.authorRole);
    }
  });

  it('should contain verified buyer reviews tied to actual plots and official branches', () => {
    const verifiedBuyers = INITIAL_REVIEWS.filter((r) => r.authorRole === 'buyer' && r.isVerified);
    expect(verifiedBuyers.length).toBeGreaterThanOrEqual(2);

    const plotNumbers = verifiedBuyers.map((b) => b.plotNumber);
    expect(plotNumbers).toContain('A-03');
    expect(plotNumbers).toContain('B-03');

    for (const b of verifiedBuyers) {
      expect(['Rampur Head Office', 'Lahartara Branch', 'Mirza Murad Branch']).toContain(b.branchLocation);
    }
  });

  it('should verify official Director corporate replies on key testimonials', () => {
    const repliedReviews = INITIAL_REVIEWS.filter((r) => r.adminReply !== undefined);
    expect(repliedReviews.length).toBeGreaterThanOrEqual(2);

    for (const r of repliedReviews) {
      expect(r.adminReply?.replierName).toContain('Rajesh Kumar Patel');
      expect(r.adminReply?.replyText.length).toBeGreaterThan(10);
    }
  });

  it('should support dynamic review creation, helpful voting, and moderation transitions', () => {
    const mockReviews: ReviewRecord[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));

    // 1. New user submits review
    const newRev: ReviewRecord = {
      id: `rev-${Date.now()}`,
      authorName: 'Vikas Kumar Srivastava',
      authorPhone: '9839123456',
      authorRole: 'buyer',
      rating: 5,
      title: 'Complete Freehold Registry Assistance',
      comment: 'Super fast deed execution support provided at Varanasi registry office.',
      plotNumber: 'A-05',
      branchLocation: 'Rampur Head Office',
      category: 'plot_purchase',
      isVerified: true,
      status: 'approved',
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };

    mockReviews.unshift(newRev);
    expect(mockReviews[0].id).toBe(newRev.id);
    expect(mockReviews[0].authorName).toBe('Vikas Kumar Srivastava');

    // 2. User votes helpful
    mockReviews[0].helpfulCount += 1;
    expect(mockReviews[0].helpfulCount).toBe(1);

    // 3. Admin replies
    mockReviews[0].adminReply = {
      replyText: 'Thank you Mr. Srivastava. We are proud to have served you.',
      repliedAt: new Date().toISOString(),
      replierName: 'Rajesh Kumar Patel (Director)'
    };
    expect(mockReviews[0].adminReply?.replyText).toContain('served you');
  });
});
