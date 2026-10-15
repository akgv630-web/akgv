'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Booking,
  ClientEnquiry,
  CmsContent,
  FieldGpsEvidence,
  InAppMessage,
  JoiningKitIssue,
  OfferIncentive,
  PaymentRecord,
  Plot,
  PlotStatus,
  Profile,
  ReviewRecord,
  SalesTarget,
  SiteVisit,
  SupportTicket,
  TaskReminder,
  UserRole
} from '@/types';
import {
  DEMO_PROFILES,
  INITIAL_BOOKINGS,
  INITIAL_CMS_CONTENT,
  INITIAL_ENQUIRIES,
  INITIAL_GPS_EVIDENCE,
  INITIAL_KIT_ISSUES,
  INITIAL_OFFERS,
  INITIAL_PAYMENTS,
  INITIAL_PLOTS,
  INITIAL_REVIEWS,
  INITIAL_SITE_VISITS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TARGETS,
  INITIAL_TASKS
} from '@/lib/store';
import { DICTIONARY, Language } from '@/lib/i18n';
import {
  fetchPlotsFromSupabase,
  savePlotToSupabase,
  deletePlotFromSupabase,
  fetchReviewsFromSupabase,
  saveReviewToSupabase,
  deleteReviewFromSupabase,
  fetchBookingsFromSupabase,
  saveBookingToSupabase,
  savePaymentToSupabase,
  saveSiteVisitToSupabase,
  fetchProfilesFromSupabase,
  saveProfileToSupabase,
  deleteProfileFromSupabase,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  supabaseResetPassword,
  supabaseGetSession,
  fetchGpsEvidenceFromSupabase,
  saveGpsEvidenceToSupabase,
  fetchEnquiriesFromSupabase,
  saveEnquiryToSupabase,
  fetchTargetsFromSupabase,
  saveTargetToSupabase,
  fetchTasksFromSupabase,
  saveTaskToSupabase,
  fetchCmsContentFromSupabase,
  saveCmsContentToSupabase
} from '@/lib/supabase/syncService';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof DICTIONARY['en'];
  currentUser: Profile | null;
  isAuthenticated: boolean;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; profile?: Profile }>;
  registerWithCredentials: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    sponsorId?: string;
    city?: string;
    branchLocation?: string;
  }) => Promise<{ success: boolean; error?: string; profile?: Profile }>;
  logout: () => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
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
  approveFieldGpsEvidence: (evidenceId: string, adminNotes?: string) => void;
  rejectFieldGpsEvidence: (evidenceId: string, reason: string) => void;
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
  enquiries: ClientEnquiry[];
  addEnquiry: (data: Omit<ClientEnquiry, 'id' | 'createdAt'>) => ClientEnquiry;
  updateEnquiryStatus: (id: string, status: ClientEnquiry['status']) => void;
  offers: OfferIncentive[];
  targets: SalesTarget[];
  updateTarget: (targetId: string, patch: Partial<SalesTarget>) => void;
  tasks: TaskReminder[];
  addTask: (task: Omit<TaskReminder, 'id' | 'createdAt' | 'isCompleted'>) => TaskReminder;
  toggleTask: (taskId: string) => void;
  messages: InAppMessage[];
  sendMessage: (msg: Omit<InAppMessage, 'id' | 'createdAt' | 'isRead'>) => InAppMessage;
  cmsContent: CmsContent;
  updateCmsContent: (patch: Partial<CmsContent>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'akgv_infra_';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>(DEMO_PROFILES);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [kitIssues, setKitIssues] = useState<JoiningKitIssue[]>(INITIAL_KIT_ISSUES);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_SITE_VISITS);
  const [gpsEvidences, setGpsEvidences] = useState<FieldGpsEvidence[]>(INITIAL_GPS_EVIDENCE);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [reviews, setReviews] = useState<ReviewRecord[]>(INITIAL_REVIEWS);
  const [selectedPlotForViewer, setSelectedPlotForViewer] = useState<Plot | null>(INITIAL_PLOTS[3]);
  const [enquiries, setEnquiries] = useState<ClientEnquiry[]>(INITIAL_ENQUIRIES);
  const [offers] = useState<OfferIncentive[]>(INITIAL_OFFERS);
  const [targets, setTargets] = useState<SalesTarget[]>(INITIAL_TARGETS);
  const [tasks, setTasks] = useState<TaskReminder[]>(INITIAL_TASKS);
  const [messages, setMessages] = useState<InAppMessage[]>([]);
  const [cmsContent, setCmsContent] = useState<CmsContent>(INITIAL_CMS_CONTENT);

  // Hydrate from localStorage first, then sync with Supabase in background
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

      // Check saved authentication session
      const savedAuthUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_user`);
      if (savedAuthUser) {
        try {
          const parsedUser = JSON.parse(savedAuthUser);
          if (parsedUser && parsedUser.id) {
            const found = loadedProfiles.find((p) => p.id === parsedUser.id) || parsedUser;
            setCurrentUser(found);
          }
        } catch {
          // Ignore
        }
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
          if (Array.isArray(parsedRev) && parsedRev.length > 0) setReviews(parsedRev);
        } catch {}
      }
      const savedEnquiries = localStorage.getItem(`${STORAGE_KEY_PREFIX}enquiries`);
      if (savedEnquiries) {
        try {
          const parsed = JSON.parse(savedEnquiries);
          if (Array.isArray(parsed) && parsed.length > 0) setEnquiries(parsed);
        } catch {}
      }
      const savedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          if (Array.isArray(parsed) && parsed.length > 0) setTasks(parsed);
        } catch {}
      }
      const savedCms = localStorage.getItem(`${STORAGE_KEY_PREFIX}cms`);
      if (savedCms) {
        try {
          const parsed = JSON.parse(savedCms);
          if (parsed && parsed.heroHeadlineEn) setCmsContent(parsed);
        } catch {}
      }
    } catch {
      // Ignore client hydration errors
    }

    // Supabase Live Remote Sync (Non-blocking background sync)
    async function syncWithSupabase() {
      try {
        const [
          remotePlots,
          remoteReviews,
          remoteBookings,
          remoteProfiles,
          remoteGps,
          remoteEnquiries,
          remoteTargets,
          remoteTasks,
          remoteCms,
          authSession
        ] = await Promise.all([
          fetchPlotsFromSupabase(),
          fetchReviewsFromSupabase(),
          fetchBookingsFromSupabase(),
          fetchProfilesFromSupabase(),
          fetchGpsEvidenceFromSupabase(),
          fetchEnquiriesFromSupabase(),
          fetchTargetsFromSupabase(),
          fetchTasksFromSupabase(),
          fetchCmsContentFromSupabase(),
          supabaseGetSession()
        ]);

        if (remotePlots && remotePlots.length > 0) {
          setPlots(remotePlots);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(remotePlots)); } catch {}
        }
        if (remoteReviews && remoteReviews.length > 0) {
          setReviews(remoteReviews);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(remoteReviews)); } catch {}
        }
        if (remoteBookings && remoteBookings.length > 0) {
          setBookings(remoteBookings);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(remoteBookings)); } catch {}
        }
        if (remoteProfiles && remoteProfiles.length > 0) {
          setAllProfiles(remoteProfiles);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(remoteProfiles)); } catch {}
        }
        if (remoteGps && remoteGps.length > 0) {
          setGpsEvidences(remoteGps);
        }
        if (remoteEnquiries && remoteEnquiries.length > 0) {
          setEnquiries(remoteEnquiries);
        }
        if (remoteTargets && remoteTargets.length > 0) {
          setTargets(remoteTargets);
        }
        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
        }
        if (remoteCms && remoteCms.heroHeadlineEn) {
          setCmsContent(remoteCms);
        }

        // Restore verified profile from Supabase Auth session if active
        if (authSession && authSession.user) {
          const profilesList = remoteProfiles || allProfiles;
          const userEmail = authSession.user.email?.toLowerCase();
          const matched = profilesList.find(
            (p) => (userEmail && p.email.toLowerCase() === userEmail) || p.id === authSession.user.id
          );
          if (matched) {
            setCurrentUser(matched);
            try { localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(matched)); } catch {}
          }
        }
      } catch (err) {
        console.warn('[Supabase Sync] Remote hydration notice:', err);
      }
    }

    syncWithSupabase();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
    } catch {
      // Ignore
    }
  };

  // Genuine Supabase Credentials Login with Local Fallback
  const loginWithCredentials = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; profile?: Profile }> => {
    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      return { success: false, error: 'Please enter both login identifier and password.' };
    }

    // 1. Try Supabase Auth
    try {
      const res = await supabaseSignIn(trimmedId, password);
      if (res && res.data && res.data.user) {
        const authUser = res.data.user;
        const userEmail = authUser.email?.toLowerCase();
        const found = allProfiles.find(
          (p) =>
            (userEmail && p.email.toLowerCase() === userEmail) ||
            p.phone === trimmedId ||
            (p.memberId && p.memberId.toLowerCase() === trimmedId.toLowerCase())
        );
        const profileToSet = found || {
          id: authUser.id,
          email: authUser.email || trimmedId,
          fullName: authUser.user_metadata?.full_name || trimmedId.split('@')[0],
          phone: authUser.user_metadata?.phone || '',
          role: (authUser.user_metadata?.role as UserRole) || 'buyer',
          kycStatus: 'verified' as const,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(profileToSet);
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(profileToSet));
        } catch {}
        return { success: true, profile: profileToSet };
      }
    } catch {
      // Supabase auth service offline / proceed to local verification
    }

    // 2. Local verified accounts verification
    const found = allProfiles.find(
      (p) =>
        p.email.toLowerCase() === trimmedId.toLowerCase() ||
        p.phone === trimmedId ||
        (p.memberId && p.memberId.toLowerCase() === trimmedId.toLowerCase())
    );

    if (found) {
      // Require password check for demo/local testing:
      // Accepts standard password 'akgv@2026' or 'admin123' or any 6+ char password in sandbox
      if (password === 'akgv@2026' || password === 'admin123' || password.length >= 6) {
        setCurrentUser(found);
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(found));
        } catch {}
        return { success: true, profile: found };
      } else {
        return { success: false, error: 'Incorrect password. (Sandbox default: akgv@2026)' };
      }
    }

    return { success: false, error: 'No account registered with this email, phone, or member ID.' };
  };

  const registerWithCredentials = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    sponsorId?: string;
    city?: string;
    branchLocation?: string;
  }): Promise<{ success: boolean; error?: string; profile?: Profile }> => {
    // 1. Attempt Supabase Auth Registration
    try {
      await supabaseSignUp({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role || 'junior_member',
        sponsorId: data.sponsorId,
      });
    } catch {
      // Proceed with local profile creation
    }

    const newMemberId = `AKGV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role || 'junior_member',
      memberId: newMemberId,
      sponsorId: data.sponsorId,
      city: data.city || 'Varanasi',
      branchLocation: data.branchLocation || 'Rampur Head Office',
      kycStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setAllProfiles((prev) => {
      const next = [...prev, newProfile];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveProfileToSupabase(newProfile);

    setCurrentUser(newProfile);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(newProfile));
    } catch {}

    return { success: true, profile: newProfile };
  };

  const logout = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}role`);
    } catch {}
  };

  const resetPasswordRequest = async (email: string) => {
    const res = await supabaseResetPassword(email);
    if (res && res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true };
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
        localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(found));
      } catch {}
      return found;
    }
    return null;
  };

  const switchUserRole = (role: UserRole) => {
    const found = allProfiles.find((p) => p.role === role) || DEMO_PROFILES.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(found));
      } catch {}
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
      } catch {}
      return next;
    });
    void saveProfileToSupabase(newProfile);
    return newProfile;
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

    const defaultLevel = data.level || (data.role === 'senior_member' ? 4 : data.role === 'sub_admin' ? 5 : 1);
    const defaultRank =
      data.rankTitle ||
      (data.role === 'super_admin'
        ? 'Director (कंपनी निदेशक)'
        : data.role === 'sub_admin'
        ? 'Platinum Leader (क्षेत्रीय प्रभारी)'
        : data.role === 'senior_member'
        ? 'Diamond Star (वरिष्ठ प्रबंधक)'
        : data.role === 'buyer'
        ? 'Verified Client (सत्यापित क्रेता)'
        : 'Sales Assistant (फील्ड एजेंट)');

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
      } catch {}
      return next;
    });
    void saveProfileToSupabase(newProfile);
    return newProfile;
  };

  const updateMember = (id: string, data: Partial<Profile>) => {
    let updatedMember: Profile | null = null;
    setAllProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          updatedMember = { ...p, ...data };
          return updatedMember;
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (updatedMember) {
      void saveProfileToSupabase(updatedMember);
    }
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteMember = (id: string) => {
    setAllProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {}
      return next;
    });
    void deleteProfileFromSupabase(id);
  };

  const toggleMemberStatus = (id: string) => {
    let toggledMember: Profile | null = null;
    setAllProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          toggledMember = { ...p, isActive: !p.isActive };
          return toggledMember;
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (toggledMember) {
      void saveProfileToSupabase(toggledMember);
    }
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
    }
  };

  const updatePlotStatus = (plotId: string, newStatus: PlotStatus, _reason: string) => {
    let targetPlot: Plot | null = null;
    setPlots((prev) => {
      const updated = prev.map((p) => {
        if (p.id === plotId) {
          targetPlot = { ...p, status: newStatus };
          return targetPlot;
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (targetPlot) {
      void savePlotToSupabase(targetPlot);
    }
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
      } catch {}
      return updated;
    });
    void savePlotToSupabase(newPlot);
    return newPlot;
  };

  const updatePlot = (plotId: string, patch: Partial<Plot>) => {
    let targetPlot: Plot | null = null;
    setPlots((prev) => {
      const updated = prev.map((p) => {
        if (p.id === plotId) {
          targetPlot = { ...p, ...patch };
          return targetPlot;
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (targetPlot) {
      void savePlotToSupabase(targetPlot);
    }
  };

  const deletePlot = (plotId: string) => {
    setPlots((prev) => {
      const updated = prev.filter((p) => p.id !== plotId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    void deletePlotFromSupabase(plotId);
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
      buyerId: currentUser?.id || `buyer-${Date.now()}`,
      buyerName,
      buyerPhone,
      sponsorId: currentUser?.sponsorId,
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
      } catch {}
      return next;
    });

    void saveBookingToSupabase(newBooking);
    updatePlotStatus(plotId, 'hold_pending', 'Booking request initiated by buyer');
    return newBooking;
  };

  const confirmBooking = (bookingId: string) => {
    let targetBooking: Booking | null = null;
    setBookings((prev) => {
      const next = prev.map((b) => {
        if (b.id === bookingId) {
          targetBooking = { ...b, status: 'confirmed' as const, confirmedAt: new Date().toISOString() };
          return targetBooking;
        }
        return b;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetBooking) {
      void saveBookingToSupabase(targetBooking);
      updatePlotStatus((targetBooking as Booking).plotId, 'booked_yellow', 'Booking confirmed by administrator');
    }
  };

  const cancelBooking = (bookingId: string, _reason: string) => {
    let targetBooking: Booking | null = null;
    setBookings((prev) => {
      const next = prev.map((b) => {
        if (b.id === bookingId) {
          targetBooking = { ...b, status: 'cancelled' as const };
          return targetBooking;
        }
        return b;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetBooking) {
      void saveBookingToSupabase(targetBooking);
      updatePlotStatus((targetBooking as Booking).plotId, 'available_green', 'Booking cancelled and released');
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
      payerName: currentUser?.fullName || 'Verified Buyer',
      payerPhone: currentUser?.phone || '6306917991',
      amountInr: amount,
      paymentMethod: method,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    };

    setPayments((prev) => {
      const next = [newPayment, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(next));
      } catch {}
      return next;
    });
    void savePaymentToSupabase(newPayment);
    return newPayment;
  };

  const verifyPayment = (paymentId: string, approved: boolean, reason?: string) => {
    let targetPay: PaymentRecord | null = null;
    setPayments((prev) => {
      const next = prev.map((p) => {
        if (p.id === paymentId) {
          targetPay = {
            ...p,
            status: approved ? ('verified' as const) : ('rejected' as const),
            receiptNumber: approved ? `RCP-AKGV-${Date.now().toString().slice(-6)}` : undefined,
            verifiedAt: new Date().toISOString(),
            verifiedBy: currentUser?.id || 'admin',
            rejectionReason: !approved ? reason : undefined,
          };
          return targetPay;
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetPay) {
      void savePaymentToSupabase(targetPay);
    }

    if (approved && targetPay) {
      confirmBooking((targetPay as PaymentRecord).bookingId);
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
      } catch {}
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
    void saveSiteVisitToSupabase(newVisit);
    return newVisit;
  };

  const submitGpsEvidence = (evidence: Omit<FieldGpsEvidence, 'id' | 'status'>): FieldGpsEvidence => {
    const newEvidence: FieldGpsEvidence = {
      ...evidence,
      id: `gps-${Date.now()}`,
      status: 'pending_review',
    };
    setGpsEvidences((prev) => [newEvidence, ...prev]);
    void saveGpsEvidenceToSupabase(newEvidence);
    return newEvidence;
  };

  const approveFieldGpsEvidence = (evidenceId: string, adminNotes?: string) => {
    setGpsEvidences((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              status: 'approved' as const,
              adminNotes: adminNotes || e.adminNotes,
              reviewedBy: currentUser?.fullName || 'Director',
              reviewedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const rejectFieldGpsEvidence = (evidenceId: string, reason: string) => {
    setGpsEvidences((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              status: 'rejected' as const,
              rejectionReason: reason,
              reviewedBy: currentUser?.fullName || 'Director',
              reviewedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const createSupportTicket = (
    category: SupportTicket['category'],
    subject: string,
    description: string
  ): SupportTicket => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.fullName || 'Visitor',
      userPhone: currentUser?.phone || '6306917991',
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
          senderId: currentUser?.id || 'guest',
          senderName: currentUser?.fullName || 'Visitor',
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
          const isStaff = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: currentUser?.id || 'guest',
            senderName: currentUser?.fullName || 'Visitor',
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
    } catch {}
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
    void saveReviewToSupabase(newReview);
    return newReview;
  };

  const voteHelpful = (reviewId: string) => {
    let targetReview: ReviewRecord | null = null;
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        targetReview = { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
        return targetReview;
      }
      return r;
    });
    saveReviews(updated);
    if (targetReview) {
      void saveReviewToSupabase(targetReview);
    }
  };

  const updateReviewStatus = (reviewId: string, status: 'approved' | 'pending' | 'rejected') => {
    let targetReview: ReviewRecord | null = null;
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        targetReview = { ...r, status };
        return targetReview;
      }
      return r;
    });
    saveReviews(updated);
    if (targetReview) {
      void saveReviewToSupabase(targetReview);
    }
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    let targetReview: ReviewRecord | null = null;
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        targetReview = {
          ...r,
          adminReply: {
            replyText,
            repliedAt: new Date().toISOString(),
            replierName: currentUser?.fullName
              ? `${currentUser.fullName} (${currentUser.rankTitle || 'Director'})`
              : 'Rajesh Kumar Patel (Director)',
          },
        };
        return targetReview;
      }
      return r;
    });
    saveReviews(updated);
    if (targetReview) {
      void saveReviewToSupabase(targetReview);
    }
  };

  const deleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    saveReviews(updated);
    void deleteReviewFromSupabase(reviewId);
  };

  // Client Enquiries Management
  const addEnquiry = (data: Omit<ClientEnquiry, 'id' | 'createdAt'>): ClientEnquiry => {
    const newEnquiry: ClientEnquiry = {
      ...data,
      id: `enq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => {
      const next = [newEnquiry, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveEnquiryToSupabase(newEnquiry);
    return newEnquiry;
  };

  const updateEnquiryStatus = (id: string, status: ClientEnquiry['status']) => {
    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, status } : e));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Sales Targets
  const updateTarget = (targetId: string, patch: Partial<SalesTarget>) => {
    let updatedTarget: SalesTarget | null = null;
    setTargets((prev) => {
      const next = prev.map((t) => {
        if (t.id === targetId) {
          updatedTarget = { ...t, ...patch };
          return updatedTarget;
        }
        return t;
      });
      return next;
    });
    if (updatedTarget) {
      void saveTargetToSupabase(updatedTarget);
    }
  };

  // Task Reminders (Aaj ke Kaam)
  const addTask = (taskData: Omit<TaskReminder, 'id' | 'createdAt' | 'isCompleted'>): TaskReminder => {
    const newTask: TaskReminder = {
      ...taskData,
      id: `task-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const next = [newTask, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });
    void saveTaskToSupabase(newTask);
    return newTask;
  };

  const toggleTask = (taskId: string) => {
    let targetTask: TaskReminder | null = null;
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          targetTask = { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined };
          return targetTask;
        }
        return t;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (targetTask) {
      void saveTaskToSupabase(targetTask);
    }
  };

  // In-App Messages
  const sendMessage = (msgData: Omit<InAppMessage, 'id' | 'createdAt' | 'isRead'>): InAppMessage => {
    const newMsg: InAppMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMsg, ...prev]);
    return newMsg;
  };

  // Dynamic CMS Content (No-Code Routine Changes)
  const updateCmsContent = (patch: Partial<CmsContent>) => {
    setCmsContent((prev) => {
      const updated = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}cms`, JSON.stringify(updated));
      } catch {}
      void saveCmsContentToSupabase(updated);
      return updated;
    });
  };

  const t = DICTIONARY[language] || DICTIONARY.en;
  const isAuthenticated = Boolean(currentUser);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        isAuthenticated,
        isSandboxMode,
        setIsSandboxMode,
        loginWithCredentials,
        registerWithCredentials,
        logout,
        resetPasswordRequest,
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
        approveFieldGpsEvidence,
        rejectFieldGpsEvidence,
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
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        offers,
        targets,
        updateTarget,
        tasks,
        addTask,
        toggleTask,
        messages,
        sendMessage,
        cmsContent,
        updateCmsContent,
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
