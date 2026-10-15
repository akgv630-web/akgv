# AKGV INFRA CITY — ROLE & PERMISSION MATRIX
**Document**: Role-Based Access Control (RBAC) & Team Privacy Matrix  
**Entity**: AKGV Infra City Private Limited  
**Status**: Production Standard  

---

## 1. System Roles

AKGV Infra City recognizes five hierarchical user roles:

1. **Super Admin (`super_admin`)**: Executive management / Company Director. Full access to plot registration, pricing, financial approvals, CMS, and member administration.
2. **Sub Admin (`sub_admin`)**: Regional / Branch Officer (Rampur, Lahartara, Mirza Murad). Can manage site visits, review field evidence, enter payments, and coordinate regional members.
3. **Senior Member (`senior_member`)**: Team Leader / Senior Associate (Level 4+). Can view downline team performance, record client enquiries, book site visits, and submit field reports.
4. **Junior Member (`junior_member`)**: Field Agent / Direct Associate. Can register personal leads, submit field GPS photos, and track individual earnings.
5. **Buyer (`buyer`)**: Customer / Investor. Can view personal booked plots, payment receipts, outstanding dues, and site visit schedules.

---

## 2. Granular Permission Matrix

| Capability / Module | Super Admin | Sub Admin | Senior Member | Junior Member | Buyer |
|---------------------|:-----------:|:---------:|:-------------:|:-------------:|:-----:|
| **Public Browsing (Plots, Models, About)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Add / Edit Plot Inventory & Prices** | ✅ | ⚠️ Delegated | ❌ | ❌ | ❌ |
| **Change Plot Status (Hold / Booked / Sold)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Organization & Full Member List** | ✅ | ✅ | ❌ (Own Team Only) | ❌ (Self Only) | ❌ |
| **Create / Suspend / Reactivate Members** | ✅ | ⚠️ Delegated | ⚠️ Downline Only | ❌ | ❌ |
| **Record Client Enquiry & Book Site Visit** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Submit Field GPS Inspection & Photos** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Approve / Reject Field GPS Evidence** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Enter Offline Payment (Cash/UPI/Cheque)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Verify / Approve Payment Records** | ✅ | ✅ (Non-Self) | ❌ | ❌ | ❌ |
| **Self-Approve Own Payment Entry** | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN | 🚫 FORBIDDEN |
| **View Full Company Financial Reports** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Team Sales & Attribution** | ✅ | ✅ (Branch) | ✅ (Downline) | ❌ (Own Only) | ❌ |
| **Manage Commission Policies & Rules** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Approve & Disburse Commission Payouts** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Configure Offers, Incentives & Targets** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Website CMS (Banners, Text, FAQs)**| ✅ | ⚠️ Content Only| ❌ | ❌ | ❌ |
| **Dispatch In-App Broadcast Notifications** | ✅ | ✅ (Branch) | ❌ | ❌ | ❌ |
| **View Personal Receipts & Certificates** | ✅ | ✅ | ✅ | ✅ | ✅ (Own Only) |

> ⚠️ **Delegated**: Requires explicit permission flag in `profiles.permissions` or `member_permissions`.  
> 🚫 **FORBIDDEN**: Hard structural constraint enforced by database triggers and API validation.

---

## 3. Team Privacy & Downline Scoping Rules

1. **Downline Boundary**: A Senior Member can only query records where `sponsor_id = senior.id` or members belonging to their recursive downline tree.
2. **Horizontal Isolation**: A Senior Member can NEVER inspect another Senior Member's private team, sales volume, or client contact details.
3. **Buyer Privacy**: Buyers are completely isolated. A buyer can only read records where `buyer_id = auth.uid()` or matching verified phone/email.
4. **Commission Confidentiality**: Member commission ledgers are private to the individual member and the Super Admin. Downline seniors see sales volumes, not personal bank payout receipts of other members.
