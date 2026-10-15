# AKGV INFRA CITY — SYSTEM ARCHITECTURE
**Document**: Technical Architecture, Domain Model & Data Flow  
**Entity**: AKGV Infra City Private Limited  
**Status**: Production Standard  

---

## 1. Architectural Overview

AKGV Infra City is structured as a modern **Decoupled Client-Cloud Architecture** utilizing Next.js (App Router, React 19, TypeScript) as the presentation layer, backed by **Supabase PostgreSQL & Auth** as the trusted security and data persistence engine.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Next.js PWA)"]
        UI["User Interface (Tailwind CSS, Lucide Icons)"]
        Ctx["AppContext (Local State & Offline Cache)"]
        SW["Service Worker (sw.js / Offline Fallback)"]
        Sync["syncService.ts (Background Remote Bridge)"]
    end

    subgraph SecurityBoundary ["Security & API Boundary"]
        Auth["Supabase Auth (JWT & Password Hash)"]
        RLS["PostgreSQL Row Level Security (RLS)"]
        Storage["Supabase Storage (Field Evidence Bucket)"]
    end

    subgraph DataStore ["PostgreSQL Authoritative Database"]
        T_Users["profiles & permissions"]
        T_Plots["plots & plot_status_history"]
        T_Sales["bookings & payment_records"]
        T_Comm["commission_rules & ledger"]
        T_Field["field_gps_evidence"]
        T_CMS["cms_content & announcements"]
    end

    UI --> Ctx
    Ctx --> Sync
    Sync --> Auth
    Sync --> RLS
    RLS --> T_Users
    RLS --> T_Plots
    RLS --> T_Sales
    RLS --> T_Comm
    RLS --> T_Field
    RLS --> T_CMS
    UI --> Storage
    SW -.-> UI
```

---

## 2. Layer Responsibilities

### 2.1 Presentation & PWA Layer (`src/app`, `src/components`)
- **Rendering Strategy**: Next.js App Router with client components for interactive real-time controls (3D Viewer, Blueprint SVG Canvas, GPS Camera, Plot Grid).
- **Offline Reliability**: Service Worker caches shell assets (`offline.html`, icons, manifest). Critical user actions execute with immediate optimistic feedback, buffered locally, and synced in the background.
- **Multilingual Support**: Dictionary-backed internationalization (`src/lib/i18n.ts`) supporting English, Hindi (हिंदी), and Hinglish (Colloquial Hindi-English).

### 2.2 Application State & Sync Layer (`src/context/AppContext.tsx`, `src/lib/supabase/syncService.ts`)
- Manages in-memory reactive state for UI responsiveness.
- Bridges client actions to Supabase with automatic type mapping (camelCase to snake_case).
- Handles network interruptions gracefully without unhandled exceptions.

### 2.3 Trusted Server & Database Boundary (Supabase PostgreSQL + Auth)
- **Authentication**: Email/Phone and secure password authentication managed via Supabase Auth with bcrypt hashing and signed JWT tokens.
- **Row Level Security (RLS)**: Enforces table-level access rules directly in the database engine based on `auth.uid()` and verified `profiles.role`.
- **Financial Integrity**: All financial fields use PostgreSQL `NUMERIC` for decimal-safe monetary calculations.

---

## 3. Core Domain Entities & Relational Schema

```mermaid
erDiagram
    PROFILES ||--o{ BOOKINGS : places
    PROFILES ||--o{ COMMISSION_LEDGER : earns
    PROFILES ||--o{ FIELD_GPS_EVIDENCE : captures
    PROFILES ||--o{ PROFILES : sponsors
    PLOTS ||--o{ BOOKINGS : reserves
    PLOTS ||--o{ PLOT_STATUS_HISTORY : audits
    BOOKINGS ||--o{ PAYMENT_RECORDS : funds
    LOCATIONS ||--o{ PLOTS : situates
    COMMISSION_RULES ||--o{ COMMISSION_LEDGER : governs

    PROFILES {
        string id PK
        uuid auth_user_id
        string email
        string full_name
        string phone
        string role
        string member_id
        string sponsor_id FK
        boolean is_active
        numeric total_business_volume_inr
    }

    PLOTS {
        string id PK
        string plot_number UK
        string block
        numeric area_sqft
        string dimensions
        string road_width
        string status
        numeric base_price_inr
        int canvas_x
        int canvas_y
    }

    BOOKINGS {
        string id PK
        string booking_number UK
        string plot_id FK
        string buyer_id FK
        string sponsor_id FK
        string status
        numeric total_amount_inr
        numeric paid_amount_inr
    }

    PAYMENT_RECORDS {
        string id PK
        string transaction_ref UK
        string booking_id FK
        numeric amount_inr
        string payment_method
        string status
        string verified_by FK
    }

    COMMISSION_LEDGER {
        string id PK
        string member_id FK
        string source_booking_id FK
        numeric sale_amount_inr
        numeric commission_percent
        numeric commission_earned_inr
        string payout_status
    }
```

---

## 4. Technical Constraints & Design Principles
1. **Zero Client Security Boundaries**: No client-side hidden button or local storage flag constitutes authorization. Permissions are verified at the database level via Postgres RLS.
2. **Idempotent Financial Operations**: Every payment, booking, and commission entry carries an immutable reference preventing duplicate creation on network retries.
3. **Audited Lifecycle Transitions**: Status changes (Plot availability, Payment verification, Member hierarchy changes) record actor ID, previous status, new status, and timestamp.
