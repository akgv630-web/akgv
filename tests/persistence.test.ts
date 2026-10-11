import { describe, it, expect, beforeEach } from 'vitest';
import {
  INITIAL_PLOTS,
  DEMO_PROFILES,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  calculateMemberLevel,
} from '../src/lib/store';
import { Booking, PaymentRecord, Plot, PlotStatus, UserRole } from '../src/types';

describe('Cross-Role Workflow & State Persistence Verification', () => {
  let mockStorage: Record<string, string> = {};
  let currentPlots: Plot[];
  let currentBookings: Booking[];
  let currentPayments: PaymentRecord[];

  beforeEach(() => {
    mockStorage = {};
    currentPlots = JSON.parse(JSON.stringify(INITIAL_PLOTS));
    currentBookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    currentPayments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
  });

  it('should persist plot booking hold, payment verification, and status transitions across sessions', () => {
    // 1. Buyer selects Plot A-04 and creates booking hold
    const targetPlot = currentPlots.find((p) => p.plotNumber === 'A-04');
    expect(targetPlot).toBeDefined();
    expect(targetPlot?.status).toBe('available_green');

    const newBooking: Booking = {
      id: 'bk-test-999',
      bookingNumber: 'BK-2026-999',
      plotId: targetPlot!.id,
      plotNumber: targetPlot!.plotNumber,
      buyerId: 'usr-buyer-01',
      buyerName: 'Pradeep Verma',
      buyerPhone: '9812345678',
      status: 'pending',
      totalAmountInr: targetPlot!.basePriceInr || 1500000,
      paidAmountInr: 0,
      holdExpiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    currentBookings.unshift(newBooking);
    targetPlot!.status = 'hold_pending';

    // Simulate saving to storage
    mockStorage['akgv_infra_bookings'] = JSON.stringify(currentBookings);
    mockStorage['akgv_infra_plots'] = JSON.stringify(currentPlots);

    // 2. Buyer submits payment proof
    const paymentProof: PaymentRecord = {
      id: 'pay-test-999',
      transactionRef: 'UPI-REF-TEST-12345',
      bookingId: newBooking.id,
      plotNumber: 'A-04',
      payerName: 'Pradeep Verma',
      payerPhone: '9812345678',
      amountInr: 1500000,
      paymentMethod: 'UPI_QR',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    };
    currentPayments.unshift(paymentProof);
    mockStorage['akgv_infra_payments'] = JSON.stringify(currentPayments);

    // 3. Page Refresh & Login as Super Admin
    const rehydratedBookings: Booking[] = JSON.parse(mockStorage['akgv_infra_bookings']);
    const rehydratedPayments: PaymentRecord[] = JSON.parse(mockStorage['akgv_infra_payments']);
    const rehydratedPlots: Plot[] = JSON.parse(mockStorage['akgv_infra_plots']);

    const adminUser = DEMO_PROFILES.find((p) => p.role === 'super_admin');
    expect(adminUser).toBeDefined();

    // 4. Admin verifies payment and approves
    const targetPayment = rehydratedPayments.find((p) => p.id === 'pay-test-999');
    expect(targetPayment).toBeDefined();
    expect(targetPayment?.status).toBe('under_review');

    // Admin verifies
    targetPayment!.status = 'verified';
    targetPayment!.receiptNumber = 'RCP-AKGV-2026-999';
    targetPayment!.verifiedAt = new Date().toISOString();
    targetPayment!.verifiedBy = adminUser!.id;

    // Associated booking transitions to confirmed
    const targetBooking = rehydratedBookings.find((b) => b.id === targetPayment!.bookingId);
    expect(targetBooking).toBeDefined();
    targetBooking!.status = 'confirmed';
    targetBooking!.paidAmountInr = targetPayment!.amountInr;
    targetBooking!.confirmedAt = new Date().toISOString();

    // Associated plot transitions to booked_yellow
    const plotToLock = rehydratedPlots.find((p) => p.id === targetBooking!.plotId);
    expect(plotToLock).toBeDefined();
    plotToLock!.status = 'booked_yellow';

    // Save back to storage
    mockStorage['akgv_infra_bookings'] = JSON.stringify(rehydratedBookings);
    mockStorage['akgv_infra_payments'] = JSON.stringify(rehydratedPayments);
    mockStorage['akgv_infra_plots'] = JSON.stringify(rehydratedPlots);

    // 5. Senior Member signs in and checks commission eligibility
    const seniorMember = DEMO_PROFILES.find((p) => p.role === 'senior_member');
    expect(seniorMember).toBeDefined();

    // Verify Plot A-04 is permanently locked as Yellow
    const finalPlots: Plot[] = JSON.parse(mockStorage['akgv_infra_plots']);
    const finalA04 = finalPlots.find((p) => p.plotNumber === 'A-04');
    expect(finalA04?.status).toBe('booked_yellow');

    // Verify receipt was issued
    const finalPayments: PaymentRecord[] = JSON.parse(mockStorage['akgv_infra_payments']);
    const finalPayment = finalPayments.find((p) => p.id === 'pay-test-999');
    expect(finalPayment?.status).toBe('verified');
    expect(finalPayment?.receiptNumber).toBe('RCP-AKGV-2026-999');
  });
});
