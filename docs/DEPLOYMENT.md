# AKGV INFRA CITY — DEPLOYMENT & ENVIRONMENT RUNBOOK
**Document**: Production Deployment, Environment Variables & Storage Setup  
**Entity**: AKGV Infra City Private Limited  
**Status**: Production Standard  

---

## 1. Environment Configuration

Create `.env.local` in the project root:

```env
# ==============================================================================
# SUPABASE PRODUCTION ENDPOINT & API KEYS
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-or-publishable-key>

# ==============================================================================
# COMPANY CONTACT & REGISTRATION METADATA
# ==============================================================================
NEXT_PUBLIC_COMPANY_NAME="AKGV Infra City Private Limited"
NEXT_PUBLIC_COMPANY_PHONE=6306917991
NEXT_PUBLIC_DEFAULT_LOCATION="Rampur, Varanasi, Uttar Pradesh"
```

A template with placeholders is maintained at `.env.example`. Real credentials must never be committed to Git.

---

## 2. Database Provisioning & Migration Order

1. **Step 1**: Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Step 2**: Navigate to **SQL Editor** -> **New Query**.
3. **Step 3**: Copy the contents of [`supabase/schema.sql`](../supabase/schema.sql) and execute the query.
   - This creates all 14 core tables, custom types, RLS policies, and populates initial ground-truth records (55 plots, 3 branch offices, 11 MLM commission levels, demo profiles, and verified reviews).
4. **Step 4**: Verify that all tables show green healthy status in Supabase **Table Editor**.

---

## 3. Storage Bucket Configuration

1. Navigate to **Storage** in the Supabase Dashboard.
2. Create a new public/authenticated bucket named:
   - `field-evidence`: For plot inspection photographs and boundary marks (Max file size: 5MB, Allowed MIME types: `image/jpeg, image/png, image/webp`).
   - `receipts`: For PDF receipt archives and bank verification slips.
3. Configure bucket policy:
   - Read: Public or Authenticated users.
   - Insert: Authenticated users only.

---

## 4. Building & Running Production Services

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Build production bundle
npm run build

# Start local production preview
npm run start
```
