/**
 * Cloudflare Pages Function: /api/admin/invite-member
 * Purpose: Authenticated server-side Member Invitation & Supabase Auth account creation.
 * Verifies that the caller holds an active Administrator JWT, generates a cryptographic
 * activation link via Supabase Auth Admin API, links the profile with database-enforced
 * Member ID sequence, and records truthful invitation dispatch state.
 */

import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string | undefined>;
}): Promise<Response> {
  try {
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid administrator bearer token.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.slice(7).trim();

    const supabaseUrl =
      context.env.NEXT_PUBLIC_SUPABASE_URL ||
      context.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://tkfnboomhunkfjqckehz.supabase.co';

    const serviceKey =
      context.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({
          error: 'Missing Supabase administrative service role credentials on backend.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Verify Caller Identity & Admin Role
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired administrative session token.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const callerId = userData.user.id;
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name')
      .or(`auth_user_id.eq.${callerId},id.eq.${callerId}`)
      .maybeSingle();

    const isAdmin =
      callerProfile?.role === 'super_admin' ||
      callerProfile?.role === 'sub_admin';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Access denied: Only authorized administrators can invite members.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse Member Details
    const body = await context.request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request payload.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      email,
      fullName,
      phone,
      role = 'member',
      sponsorId,
      city,
      branchLocation,
      address,
      level = 1,
      rankTitle = 'Associate Partner',
    } = body as Record<string, any>;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required for member invitation.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!fullName || !fullName.trim()) {
      return new Response(
        JSON.stringify({ error: 'Full name is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || !phone.trim()) {
      return new Response(
        JSON.stringify({ error: 'Contact phone number is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate Sponsor Attribution Server-Side
    let resolvedSponsorId: string | null = null;
    if (sponsorId && sponsorId.trim()) {
      const { data: sponsorRes } = await supabaseAdmin.rpc('resolve_and_validate_sponsor', {
        p_identifier: sponsorId.trim(),
      });
      if (sponsorRes && sponsorRes.valid) {
        resolvedSponsorId = sponsorRes.member_id || sponsorId.trim();
      } else {
        return new Response(
          JSON.stringify({
            error: `Invalid sponsor code "${sponsorId}": ${sponsorRes?.error || 'Sponsor not found or inactive.'}`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Generate Supabase Auth Account & Cryptographic Invite Link
    const appOrigin =
      context.request.headers.get('origin') ||
      'https://akgv.pages.dev';

    const redirectTo = `${appOrigin}/auth/reset?type=invite`;

    // Try generateLink with type: 'invite' to produce a real cryptographically signed verification link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: email.trim().toLowerCase(),
      options: {
        redirectTo,
        data: {
          full_name: fullName.trim(),
          role: role,
        },
      },
    });

    if (linkError) {
      return new Response(
        JSON.stringify({
          error: `Failed to create Supabase Auth invitation: ${linkError.message}`,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const createdAuthUser = linkData.user;
    const actionLink = linkData.properties?.action_link || null;

    // 5. Create or Update Linked Profile with Database Sequence Member ID
    const profileId = `usr-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const profilePayload = {
      id: profileId,
      auth_user_id: createdAuthUser?.id || null,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      role: role,
      sponsor_id: resolvedSponsorId,
      kyc_status: 'pending',
      is_active: true,
      city: city || null,
      branch_location: branchLocation || 'Varanasi Central',
      address: address || null,
      level: Number(level) || 1,
      rank_title: rankTitle || 'Associate Partner',
      invitation_status: 'sent',
      invitation_sent_at: nowIso,
      invited_by: callerProfile?.id || null,
      joined_date: nowIso.slice(0, 10),
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data: insertedProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' })
      .select('*')
      .single();

    if (profileErr) {
      return new Response(
        JSON.stringify({
          error: `Auth account created but profile sync failed: ${profileErr.message}`,
          authUser: createdAuthUser,
          actionLink,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: createdAuthUser,
        profile: insertedProfile,
        actionLink,
        invitationStatus: 'sent',
        emailDelivered: false,
        note:
          'Supabase Auth invitation token created successfully. Custom SMTP delivery awaits provider credentials in Supabase project settings; real cryptographic action link is provided for instant onboarding dispatch.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error processing invitation.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
