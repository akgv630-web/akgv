import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AKGV Infra City — Complete Enterprise Integrity & Production Hardening Test Suite', () => {
  // 1. Enterprise Database Hardening & Schema Synchronization
  describe('Enterprise RLS Policies & Schema Synchronization', () => {
    it('verifies hardened RLS policies in migration 20261016_complete_enterprise_rls_hardening.sql', () => {
      const migrationPath = path.join(
        __dirname,
        '../supabase/migrations/20261016_complete_enterprise_rls_hardening.sql'
      );
      expect(fs.existsSync(migrationPath)).toBe(true);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Commission ledger policy verification
      expect(sql).toContain('Members view own commission');
      expect(sql).toContain('Admins manage commission ledger');

      // Joining kit issues policy verification
      expect(sql).toContain('Members view own kit issue');
      expect(sql).toContain('Admins manage kit issues');

      // Receipts policy verification
      expect(sql).toContain('Payers can view own receipts');
      expect(sql).toContain('Admins manage receipts');

      // Support tickets & ticket messages
      expect(sql).toContain('Users can create tickets');
      expect(sql).toContain("status = 'open'");
      expect(sql).toContain('Users can view customer-visible messages');
      expect(sql).toContain('is_internal_note = FALSE');
      expect(sql).toContain('Users can reply to own tickets');

      // Reward claims
      expect(sql).toContain('Members submit reward claims');
      expect(sql).toContain("status = 'pending'");

      // Field GPS evidence
      expect(sql).toContain('Authenticated insert gps evidence');
      expect(sql).toContain("status IN ('pending', 'pending_review')");

      // Bookings and payment records
      expect(sql).toContain('Buyer create booking');
      expect(sql).toContain('Payer create payment');
      expect(sql).toContain('amount_inr > 0');
    });

    it('verifies that supabase/schema.sql is synchronized with complete hardened policies', () => {
      const schemaPath = path.join(__dirname, '../supabase/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      expect(schemaSql).toContain('Members view own commission');
      expect(schemaSql).toContain('Members view own kit issue');
      expect(schemaSql).toContain('Payers can view own receipts');
      expect(schemaSql).toContain('Users can create tickets');
      expect(schemaSql).toContain('Users can view customer-visible messages');
      expect(schemaSql).toContain('Members submit reward claims');
      expect(schemaSql).toContain('Authenticated insert gps evidence');
      expect(schemaSql).toContain('Buyer create booking');
      expect(schemaSql).toContain('Payer create payment');
    });
  });

  // 2. Service Worker Isolation & Scope Safety
  describe('PWA Service Worker Cache Isolation', () => {
    it('ensures service worker only purges caches matching akgv-infra- prefix', () => {
      const swPath = path.join(__dirname, '../public/sw.js');
      expect(fs.existsSync(swPath)).toBe(true);
      const swCode = fs.readFileSync(swPath, 'utf8');

      expect(swCode).toContain("key.startsWith('akgv-infra-') && key !== CACHE_NAME");
      expect(swCode).not.toMatch(/caches\.delete\(key\)\s*;\s*\}\s*\)\s*;\s*\}\s*\)\s*;\s*\/\/ Unscoped deletion/);
    });
  });

  // 3. Security Headers for Static Export & Cloudflare Pages
  describe('Production Security Headers', () => {
    it('verifies public/_headers contains enterprise security policies', () => {
      const headersPath = path.join(__dirname, '../public/_headers');
      expect(fs.existsSync(headersPath)).toBe(true);
      const headersContent = fs.readFileSync(headersPath, 'utf8');

      expect(headersContent).toContain('X-Frame-Options: SAMEORIGIN');
      expect(headersContent).toContain('X-Content-Type-Options: nosniff');
      expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
      expect(headersContent).toContain('Permissions-Policy:');
      expect(headersContent).toContain('Content-Security-Policy:');
    });
  });

  // 4. Client-Side Context Layer Authorization Enforcement
  describe('AppContext Authorization & Integrity Guards', () => {
    const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx');
    const contextCode = fs.readFileSync(appContextPath, 'utf8');

    it('enforces admin check on plot inventory status and modifications', () => {
      expect(contextCode).toContain('Only administrators can manually update plot statuses.');
      expect(contextCode).toContain('Only administrators can add new plots.');
      expect(contextCode).toContain('Only administrators can edit plot configurations.');
      expect(contextCode).toContain('Only administrators can delete plots.');
    });

    it('enforces booking cancellation and confirmation authorization', () => {
      expect(contextCode).toContain('Only administrators can confirm bookings.');
      expect(contextCode).toContain('Access denied: You can only cancel your own bookings.');
    });

    it('enforces validation and ownership on payment proof submissions', () => {
      expect(contextCode).toContain('Authentication required: You must be logged in to submit payment proof.');
      expect(contextCode).toContain('Invalid payment amount: Amount must be greater than zero.');
      expect(contextCode).toContain('Transaction reference number is required.');
      expect(contextCode).toContain('You can only submit payment proofs for your own bookings.');
    });

    it('enforces role checks on joining kit issues and field GPS evidence', () => {
      expect(contextCode).toContain('Only administrators can record joining kit issues.');
      expect(contextCode).toContain('Authentication required to submit field GPS evidence.');
    });

    it('enforces ticket reply ownership and internal note sanitization', () => {
      expect(contextCode).toContain('Authentication required to reply to support tickets.');
      expect(contextCode).toContain("You cannot reply to another user's support ticket.");
      expect(contextCode).toContain('const safeInternalNote = isStaff && Boolean(isInternalNote);');
    });

    it('enforces admin checks on reviews, enquiries, sales targets, and CMS content', () => {
      expect(contextCode).toContain('Only administrators can update review status.');
      expect(contextCode).toContain('Only administrators can reply to reviews.');
      expect(contextCode).toContain('Only administrators can delete reviews.');
      expect(contextCode).toContain('status: isAdmin ? \'approved\' : \'pending\'');
      expect(contextCode).toContain('Only staff can update enquiry status.');
      expect(contextCode).toContain('Only administrators can update sales targets.');
      expect(contextCode).toContain('Only administrators can update CMS content.');
    });
  });
});
