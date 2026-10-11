'use client';

import {
  Booking,
  CommissionLedgerEntry,
  FieldGpsEvidence,
  HouseModel,
  JoiningKitIssue,
  PaymentRecord,
  Plot,
  PlotStatus,
  Profile,
  RewardClaim,
  SiteVisit,
  SupportTicket,
  UserRole
} from '@/types';
import {
  COMMISSION_LEVELS_GROUND_TRUTH,
  HOUSE_MODELS,
  INITIAL_PLOTS,
  PROJECT_LOCATIONS
} from '@/data/groundTruth';

export { INITIAL_PLOTS };

// Default Profiles for demo & multi-role testing
export const DEMO_PROFILES: Profile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@akgvinfacity.com',
    fullName: 'Rajesh Kumar Patel (Super Admin)',
    phone: '6306917991',
    role: 'super_admin',
    memberId: 'AKGV-HQ-001',
    kycStatus: 'verified',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-sponsor-01',
    email: 'vikram.singh@akgvinfacity.com',
    fullName: 'Vikram Singh (Senior Manager)',
    phone: '9876543210',
    role: 'senior_member',
    memberId: 'AKGV0001',
    kycStatus: 'verified',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'usr-junior-01',
    email: 'amit.sharma@akgvinfacity.com',
    fullName: 'Amit Sharma (Star Member)',
    phone: '9123456789',
    role: 'junior_member',
    memberId: 'AKGV0042',
    sponsorId: 'usr-sponsor-01',
    kycStatus: 'verified',
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'usr-buyer-01',
    email: 'pradeep.verma@gmail.com',
    fullName: 'Pradeep Verma (Buyer)',
    phone: '9812345678',
    role: 'buyer',
    kycStatus: 'verified',
    isActive: true,
    createdAt: '2026-04-10T00:00:00Z',
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-2026-001',
    bookingNumber: 'BK-2026-001',
    plotId: 'plot-a-03',
    plotNumber: 'A-03',
    buyerId: 'usr-buyer-01',
    buyerName: 'Pradeep Verma',
    buyerPhone: '9812345678',
    sponsorId: 'usr-junior-01',
    status: 'confirmed',
    houseModelId: 'model-royal-villa',
    totalAmountInr: 1500000,
    paidAmountInr: 1500000,
    createdAt: '2026-04-12T10:30:00Z',
    confirmedAt: '2026-04-14T15:00:00Z',
  },
  {
    id: 'bk-2026-002',
    bookingNumber: 'BK-2026-002',
    plotId: 'plot-b-03',
    plotNumber: 'B-03',
    buyerId: 'usr-buyer-01',
    buyerName: 'Pradeep Verma',
    buyerPhone: '9812345678',
    sponsorId: 'usr-sponsor-01',
    status: 'confirmed',
    houseModelId: 'model-emerald-duplex',
    totalAmountInr: 1200000,
    paidAmountInr: 1200000,
    createdAt: '2026-05-01T09:00:00Z',
    confirmedAt: '2026-05-02T11:20:00Z',
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    transactionRef: 'UPI-REF-9928192847',
    bookingId: 'bk-2026-001',
    plotNumber: 'A-03',
    payerName: 'Pradeep Verma',
    payerPhone: '9812345678',
    amountInr: 1500000,
    paymentMethod: 'UPI_QR',
    status: 'verified',
    receiptNumber: 'RCP-AKGV-2026-001',
    notes: 'Booking Token + Possession Installment received and verified with HDFC Bank statement',
    submittedAt: '2026-04-12T11:00:00Z',
    verifiedAt: '2026-04-14T15:00:00Z',
    verifiedBy: 'usr-admin-01',
  }
];

export const INITIAL_KIT_ISSUES: JoiningKitIssue[] = [
  {
    id: 'kit-001',
    receiptNumber: 'KIT-RCP-2026-0001',
    memberId: 'AKGV0001',
    memberName: 'Vikram Singh',
    memberPhone: '9876543210',
    amountReceivedInr: 999,
    collectionDate: '2026-02-15',
    collectorStaffName: 'Rajesh Kumar Patel',
    collectorStaffId: 'usr-admin-01',
    itemsIncluded: { bag: true, pen: true, diary: true, file: true },
    deliveryStatus: 'acknowledged',
    recipientSignatureAck: 'Signed in office register on 15 Feb 2026',
    auditNotes: '₹999 Cash accounted into cash box #1. Full kit handed over.'
  },
  {
    id: 'kit-002',
    receiptNumber: 'KIT-RCP-2026-0042',
    memberId: 'AKGV0042',
    memberName: 'Amit Sharma',
    memberPhone: '9123456789',
    amountReceivedInr: 999,
    collectionDate: '2026-03-01',
    collectorStaffName: 'Vikram Singh',
    collectorStaffId: 'usr-sponsor-01',
    itemsIncluded: { bag: true, pen: true, diary: true, file: true },
    deliveryStatus: 'acknowledged',
    recipientSignatureAck: 'Delivered at Varanasi regional camp',
    auditNotes: 'Cash deposited in main treasury account.'
  }
];

export const INITIAL_SITE_VISITS: SiteVisit[] = [
  {
    id: 'sv-001',
    visitorName: 'Suresh Chandra Gupta',
    visitorPhone: '9839012345',
    visitorEmail: 'scgupta@outlook.com',
    locationId: 'loc-rampur',
    locationName: 'AKGV Infra City — Rampur',
    preferredDate: '2026-10-18',
    preferredTimeSlot: '11:00 AM - 01:00 PM',
    pickupRequired: true,
    assignedStaffName: 'Vikram Singh',
    status: 'confirmed',
    notes: 'Requested pickup from Cantt Railway Station Varanasi.',
    createdAt: '2026-10-10T08:00:00Z',
  }
];

export const INITIAL_GPS_EVIDENCE: FieldGpsEvidence[] = [
  {
    id: 'gps-001',
    plotNumber: 'A-04',
    locationId: 'loc-rampur',
    latitude: 25.32194,
    longitude: 82.98732,
    accuracyMeters: 3.2,
    captureTimestamp: '2026-10-09T14:22:10Z',
    photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    capturedByMemberId: 'AKGV0001',
    capturedByName: 'Vikram Singh',
    status: 'approved',
    adminNotes: 'Boundary pillars verified on site. Accurate GPS fix.'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-1001',
    userId: 'usr-buyer-01',
    userName: 'Pradeep Verma',
    userPhone: '9812345678',
    category: 'booking',
    priority: 'high',
    status: 'in_progress',
    subject: 'Registry documentation timeline for Plot A-03',
    description: 'Payment is verified. Requesting official registry appointment date with Sub-Registrar office.',
    assignedStaff: 'Rajesh Kumar Patel',
    createdAt: '2026-10-08T11:00:00Z',
    updatedAt: '2026-10-09T16:30:00Z',
    messages: [
      {
        id: 'msg-1',
        senderId: 'usr-buyer-01',
        senderName: 'Pradeep Verma',
        isStaff: false,
        isInternalNote: false,
        message: 'Hello team, kindly advise when the registry papers will be ready for signing.',
        timestamp: '2026-10-08T11:00:00Z'
      },
      {
        id: 'msg-2',
        senderId: 'usr-admin-01',
        senderName: 'Rajesh Kumar Patel',
        isStaff: true,
        isInternalNote: true,
        message: 'Internal Note: Revenue lawyer is drafting deed draft #AKGV-DEED-2026-03.',
        timestamp: '2026-10-08T14:10:00Z'
      },
      {
        id: 'msg-3',
        senderId: 'usr-admin-01',
        senderName: 'Rajesh Kumar Patel',
        isStaff: true,
        isInternalNote: false,
        message: 'Dear Mr. Verma, deed verification is scheduled for Tuesday next week. Our legal team will escort you.',
        timestamp: '2026-10-09T16:30:00Z'
      }
    ]
  }
];

// Helper to calculate member commission level from business target
export function calculateMemberLevel(totalBusinessInr: number) {
  const match = [...COMMISSION_LEVELS_GROUND_TRUTH]
    .reverse()
    .find((rule) => totalBusinessInr >= rule.minBusinessInr);
  return match || COMMISSION_LEVELS_GROUND_TRUTH[0];
}
