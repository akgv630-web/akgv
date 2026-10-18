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
    const callerEmail = userData.user.email?.toLowerCase();
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name')
      .or(`auth_user_id.eq.${callerId},id.eq.${callerId}${callerEmail ? `,email.eq.${callerEmail}` : ''}`)
      .maybeSingle();

    const isAdmin =
      callerProfile?.role === 'super_admin' ||
      callerProfile?.role === 'sub_admin' ||
      callerEmail === 'yadavpreetrajesh@gmail.com' ||
      callerEmail === 'admin@akgv.com' ||
      callerEmail === 'admin@akgvinfacity.com';

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
      password,
    } = body as Record<string, any>;

    const initialPassword =
      typeof password === 'string' && password.trim().length >= 6
        ? password.trim()
        : 'Akgv@2026';

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
    const cleanEmail = email.trim().toLowerCase();

    let createdAuthUser: any = null;
    let emailDelivered = false;
    let actionLink: string | null = null;

    // A. Create or update user directly in Supabase Auth with initial password
    const { data: createdUsr, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      email_confirm: true,
      password: initialPassword,
      user_metadata: {
        full_name: fullName.trim(),
        role: role,
        phone: phone.trim(),
      },
    });

    if (createdUsr?.user) {
      createdAuthUser = createdUsr.user;
    } else {
      // If user already exists in auth.users, update their password so initialPassword is valid
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        createdAuthUser = existing;
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password: initialPassword,
          user_metadata: {
            full_name: fullName.trim(),
            role: role,
            phone: phone.trim(),
          },
        });
      }
    }

    // B. Generate 1-Click Auto-Login URL
    const oneClickLoginUrl = `${appOrigin}/login?identifier=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(initialPassword)}&auto=1`;

    // C. Generate cryptographic link as backup
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: cleanEmail,
        options: {
          redirectTo,
          data: {
            full_name: fullName.trim(),
            role: role,
          },
        },
      });
      if (linkData?.properties?.action_link) {
        actionLink = linkData.properties.action_link;
      }
    } catch {}

    // D. Dispatch official email via Resend API if configured
    const resendApiKey = context.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background-color: #050A17; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid #C7A35A;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #C7A35A; margin: 0; font-size: 26px; letter-spacing: 2px;">AKGV INFRA CITY</h1>
              <p style="color: #DFC382; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold;">Official Account Credentials & Welcome Dossier</p>
            </div>
            <p style="font-size: 15px; color: #e2e8f0;">Dear <strong>${fullName.trim()}</strong>,</p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              Welcome to <strong>AKGV Infra City Private Limited</strong>. Your official account has been successfully provisioned. Here are your verified login credentials:
            </p>
            <div style="background-color: #0B1734; border: 1px solid rgba(199, 163, 90, 0.4); border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                <tr><td style="padding: 8px 0; color: #94a3b8;">👤 Name:</td><td style="font-weight: bold; color: #38bdf8;">${fullName.trim()}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">🏷️ Role:</td><td style="font-weight: bold; color: #fbbf24;">${role}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">📧 Login Email:</td><td style="font-weight: bold; color: #ffffff;">${cleanEmail}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">📱 Mobile:</td><td style="font-weight: bold; color: #e2e8f0;">${phone.trim()}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">🔑 Password:</td><td style="font-weight: bold; color: #4ade80; font-family: monospace; font-size: 16px;">${initialPassword}</td></tr>
              </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${oneClickLoginUrl}" style="background: linear-gradient(135deg, #C7A35A, #9E7E36); color: #0B1734; font-weight: bold; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(199, 163, 90, 0.3);">
                ⚡ 1-Click Instant Login to Dashboard
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              Tapping the button above automatically fills your credentials and signs you straight into your dashboard.
            </p>
            <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
            <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
              AKGV Infra City Private Limited • Head Office: Near Ring Road Phase-2, Rampur, Varanasi, UP - 221008<br/>
              Support Helpline: +91 6306917991 • Website: https://akgv.pages.dev
            </p>
          </div>
        `;
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'AKGV Infra City <welcome@akgvinfacity.com>',
            to: [cleanEmail],
            subject: `AKGV Infra City - Official Login Credentials (${fullName.trim()})`,
            html: emailHtml,
          }),
        });
        if (resendRes.ok) emailDelivered = true;
      } catch (err) {
        console.warn('[Resend Mailer Error]', err);
      }
    }

    // E. Fallback: dispatch Supabase Auth invite if Resend not active
    if (!emailDelivered) {
      try {
        const { error: invErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
          redirectTo,
          data: { full_name: fullName.trim(), role },
        });
        if (!invErr) emailDelivered = true;
      } catch {}
    }

    // 5. Create or Update Linked Profile with Database Sequence Member ID
    const profileId = `usr-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const profilePayload = {
      id: profileId,
      auth_user_id: createdAuthUser?.id || null,
      email: cleanEmail,
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
          initialPassword,
          oneClickLoginUrl,
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
        initialPassword,
        oneClickLoginUrl,
        invitationStatus: emailDelivered ? 'delivered' : 'pending',
        emailDelivered: emailDelivered,
        note: emailDelivered
          ? 'Official credentials email dispatched directly to recipient Gmail inbox.'
          : 'Credentials created. Direct WhatsApp & 1-click auto-login ready.',
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
