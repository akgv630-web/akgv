# PRODUCTION DEPLOYMENT CHECKLIST — AKGV INFRA CITY

## 1. Database Migration (Supabase PostgreSQL)
- [x] Schema migration file prepared: `supabase/migrations/20261011_initial_schema.sql`
- [ ] Connect to your production Supabase project via Supabase CLI:
  ```bash
  supabase db push
  ```
- [x] Row Level Security (RLS) enabled on all 18 tables with role-based policies.
- [x] Initial seed fixtures prepared for development and testing.

## 2. Environment Variables (.env.local / Cloudflare Secret Settings)
- [x] Environment variable template documented in `.env.example`
- [ ] Required production variables to set in Cloudflare Pages dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-side functions only)
  - `CLOUDFLARE_R2_ACCOUNT_ID`
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
  - `CLOUDFLARE_R2_BUCKET_NAME`
  - `NEXT_PUBLIC_COMPANY_PHONE=6306917991`

## 3. PWA & Mobile Installability
- [x] `public/manifest.json` configured with standalone display mode.
- [x] SVG brand icon created at `public/icons/icon.svg`.
- [x] Service Worker registered at `public/sw.js` with network-first navigation and cache-first static shell.
- [x] Graceful offline fallback page at `public/offline.html`.

## 4. Architectural 3D House Viewer
- [x] Procedural Villa 3D engine with dynamic material and lighting shaders active in `src/components/3d/HouseViewer3D.tsx`.
- [x] Dimension lines in feet and plot-fit verification calculation.
- [ ] To deploy custom company GLB models:
  - Upload `.glb` / `.gltf` model files to Cloudflare R2 bucket.
  - Set model URL in `house_models` database table or `src/data/groundTruth.ts`.

## 5. Build & Test Verification
- [x] Vitest automated tests executed: 14/14 tests passed (`npm run test`).
- [x] Next.js 16 production build succeeded: `npm run build` completed with 17 static routes.
- [x] Zero TypeScript compilation errors.
