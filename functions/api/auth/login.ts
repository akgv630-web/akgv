/**
 * Cloudflare Pages Function: /api/auth/login
 * Purpose: Secure trusted backend login identifier resolution & rate-limited authentication.
 * Eliminates anonymous email enumeration by resolving Member ID/Phone server-side using
 * SUPABASE_SERVICE_ROLE_KEY and returning uniform error messages without leaking user directory.
 */

import { createClient } from '@supabase/supabase-js';

// Simple sliding window in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // max 10 attempts per minute

  const record = rateLimitMap.get(ip);
  if (!record || record.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > maxRequests;
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string | undefined>;
}): Promise<Response> {
  const clientIp =
    context.request.headers.get('cf-connecting-ip') ||
    context.request.headers.get('x-forwarded-for') ||
    '127.0.0.1';

  // 1. Enforce IP Rate Limiting
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await context.request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request payload.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { identifier, password } = body as { identifier?: string; password?: string };

    if (!identifier || !password || !identifier.trim() || !password.trim()) {
      return new Response(
        JSON.stringify({ error: 'Please enter both login identifier and password.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Environment variables
    const supabaseUrl =
      context.env.NEXT_PUBLIC_SUPABASE_URL ||
      context.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://tkfnboomhunkfjqckehz.supabase.co';

    const serviceKey =
      context.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const anonKey =
      context.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_jeTCtIa5WhpudOOVD9yxSw_2Z5DJoEn';

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({
          error: 'Backend authentication service is not fully configured (missing service credentials).',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Resolve Identifier Server-Side with Service Role
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let canonicalEmail: string | null = null;

    if (cleanIdentifier.includes('@')) {
      const lower = cleanIdentifier.toLowerCase();
      canonicalEmail = lower === 'admin@akgv.com' ? 'admin@akgvinfacity.com' : lower;
    } else {
      // 1. Attempt database RPC resolution
      const { data: resolvedEmail, error: rpcErr } = await supabaseAdmin.rpc(
        'resolve_login_identifier',
        { p_identifier: cleanIdentifier }
      );

      if (!rpcErr && resolvedEmail) {
        canonicalEmail = resolvedEmail;
      } else {
        // 2. Direct service-role fallback lookup on profiles table
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .or(`member_id.ilike.${cleanIdentifier},phone.eq.${cleanIdentifier}`)
          .maybeSingle();

        if (profile?.email) {
          canonicalEmail = profile.email.toLowerCase();
        } else {
          const digits = cleanIdentifier.replace(/\D/g, '');
          if (digits.length >= 10) {
            const { data: pByPhone } = await supabaseAdmin
              .from('profiles')
              .select('email')
              .like('phone', `%${digits.slice(-10)}`)
              .maybeSingle();
            if (pByPhone?.email) {
              canonicalEmail = pByPhone.email.toLowerCase();
            }
          }
        }
      }

      if (!canonicalEmail) {
        // Return uniform credential error to avoid enumeration
        return new Response(
          JSON.stringify({
            error: 'Invalid credentials. Please verify your Member ID / phone and password.',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!canonicalEmail) {
      return new Response(
        JSON.stringify({
          error: 'Invalid credentials. Please verify your login details.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Authenticate with Supabase Auth
    const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } =
      await supabaseAuthClient.auth.signInWithPassword({
        email: canonicalEmail,
        password: password,
      });

    if (authError || !authData.session) {
      return new Response(
        JSON.stringify({
          error: 'Invalid credentials. Please verify your login details.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Fetch User Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`auth_user_id.eq.${authData.user.id},email.eq.${canonicalEmail}`)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user,
        profile: profile || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error during authentication.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
