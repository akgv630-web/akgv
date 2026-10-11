# AKGV INFRA CITY PRIVATE LIMITED — ADMINISTRATOR OPERATIONAL GUIDE

## 1. Overview & System Portals

The AKGV Infra City business platform is partitioned into three role-governed operational environments:
1. **Public Township Portal**: General inquiries, master plan inspection, 3D house viewer, site visit bookings.
2. **Buyer Portal (`/buyer`)**: Dedicated dashboard for registered buyers to track plot bookings, view 72-hour holds, submit payment proofs, and monitor deed registry milestones.
3. **Company Member Portal (`/member`)**: Internal portal for sales associates showing digital ID cards, downline teams, business volume progress, commission ledgers, and joining-kit status.
4. **Super Admin Control Centre (`/admin`)**: Company management center with real-time metrics, plot inventory status toggles, payment verification desk, cash reconciliation, and support CRM.

---

## 2. Managing Plot Inventory

Access the **Plot Inventory** tab in the Super Admin dashboard (`/admin`):
- **Green (Available)**: Selectable and bookable by buyers on the public master plan.
- **Yellow (Confirmed Booked)**: Permanently locked once payment verification has been approved. Cannot be booked by others.
- **Red (Vacant / Reserved)**: Inventory held in administrative reserve. Cannot be booked publicly until an admin toggles it to Green.

To update status:
1. Navigate to `/admin` -> `Plot Inventory`.
2. Locate the target plot number (e.g. `A-05`, `B-06`, `C-01`).
3. Click `Set Green`, `Set Yellow`, or `Set Red`.
4. The change immediately updates the interactive vector master plan across the entire platform.

---

## 3. Payment Verification & Receipt Workflow

1. A buyer reserves a plot and is granted a **72-Hour Temporary Hold**.
2. The buyer transfers funds via company UPI QR or bank NEFT and submits the transaction reference (e.g. `UPI-REF-9928192847`) in `/buyer`.
3. The payment appears in `/admin` under **Payment Reviews** with status `under_review`.
4. Authorized staff verify the funds against the actual company bank account statement.
5. If verified:
   - Click **Approve & Issue Receipt**.
   - The system automatically generates a unique receipt number (e.g. `RCP-AKGV-2026-001`).
   - The booking transitions to `confirmed`.
   - The plot is transitioned to `booked_yellow`.
6. If the deposit is not found or invalid:
   - Click **Reject** and provide an explanation. The plot hold will expire and release back to Green after 72 hours.

---

## 4. Offline Joining Kit Cash Ledger (₹999)

- Fee is strictly **₹999 Cash collected offline** at physical branch counters.
- **Mandatory Kit Contents**: 1 Bag, 1 Pen, 1 Diary, 1 Portfolio File.
- To record a kit issue:
  1. Open `/joining-kit` or `/admin` -> `₹999 Cash Kit Ledger`.
  2. Click **Record New ₹999 Cash Kit**.
  3. Enter Member ID (e.g. `AKGV0088`), Full Name, Phone, and check off the 4 physical items.
  4. Submit to create the official record.
  5. Click **Print Receipt** to produce the printed physical slip.

---

## 5. Member Hierarchy & 11-Tier Commission Management

- Tiers 1 to 11 correspond directly to the official company brochure:
  - Level 1: Sales Assistant (₹1L–₹20L) @ 4% | Smartphone
  - Level 2: Star (₹21L–₹80L) @ 5% | Goa Trip
  - Level 3: Gold Star (₹81L–₹1.5Cr) @ 6% | Sports Bike
  - Level 4: Assistant Manager (₹1.5Cr–₹4Cr) @ 7% | Bangkok Trip
  - Level 5: Manager (₹4Cr–₹7Cr) @ 8% | Swift Dzire Down Payment
  - Level 6: Senior Manager (₹7Cr–₹12Cr) @ 9% | Duplex 2 BHK
  - Level 7: Diamond (₹12Cr–₹20Cr) @ 10% | Fortuner Down Payment
  - Level 8: Double Diamond (₹20Cr–₹30Cr) @ 11% | Farmhouse
  - Level 9: Ambassador (₹30Cr–₹100Cr) @ 12% | ₹51 Lakh Cash
  - Level 10: Double Ambassador (₹100Cr–₹300Cr) @ 13% | ₹1 Crore Cash
  - Level 11: Crown Ambassador (₹300Cr–₹500Cr) @ 14% | BMW
- Commission is disbursed **only** on verified property sales. No commission is awarded for member signups or joining kits.
