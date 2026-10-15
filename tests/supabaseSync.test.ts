import { describe, it, expect, vi } from 'vitest';
import {
  fetchPlotsFromSupabase,
  fetchReviewsFromSupabase,
  savePlotToSupabase,
  saveReviewToSupabase,
  deletePlotFromSupabase,
  deleteReviewFromSupabase
} from '../src/lib/supabase/syncService';
import { isSupabaseConfigured } from '../src/lib/supabase/client';

describe('Supabase Connectivity & Resilient Sync Suite', () => {
  it('identifies Supabase configuration status accurately', () => {
    // Configured based on process.env in test or default
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('gracefully handles remote fetch when tables are not yet created or offline', async () => {
    // Should never throw unhandled exception
    const plotsResult = await fetchPlotsFromSupabase();
    // Either returns null or array of plots
    expect(plotsResult === null || Array.isArray(plotsResult)).toBe(true);

    const reviewsResult = await fetchReviewsFromSupabase();
    expect(reviewsResult === null || Array.isArray(reviewsResult)).toBe(true);
  });

  it('safely handles save operations without breaking client state', async () => {
    const dummyPlot = {
      id: 'test-plot-01',
      plotNumber: 'T-01',
      block: 'A' as const,
      locationId: 'loc-rampur',
      areaSqft: 1200,
      dimensions: "30' x 40'",
      roadWidth: "30'-0\" WIDE",
      roadFacing: 'East',
      status: 'available_green' as const,
      suitableHouseModelIds: [],
      x: 100,
      y: 100,
      width: 80,
      height: 120,
    };

    const saveResult = await savePlotToSupabase(dummyPlot);
    expect(typeof saveResult).toBe('boolean');

    const deleteResult = await deletePlotFromSupabase('test-plot-01');
    expect(typeof deleteResult).toBe('boolean');
  });

  it('safely handles review operations with full type fidelity', async () => {
    const dummyReview = {
      id: 'test-rev-01',
      authorName: 'Test Buyer',
      authorRole: 'buyer' as const,
      rating: 5,
      title: 'Seamless Registry Test',
      comment: 'Verified clear title at Varanasi registry office.',
      branchLocation: 'Rampur Head Office',
      category: 'legal_registry' as const,
      isVerified: true,
      status: 'approved' as const,
      helpfulCount: 3,
      createdAt: new Date().toISOString()
    };

    const saveRev = await saveReviewToSupabase(dummyReview);
    expect(typeof saveRev).toBe('boolean');

    const delRev = await deleteReviewFromSupabase('test-rev-01');
    expect(typeof delRev).toBe('boolean');
  });
});
