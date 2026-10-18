import { supabase, isSupabaseConfigured } from './client';
import type { Session } from '@supabase/supabase-js';
import { DEMO_PROFILES } from '@/lib/store';
import {
  Booking,
  ClientEnquiry,
  CmsContent,
  FieldGpsEvidence,
  InAppMessage,
  OfferIncentive,
  PaymentRecord,
  Plot,
  Profile,
  ReviewRecord,
  SalesTarget,
  SiteVisit,
  TaskReminder
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

export async function fetchSiteVisitsFromSupabase(): Promise<SiteVisit[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .order('preferred_date', { ascending: false });

    if (error) {
      console.warn('[Supabase Sync] fetchSiteVisits notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      buyerId: row.buyer_id || undefined,
      visitorName: row.visitor_name,
      visitorPhone: row.visitor_phone,
      visitorEmail: row.visitor_email || undefined,
      locationId: row.location_id,
      locationName: row.location_name,
      preferredDate: row.preferred_date,
      preferredTimeSlot: row.preferred_time_slot,
      pickupRequired: Boolean(row.pickup_required),
      assignedStaffId: row.assigned_staff_id || undefined,
      assignedStaffMemberId: row.assigned_staff_member_id || undefined,
      assignedStaffName: row.assigned_staff_name || undefined,
      status: row.status,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching site visits:', err);
    return null;
  }
}

export async function saveSiteVisitToSupabase(visit: SiteVisit): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: visit.id,
      buyer_id: visit.buyerId || null,
      visitor_name: visit.visitorName,
      visitor_phone: visit.visitorPhone,
      visitor_email: visit.visitorEmail || null,
      location_id: visit.locationId,
      location_name: visit.locationName,
      preferred_date: visit.preferredDate,
      preferred_time_slot: visit.preferredTimeSlot,
      pickup_required: visit.pickupRequired,
      assigned_staff_id: visit.assignedStaffId || null,
      assigned_staff_member_id: visit.assignedStaffMemberId || null,
      assigned_staff_name: visit.assignedStaffName || null,
      status: visit.status,
      notes: visit.notes || null,
      created_at: visit.createdAt,
      updated_at: new Date().toISOString()
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

export async function updateSiteVisitInSupabase(
  visitId: string,
  patch: Partial<SiteVisit>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.assignedStaffId !== undefined) payload.assigned_staff_id = patch.assignedStaffId;
    if (patch.assignedStaffMemberId !== undefined) payload.assigned_staff_member_id = patch.assignedStaffMemberId;
    if (patch.assignedStaffName !== undefined) payload.assigned_staff_name = patch.assignedStaffName;
    if (patch.preferredDate !== undefined) payload.preferred_date = patch.preferredDate;
    if (patch.preferredTimeSlot !== undefined) payload.preferred_time_slot = patch.preferredTimeSlot;

    const { error } = await supabase
      .from('site_visits')
      .update(payload)
      .eq('id', visitId);

    if (error) {
      console.warn('[Supabase Sync] Error updating site visit:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception updating site visit:', err);
    return false;
  }
}

export async function deleteSiteVisitFromSupabase(visitId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('site_visits')
      .delete()
      .eq('id', visitId);

    if (error) {
      console.warn('[Supabase Sync] Error deleting site visit:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception deleting site visit:', err);
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
      authUserId: row.auth_user_id || undefined,
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
      permissions: row.permissions || undefined,
      invitationStatus: row.invitation_status || undefined,
      invitationSentAt: row.invitation_sent_at || undefined,
      invitedBy: row.invited_by || undefined,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching profiles:', err);
    return null;
  }
}

export interface SaveProfileResult {
  success: boolean;
  error?: string;
  profile?: Profile;
}

export async function saveProfileToSupabase(
  profile: Profile,
  authUserIdOverride?: string
): Promise<SaveProfileResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const effectiveAuthUserId =
      authUserIdOverride ||
      profile.authUserId ||
      (profile.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? profile.id : null);

    const payload: Record<string, unknown> = {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      phone: profile.phone,
      role: profile.role,
      member_id: profile.memberId || null,
      sponsor_id: profile.sponsorId || null,
      kyc_status: profile.kycStatus,
      is_active: profile.isActive,
      avatar_url: profile.avatarUrl || null,
      city: profile.city || null,
      branch_location: profile.branchLocation || null,
      address: profile.address || null,
      level: profile.level ?? 1,
      rank_title: profile.rankTitle || null,
      total_business_volume_inr: profile.totalBusinessVolumeInr ?? 0,
      plots_closed_count: profile.plotsClosedCount ?? 0,
      joined_date: profile.joinedDate || null,
      created_at: profile.createdAt,
      updated_at: new Date().toISOString()
    };

    if (effectiveAuthUserId) {
      payload.auth_user_id = effectiveAuthUserId;
    }
    if (profile.permissions) {
      payload.permissions = profile.permissions;
    }
    if (profile.invitationStatus) {
      payload.invitation_status = profile.invitationStatus;
    }
    if (profile.invitationSentAt) {
      payload.invitation_sent_at = profile.invitationSentAt;
    }
    if (profile.invitedBy) {
      payload.invited_by = profile.invitedBy;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving profile:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, profile };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Sync] Exception saving profile:', msg);
    return { success: false, error: msg };
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

export async function fetchProfileByAuthId(authUserId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase || !authUserId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`auth_user_id.eq.${authUserId},id.eq.${authUserId}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('[Supabase Sync] fetchProfileByAuthId notice:', error.message);
      return null;
    }

    return {
      id: data.id,
      authUserId: data.auth_user_id || data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      role: data.role,
      memberId: data.member_id || undefined,
      sponsorId: data.sponsor_id || undefined,
      kycStatus: data.kyc_status,
      isActive: Boolean(data.is_active),
      avatarUrl: data.avatar_url || undefined,
      city: data.city || undefined,
      branchLocation: data.branch_location || undefined,
      address: data.address || undefined,
      level: data.level ? Number(data.level) : undefined,
      rankTitle: data.rank_title || undefined,
      totalBusinessVolumeInr: data.total_business_volume_inr ? Number(data.total_business_volume_inr) : undefined,
      plotsClosedCount: data.plots_closed_count ? Number(data.plots_closed_count) : undefined,
      joinedDate: data.joined_date || undefined,
      permissions: data.permissions || undefined,
      invitationStatus: data.invitation_status || undefined,
      invitationSentAt: data.invitation_sent_at || undefined,
      invitedBy: data.invited_by || undefined,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching profile by auth id:', err);
    return null;
  }
}

// ==============================================================================
// 7. SUPABASE AUTH WRAPPER
// ==============================================================================

export async function supabaseSignIn(identifier: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  try {
    let emailToUse = identifier.trim();
    // If identifier is not an email (e.g. Member ID or Phone), resolve via secure RPC
    if (!emailToUse.includes('@')) {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc('resolve_login_identifier', {
        p_identifier: emailToUse,
      });

      if (!rpcErr && typeof resolvedEmail === 'string' && resolvedEmail.length > 0) {
        emailToUse = resolvedEmail;
      } else {
        // Fallback for development/offline environments where RPC migration hasn't been executed
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .or(`phone.eq.${emailToUse},member_id.ilike.${emailToUse}`)
          .limit(1)
          .maybeSingle();

        if (profile && profile.email) {
          emailToUse = profile.email;
        }
      }
    }

    const res = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export async function supabaseSignUp(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  sponsorId?: string;
}) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  try {
    const res = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role || 'buyer',
          sponsor_id: data.sponsorId,
        },
      },
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase Auth] Sign out error:', err);
  }
}

export async function supabaseResetPassword(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset` : undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export async function supabaseUpdatePassword(newPassword: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const res = await supabase.auth.updateUser({
      password: newPassword,
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export async function supabaseGetSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

export function supabaseOnAuthStateChange(callback: (session: Session | null) => void) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  } catch {
    return () => {};
  }
}

export interface CreateBookingAtomicResult {
  success: boolean;
  error?: string;
  booking_id?: string;
  booking_number?: string;
  hold_expires_at?: string;
}

export async function callCreatePlotBookingAtomic(params: {
  plotId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  totalAmount: number;
  sponsorId?: string;
  houseModelId?: string;
}): Promise<{ data: CreateBookingAtomicResult | null; error: { message?: string } | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase database service is not configured') };
  }

  try {
    const { data, error } = await supabase.rpc('create_plot_booking_atomic', {
      p_plot_id: params.plotId,
      p_buyer_id: params.buyerId,
      p_buyer_name: params.buyerName,
      p_buyer_phone: params.buyerPhone,
      p_total_amount: params.totalAmount,
      p_sponsor_id: params.sponsorId || null,
      p_house_model_id: params.houseModelId || null,
    });
    return { data: (data as CreateBookingAtomicResult) || null, error };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export interface VerifyPaymentAtomicResult {
  success: boolean;
  error?: string;
  payment_id?: string;
  receipt_number?: string;
  total_paid?: number;
  total_price?: number;
  remaining_due?: number;
  booking_status?: string;
  plot_status?: string;
}

export async function callVerifyPaymentAtomic(params: {
  paymentId: string;
  approved: boolean;
  reason?: string;
}): Promise<{ data: VerifyPaymentAtomicResult | null; error: { message?: string } | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase database service is not configured') };
  }

  try {
    const { data, error } = await supabase.rpc('verify_payment_atomic', {
      p_payment_id: params.paymentId,
      p_approved: params.approved,
      p_reason: params.reason || null,
    });
    return { data: (data as VerifyPaymentAtomicResult) || null, error };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: { message } };
  }
}

export async function uploadGpsEvidencePhoto(
  fileOrBlob: Blob | File,
  path: string
): Promise<{ data: unknown; error: unknown }> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase storage is not configured') };
  }

  try {
    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(path, fileOrBlob, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ==============================================================================
// 8. FIELD GPS EVIDENCE SYNC
// ==============================================================================

export async function fetchGpsEvidenceFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('field_gps_evidence')
      .select('*')
      .order('capture_timestamp', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      plotNumber: row.plot_number,
      locationId: row.location_id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      accuracyMeters: Number(row.accuracy_meters),
      captureTimestamp: row.capture_timestamp,
      photoUrl: row.photo_url,
      capturedByMemberId: row.captured_by_member_id,
      capturedByName: row.captured_by_name,
      status: row.status,
      adminNotes: row.admin_notes || undefined,
      isLiveCamera: Boolean(row.is_live_camera),
      measuredDimensions: row.measured_dimensions || undefined,
      measuredAreaSqft: row.measured_area_sqft ? Number(row.measured_area_sqft) : undefined,
      roadAccessWidth: row.road_access_width || undefined,
      proposedRatePerSqft: row.proposed_rate_per_sqft ? Number(row.proposed_rate_per_sqft) : undefined,
      expectedPriceInr: row.expected_price_inr ? Number(row.expected_price_inr) : undefined,
      reviewedBy: row.reviewed_by || undefined,
      reviewedAt: row.reviewed_at || undefined,
      rejectionReason: row.rejection_reason || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching GPS evidence:', err);
    return null;
  }
}

export async function saveGpsEvidenceToSupabase(evidence: FieldGpsEvidence): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: evidence.id,
      plot_number: evidence.plotNumber,
      location_id: evidence.locationId || 'loc-rampur',
      latitude: evidence.latitude,
      longitude: evidence.longitude,
      accuracy_meters: evidence.accuracyMeters,
      capture_timestamp: evidence.captureTimestamp,
      photo_url: evidence.photoUrl,
      captured_by_member_id: evidence.capturedByMemberId,
      captured_by_name: evidence.capturedByName,
      status: evidence.status || 'pending_review',
      admin_notes: evidence.adminNotes,
      is_live_camera: evidence.isLiveCamera ?? true,
      measured_dimensions: evidence.measuredDimensions,
      measured_area_sqft: evidence.measuredAreaSqft,
      road_access_width: evidence.roadAccessWidth,
      proposed_rate_per_sqft: evidence.proposedRatePerSqft,
      expected_price_inr: evidence.expectedPriceInr,
      reviewed_by: evidence.reviewedBy,
      reviewed_at: evidence.reviewedAt,
      rejection_reason: evidence.rejectionReason,
    };
    const { error } = await supabase
      .from('field_gps_evidence')
      .upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 9. CLIENT ENQUIRIES & CRM SYNC
// ==============================================================================

export async function fetchEnquiriesFromSupabase(): Promise<ClientEnquiry[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('client_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      clientEmail: row.client_email || undefined,
      interestedPlotId: row.interested_plot_id || undefined,
      preferredLocationId: row.preferred_location_id || undefined,
      budgetInr: row.budget_inr ? Number(row.budget_inr) : undefined,
      status: row.status,
      assignedProfileId: row.assigned_profile_id || undefined,
      assignedMemberId: row.assigned_member_id || '',
      assignedMemberName: row.assigned_member_name || '',
      notes: row.notes || undefined,
      followUps: Array.isArray(row.follow_ups) ? row.follow_ups : [],
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

export async function saveEnquiryToSupabase(enquiry: ClientEnquiry): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: enquiry.id,
      client_name: enquiry.clientName,
      client_phone: enquiry.clientPhone,
      client_email: enquiry.clientEmail || null,
      interested_plot_id: enquiry.interestedPlotId || null,
      preferred_location_id: enquiry.preferredLocationId || null,
      budget_inr: enquiry.budgetInr || null,
      status: enquiry.status,
      assigned_profile_id: enquiry.assignedProfileId || null,
      assigned_member_id: enquiry.assignedMemberId || null,
      assigned_member_name: enquiry.assignedMemberName || null,
      notes: enquiry.notes || null,
      follow_ups: enquiry.followUps || [],
      created_at: enquiry.createdAt,
    };
    const { error } = await supabase
      .from('client_enquiries')
      .upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function updateEnquiryInSupabase(
  enquiryId: string,
  patch: Partial<ClientEnquiry>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload: Record<string, unknown> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.followUps !== undefined) payload.follow_ups = patch.followUps;
    if (patch.assignedProfileId !== undefined) payload.assigned_profile_id = patch.assignedProfileId;
    if (patch.assignedMemberId !== undefined) payload.assigned_member_id = patch.assignedMemberId;
    if (patch.assignedMemberName !== undefined) payload.assigned_member_name = patch.assignedMemberName;

    const { error } = await supabase
      .from('client_enquiries')
      .update(payload)
      .eq('id', enquiryId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteEnquiryFromSupabase(enquiryId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('client_enquiries')
      .delete()
      .eq('id', enquiryId);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 10. SALES TARGETS & TASK REMINDERS SYNC
// ==============================================================================

export async function fetchTargetsFromSupabase(): Promise<SalesTarget[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('sales_targets').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      profileId: row.profile_id || undefined,
      memberId: row.member_id,
      memberName: row.member_name,
      period: row.period,
      periodLabel: row.period_label,
      targetPlotsCount: Number(row.target_plots_count),
      targetSalesVolumeInr: Number(row.target_sales_volume_inr),
      achievedPlotsCount: Number(row.achieved_plots_count),
      achievedSalesVolumeInr: Number(row.achieved_sales_volume_inr),
      status: row.status,
      assignedBy: row.assigned_by,
      updatedAt: row.updated_at,
    }));
  } catch {
    return null;
  }
}

export async function saveTargetToSupabase(target: SalesTarget): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: target.id,
      profile_id: target.profileId || null,
      member_id: target.memberId,
      member_name: target.memberName,
      period: target.period,
      period_label: target.periodLabel,
      target_plots_count: target.targetPlotsCount,
      target_sales_volume_inr: target.targetSalesVolumeInr,
      achieved_plots_count: target.achievedPlotsCount,
      achieved_sales_volume_inr: target.achievedSalesVolumeInr,
      status: target.status,
      assigned_by: target.assignedBy,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('sales_targets').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function updateTargetInSupabase(
  targetId: string,
  patch: Partial<SalesTarget>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.targetPlotsCount !== undefined) payload.target_plots_count = patch.targetPlotsCount;
    if (patch.targetSalesVolumeInr !== undefined) payload.target_sales_volume_inr = patch.targetSalesVolumeInr;
    if (patch.achievedPlotsCount !== undefined) payload.achieved_plots_count = patch.achievedPlotsCount;
    if (patch.achievedSalesVolumeInr !== undefined) payload.achieved_sales_volume_inr = patch.achievedSalesVolumeInr;
    if (patch.status !== undefined) payload.status = patch.status;

    const { error } = await supabase.from('sales_targets').update(payload).eq('id', targetId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteTargetFromSupabase(targetId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('sales_targets').delete().eq('id', targetId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTasksFromSupabase(): Promise<TaskReminder[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('task_reminders')
      .select('*')
      .order('due_date', { ascending: true });
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      assigneeId: row.assignee_id || row.assigned_to_member_id,
      assignedToMemberId: row.assigned_to_member_id,
      assignedToName: row.assigned_to_name,
      title: row.title,
      description: row.description || undefined,
      category: row.category,
      relatedRecordType: row.related_record_type || undefined,
      relatedRecordId: row.related_record_id || undefined,
      targetRoute: row.target_route || undefined,
      completionNotes: row.completion_notes || undefined,
      status: row.status || (row.is_completed ? 'completed' : 'pending'),
      dueDate: row.due_date,
      dueTime: row.due_time || undefined,
      priority: row.priority,
      isCompleted: Boolean(row.is_completed),
      completedAt: row.completed_at || undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

export async function saveTaskToSupabase(task: TaskReminder): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: task.id,
      assignee_id: task.assigneeId || task.assignedToMemberId,
      assigned_to_member_id: task.assignedToMemberId,
      assigned_to_name: task.assignedToName,
      title: task.title,
      description: task.description || null,
      category: task.category,
      related_record_type: task.relatedRecordType || null,
      related_record_id: task.relatedRecordId || null,
      target_route: task.targetRoute || null,
      completion_notes: task.completionNotes || null,
      status: task.status || (task.isCompleted ? 'completed' : 'pending'),
      due_date: task.dueDate,
      due_time: task.dueTime || null,
      priority: task.priority,
      is_completed: task.isCompleted,
      completed_at: task.completedAt || null,
      created_by: task.createdBy,
      created_at: task.createdAt,
    };
    const { error } = await supabase.from('task_reminders').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

export async function updateTaskInSupabase(
  taskId: string,
  patch: Partial<TaskReminder>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Database service not configured' };
  try {
    const payload: Record<string, unknown> = {};
    if (patch.isCompleted !== undefined) {
      payload.is_completed = patch.isCompleted;
      if (patch.isCompleted) {
        payload.completed_at = patch.completedAt || new Date().toISOString();
        payload.status = 'completed';
      } else {
        payload.completed_at = null;
        payload.status = patch.status || 'in_progress';
      }
    }
    if (patch.completionNotes !== undefined) payload.completion_notes = patch.completionNotes;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
    if (patch.dueTime !== undefined) payload.due_time = patch.dueTime;
    if (patch.priority !== undefined) payload.priority = patch.priority;
    if (patch.category !== undefined) payload.category = patch.category;
    if (patch.assigneeId !== undefined) payload.assignee_id = patch.assigneeId;
    if (patch.assignedToMemberId !== undefined) payload.assigned_to_member_id = patch.assignedToMemberId;
    if (patch.assignedToName !== undefined) payload.assigned_to_name = patch.assignedToName;
    if (patch.targetRoute !== undefined) payload.target_route = patch.targetRoute;
    if (patch.relatedRecordType !== undefined) payload.related_record_type = patch.relatedRecordType;
    if (patch.relatedRecordId !== undefined) payload.related_record_id = patch.relatedRecordId;

    const { error } = await supabase
      .from('task_reminders')
      .update(payload)
      .eq('id', taskId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function deleteTaskFromSupabase(taskId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('task_reminders').delete().eq('id', taskId);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 11. DYNAMIC CMS CONTENT SYNC
// ==============================================================================

export async function fetchCmsContentFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .eq('id', 'main_homepage')
      .maybeSingle();

    if (error || !data) return null;
    return {
      heroHeadlineEn: data.hero_headline_en,
      heroHeadlineHi: data.hero_headline_hi,
      heroSubtitleEn: data.hero_subtitle_en,
      heroSubtitleHi: data.hero_subtitle_hi,
      announcementBanner: data.announcement_banner,
      publicOffers: Array.isArray(data.public_offers) ? data.public_offers : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
    };
  } catch {
    return null;
  }
}

export async function saveCmsContentToSupabase(content: CmsContent): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: 'main_homepage',
      hero_headline_en: content.heroHeadlineEn,
      hero_headline_hi: content.heroHeadlineHi,
      hero_subtitle_en: content.heroSubtitleEn,
      hero_subtitle_hi: content.heroSubtitleHi,
      announcement_banner: content.announcementBanner,
      public_offers: content.publicOffers,
      faqs: content.faqs,
      updated_at: new Date().toISOString(),
      updated_by: content.updatedBy || 'Director',
    };
    const { error } = await supabase.from('cms_content').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 12. OFFERS & INCENTIVES SYNC
// ==============================================================================

export async function fetchOffersFromSupabase(): Promise<OfferIncentive[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('offer_incentives')
      .select('*')
      .order('start_date', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      titleEn: row.title_en,
      titleHi: row.title_hi,
      description: row.description,
      minPlotCount: row.min_plot_count ? Number(row.min_plot_count) : undefined,
      minSalesValueInr: row.min_sales_value_inr ? Number(row.min_sales_value_inr) : undefined,
      rewardDescription: row.reward_description,
      rewardType: row.reward_type,
      startDate: row.start_date,
      endDate: row.end_date,
      eligibleRoles: Array.isArray(row.eligible_roles) ? row.eligible_roles : [],
      status: row.status,
      claimedCount: Number(row.claimed_count || 0),
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching offers:', err);
    return null;
  }
}

export async function saveOfferToSupabase(offer: OfferIncentive): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payload = {
      id: offer.id,
      title_en: offer.titleEn,
      title_hi: offer.titleHi,
      description: offer.description,
      min_plot_count: offer.minPlotCount,
      min_sales_value_inr: offer.minSalesValueInr,
      reward_description: offer.rewardDescription,
      reward_type: offer.rewardType,
      start_date: offer.startDate,
      end_date: offer.endDate,
      eligible_roles: offer.eligibleRoles,
      status: offer.status,
      claimed_count: offer.claimedCount,
    };

    const { error } = await supabase
      .from('offer_incentives')
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 13. IN-APP MESSAGING SYNC
// ==============================================================================

export async function fetchInAppMessagesFromSupabase(): Promise<InAppMessage[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('in_app_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      recipientType: row.recipient_type as 'individual' | 'role' | 'branch' | 'all',
      recipientId: row.recipient_id || undefined,
      recipientProfileId: row.recipient_profile_id || undefined,
      targetRoute: row.target_route || undefined,
      title: row.title,
      message: row.message,
      senderName: row.sender_name,
      priority: row.priority as 'normal' | 'important' | 'urgent',
      isRead: Boolean(row.is_read),
      readAt: row.read_at || undefined,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('[Supabase Sync] Exception fetching in-app messages:', err);
    return null;
  }
}

export async function saveInAppMessageToSupabase(msg: InAppMessage): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: msg.id,
      recipient_type: msg.recipientType,
      recipient_id: msg.recipientId || null,
      recipient_profile_id: msg.recipientProfileId || null,
      target_route: msg.targetRoute || null,
      title: msg.title,
      message: msg.message,
      sender_name: msg.senderName,
      priority: msg.priority || 'normal',
      is_read: Boolean(msg.isRead),
      read_at: msg.readAt || null,
      created_at: msg.createdAt,
    };

    const { error } = await supabase
      .from('in_app_messages')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync] Error saving in-app message:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Sync] Exception saving in-app message:', err);
    return false;
  }
}

export async function markInAppMessageReadInSupabase(msgId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('in_app_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', msgId);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteInAppMessageFromSupabase(msgId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('in_app_messages')
      .delete()
      .eq('id', msgId);

    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 17. AUTHORITATIVE SPONSOR VALIDATION & RESOLUTION
// ==============================================================================

export interface SponsorValidationResult {
  valid: boolean;
  canonicalSponsorId?: string;
  sponsorProfileId?: string;
  sponsorMemberId?: string;
  sponsorName?: string;
  sponsorRole?: string;
  error?: string;
}

export async function resolveAndValidateSponsor(
  identifier: string,
  candidateUserId?: string,
  candidateAuthId?: string
): Promise<SponsorValidationResult> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { valid: false, error: 'Sponsor identifier cannot be empty.' };
  }

  // Reject malformed identifiers
  if (trimmed.length < 3 || trimmed.length > 100) {
    return { valid: false, error: 'Invalid sponsor code format.' };
  }

  // Self-referral check if candidateUserId or candidateAuthId provided
  if (
    (candidateUserId && trimmed.toLowerCase() === candidateUserId.toLowerCase()) ||
    (candidateAuthId && trimmed.toLowerCase() === candidateAuthId.toLowerCase())
  ) {
    return { valid: false, error: 'Self-referral is strictly prohibited.' };
  }

  // 1. Authoritative check via Supabase RPC or Direct DB Query
  if (isSupabaseConfigured && supabase) {
    try {
      // First attempt RPC if installed in database
      const { data, error } = await supabase.rpc('resolve_and_validate_sponsor', {
        p_identifier: trimmed,
        p_candidate_profile_id: candidateUserId || null,
        p_candidate_auth_id: candidateAuthId || candidateUserId || null,
      });

      if (!error && data && typeof data === 'object') {
        const res = data as {
          valid: boolean;
          canonical_sponsor_id?: string;
          sponsor_profile_id?: string;
          sponsor_member_id?: string;
          sponsor_name?: string;
          sponsor_role?: string;
          error?: string;
        };
        if (res.valid) {
          return {
            valid: true,
            canonicalSponsorId: res.canonical_sponsor_id,
            sponsorName: res.sponsor_name,
          };
        } else if (res.error && res.error !== 'Sponsor identifier does not match any registered member.') {
          return { valid: false, error: res.error };
        }
      }
    } catch {
      // Fall through to direct query fallback
    }

    try {
      // Authoritative database fallback query with duplicate detection
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, member_id, full_name, role, is_active, auth_user_id', { count: 'exact' })
        .or(`member_id.ilike.${trimmed},id.eq.${trimmed}`)
        .limit(2);

      if (!error && data && data.length > 0) {
        if ((count && count > 1) || data.length > 1) {
          return { valid: false, error: 'Ambiguous sponsor identifier. Multiple matching records found.' };
        }

        const row = data[0];

        if (!row.is_active) {
          return { valid: false, error: 'The specified sponsor account is suspended or inactive.' };
        }

        const eligibleRoles = ['super_admin', 'sub_admin', 'senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member'];
        if (!row.role || !eligibleRoles.includes(row.role)) {
          return { valid: false, error: 'The specified account is not authorized to sponsor members or clients.' };
        }

        if (
          (candidateUserId && (
            row.id === candidateUserId ||
            row.auth_user_id === candidateUserId ||
            row.member_id?.toLowerCase() === candidateUserId.toLowerCase()
          )) ||
          (candidateAuthId && (
            row.id === candidateAuthId ||
            row.auth_user_id === candidateAuthId ||
            row.member_id?.toLowerCase() === candidateAuthId.toLowerCase()
          ))
        ) {
          return { valid: false, error: 'Self-referral is strictly prohibited.' };
        }

        return {
          valid: true,
          canonicalSponsorId: row.member_id || row.id,
          sponsorName: row.full_name,
        };
      }
    } catch (err) {
      console.warn('[Supabase Sync] Exception during sponsor validation:', err);
    }
  }

  // 2. Offline / Local Sandbox Fallback using DEMO_PROFILES directory
  const eligibleRoles = ['super_admin', 'sub_admin', 'senior_member', 'junior_member', 'channel_partner', 'field_officer', 'member'];
  const normalized = trimmed.toUpperCase().replace(/-/g, '');

  const matches = DEMO_PROFILES.filter((p) => {
    const memClean = (p.memberId || '').toUpperCase().replace(/-/g, '');
    const idClean = p.id.toUpperCase();
    return memClean === normalized || idClean === trimmed.toUpperCase();
  });

  if (matches.length === 0) {
    return { valid: false, error: 'Sponsor identifier does not match any registered member.' };
  }

  if (matches.length > 1) {
    return { valid: false, error: 'Ambiguous sponsor identifier. Multiple matching records found.' };
  }

  const match = matches[0];

  if (!match.isActive) {
    return { valid: false, error: 'The specified sponsor account is suspended or inactive.' };
  }

  if (!match.role || !eligibleRoles.includes(match.role)) {
    return { valid: false, error: 'The specified account is not authorized to sponsor members or clients.' };
  }

  if (
    (candidateUserId && (
      match.id.toLowerCase() === candidateUserId.toLowerCase() ||
      (match.memberId && match.memberId.toLowerCase() === candidateUserId.toLowerCase()) ||
      (match.authUserId && match.authUserId.toLowerCase() === candidateUserId.toLowerCase())
    )) ||
    (candidateAuthId && (
      match.id.toLowerCase() === candidateAuthId.toLowerCase() ||
      (match.memberId && match.memberId.toLowerCase() === candidateAuthId.toLowerCase()) ||
      (match.authUserId && match.authUserId.toLowerCase() === candidateAuthId.toLowerCase())
    ))
  ) {
    return { valid: false, error: 'Self-referral is strictly prohibited.' };
  }

  return {
    valid: true,
    canonicalSponsorId: match.memberId || match.id,
    sponsorName: match.fullName,
  };
}


