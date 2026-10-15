export type UserRole = 'super_admin' | 'sub_admin' | 'senior_member' | 'junior_member' | 'buyer';

export type PlotStatus = 'vacant_red' | 'available_green' | 'booked_yellow' | 'hold_pending';

export type BookingStatus = 'pending' | 'hold' | 'confirmed' | 'cancelled' | 'released';

export type PaymentStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'refund_pending' | 'refunded';

export type SiteVisitStatus = 'requested' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';

export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  memberId?: string; // e.g. AKGV0001 for company members
  sponsorId?: string; // Parent reporting member
  kycStatus: KycStatus;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;

  // CRM, Geographic & Performance Dossier
  city?: string; // e.g. "Varanasi", "Chandauli", "Mirzapur", "Prayagraj"
  branchLocation?: string; // e.g. "Rampur Head Office", "Lahartara Branch", "Mirza Murad Branch"
  address?: string; // Full residential / communication address
  level?: number; // 1 to 7
  rankTitle?: string; // e.g. "Sales Assistant", "Star Associate", "Gold Star", "Director"
  totalBusinessVolumeInr?: number; // Cumulative business volume in INR
  plotsClosedCount?: number; // Count of plots booked or closed
  joinedDate?: string; // Explicit join date (ISO or formatted string)
  permissions?: MemberPermissions;
}

export interface MemberPermissions {
  canCreateDownline?: boolean;
  canManagePlots?: boolean;
  canRecordEnquiries?: boolean;
  canSubmitFieldReports?: boolean;
  canViewTeamSales?: boolean;
  canVerifyPayments?: boolean;
  canEditCms?: boolean;
}


export interface ProjectLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  branchType?: string;
  headline: string;
  description: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  totalPlots?: number;
  availablePlots?: number;
  roadConnectivity: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
  imageUrl?: string;
}

export interface Plot {
  id: string;
  plotNumber: string; // e.g. A-01, B-05, C-12
  block: 'A' | 'B' | 'C';
  locationId: string;
  areaSqft: number;
  dimensions: string; // e.g. "30' x 50'", "25' x 50'", "20' x 50'"
  roadWidth: string; // "30'-0\" WIDE" or "25'-0\" WIDE"
  roadFacing: string;
  status: PlotStatus;
  basePriceInr?: number; // Configurable admin value
  suitableHouseModelIds: string[];
  isCornerPlot?: boolean;
  notes?: string;
  // Position on interactive master plan canvas (SVG coords)
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HouseModel {
  id: string;
  name: string;
  subtitle: string;
  bhk: string;
  carpetAreaSqft: number;
  estimatedCostInr: number;
  floors: number;
  suitablePlotBlocks: ('A' | 'B' | 'C')[];
  minPlotAreaSqft: number;
  features: string[];
  exteriorThemes: {
    id: string;
    name: string;
    primaryColor: string;
    accentColor: string;
    roofColor: string;
  }[];
  imageUrl?: string;
  gltfModelUrl?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  plotId: string;
  plotNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sponsorId?: string;
  status: BookingStatus;
  houseModelId?: string;
  totalAmountInr: number;
  paidAmountInr: number;
  holdExpiresAt?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  bookingId: string;
  plotNumber: string;
  payerId?: string;
  payerName: string;
  payerPhone: string;
  amountInr: number;
  paymentMethod: 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE';
  status: PaymentStatus;
  receiptNumber?: string;
  proofUrl?: string;
  notes?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface JoiningKitIssue {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  amountReceivedInr: number; // ₹999 cash offline
  collectionDate: string;
  collectorStaffName: string;
  collectorStaffId: string;
  itemsIncluded: {
    bag: boolean;
    pen: boolean;
    diary: boolean;
    file: boolean;
  };
  deliveryStatus: 'issued' | 'in_transit' | 'acknowledged';
  recipientSignatureAck?: string;
  auditNotes?: string;
}

export interface CommissionLevelRule {
  levelNumber: number;
  rankTitleEn: string;
  rankTitleHi: string;
  minBusinessInr: number; // e.g. 100000 (1 Lakh)
  maxBusinessInr: number; // e.g. 2000000 (20 Lakh)
  commissionPercent: number; // e.g. 4%
  rewardNameEn: string;
  rewardNameHi: string;
  rewardCategory: string;
  rewardEstimatedValueInr?: number;
  badgeIcon: string;
}

export interface CommissionLedgerEntry {
  id: string;
  memberId: string;
  memberName: string;
  sourceBookingId: string;
  sourcePlotNumber: string;
  saleAmountInr: number;
  commissionPercent: number;
  commissionEarnedInr: number;
  isReversed: boolean;
  payoutStatus: 'calculated' | 'approved' | 'paid' | 'reversed';
  createdAt: string;
  paidAt?: string;
}

export interface RewardClaim {
  id: string;
  memberId: string;
  memberName: string;
  levelNumber: number;
  rewardName: string;
  businessVolumeAchievedInr: number;
  status: 'eligible' | 'claimed' | 'in_review' | 'fulfilled' | 'rejected';
  claimDate: string;
  fulfilledDate?: string;
  adminNotes?: string;
}

export interface SiteVisit {
  id: string;
  buyerId?: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  locationId: string;
  locationName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  pickupRequired: boolean;
  assignedStaffName?: string;
  status: SiteVisitStatus;
  notes?: string;
  createdAt: string;
}

export interface FieldGpsEvidence {
  id: string;
  plotNumber: string;
  locationId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  captureTimestamp: string;
  photoUrl: string;
  capturedByMemberId: string;
  capturedByName: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'recapture_requested';
  adminNotes?: string;
  isLiveCamera?: boolean;
  captureSource?: 'live_camera' | 'file_upload';
  measuredDimensions?: string;
  measuredAreaSqft?: number;
  roadAccessWidth?: string;
  proposedRatePerSqft?: number;
  expectedPriceInr?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}


export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: 'booking' | 'payment' | 'plot_enquiry' | 'commission' | 'joining_kit' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assignedStaff?: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    isStaff: boolean;
    isInternalNote: boolean;
    message: string;
    timestamp: string;
  }[];
}

export interface ReviewRecord {
  id: string;
  authorName: string;
  authorPhone?: string;
  authorRole: 'buyer' | 'visitor' | 'associate' | 'public';
  rating: number; // 1 to 5
  title: string;
  comment: string;
  plotNumber?: string;
  branchLocation: string;
  category: 'plot_purchase' | 'site_visit' | 'legal_registry' | 'staff_support' | 'corporate_trust';
  isVerified: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  helpfulCount: number;
  adminReply?: {
    replyText: string;
    repliedAt: string;
    replierName: string;
  };
}

export interface ClientEnquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  interestedPlotId?: string;
  preferredLocationId?: string;
  budgetInr?: number;
  status: 'new' | 'contacted' | 'visit_scheduled' | 'booked' | 'lost';
  assignedMemberId: string;
  assignedMemberName: string;
  notes?: string;
  followUps?: {
    id: string;
    date: string;
    summary: string;
    nextFollowUpDate?: string;
  }[];
  createdAt: string;
}

export interface OfferIncentive {
  id: string;
  titleEn: string;
  titleHi: string;
  description: string;
  minPlotCount?: number;
  minSalesValueInr?: number;
  rewardDescription: string;
  rewardType: 'cash_bonus' | 'commission_bump' | 'vehicle' | 'travel' | 'gift';
  startDate: string;
  endDate: string;
  eligibleRoles: UserRole[];
  status: 'active' | 'draft' | 'expired' | 'archived';
  claimedCount: number;
}

export interface SalesTarget {
  id: string;
  memberId: string;
  memberName: string;
  period: 'monthly' | 'quarterly';
  periodLabel: string; // e.g. "October 2026", "Q4 2026"
  targetPlotsCount: number;
  targetSalesVolumeInr: number;
  achievedPlotsCount: number;
  achievedSalesVolumeInr: number;
  status: 'in_progress' | 'achieved' | 'missed';
  assignedBy: string;
  updatedAt: string;
}

export interface TaskReminder {
  id: string;
  assignedToMemberId: string;
  assignedToName: string;
  title: string;
  description?: string;
  category: 'site_visit' | 'client_followup' | 'payment_verification' | 'field_inspection' | 'general';
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface InAppMessage {
  id: string;
  recipientType: 'individual' | 'role' | 'branch' | 'all';
  recipientId?: string; // memberId or role or branch name
  title: string;
  message: string;
  senderName: string;
  priority: 'normal' | 'important' | 'urgent';
  isRead?: boolean;
  createdAt: string;
}

export interface CmsContent {
  heroHeadlineEn: string;
  heroHeadlineHi: string;
  heroSubtitleEn: string;
  heroSubtitleHi: string;
  announcementBanner?: {
    textEn: string;
    textHi: string;
    isActive: boolean;
    linkUrl?: string;
  };
  publicOffers: {
    id: string;
    title: string;
    highlight: string;
    badge: string;
  }[];
  faqs: {
    id: string;
    questionEn: string;
    questionHi: string;
    answerEn: string;
    answerHi: string;
    category: string;
  }[];
  updatedAt: string;
  updatedBy: string;
}


