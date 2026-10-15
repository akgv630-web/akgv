'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Booking,
  FieldGpsEvidence,
  JoiningKitIssue,
  PaymentRecord,
  Plot,
  PlotStatus,
  Profile,
  ReviewRecord,
  SiteVisit,
  SupportTicket,
  UserRole
} from '@/types';
import {
  DEMO_PROFILES,
  INITIAL_BOOKINGS,
  INITIAL_GPS_EVIDENCE,
  INITIAL_KIT_ISSUES,
  INITIAL_PAYMENTS,
  INITIAL_PLOTS,
  INITIAL_REVIEWS,
  INITIAL_SITE_VISITS,
  INITIAL_SUPPORT_TICKETS
} from '@/lib/store';
import { DICTIONARY, Language } from '@/lib/i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof DICTIONARY['en'];
  currentUser: Profile;
  switchUserRole: (role: UserRole) => void;
  allProfiles: Profile[];
  plots: Plot[];
  updatePlotStatus: (plotId: string, newStatus: PlotStatus, reason: string) => void;
  addPlot: (plotData: Omit<Plot, 'id'>) => Plot;
  updatePlot: (plotId: string, patch: Partial<Plot>) => void;
  deletePlot: (plotId: string) => void;
  bookings: Booking[];
  createBookingRequest: (plotId: string, buyerName: string, buyerPhone: string, houseModelId?: string) => Booking;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
  payments: PaymentRecord[];
  submitPaymentProof: (bookingId: string, amount: number, txRef: string, method: 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE') => PaymentRecord;
  verifyPayment: (paymentId: string, approved: boolean, reason?: string) => void;
  kitIssues: JoiningKitIssue[];
  recordKitIssue: (data: Omit<JoiningKitIssue, 'id' | 'receiptNumber'>) => JoiningKitIssue;
  siteVisits: SiteVisit[];
  bookSiteVisit: (data: Omit<SiteVisit, 'id' | 'status' | 'createdAt'>) => SiteVisit;
  gpsEvidences: FieldGpsEvidence[];
  submitGpsEvidence: (evidence: Omit<FieldGpsEvidence, 'id' | 'status'>) => FieldGpsEvidence;
  supportTickets: SupportTicket[];
  createSupportTicket: (category: SupportTicket['category'], subject: string, description: string) => SupportTicket;
  replyToTicket: (ticketId: string, message: string, isInternalNote?: boolean) => void;
  selectedPlotForViewer: Plot | null;
  setSelectedPlotForViewer: (plot: Plot | null) => void;
  registerMember: (data: { fullName: string; email: string; phone: string; role?: UserRole; sponsorId?: string }) => Profile;
  loginUser: (identifier: string) => Profile | null;
  createSponsorMember: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    sponsorId: string;
    city?: string;
    branchLocation?: string;
    address?: string;
    level?: number;
    rankTitle?: string;
  }) => Profile;
  updateMember: (id: string, data: Partial<Profile>) => void;
  deleteMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;
  reviews: ReviewRecord[];
  addReview: (review: Omit<ReviewRecord, 'id' | 'createdAt' | 'helpfulCount' | 'status'>) => ReviewRecord;
  voteHelpful: (reviewId: string) => void;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'pending' | 'rejected') => void;
  replyToReview: (reviewId: string, replyText: string) => void;
  deleteReview: (reviewId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'akgv_infra_';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<Profile>(DEMO_PROFILES[0]); // default super admin
  const [allProfiles, setAllProfiles] = useState<Profile[]>(DEMO_PROFILES);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [kitIssues, setKitIssues] = useState<JoiningKitIssue[]>(INITIAL_KIT_ISSUES);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_SITE_VISITS);
  const [gpsEvidences, setGpsEvidences] = useState<FieldGpsEvidence[]>(INITIAL_GPS_EVIDENCE);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [reviews, setReviews] = useState<ReviewRecord[]>(INITIAL_REVIEWS);
  const [selectedPlotForViewer, setSelectedPlotForViewer] = useState<Plot | null>(INITIAL_PLOTS[3]); // default A-04

  // Hydrate from localStorage if available
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`) as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'hinglish')) {
        setLanguageState(savedLang);
      }
      let loadedProfiles = DEMO_PROFILES;
      const savedProfiles = localStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`);
      if (savedProfiles) {
        try {
          const parsed = JSON.parse(savedProfiles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedProfiles = parsed;
            setAllProfiles(parsed);
          }
        } catch {
          // Ignore
        }
      }
      const savedRole = localStorage.getItem(`${STORAGE_KEY_PREFIX}role`) as UserRole;
      if (savedRole) {
        const found = loadedProfiles.find((p) => p.role === savedRole) || DEMO_PROFILES.find((p) => p.role === savedRole);
        if (found) setCurrentUser(found);
      } else if (loadedProfiles.length > 0) {
        setCurrentUser(loadedProfiles[0]);
      }
      const savedPlots = localStorage.getItem(`${STORAGE_KEY_PREFIX}plots`);
      if (savedPlots) setPlots(JSON.parse(savedPlots));
      const savedBookings = localStorage.getItem(`${STORAGE_KEY_PREFIX}bookings`);
      if (savedBookings) setBookings(JSON.parse(savedBookings));
      const savedPayments = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);
      if (savedPayments) setPayments(JSON.parse(savedPayments));
      const savedKit = localStorage.getItem(`${STORAGE_KEY_PREFIX}kit_issues`);
      if (savedKit) setKitIssues(JSON.parse(savedKit));
      const savedReviews = localStorage.getItem(`${STORAGE_KEY_PREFIX}reviews`);
      if (savedReviews) {
        try {
          const parsedRev = JSON.parse(savedReviews);
          if (Array.isArray(parsedRev) && parsedRev.length > 0) {
            setReviews(parsedRev);
          }
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore client hydration errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
    } catch {
      // Ignore
    }
  };

  const switchUserRole = (role: UserRole) => {
    const found = allProfiles.find((p) => p.role === role) || DEMO_PROFILES.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, role);
      } catch {
        // Ignore
      }
    }
  };

  const registerMember = (data: {
    fullName: string;
    email: string;
    phone: string;
    role?: UserRole;
    sponsorId?: string;
  }): Profile => {
    const newMemberId = `AKGV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role || 'junior_member',
      memberId: newMemberId,
      sponsorId: data.sponsorId,
      kycStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setAllProfiles((prev) => {
      const next = [...prev, newProfile];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    setCurrentUser(newProfile);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, newProfile.role);
    } catch {
      // Ignore
    }
    return newProfile;
  };

  const loginUser = (identifier: string): Profile | null => {
    const trimmed = identifier.trim().toLowerCase();
    const found = allProfiles.find(
      (p) =>
        p.email.toLowerCase() === trimmed ||
        p.phone === trimmed ||
        (p.memberId && p.memberId.toLowerCase() === trimmed)
    );
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, found.role);
      } catch {
        // Ignore
      }
      return found;
    }
    return null;
  };

  const createSponsorMember = (data: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    sponsorId: string;
    city?: string;
    branchLocation?: string;
    address?: string;
    level?: number;
    rankTitle?: string;
  }): Profile => {
    const newMemberId = `AKGV-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.slice(0, 10);

    // Determine sensible default rank and level based on role
    const defaultLevel = data.level || (data.role === 'senior_member' ? 4 : data.role === 'sub_admin' ? 5 : data.role === 'buyer' ? 1 : 1);
    const defaultRank = data.rankTitle || (
      data.role === 'super_admin' ? 'Director (कंपनी निदेशक)' :
      data.role === 'sub_admin' ? 'Platinum Leader (क्षेत्रीय प्रभारी)' :
      data.role === 'senior_member' ? 'Diamond Star (वरिष्ठ प्रबंधक)' :
      data.role === 'buyer' ? 'Verified Client (सत्यापित क्रेता)' :
      'Sales Assistant (फील्ड एजेंट)'
    );

    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role,
      memberId: newMemberId,
      sponsorId: data.sponsorId,
      city: data.city || 'Varanasi',
      branchLocation: data.branchLocation || 'Rampur Head Office',
      address: data.address || '',
      level: defaultLevel,
      rankTitle: defaultRank,
      totalBusinessVolumeInr: 0,
      plotsClosedCount: 0,
      joinedDate: todayDate,
      kycStatus: 'verified',
      isActive: true,
      createdAt: nowIso,
    };
    setAllProfiles((prev) => {
      const next = [...prev, newProfile];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    return newProfile;
  };

  const updateMember = (id: string, data: Partial<Profile>) => {
    setAllProfiles((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
  };

  const deleteMember = (id: string) => {
    setAllProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const toggleMemberStatus = (id: string) => {
    setAllProfiles((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, isActive: !prev.isActive }));
    }
  };

  const updatePlotStatus = (plotId: string, newStatus: PlotStatus, _reason: string) => {
    setPlots((prev) => {
      const updated = prev.map((p) => (p.id === plotId ? { ...p, status: newStatus } : p));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const addPlot = (plotData: Omit<Plot, 'id'>): Plot => {
    const cleanNum = plotData.plotNumber.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const newPlot: Plot = {
      ...plotData,
      id: `plot-${cleanNum}-${Date.now().toString().slice(-4)}`,
    };
    setPlots((prev) => {
      const updated = [...prev, newPlot];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    return newPlot;
  };

  const updatePlot = (plotId: string, patch: Partial<Plot>) => {
    setPlots((prev) => {
      const updated = prev.map((p) => (p.id === plotId ? { ...p, ...patch } : p));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const deletePlot = (plotId: string) => {
    setPlots((prev) => {
      const updated = prev.filter((p) => p.id !== plotId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const createBookingRequest = (
    plotId: string,
    buyerName: string,
    buyerPhone: string,
    houseModelId?: string
  ): Booking => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot) throw new Error('Plot not found');

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      plotId,
      plotNumber: plot.plotNumber,
      buyerId: currentUser.id,
      buyerName,
      buyerPhone,
      sponsorId: currentUser.sponsorId,
      status: 'pending',
      houseModelId,
      totalAmountInr: plot.basePriceInr || 1500000,
      paidAmountInr: 0,
      holdExpiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => {
      const next = [newBooking, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    // Mark plot as hold_pending or notify
    updatePlotStatus(plotId, 'hold_pending', 'Booking request initiated by buyer');
    return newBooking;
  };

  const confirmBooking = (bookingId: string) => {
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'confirmed' as const, confirmedAt: new Date().toISOString() } : b
      );
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      updatePlotStatus(booking.plotId, 'booked_yellow', 'Booking confirmed by administrator');
    }
  };

  const cancelBooking = (bookingId: string, _reason: string) => {
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      updatePlotStatus(booking.plotId, 'available_green', 'Booking cancelled and released');
    }
  };

  const submitPaymentProof = (
    bookingId: string,
    amount: number,
    txRef: string,
    method: 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE'
  ): PaymentRecord => {
    const booking = bookings.find((b) => b.id === bookingId);
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionRef: txRef,
      bookingId,
      plotNumber: booking ? booking.plotNumber : 'A-01',
      payerName: currentUser.fullName,
      payerPhone: currentUser.phone,
      amountInr: amount,
      paymentMethod: method,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    };

    setPayments((prev) => {
      const next = [newPayment, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    return newPayment;
  };

  const verifyPayment = (paymentId: string, approved: boolean, reason?: string) => {
    setPayments((prev) => {
      const next = prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: approved ? ('verified' as const) : ('rejected' as const),
            receiptNumber: approved ? `RCP-AKGV-${Date.now().toString().slice(-6)}` : undefined,
            verifiedAt: new Date().toISOString(),
            verifiedBy: currentUser.id,
            rejectionReason: !approved ? reason : undefined,
          };
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    if (approved) {
      const targetPay = payments.find((p) => p.id === paymentId);
      if (targetPay) {
        confirmBooking(targetPay.bookingId);
      }
    }
  };

  const recordKitIssue = (data: Omit<JoiningKitIssue, 'id' | 'receiptNumber'>): JoiningKitIssue => {
    const newKit: JoiningKitIssue = {
      ...data,
      id: `kit-${Date.now()}`,
      receiptNumber: `KIT-RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setKitIssues((prev) => {
      const next = [newKit, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}kit_issues`, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    return newKit;
  };

  const bookSiteVisit = (data: Omit<SiteVisit, 'id' | 'status' | 'createdAt'>): SiteVisit => {
    const newVisit: SiteVisit = {
      ...data,
      id: `sv-${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    setSiteVisits((prev) => [newVisit, ...prev]);
    return newVisit;
  };

  const submitGpsEvidence = (evidence: Omit<FieldGpsEvidence, 'id' | 'status'>): FieldGpsEvidence => {
    const newEvidence: FieldGpsEvidence = {
      ...evidence,
      id: `gps-${Date.now()}`,
      status: 'pending_review',
    };
    setGpsEvidences((prev) => [newEvidence, ...prev]);
    return newEvidence;
  };

  const createSupportTicket = (
    category: SupportTicket['category'],
    subject: string,
    description: string
  ): SupportTicket => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      category,
      priority: 'medium',
      status: 'open',
      subject,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          isStaff: false,
          isInternalNote: false,
          message: description,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const replyToTicket = (ticketId: string, message: string, isInternalNote = false) => {
    setSupportTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const isStaff = currentUser.role === 'super_admin' || currentUser.role === 'sub_admin';
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.fullName,
            isStaff,
            isInternalNote,
            message,
            timestamp: new Date().toISOString(),
          };
          return {
            ...tkt,
            updatedAt: new Date().toISOString(),
            messages: [...tkt.messages, newMsg],
          };
        }
        return tkt;
      })
    );
  };

  const saveReviews = (updated: ReviewRecord[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const addReview = (data: Omit<ReviewRecord, 'id' | 'createdAt' | 'helpfulCount' | 'status'>): ReviewRecord => {
    const newReview: ReviewRecord = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      status: 'approved',
    };
    const updated = [newReview, ...reviews];
    saveReviews(updated);
    return newReview;
  };

  const voteHelpful = (reviewId: string) => {
    const updated = reviews.map((r) =>
      r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
    );
    saveReviews(updated);
  };

  const updateReviewStatus = (reviewId: string, status: 'approved' | 'pending' | 'rejected') => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    saveReviews(updated);
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    const updated = reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            adminReply: {
              replyText,
              repliedAt: new Date().toISOString(),
              replierName: currentUser.fullName
                ? `${currentUser.fullName} (${currentUser.rankTitle || 'Director'})`
                : 'Rajesh Kumar Patel (Director)'
            }
          }
        : r
    );
    saveReviews(updated);
  };

  const deleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    saveReviews(updated);
  };

  const t = DICTIONARY[language] || DICTIONARY.en;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        switchUserRole,
        allProfiles,
        plots,
        updatePlotStatus,
        addPlot,
        updatePlot,
        deletePlot,
        bookings,
        createBookingRequest,
        confirmBooking,
        cancelBooking,
        payments,
        submitPaymentProof,
        verifyPayment,
        kitIssues,
        recordKitIssue,
        siteVisits,
        bookSiteVisit,
        gpsEvidences,
        submitGpsEvidence,
        supportTickets,
        createSupportTicket,
        replyToTicket,
        selectedPlotForViewer,
        setSelectedPlotForViewer,
        registerMember,
        loginUser,
        createSponsorMember,
        updateMember,
        deleteMember,
        toggleMemberStatus,
        reviews,
        addReview,
        voteHelpful,
        updateReviewStatus,
        replyToReview,
        deleteReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
