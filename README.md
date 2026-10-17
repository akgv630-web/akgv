# AKGV INFRA CITY PRIVATE LIMITED

> **"Where Dreams Find Their Address" (जहां सपने पाते हैं अपना ठिकाना)**  
> Official Helpline: **+91 6306917991** | Headquarters: **Varanasi, Uttar Pradesh**

A full-stack, enterprise-grade Progressive Web App (PWA) real estate and township infrastructure platform designed for **AKGV Infra City Private Limited**.

---

## 🌟 Key Architecture & Highlights

- **Next.js 16 + React 19 + TypeScript**: Modern, type-safe App Router foundation optimized for high performance.
- **Brand Palette**:
  - Deep Navy (`#0B1734`)
  - Champagne Gold (`#C7A35A`)
  - Emerald Green (`#146B4D`)
  - Warm Ivory (`#F6F1E7`)
- **Interactive Master Plan**:
  - Transcribed with exact fidelity from the official blueprint of *A.K.G.V. Infraa City, Varanasi* (Designed by Er. Rajesh Kumar Patel, R.P. Home Design).
  - Area Schedule: **77,550 sqft Total Area**, **55,970 sqft Plot Area**, **21,580 sqft Road Area (27.82%)**.
  - Corridors: **30'-0" Wide Main Proposed Boulevard** & **25'-0" Wide Internal Roads**.
  - Color Rules:
    - **Green**: Available for Booking.
    - **Yellow**: Confirmed Booked (permanently locked).
    - **Red**: Vacant / Reserved Inventory (under administrative control).
  - Interactive blueprint lightbox modal allowing users to inspect the original architectural blueprint photo.
- **Interactive 3D House Viewer**:
  - Powered by Three.js & React Three Fiber.
  - 360° OrbitControls (mouse and touch drag), Zoom In/Out, Camera Angle presets (Front, Rear, Left, Right, Isometric, Floor Plan).
  - Lighting Modes: Daylight, Golden Hour Sunset, Architectural Night Lighting.
  - Exterior Finishes: Warm Ivory & Teak, Executive Navy & Gold, Emerald Heritage & Slate.
  - Dimension inspection in feet and Plot-Fit validation algorithm.
- **Offline Joining Kit Cash Ledger (₹999)**:
  - Tracks physical onboarding kits: **1 Executive Bag, 1 Metallic Pen, 1 Diary, 1 Portfolio File Folder**.
  - Strictly collected in offline cash at company counters (non-commissionable).
  - Built-in printable cash receipt generator (`KIT-RCP-XXXX`).
- **11-Tier Commission & Rewards Engine**:
  - Transcribed with exact fidelity from the official company brochure (*लेवल — कमीशन एवं रिवार्ड प्लान*).
  - Levels 1 to 11 with verified targets and brochure rewards:
    1. Sales Assistant (₹1L–₹20L) @ 4% | Smartphone
    2. Star (₹21L–₹80L) @ 5% | Goa Trip
    3. Gold Star (₹81L–₹1.5Cr) @ 6% | Sports Bike
    4. Assistant Manager (₹1.5Cr–₹4Cr) @ 7% | Bangkok Trip
    5. Manager (₹4Cr–₹7Cr) @ 8% | Swift Dzire Down Payment
    6. Senior Manager (₹7Cr–₹12Cr) @ 9% | Duplex 2 BHK
    7. Diamond (₹12Cr–₹20Cr) @ 10% | Fortuner Down Payment
    8. Double Diamond (₹20Cr–₹30Cr) @ 11% | Farmhouse
    9. Ambassador (₹30Cr–₹100Cr) @ 12% | ₹51 Lakh Cash
    10. Double Ambassador (₹100Cr–₹300Cr) @ 13% | ₹1 Crore Cash
    11. Crown Ambassador (₹300Cr–₹500Cr) @ 14% | BMW
  - Interactive Business Volume simulator with particle celebration (`canvas-confetti`).
- **Field GPS & Camera Telemetry**:
  - Device camera and geolocation integration.
  - Captures on-site plot photo, latitude, longitude, and accuracy in meters.
- **Role-Governed Dashboards**:
  - **Buyer Portal (`/buyer`)**: Manage bookings, submit payment proofs, schedule site visits, track registry status.
  - **Member Portal (`/member`)**: Digital ID card, downline hierarchy tree, commission ledger, rewards claim tracking, offline kit status.
  - **Admin Control Centre (`/admin`)**: Database-derived live KPIs, plot status toggle (Red/Green/Yellow), manual payment verification desk, cash reconciliation, and support CRM.
- **Multi-Language Support**:
  - Full toggle between **English**, **हिंदी (Hindi)**, and **Hinglish**.
- **Progressive Web App (PWA)**:
  - Installable manifest (`/manifest.json`), service worker (`/sw.js`), and offline fallback (`/offline.html`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested with v24.14.0)
- npm 9+ (tested with v11.9.0)

### 2. Installation
```bash
npm install --legacy-peer-deps
```

### 3. Running Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Running Automated Tests
```bash
npm run test
```
Executes all 14 domain unit and integration tests via Vitest:
- `tests/plots.test.ts`
- `tests/commission.test.ts`
- `tests/joiningKit.test.ts`
- `tests/i18n.test.ts`

### 5. Production Build
```bash
npm run build
```
Creates an optimized static/SSR build with Turbopack across all 17 platform routes.

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

The database schema includes 18 normalized tables, custom enums, and comprehensive Row Level Security (RLS) policies:
- Migration script: `supabase/migrations/20261011_initial_schema.sql`
- Environment variables: Refer to `.env.example`

Apply to your Supabase instance:
```bash
supabase db push
```

---

## ☁️ Cloudflare Deployment

The platform is configured with `wrangler.toml` for deployment to Cloudflare Pages:
```bash
npx wrangler pages deploy .next
```

---

## 📜 Documentation

- [Administrator User Guide](docs/ADMIN_GUIDE.md)
- [Production Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Master Architecture Plan](C:\Users\Preet Yadav\.gemini\antigravity\brain\2f3036e0-8236-464e-9962-596011ec6131\MASTER_PLAN.md)
