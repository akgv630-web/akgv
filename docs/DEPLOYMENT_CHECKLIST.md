# PRODUCTION DEPLOYMENT CHECKLIST — AKGV INFRA CITY

## 1. Database Migrations (Supabase PostgreSQL)
- [x] Canonical migration sequence prepared (8 migrations):
  1. `supabase/migrations/20261011_initial_schema.sql`
  2. `supabase/migrations/20261015_complete_production_schema.sql`
  3. `supabase/migrations/20261016_security_data_integrity_hardening.sql`
  4. `supabase/migrations/20261016_z_complete_enterprise_rls_hardening.sql`
  5. `supabase/migrations/20261016_zz_profile_integrity_trigger_hardening.sql`
  6. `supabase/migrations/20261016_zzz_sponsor_integrity_hardening.sql`
  7. `supabase/migrations/20261016_zzzz_security_integrity_final_hardening.sql`
  8. `supabase/migrations/20261017_role_based_assignment_system.sql`
  9. `supabase/migrations/20261018_login_identifier_resolution.sql`
- [ ] Connect to your production Supabase project via Supabase CLI or SQL Editor:
  ```bash
  supabase db push
  ```
- [x] Row Level Security (RLS) enabled on all tables with strict role-based policies and integrity triggers.
- [x] Pre-login identifier resolution RPC (`resolve_login_identifier`) defined as `SECURITY DEFINER`.

## 2. Environment Variables (.env.local / Cloudflare Secret Settings)
- [x] Environment variable template documented in `.env.example`
- [x] Production environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_COMPANY_PHONE=6306917991`
- [ ] Optional R2 asset bucket credentials:
  - `CLOUDFLARE_R2_ACCOUNT_ID`
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
  - `CLOUDFLARE_R2_BUCKET_NAME`

## 3. PWA & Mobile Installability
- [x] `public/manifest.json` configured with standalone display mode.
- [x] SVG brand icon created at `public/icons/icon.svg`.
- [x] Service Worker registered at `public/sw.js` with network-first navigation, caching public shell, and explicitly bypassing `/admin`, `/member`, `/buyer`, `/auth`, and Supabase API calls.
- [x] Graceful offline fallback page at `public/offline.html`.

## 4. Architectural 3D House Viewer
- [x] Procedural Villa 3D engine with dynamic material and lighting shaders active in `src/components/3d/HouseViewer3D.tsx`.
- [x] Dimension lines in feet and plot-fit verification calculation.

## 5. Build & Test Verification
- [x] Vitest automated test suite executed: **16 test files, 157/157 tests passed** (`npx vitest run`).
- [x] Next.js 16.4.0 static export build succeeded: `npm run build` completed with **22 static routes** prerendered.
- [x] Zero TypeScript compilation errors (`npx tsc --noEmit`).
- [x] All changes committed and synchronized with remote repository `origin/main`.
