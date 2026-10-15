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

// ==============================================================================
// 7. SUPABASE AUTH WRAPPER
// ==============================================================================

export async function supabaseSignIn(identifier: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  try {
    let emailToUse = identifier.trim();
    // If identifier is not an email, find matching profile email
    if (!emailToUse.includes('@')) {
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

    const res = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });
    return res;
  } catch (err: any) {
    return { data: null, error: err };
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
          role: data.role || 'junior_member',
          sponsor_id: data.sponsorId,
        },
      },
    });
    return res;
  } catch (err: any) {
    return { data: null, error: err };
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
  } catch (err: any) {
    return { data: null, error: err };
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

export async function saveGpsEvidenceToSupabase(evidence: any): Promise<boolean> {
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

export async function fetchEnquiriesFromSupabase() {
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
      assignedMemberId: row.assigned_member_id,
      assignedMemberName: row.assigned_member_name,
      notes: row.notes || undefined,
      followUps: Array.isArray(row.follow_ups) ? row.follow_ups : [],
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

export async function saveEnquiryToSupabase(enquiry: any): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: enquiry.id,
      client_name: enquiry.clientName,
      client_phone: enquiry.clientPhone,
      client_email: enquiry.clientEmail,
      interested_plot_id: enquiry.interestedPlotId,
      preferred_location_id: enquiry.preferredLocationId,
      budget_inr: enquiry.budgetInr,
      status: enquiry.status,
      assigned_member_id: enquiry.assignedMemberId,
      assigned_member_name: enquiry.assignedMemberName,
      notes: enquiry.notes,
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

// ==============================================================================
// 10. SALES TARGETS & TASK REMINDERS SYNC
// ==============================================================================

export async function fetchTargetsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('sales_targets').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
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

export async function saveTargetToSupabase(target: any): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: target.id,
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

export async function fetchTasksFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('task_reminders').select('*').order('due_date', { ascending: true });
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      assignedToMemberId: row.assigned_to_member_id,
      assignedToName: row.assigned_to_name,
      title: row.title,
      description: row.description || undefined,
      category: row.category,
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

export async function saveTaskToSupabase(task: any): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: task.id,
      assigned_to_member_id: task.assignedToMemberId,
      assigned_to_name: task.assignedToName,
      title: task.title,
      description: task.description,
      category: task.category,
      due_date: task.dueDate,
      due_time: task.dueTime,
      priority: task.priority,
      is_completed: task.isCompleted,
      completed_at: task.completedAt,
      created_by: task.createdBy,
      created_at: task.createdAt,
    };
    const { error } = await supabase.from('task_reminders').upsert(payload, { onConflict: 'id' });
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

export async function saveCmsContentToSupabase(content: any): Promise<boolean> {
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

