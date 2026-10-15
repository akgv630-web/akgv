# AKGV INFRA CITY — AUTOMATED TESTING STRATEGY
**Document**: Quality Assurance, Test Coverage & Verification Matrix  
**Entity**: AKGV Infra City Private Limited  
**Status**: Production Standard  

---

## 1. Testing Framework & Philosophy

The platform utilizes **Vitest** for unit and integration testing. Testing operates on the principle that:
1. Every critical business rule (commission calculation, role permission, double booking prevention, payment verification, offline sync fallback) must have an automated test.
2. Tests must execute rapidly in continuous integration without hanging on network timeouts.
3. Mocking is restricted to external network I/O; business calculation logic runs against real domain algorithms.

---

## 2. Test Suite Architecture

| Test Suite File | Coverage Domain | Key Invariants Verified |
|-----------------|-----------------|-------------------------|
| `tests/authAndPages.test.ts` | Auth & Page Access | Role dashboard routing, protected page barriers, guest fallbacks. |
| `tests/adminPlotGovernance.test.ts` | Inventory Governance | Dimension calculations (ft -> sqft), unique plot validation, safe deletion. |
| `tests/plots.test.ts` | Plot Matrix & Status | Status transitions (`available`, `booked`, `hold`), 55 blueprint plot matrix. |
| `tests/joiningKit.test.ts` | Offline Cash Kit | Fixed ₹999 cash ledger receipt generation, stock deduction, staff audit. |
| `tests/commission.test.ts` | MLM & Payout Engine | 11 ground-truth levels, business volume thresholds, historical rate locking. |
| `tests/reviews.test.ts` | Verified Reviews | Moderation states, rating bounds (1-5), helpful vote incrementing. |
| `tests/persistence.test.ts` | Offline Storage | `localStorage` serialization, hydration error tolerance. |
| `tests/i18n.test.ts` | Internationalization | Dictionary completeness across English, Hindi, and Hinglish. |
| `tests/supabaseSync.test.ts` | Cloud Synchronization | Graceful fallback when tables are unmigrated, type conversions, non-blocking writes. |

---

## 3. Running Test Suites

```bash
# Run all tests once
npm test

# Run tests in watch mode
npx vitest

# Run a specific suite
npx vitest tests/adminPlotGovernance.test.ts
```
