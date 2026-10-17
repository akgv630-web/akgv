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
  ReviewRecord,
  UserRole,
  ClientEnquiry,
  OfferIncentive,
  SalesTarget,
  TaskReminder,
  InAppMessage,
  CmsContent
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
    fullName: 'Preet Yadav',
    phone: '6306917991',
    role: 'super_admin',
    memberId: 'AKGV-HQ-001',
    kycStatus: 'verified',
    isActive: true,
    city: 'Varanasi',
    branchLocation: 'Rampur Head Office',
    address: 'Near Ring Road Phase-2, Rampur, Varanasi, Uttar Pradesh - 221008',
    level: 7,
    rankTitle: 'Director',
    totalBusinessVolumeInr: 25000000,
    plotsClosedCount: 18,
    joinedDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-subadmin-01',
    email: 'suresh.yadav@akgvinfacity.com',
    fullName: 'Suresh Yadav',
    phone: '9838012345',
    role: 'sub_admin',
    memberId: 'AKGV-SUB-101',
    kycStatus: 'verified',
    isActive: true,
    city: 'Varanasi',
    branchLocation: 'Lahartara Branch',
    address: 'GT Road Corridor near Cantt, Lahartara, Varanasi, Uttar Pradesh - 221002',
    level: 5,
    rankTitle: 'Platinum Leader',
    totalBusinessVolumeInr: 12000000,
    plotsClosedCount: 9,
    joinedDate: '2026-01-15',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'usr-sponsor-01',
    email: 'vikram.singh@akgvinfacity.com',
    fullName: 'Vikram Singh',
    phone: '9876543210',
    role: 'senior_member',
    memberId: 'AKGV-3498',
    kycStatus: 'verified',
    isActive: true,
    city: 'Varanasi',
    branchLocation: 'Mirza Murad Branch',
    address: 'NH-19 Highway Corridor, Mirza Murad, Varanasi, Uttar Pradesh - 221307',
    level: 4,
    rankTitle: 'Diamond Star',
    totalBusinessVolumeInr: 9500000,
    plotsClosedCount: 7,
    joinedDate: '2026-02-15',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'usr-junior-01',
    email: 'amit.sharma@akgvinfacity.com',
    fullName: 'Amit Sharma',
    phone: '9123456789',
    role: 'junior_member',
    memberId: 'AKGV0042',
    sponsorId: 'usr-sponsor-01',
    kycStatus: 'verified',
    isActive: true,
    city: 'Chandauli',
    branchLocation: 'Rampur Head Office',
    address: 'Mughalsarai Station Road, Chandauli, Uttar Pradesh - 232101',
    level: 2,
    rankTitle: 'Star Associate',
    totalBusinessVolumeInr: 2800000,
    plotsClosedCount: 2,
    joinedDate: '2026-03-01',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'usr-buyer-01',
    email: 'pradeep.verma@gmail.com',
    fullName: 'Pradeep Verma',
    phone: '9812345678',
    role: 'buyer',
    kycStatus: 'verified',
    isActive: true,
    city: 'Mirzapur',
    branchLocation: 'Lahartara Branch',
    address: 'Civil Lines, Near Vindhyachal Link Road, Mirzapur, Uttar Pradesh - 231001',
    level: 1,
    rankTitle: 'Verified Client',
    totalBusinessVolumeInr: 1500000,
    plotsClosedCount: 1,
    joinedDate: '2026-04-10',
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
    memberId: 'AKGV-3498',
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
    assignedStaffId: 'usr-sponsor-01',
    assignedStaffMemberId: 'AKGV-3498',
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
    photoUrl: '/assets/layout_plan_brochure.png',
    capturedByMemberId: 'AKGV-3498',
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

export const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: 'rev-2026-001',
    authorName: 'Pradeep Verma',
    authorRole: 'buyer',
    rating: 5,
    title: '100% Freehold Registry & Clear Demarcation',
    comment: 'Registered deed verification completed at Sub-Registrar office Varanasi. The 30ft entrance road and demarcated stone boundary pillars were verified on site. Very transparent transaction with zero broker interference.',
    plotNumber: 'A-03',
    branchLocation: 'Rampur Head Office',
    category: 'plot_purchase',
    isVerified: true,
    status: 'approved',
    createdAt: '2026-04-15T11:20:00Z',
    helpfulCount: 14,
    adminReply: {
      replyText: 'Thank you Mr. Pradeep Verma. It was our pleasure assisting with your registered deed and demarcation at the Varanasi Sub-Registrar office.',
      repliedAt: '2026-04-16T10:00:00Z',
      replierName: 'Rajesh Kumar Patel (Director)'
    }
  },
  {
    id: 'rev-2026-002',
    authorName: 'Suresh Chandra Gupta',
    authorRole: 'visitor',
    rating: 5,
    title: 'Professional Accompanied Site Inspection',
    comment: 'Took the company vehicle pickup from Cantt railway station for a physical site inspection at Rampur. The scale 1:500 blueprint layout matched the ground markers exactly. Impressed by the 27.82% road area dedication.',
    branchLocation: 'Lahartara Branch',
    category: 'site_visit',
    isVerified: true,
    status: 'approved',
    createdAt: '2026-05-18T14:45:00Z',
    helpfulCount: 9
  },
  {
    id: 'rev-2026-003',
    authorName: 'Dr. Anand Kumar Mishra',
    authorRole: 'buyer',
    rating: 5,
    title: 'Direct Developer Purchase with Dakhil-Kharij Assistance',
    comment: 'Booked plot B-03 directly with AKGV Infra City. Complete revenue department guidance was provided for mutation documentation. No hidden fees or unexpected brokerage.',
    plotNumber: 'B-03',
    branchLocation: 'Rampur Head Office',
    category: 'legal_registry',
    isVerified: true,
    status: 'approved',
    createdAt: '2026-06-02T16:10:00Z',
    helpfulCount: 11,
    adminReply: {
      replyText: 'Heartiest congratulations Dr. Mishra on your plot booking. Your Dakhil-Kharij administrative record is actively coordinated by our corporate legal desk.',
      repliedAt: '2026-06-03T11:30:00Z',
      replierName: 'Rajesh Kumar Patel (Director)'
    }
  },
  {
    id: 'rev-2026-004',
    authorName: 'Mahesh Narayan Tiwari',
    authorRole: 'visitor',
    rating: 5,
    title: 'Prime Highway Access Near NH-19',
    comment: 'Visited the Mirza Murad branch on GT Road / NH-19 corridor. Very accessible location and courteous staff. They clearly walked through the layout master plan and future Ring Road connectivity.',
    branchLocation: 'Mirza Murad Branch',
    category: 'staff_support',
    isVerified: true,
    status: 'approved',
    createdAt: '2026-07-22T09:30:00Z',
    helpfulCount: 6
  },
  {
    id: 'rev-2026-005',
    authorName: 'Kamlesh Chandra Upadhyay',
    authorRole: 'buyer',
    rating: 5,
    title: 'Clear Pillar Demarcation & Fast Registry Support',
    comment: 'Verified the 25ft sector internal road and stone boundary markers in Block A. The legal registry team gave clear stamp duty calculation without any inflated charges.',
    plotNumber: 'A-08',
    branchLocation: 'Rampur Head Office',
    category: 'plot_purchase',
    isVerified: true,
    status: 'approved',
    createdAt: '2026-08-11T13:15:00Z',
    helpfulCount: 8
  }
];

export const INITIAL_ENQUIRIES: ClientEnquiry[] = [
  {
    id: 'enq-001',
    clientName: 'Shri Rameshwar Nath Tripathi',
    clientPhone: '9415012345',
    clientEmail: 'rn.tripathi@gmail.com',
    interestedPlotId: 'plot-a-04',
    preferredLocationId: 'loc-rampur',
    budgetInr: 1500000,
    status: 'visit_scheduled',
    assignedProfileId: 'usr-sponsor-01',
    assignedMemberId: 'AKGV-3498',
    assignedMemberName: 'Vikram Singh',
    notes: 'Interested in East-facing corner plot near 30ft entrance road. Site visit scheduled for Sunday.',
    followUps: [
      {
        id: 'flw-1',
        date: '2026-10-10',
        summary: 'Telephonic consultation completed. Customer verified freehold registry policy.',
        nextFollowUpDate: '2026-10-17'
      }
    ],
    createdAt: '2026-10-09T10:00:00Z'
  },
  {
    id: 'enq-002',
    clientName: 'Birendra Kumar Yadav',
    clientPhone: '9839098765',
    preferredLocationId: 'loc-mirza-murad',
    budgetInr: 1200000,
    status: 'contacted',
    assignedProfileId: 'usr-junior-01',
    assignedMemberId: 'AKGV0042',
    assignedMemberName: 'Amit Sharma',
    notes: 'Inquired at Mirza Murad NH-19 branch regarding commercial road facing plots.',
    createdAt: '2026-10-12T14:30:00Z'
  }
];

export const INITIAL_OFFERS: OfferIncentive[] = [
  {
    id: 'off-navratri-2026',
    titleEn: 'Navratri Mahotsav: Freehold Registry Subsidy',
    titleHi: 'नवरात्रि महोत्सव: ₹50,000 निःशुल्क रजिस्ट्री छूट',
    description: 'Special corporate festival incentive: Instant ₹50,000 registry fee subsidy on direct token booking of any Block A or Block B residential plot.',
    rewardDescription: '₹50,000 Registry Stamp Duty Adjustment Voucher',
    rewardType: 'cash_bonus',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    eligibleRoles: ['senior_member', 'junior_member', 'buyer'],
    status: 'active',
    claimedCount: 4
  },
  {
    id: 'off-star-bike-2026',
    titleEn: 'Mega Associate Volume Challenge',
    titleHi: 'मेगा एसोसिएट वॉल्यूम चैलेंज (Sports Bike)',
    description: 'Achieve ₹1.5 Crore cumulative team sales volume in Q4 2026 and receive an official company-funded Sports Bike experience reward.',
    minSalesValueInr: 15000000,
    minPlotCount: 12,
    rewardDescription: 'Sports Bike / ₹1.5 Lakh Cash Equivalent',
    rewardType: 'vehicle',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    eligibleRoles: ['senior_member', 'junior_member'],
    status: 'active',
    claimedCount: 1
  }
];

export const INITIAL_TARGETS: SalesTarget[] = [
  {
    id: 'tgt-01',
    profileId: 'usr-sponsor-01',
    memberId: 'AKGV-3498',
    memberName: 'Vikram Singh (Senior Associate)',
    period: 'monthly',
    periodLabel: 'October 2026',
    targetPlotsCount: 3,
    targetSalesVolumeInr: 3500000,
    achievedPlotsCount: 1,
    achievedSalesVolumeInr: 1200000,
    status: 'in_progress',
    assignedBy: 'Rajesh Kumar Patel (Director)',
    updatedAt: '2026-10-14T10:00:00Z'
  },
  {
    id: 'tgt-02',
    profileId: 'usr-junior-01',
    memberId: 'AKGV0042',
    memberName: 'Amit Sharma (Field Associate)',
    period: 'monthly',
    periodLabel: 'October 2026',
    targetPlotsCount: 2,
    targetSalesVolumeInr: 2400000,
    achievedPlotsCount: 0,
    achievedSalesVolumeInr: 0,
    status: 'in_progress',
    assignedBy: 'Vikram Singh (Team Lead)',
    updatedAt: '2026-10-14T10:00:00Z'
  }
];

export const INITIAL_TASKS: TaskReminder[] = [
  {
    id: 'task-01',
    assigneeId: 'usr-sponsor-01',
    assignedToMemberId: 'AKGV-3498',
    assignedToName: 'Vikram Singh',
    title: 'Site Visit Escort: Cantt Station to Rampur',
    description: 'Escort Shri Suresh Chandra Gupta from Varanasi Cantt Station in company vehicle for Block A boundary inspection.',
    category: 'site_visit',
    relatedRecordType: 'site_visit',
    relatedRecordId: 'sv-001',
    targetRoute: '/member?tab=visits&id=sv-001',
    status: 'in_progress',
    dueDate: '2026-10-18',
    dueTime: '10:30 AM',
    priority: 'high',
    isCompleted: false,
    createdBy: 'usr-admin-01',
    createdByName: 'Director Office',
    createdAt: '2026-10-14T08:00:00Z'
  },
  {
    id: 'task-02',
    assigneeId: 'usr-admin-01',
    assignedToMemberId: 'AKGV-HQ-001',
    assignedToName: 'Rajesh Kumar Patel',
    title: 'Verify Bank Statement for Plot A-03 Token Payment',
    description: 'Cross-check HDFC Bank current account statement for ₹1.5L NEFT credit ref #UPI-REF-9928192847.',
    category: 'payment_verification',
    relatedRecordType: 'payment',
    relatedRecordId: 'pay-001',
    targetRoute: '/admin?tab=payments&id=pay-001',
    status: 'pending',
    dueDate: '2026-10-18',
    dueTime: '04:00 PM',
    priority: 'urgent',
    isCompleted: false,
    createdBy: 'usr-admin-01',
    createdByName: 'Admin Desk',
    createdAt: '2026-10-14T09:30:00Z'
  },
  {
    id: 'task-03',
    assigneeId: 'usr-admin-01',
    assignedToMemberId: 'AKGV-2117',
    assignedToName: 'Preet Yadav',
    title: 'Site Visit Escort: Suresh Chandra Gupta (Rampur Township)',
    description: 'Escort Shri Suresh Chandra Gupta (Phone: 9839012345) from Cantt Railway Station in company vehicle for Block A boundary inspection.',
    category: 'site_visit',
    relatedRecordType: 'site_visit',
    relatedRecordId: 'sv-001',
    targetRoute: '/member?tab=visits&id=sv-001',
    status: 'pending',
    dueDate: '2026-10-18',
    dueTime: '11:00 AM',
    priority: 'high',
    isCompleted: false,
    createdBy: 'usr-admin-01',
    createdByName: 'Admin Desk',
    createdAt: '2026-10-15T08:00:00Z'
  },
  {
    id: 'task-04',
    assigneeId: 'usr-admin-01',
    assignedToMemberId: 'AKGV-2117',
    assignedToName: 'Preet Yadav',
    title: 'Client Lead Follow-up: Shri Rameshwar Nath Tripathi',
    description: 'Customer interested in East-facing corner plot near 30ft entrance road (Phone: 9415012345). Confirm site visit timing for Sunday.',
    category: 'client_followup',
    relatedRecordType: 'enquiry',
    relatedRecordId: 'enq-001',
    targetRoute: '/member?tab=enquiries&id=enq-001',
    status: 'pending',
    dueDate: '2026-10-18',
    dueTime: '02:30 PM',
    priority: 'urgent',
    isCompleted: false,
    createdBy: 'usr-admin-01',
    createdByName: 'Admin Desk',
    createdAt: '2026-10-15T09:30:00Z'
  },
  {
    id: 'task-05',
    assigneeId: 'usr-admin-01',
    assignedToMemberId: 'AKGV-2117',
    assignedToName: 'Preet Yadav',
    title: 'Field Inspection: Boundary Demarcation Verification on Block B',
    description: 'Inspect physical corner demarcation pillars with GPS camera at Rampur extension and upload geofenced photo proof.',
    category: 'field_inspection',
    relatedRecordType: 'field_inspection',
    relatedRecordId: 'gps-001',
    targetRoute: '/member?tab=field_gps',
    status: 'pending',
    dueDate: '2026-10-19',
    dueTime: '04:00 PM',
    priority: 'medium',
    isCompleted: false,
    createdBy: 'usr-admin-01',
    createdByName: 'Admin Desk',
    createdAt: '2026-10-16T10:00:00Z'
  }
];

export const INITIAL_CMS_CONTENT: CmsContent = {
  heroHeadlineEn: 'Where Dreams Find Their Address in Varanasi',
  heroHeadlineHi: 'जहां सपने पाते हैं अपना ठिकाना — वाराणसी',
  heroSubtitleEn: 'Verified residential plots with 30ft & 25ft planned road network, 100% freehold registry, and transparent developer booking.',
  heroSubtitleHi: 'सुव्यवस्थित टाउनशिप प्लॉट्स, 30 फीट चौड़ी सड़कें, दाखिल-खारिज और सुगम रजिस्ट्री सुविधा।',
  announcementBanner: {
    textEn: 'Navratri Special: ₹50,000 Registry Subsidy on Block A Corner Plots!',
    textHi: 'नवरात्रि स्पेशल: ब्लॉक A कॉर्नर प्लॉट्स पर ₹50,000 रजिस्ट्री छूट!',
    isActive: true,
    linkUrl: '/master-plan'
  },
  publicOffers: [
    {
      id: 'off-01',
      title: 'Zero Brokerage Direct Registry',
      highlight: '100% Freehold Title',
      badge: 'Verified'
    },
    {
      id: 'off-02',
      title: '30ft Wide Dedicated Road Network',
      highlight: 'Demarcated Pillars',
      badge: 'On Ground'
    }
  ],
  faqs: [
    {
      id: 'faq-01',
      questionEn: 'Is the registry executed directly at the Sub-Registrar office?',
      questionHi: 'क्या रजिस्ट्री सीधे उप-निबंधक कार्यालय में होती है?',
      answerEn: 'Yes, 100% direct freehold deed registry is executed at the Varanasi Sub-Registrar office with complete revenue mutation (Dakhil-Kharij) support.',
      answerHi: 'हाँ, वाराणसी उप-निबंधक कार्यालय में सीधे आपके नाम 100% फ्रीहोल्ड बैनामा रजिस्ट्री की जाती है और दाखिल-खारिज में पूर्ण सहयोग दिया जाता है।',
      category: 'Legal'
    },
    {
      id: 'faq-02',
      questionEn: 'Can I inspect the land boundaries and survey markers on site?',
      questionHi: 'क्या मैं जमीन के पिलर और सीमांकन की मौके पर जांच कर सकता हूँ?',
      answerEn: 'Absolutely. We provide company vehicle pickup from Cantt railway station for physical inspection with GPS coordinates and blueprint ground markers.',
      answerHi: 'जी हाँ, आप कैंट रेलवे स्टेशन से कंपनी वाहन द्वारा मौके पर जाकर 30 फीट सड़क, पिलर और लेआउट की सीधी जांच कर सकते हैं।',
      category: 'Site Visit'
    }
  ],
  updatedAt: '2026-10-15T00:00:00Z',
  updatedBy: 'Director (Rajesh Kumar Patel)'
};

export const INITIAL_MESSAGES: InAppMessage[] = [
  {
    id: 'msg-001',
    recipientType: 'all',
    title: 'Navratri Land Demarcation & Customer Booking Camp',
    message: 'Welcome to Navratri Fest 2026. Rampur township boundary pillars and 30ft main road demarcation are fully completed on ground. Special subsidies active this month.',
    senderName: 'Corporate Office',
    priority: 'important',
    isRead: false,
    createdAt: '2026-10-15T09:00:00Z'
  },
  {
    id: 'msg-002',
    recipientType: 'role',
    recipientId: 'senior_member',
    title: 'Senior Associate Briefing: Q4 Sales Incentives',
    message: 'All Senior Associates are invited to review new quarterly volume targets and sports bike rewards. Review assigned leads in your Task Center.',
    senderName: 'Director (Rajesh Kumar Patel)',
    priority: 'normal',
    isRead: false,
    targetRoute: '/member?tab=targets',
    createdAt: '2026-10-16T11:00:00Z'
  },
  {
    id: 'msg-003',
    recipientType: 'individual',
    recipientId: 'AKGV-3498',
    recipientProfileId: 'usr-sponsor-01',
    title: 'Assigned Site Visit: Cantt Railway Station Escort',
    message: 'You have been assigned to escort Shri Suresh Chandra Gupta for a physical inspection at Rampur on 18 Oct 2026.',
    senderName: 'Admin Operations',
    priority: 'urgent',
    isRead: false,
    targetRoute: '/member?tab=visits&id=sv-001',
    createdAt: '2026-10-16T14:30:00Z'
  }
];


