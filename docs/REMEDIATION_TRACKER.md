# AKGV INFRA CITY — Deep Audit Remediation & Production Hardening Tracker

**Audit Date**: October 2026  
**Auditor**: Senior Application Security Engineer & PostgreSQL Security Specialist  
**Status**: COMPLETED & VERIFIED WITH AUTOMATED TEST SUITE  
**Target Environment**: Next.js 16 (Turbopack) + Supabase PostgreSQL (Production BaaS)  
**Test Suite**: Vitest (11 test suites, 50 tests passing)

---

## 1. Remediation Status Summary

| ID | Module / Component | Severity | Vulnerability / Defect | Root Cause | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VULN-01** | Auth Barrier & Demo Access | **CRITICAL (P0)** | 1-click unauthenticated admin login buttons in `AuthBarrier.tsx` | Demo buttons called `loginUser('admin@...')` directly | **RESOLVED** | Quick-test buttons removed completely from `AuthBarrier.tsx` |
| **VULN-02** | Credential Verification | **CRITICAL (P0)** | Password length `>= 6` accepted as identity proof in `AppContext.tsx` | Fallback treated any 6+ char password as valid admin | **RESOLVED** | `AppContext.tsx`: Length bypass removed; requires Supabase Auth or strictly designated sandbox credential |
| **VULN-03** | Public Member Registration | **HIGH (P0)** | Public visitors could register with `senior_member` / `junior_member` roles | Registration UI exposed unconstrained role dropdown | **RESOLVED** | Public registration forced strictly to `buyer` role and unverified KYC in UI & state |
| **VULN-04** | Row Level Security (RLS) | **CRITICAL (P0)** | `FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)` on all 17 tables | Placeholder RLS generated in `build_supabase_schema.js` | **RESOLVED** | Least-privilege RLS policies generated across all 18 tables in `supabase/schema.sql` |
| **VULN-05** | Inventory & Concurrency | **HIGH (P0)** | Potential double booking on concurrent reservations | Plot status checked only in React state without DB lock | **RESOLVED** | Partial unique index on active bookings + `create_plot_booking_atomic()` with `FOR UPDATE` |
| **VULN-06** | Payment Verification Integrity | **HIGH (P0)** | Self-approval risk and unverified state transitions | Missing server/DB separation of duties constraint | **RESOLVED** | `verifyPayment()` rejects self-approval by ID, payerName, or phone |
| **VULN-07** | Commission Rule Inconsistency | **MEDIUM (P1)** | Hardcoded 7-level map in `admin/page.tsx` conflicted with ground truth | UI had local inline `getLevelInfo()` copy | **RESOLVED** | Standardized to authoritative `COMMISSION_LEVELS_GROUND_TRUTH` in `src/data/groundTruth.ts` |
| **VULN-08** | PWA Caching Boundaries | **MEDIUM (P1)** | Potential caching of private dashboard HTML in shared cache | Service worker had generic navigate handler without route exemptions | **RESOLVED** | `public/sw.js` explicitly exempts `/admin`, `/member`, `/buyer`, and `supabase.co` |
| **VULN-09** | Field GPS Evidence Provenance | **MEDIUM (P1)** | Gallery photo uploads not explicitly tagged differently from live camera GPS | Single capture flow without provenance flag | **RESOLVED** | Added `captureSource` & `isLiveCamera` tracking and display badges in `FieldGpsCameraCapture.tsx` |
| **VULN-10** | Database Persistence Guarantees | **HIGH (P0)** | Optimistic writes in UI could mask backend Supabase failures | Local storage updated before or regardless of remote outcome | **RESOLVED** | Synchronized with Supabase DB with error trapping and immutable audit log stream |

---

## 2. Detailed Vulnerability Fixes & Files Changed

### VULN-01: One-Click Admin Impersonation in AuthBarrier
- **Location**: `src/components/auth/AuthBarrier.tsx`
- **Fix**: Removed the development quick-test bar that allowed one-click unauthenticated admin login (`loginUser('admin@...')`). Removed unused imports and stripped debug quick-login paths.

### VULN-02: Password Length Bypass in AppContext
- **Location**: `src/context/AppContext.tsx`
- **Fix**: Removed `password.length >= 6` and `password === 'admin123'`. In production builds (`process.env.NODE_ENV === 'production'`), authenticating strictly requires Supabase Auth and returns an explicit error if unreachable. In local development sandbox, only the designated test credential `akgv@2026` is accepted. Suspended accounts (`isActive === false`) are strictly prohibited from logging in.

### VULN-03: Unrestricted Public Role Escalation in Registration
- **Location**: `src/components/auth/AuthModal.tsx` & `src/context/AppContext.tsx`
- **Fix**:
  1. Removed the public role `<select>` dropdown from `AuthModal.tsx`. Public registration is hardcoded strictly to `buyer`.
  2. Gated the "Sandbox Roles" tab strictly to non-production environments (`isDev = process.env.NODE_ENV !== 'production'`).
  3. `registerWithCredentials()` in `AppContext.tsx` forces `role: 'buyer'` and `kycStatus: 'unverified'`, regardless of client parameters.
  4. Onboarding associate members (`junior_member` or `senior_member`) is restricted to authenticated administrators or authorized seniors via `createSponsorMember()`.

### VULN-04: Over-Permissive Row Level Security in SQL Schema
- **Location**: `scripts/build_supabase_schema.js`, `supabase/schema.sql`, `supabase/migrations/20261015_complete_production_schema.sql`
- **Fix**:
  1. Defined helper security functions `public.current_user_role()` and `public.is_admin()`.
  2. Removed all `FOR ALL ... USING (true) WITH CHECK (true)` open policies.
  3. Generated fine-grained, least-privilege policies:
     - Public read for `locations`, `projects`, `plots` (inventory), `cms_content`, and approved `reviews`.
     - Owner and admin access for `bookings`, `payment_records`, and `client_enquiries`.
     - Strict admin-only access for `audit_logs` (read-only for admins, append-only, update/delete forbidden).
     - Separation of duties enforced in RLS: verifiers cannot update payments where `payer_id = auth.uid()`.

### VULN-05: Double Booking Concurrency Risk
- **Location**: `src/context/AppContext.tsx`, `scripts/build_supabase_schema.js`, `supabase/schema.sql`
- **Fix**:
  1. Created a partial unique index in PostgreSQL:
     ```sql
     CREATE UNIQUE INDEX idx_unique_active_plot_booking 
     ON bookings (plot_id) 
     WHERE status IN ('confirmed', 'under_review', 'hold', 'pending');
     ```
  2. Created PostgreSQL stored procedure `create_plot_booking_atomic()` with row-level locking (`SELECT ... FROM plots WHERE id = p_plot_id FOR UPDATE`) to eliminate concurrent reservation race conditions.
  3. Enforced availability and active reservation conflict checks inside `createBookingRequest()`.

### VULN-06: Payment Verification Separation of Duties
- **Location**: `src/context/AppContext.tsx`, `src/types/index.ts`
- **Fix**:
  1. Added `payerId?: string` to `PaymentRecord`.
  2. In `verifyPayment()`, enforced separation of duties check:
     - Verifier must possess admin role or `canVerifyPayments` permission.
     - Verifier cannot approve their own payment proof (`existingPayment.payerId === currentUser.id`, `payerName === currentUser.fullName`, or matching phone numbers).

### VULN-07: Conflicting Commission Calculations
- **Location**: `src/app/admin/page.tsx`
- **Fix**: Removed local conflicting 7-level `getLevelInfo()` from `src/app/admin/page.tsx`. Directly imported and derived level data from the authoritative `COMMISSION_LEVELS_GROUND_TRUTH` in `src/data/groundTruth.ts`.

### VULN-08: PWA Shared Cache Leakage
- **Location**: `public/sw.js`
- **Fix**: Added explicit fetch event exemptions preventing caching of private dashboard paths (`/admin`, `/member`, `/buyer`) and remote Supabase API calls (`*.supabase.co`).

### VULN-09: Field GPS Evidence Provenance
- **Location**: `src/components/gps-camera/FieldGpsCameraCapture.tsx`, `src/types/index.ts`
- **Fix**:
  1. Added `captureSource: 'live_camera' | 'file_upload'` and `isLiveCamera` to `FieldGpsEvidence`.
  2. In `FieldGpsCameraCapture.tsx`, tracked whether the image was taken via the live device camera stream or selected from gallery.
  3. Rendered distinct provenance badges ("Live Sensor Stream" vs "Gallery File Upload") in the preview and historical feed cards.

---

## 3. Automated Test Verification Results

All tests executed via Vitest:
- `tests/securityHardening.test.ts`: **9 passed**
- `tests/enterpriseGovernance.test.ts`: **6 passed**
- `tests/reviews.test.ts`: **4 passed**
- `tests/persistence.test.ts`: **1 passed**
- `tests/commission.test.ts`: **5 passed**
- `tests/adminPlotGovernance.test.ts`: **4 passed**
- `tests/supabaseSync.test.ts`: **4 passed**
- `tests/i18n.test.ts`: **7 passed**
- `tests/joiningKit.test.ts`: **3 passed**
- `tests/authAndPages.test.ts`: **4 passed**
- `tests/plots.test.ts`: **3 passed**

**Total: 11 Test Suites Passed, 50 Tests Passed, 0 Failures.**
