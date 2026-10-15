import { supabase, isSupabaseConfigured } from './client';
import {
  Booking,
  PaymentRecord,
  Plot,
  Profile,
  ReviewRecord,
  SiteVisit
} from '@/types';

// ==============================================================================
// 1. PLOT SYNC
// ==============================================================================

export async function fetchPlotsFromSupabase(): Promise<Plot[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .order('plot_number', { ascending: true });

    if (error) {
      // Table doesn't exist yet or connection issue
      console.warn('[Supabase Sync] fetchPlots notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      plotNumber: row.plot_number,
      block: row.block as 'A' | 'B' | 'C',
      locationId: row.location_id || 'loc-rampur',
      areaSqft: Number(row.area_sqft),
      dimensions: row.dimensions,
      roadWidth: row.road_width,
      roadFacing: row.road_facing,
      status: row.status,
      basePriceInr: row.base_price_inr ? Number(row.base_price_inr) : undefined,
      suitableHouseModelIds: Array.isArray(row.suitable_house_model_ids) ? row.suitable_house_model_ids : [],
      isCornerPlot: Boolean(row.is_corner_plot),
      notes: row.notes || undefined,
      x: row.canvas_x ?? 100,
      y: row.canvas_y ?? 100,
      width: row.canvas_w ?? 80,
      height: row.canvas_h ?? 125,
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching plots:', err);
    return null;
  }
}

export async function savePlotToSupabase(plot: Plot): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: plot.id,
      plot_number: plot.plotNumber,
      block: plot.block,
      location_id: plot.locationId,
      area_sqft: plot.areaSqft,
      dimensions: plot.dimensions,
      road_width: plot.roadWidth,
      road_facing: plot.roadFacing,
      status: plot.status,
      base_price_inr: plot.basePriceInr,
      suitable_house_model_ids: plot.suitableHouseModelIds,
      is_corner_plot: plot.isCornerPlot ?? false,
      notes: plot.notes,
      canvas_x: plot.x,
      canvas_y: plot.y,
      canvas_w: plot.width,
      canvas_h: plot.height,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('plots')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving plot:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving plot:', err);
    return false;
  }
}

export async function deletePlotFromSupabase(plotId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('plots')
      .delete()
      .eq('id', plotId);

    if (error) {
      console.warn('[Supabase Sync] Error deleting plot:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception deleting plot:', err);
    return false;
  }
}

// ==============================================================================
// 2. REVIEWS SYNC
// ==============================================================================

export async function fetchReviewsFromSupabase(): Promise<ReviewRecord[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Sync] fetchReviews notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      authorName: row.author_name,
      authorPhone: row.author_phone || undefined,
      authorRole: row.author_role,
      rating: Number(row.rating),
      title: row.title,
      comment: row.comment,
      plotNumber: row.plot_number || undefined,
      branchLocation: row.branch_location,
      category: row.category,
      isVerified: Boolean(row.is_verified),
      status: row.status,
      helpfulCount: Number(row.helpful_count || 0),
      createdAt: row.created_at,
      adminReply: row.admin_reply ? {
        replyText: row.admin_reply.replyText,
        repliedAt: row.admin_reply.repliedAt,
        replierName: row.admin_reply.replierName
      } : undefined
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching reviews:', err);
    return null;
  }
}

export async function saveReviewToSupabase(review: ReviewRecord): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: review.id,
      author_name: review.authorName,
      author_phone: review.authorPhone,
      author_role: review.authorRole,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      plot_number: review.plotNumber,
      branch_location: review.branchLocation,
      category: review.category,
      is_verified: review.isVerified,
      status: review.status,
      helpful_count: review.helpfulCount,
      admin_reply: review.adminReply,
      created_at: review.createdAt
    };

    const { error } = await supabase
      .from('reviews')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving review:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving review:', err);
    return false;
  }
}

export async function updateReviewInSupabase(
  reviewId: string,
  patch: Partial<ReviewRecord>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload: Record<string, unknown> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.helpfulCount !== undefined) payload.helpful_count = patch.helpfulCount;
    if (patch.adminReply !== undefined) payload.admin_reply = patch.adminReply;

    const { error } = await supabase
      .from('reviews')
      .update(payload)
      .eq('id', reviewId);

    if (error) {
      console.warn('[Supabase Sync] Error updating review:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception updating review:', err);
    return false;
  }
}

export async function deleteReviewFromSupabase(reviewId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.warn('[Supabase Sync] Error deleting review:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception deleting review:', err);
    return false;
  }
}

// ==============================================================================
// 3. BOOKINGS SYNC
// ==============================================================================

export async function fetchBookingsFromSupabase(): Promise<Booking[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Sync] fetchBookings notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      bookingNumber: row.booking_number,
      plotId: row.plot_id,
      plotNumber: row.plot_number,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name,
      buyerPhone: row.buyer_phone,
      sponsorId: row.sponsor_id || undefined,
      status: row.status,
      houseModelId: row.house_model_id || undefined,
      totalAmountInr: Number(row.total_amount_inr),
      paidAmountInr: Number(row.paid_amount_inr || 0),
      holdExpiresAt: row.hold_expires_at || undefined,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at || undefined
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching bookings:', err);
    return null;
  }
}

export async function saveBookingToSupabase(booking: Booking): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: booking.id,
      booking_number: booking.bookingNumber,
      plot_id: booking.plotId,
      plot_number: booking.plotNumber,
      buyer_id: booking.buyerId,
      buyer_name: booking.buyerName,
      buyer_phone: booking.buyerPhone,
      sponsor_id: booking.sponsorId,
      house_model_id: booking.houseModelId,
      status: booking.status,
      total_amount_inr: booking.totalAmountInr,
      paid_amount_inr: booking.paidAmountInr,
      hold_expires_at: booking.holdExpiresAt,
      created_at: booking.createdAt,
      confirmed_at: booking.confirmedAt
    };

    const { error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving booking:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving booking:', err);
    return false;
  }
}

// ==============================================================================
// 4. PAYMENTS SYNC
// ==============================================================================

export async function savePaymentToSupabase(payment: PaymentRecord): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: payment.id,
      transaction_ref: payment.transactionRef,
      booking_id: payment.bookingId,
      plot_number: payment.plotNumber,
      payer_name: payment.payerName,
      payer_phone: payment.payerPhone,
      amount_inr: payment.amountInr,
      payment_method: payment.paymentMethod,
      status: payment.status,
      receipt_number: payment.receiptNumber,
      proof_url: payment.proofUrl,
      notes: payment.notes,
      submitted_at: payment.submittedAt,
      verified_at: payment.verifiedAt,
      verified_by: payment.verifiedBy,
      rejection_reason: payment.rejectionReason
    };

    const { error } = await supabase
      .from('payment_records')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving payment:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving payment:', err);
    return false;
  }
}

// ==============================================================================
// 5. SITE VISITS SYNC
// ==============================================================================

export async function saveSiteVisitToSupabase(visit: SiteVisit): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: visit.id,
      visitor_name: visit.visitorName,
      visitor_phone: visit.visitorPhone,
      visitor_email: visit.visitorEmail,
      location_id: visit.locationId,
      location_name: visit.locationName,
      preferred_date: visit.preferredDate,
      preferred_time_slot: visit.preferredTimeSlot,
      pickup_required: visit.pickupRequired,
      assigned_staff_name: visit.assignedStaffName,
      status: visit.status,
      notes: visit.notes,
      created_at: visit.createdAt
    };

    const { error } = await supabase
      .from('site_visits')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving site visit:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving site visit:', err);
    return false;
  }
}

// ==============================================================================
// 6. PROFILES SYNC
// ==============================================================================

export async function fetchProfilesFromSupabase(): Promise<Profile[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase Sync] fetchProfiles notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      role: row.role,
      memberId: row.member_id || undefined,
      sponsorId: row.sponsor_id || undefined,
      kycStatus: row.kyc_status,
      isActive: Boolean(row.is_active),
      avatarUrl: row.avatar_url || undefined,
      city: row.city || undefined,
      branchLocation: row.branch_location || undefined,
      address: row.address || undefined,
      level: row.level ? Number(row.level) : undefined,
      rankTitle: row.rank_title || undefined,
      totalBusinessVolumeInr: row.total_business_volume_inr ? Number(row.total_business_volume_inr) : undefined,
      plotsClosedCount: row.plots_closed_count ? Number(row.plots_closed_count) : undefined,
      joinedDate: row.joined_date || undefined,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching profiles:', err);
    return null;
  }
}

export async function saveProfileToSupabase(profile: Profile): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      phone: profile.phone,
      role: profile.role,
      member_id: profile.memberId,
      sponsor_id: profile.sponsorId,
      kyc_status: profile.kycStatus,
      is_active: profile.isActive,
      avatar_url: profile.avatarUrl,
      city: profile.city,
      branch_location: profile.branchLocation,
      address: profile.address,
      level: profile.level,
      rank_title: profile.rankTitle,
      total_business_volume_inr: profile.totalBusinessVolumeInr,
      plots_closed_count: profile.plotsClosedCount,
      joined_date: profile.joinedDate,
      created_at: profile.createdAt,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving profile:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving profile:', err);
    return false;
  }
}

export async function deleteProfileFromSupabase(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      console.warn('[Supabase Sync] Error deleting profile:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception deleting profile:', err);
    return false;
  }
}
