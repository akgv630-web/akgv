# AKGV INFRA CITY — APPLICATION SECURITY SPECIFICATION
**Document**: Threat Modeling, Security Boundaries & Defense-in-Depth  
**Entity**: AKGV Infra City Private Limited  
**Status**: Production Standard  

---

## 1. Core Security Principles

1. **Defense in Depth**: Security boundaries must be enforced at the database level via PostgreSQL Row Level Security (RLS) and server boundaries, never purely in React components or client state.
2. **Least Privilege**: Users and roles are granted only the minimal permissions required to perform their authorized corporate responsibilities.
3. **Zero Plaintext Secrets**: Passwords are cryptographically hashed using standard bcrypt/argon2. No API keys with service-role permissions are exposed to the client bundle.
4. **Separation of Duties**: Operational workflows (especially payment verification and plot booking approvals) prevent self-approval.

---

## 2. Threat Analysis & Mitigations

### 2.1 Unauthorized Financial Approval (Payment Fraud)
- **Risk**: An associate enters an offline cash or UPI payment record and verifies it themselves, marking a plot as booked without actual fund receipt.
- **Mitigation**: Database policy and application logic explicitly check `payment_records.verified_by <> payment_records.entered_by`. Only authorized finance/admin staff can verify payments.

### 2.2 Plot Double-Booking Race Condition
- **Risk**: Two buyers or associates attempt to reserve the same plot concurrently.
- **Mitigation**: Plot status transitions enforce database constraints. A booking request can only succeed if `plots.status = 'available_green'`. Concurrent attempts fail with atomic conflict error.

### 2.3 Broken Access Control & Role Impersonation
- **Risk**: A user alters `localStorage` or manipulates client state to set their role to `super_admin`.
- **Mitigation**: Role verification is grounded in the database session token (`auth.jwt() -> profiles.role`). Any write to administrative tables (`plots`, `payment_records`, `commission_rules`) is evaluated by RLS in PostgreSQL; client-side tampering fails with `403 Forbidden`.

### 2.4 Mass File Upload & Malicious Payloads
- **Risk**: Malicious actors upload oversized files or executable scripts disguised as plot inspection photos.
- **Mitigation**:
  - Client and storage bucket validate MIME types (`image/jpeg`, `image/png`, `image/webp`).
  - Strict file size limit (5MB).
  - Storage buckets configure explicit `Content-Disposition` and non-executable execution policies.

### 2.5 Cross-Site Scripting (XSS) in Dynamic CMS
- **Risk**: An administrator or compromised account inputs executable HTML/JavaScript in the CMS editor.
- **Mitigation**: Content fields are rendered using React JSX sanitization. Raw HTML injection (`dangerouslySetInnerHTML`) is prohibited for dynamic database content.

### 2.6 Open Redirect Vulnerability
- **Risk**: Attackers supply external or pseudo-protocol URLs in `?redirect=` parameters to trick authenticated users into phishing sites upon login.
- **Mitigation**: Enforced `safeRedirectUrl(target, fallback)` across the application. Explicitly rejects protocol-relative (`//`, `/\`), external schemes (`https://`, `ftp://`), and pseudo-protocols (`javascript:`, `data:`).

### 2.7 Pre-Login Identifier Resolution Under RLS
- **Risk**: Allowing unauthenticated users to query `public.profiles` to resolve Member IDs or phone numbers leaks associate records. Conversely, blocking anonymous queries breaks non-email logins.
- **Mitigation**: Implemented `resolve_login_identifier(p_identifier TEXT)` as a PostgreSQL `SECURITY DEFINER` function with strict `search_path = public`. It returns only the canonical email without exposing names, roles, or financial data.

### 2.8 Zero-Plaintext Member Onboarding
- **Risk**: Storing or emailing randomly generated plaintext passwords exposes initial associate accounts to interception.
- **Mitigation**: Eliminated plaintext password generation. Admin enrollment generates a cryptographic activation invite link (`/auth/reset?type=invite&email=...`), enabling the member to establish their own confidential credentials directly via Supabase Auth recovery tokens.

### 2.9 Cadastral Inventory & Anti-Mutation Governance
- **Risk**: Silently mutating plot areas or dimensions to force marketing brochure agreement (+1,500 sq ft) creates contractual and legal liability.
- **Mitigation**: Retained exact CAD-demarcated plot dimensions (57,470 sq ft) in database and master plan canvas. Exposed transparent Survey Reconciliation Audit Dossier in the Admin portal badged as *"Awaiting Corporate Survey Re-Certification"*.

---

## 3. First Admin Bootstrapping Protocol
1. The initial Admin account is provisioned securely during database initialization via Supabase Auth admin API or SQL migration with a unique temporary credential.
2. Upon first login, the administrator is required to update their temporary password.
3. No universal fallback password exists in the production codebase.

