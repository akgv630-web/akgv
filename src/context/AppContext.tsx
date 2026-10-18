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
  INITIAL_TASKS,
  INITIAL_MESSAGES
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
  fetchSiteVisitsFromSupabase,
  saveSiteVisitToSupabase,
  updateSiteVisitInSupabase,
  deleteSiteVisitFromSupabase,
  fetchProfilesFromSupabase,
  fetchProfileByAuthId,
  saveProfileToSupabase,
  deleteProfileFromSupabase,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  supabaseResetPassword,
  supabaseUpdatePassword,
  supabaseGetSession,
  supabaseOnAuthStateChange,
  callCreatePlotBookingAtomic,
  callVerifyPaymentAtomic,
  fetchGpsEvidenceFromSupabase,
  saveGpsEvidenceToSupabase,
  fetchEnquiriesFromSupabase,
  saveEnquiryToSupabase,
  updateEnquiryInSupabase,
  deleteEnquiryFromSupabase,
  fetchTargetsFromSupabase,
  saveTargetToSupabase,
  updateTargetInSupabase,
  deleteTargetFromSupabase,
  fetchTasksFromSupabase,
  saveTaskToSupabase,
  updateTaskInSupabase,
  deleteTaskFromSupabase,
  fetchInAppMessagesFromSupabase,
  saveInAppMessageToSupabase,
  markInAppMessageReadInSupabase,
  deleteInAppMessageFromSupabase,
  fetchCmsContentFromSupabase,
  saveCmsContentToSupabase,
  fetchOffersFromSupabase,
  resolveAndValidateSponsor
} from '@/lib/supabase/syncService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

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
  }) => Promise<{
    success: boolean;
    error?: string;
    emailConfirmationRequired?: boolean;
    profile?: Profile;
  }>;
  logout: () => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchUserRole: (role: UserRole) => void;
  allProfiles: Profile[];
  plots: Plot[];
  updatePlotStatus: (plotId: string, newStatus: PlotStatus, reason: string) => void;
  addPlot: (plotData: Omit<Plot, 'id'>) => Plot;
  updatePlot: (plotId: string, patch: Partial<Plot>) => void;
  deletePlot: (plotId: string) => void;
  bookings: Booking[];
  createBookingRequest: (plotId: string, buyerName: string, buyerPhone: string, houseModelId?: string) => Promise<Booking>;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
  payments: PaymentRecord[];
  submitPaymentProof: (bookingId: string, amount: number, txRef: string, method: 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE') => Promise<PaymentRecord>;
  verifyPayment: (paymentId: string, approved: boolean, reason?: string) => Promise<void>;
  kitIssues: JoiningKitIssue[];
  recordKitIssue: (data: Omit<JoiningKitIssue, 'id' | 'receiptNumber'>) => JoiningKitIssue;
  siteVisits: SiteVisit[];
  bookSiteVisit: (data: Omit<SiteVisit, 'id' | 'status' | 'createdAt'>) => SiteVisit;
  assignSiteVisit: (visitId: string, staffProfileId: string, staffName: string, staffMemberId?: string) => Promise<{ success: boolean; error?: string }>;
  updateSiteVisitStatus: (visitId: string, status: SiteVisit['status'], notes?: string) => Promise<{ success: boolean; error?: string }>;
  deleteSiteVisit: (visitId: string) => Promise<boolean>;
  gpsEvidences: FieldGpsEvidence[];
  submitGpsEvidence: (evidence: Omit<FieldGpsEvidence, 'id' | 'status'>) => Promise<FieldGpsEvidence>;
  approveFieldGpsEvidence: (evidenceId: string, adminNotes?: string) => Promise<void>;
  rejectFieldGpsEvidence: (evidenceId: string, reason: string) => Promise<void>;
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
    password?: string;
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
  assignEnquiry: (enquiryId: string, memberProfileId: string, memberName: string, memberId?: string) => Promise<{ success: boolean; error?: string }>;
  addEnquiryFollowUp: (enquiryId: string, summary: string, nextDate?: string) => Promise<{ success: boolean; error?: string }>;
  updateEnquiryStatus: (id: string, status: ClientEnquiry['status'], notes?: string) => Promise<{ success: boolean; error?: string }>;
  deleteEnquiry: (enquiryId: string) => Promise<boolean>;
  offers: OfferIncentive[];
  targets: SalesTarget[];
  updateTarget: (targetId: string, patch: Partial<SalesTarget>) => Promise<{ success: boolean; error?: string }>;
  assignTarget: (targetData: Omit<SalesTarget, 'id' | 'updatedAt'>) => Promise<SalesTarget>;
  deleteTarget: (targetId: string) => Promise<boolean>;
  tasks: TaskReminder[];
  addTask: (task: Omit<TaskReminder, 'id' | 'createdAt' | 'isCompleted'>) => Promise<TaskReminder>;
  updateTask: (taskId: string, patch: Partial<TaskReminder>) => Promise<{ success: boolean; error?: string }>;
  toggleTask: (taskId: string, completionNotes?: string) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (taskId: string) => Promise<boolean>;
  messages: InAppMessage[];
  sendMessage: (msg: Omit<InAppMessage, 'id' | 'createdAt' | 'isRead'>) => Promise<InAppMessage>;
  markMessageRead: (msgId: string) => Promise<boolean>;
  deleteMessage: (msgId: string) => Promise<boolean>;
  cmsContent: CmsContent;
  updateCmsContent: (patch: Partial<CmsContent>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'akgv_infra_';

function getInitialStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
      } else if (parsed && typeof parsed === 'object') {
        return parsed as unknown as T;
      }
    }
  } catch {}
  return fallback;
}

export function safeRedirectUrl(target: string | null | undefined, fallback: string = '/'): string {
  if (!target || typeof target !== 'string') return fallback;
  const trimmed = target.trim();
  // Reject absolute protocols, protocol-relative '//', or backslash injection
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }
  // Reject protocol prefix inside path before query
  const pathPart = trimmed.split('?')[0].split('#')[0];
  if (pathPart.includes(':')) {
    return fallback;
  }
  return trimmed;
}

export function generateUniqueMemberId(existingProfiles: Profile[]): string {
  const existingCodes = new Set(
    existingProfiles
      .map((p) => p.memberId?.trim().toUpperCase())
      .filter((id): id is string => Boolean(id))
  );

  let maxSeq = 1000;
  for (const code of existingCodes) {
    const match = code.match(/^AKGV-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq && num < 9999) {
        maxSeq = num;
      }
    }
  }

  let candidateNum = maxSeq + 1;
  let candidateCode = `AKGV-${candidateNum}`;
  while (existingCodes.has(candidateCode)) {
    candidateNum++;
    candidateCode = `AKGV-${candidateNum}`;
    if (candidateNum > 9999) {
      candidateCode = `AKGV-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!existingCodes.has(candidateCode)) break;
    }
  }
  return candidateCode;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`) as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'hinglish')) {
          return savedLang;
        }
      } catch {
        // ignore
      }
    }
    return 'en';
  });
  // Authoritative Security: Identity MUST NOT originate from editable localStorage.
  // currentUser initializes to null and resolves exclusively from a valid database/provider session.
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>(() => getInitialStorage('profiles', DEMO_PROFILES));
  const [plots, setPlots] = useState<Plot[]>(() => getInitialStorage('plots', INITIAL_PLOTS));
  const [bookings, setBookings] = useState<Booking[]>(() => getInitialStorage('bookings', INITIAL_BOOKINGS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getInitialStorage('payments', INITIAL_PAYMENTS));
  const [kitIssues, setKitIssues] = useState<JoiningKitIssue[]>(() => getInitialStorage('kit_issues', INITIAL_KIT_ISSUES));
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(() => getInitialStorage('site_visits', INITIAL_SITE_VISITS));
  const [gpsEvidences, setGpsEvidences] = useState<FieldGpsEvidence[]>(() => getInitialStorage('gps_evidence', INITIAL_GPS_EVIDENCE));
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => getInitialStorage('support_tickets', INITIAL_SUPPORT_TICKETS));
  const [reviews, setReviews] = useState<ReviewRecord[]>(() => getInitialStorage('reviews', INITIAL_REVIEWS));
  const [selectedPlotForViewer, setSelectedPlotForViewer] = useState<Plot | null>(INITIAL_PLOTS[3]);
  const [enquiries, setEnquiries] = useState<ClientEnquiry[]>(() => getInitialStorage('enquiries', INITIAL_ENQUIRIES));
  const [offers, setOffers] = useState<OfferIncentive[]>(() => getInitialStorage('offers', INITIAL_OFFERS));
  const [targets, setTargets] = useState<SalesTarget[]>(() => getInitialStorage('targets', INITIAL_TARGETS));
  const [tasks, setTasks] = useState<TaskReminder[]>(() => getInitialStorage('tasks', INITIAL_TASKS));
  const [messages, setMessages] = useState<InAppMessage[]>(() => getInitialStorage('messages', INITIAL_MESSAGES));
  const [cmsContent, setCmsContent] = useState<CmsContent>(() => getInitialStorage('cms', INITIAL_CMS_CONTENT));

  // Supabase Live Remote Sync (Non-blocking background sync)
  useEffect(() => {
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
          remoteOffers,
          remoteVisits,
          remoteMessages,
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
          fetchOffersFromSupabase(),
          fetchSiteVisitsFromSupabase(),
          fetchInAppMessagesFromSupabase(),
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
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(remoteEnquiries)); } catch {}
        }
        if (remoteTargets && remoteTargets.length > 0) {
          setTargets(remoteTargets);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}targets`, JSON.stringify(remoteTargets)); } catch {}
        }
        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(remoteTasks)); } catch {}
        }
        if (remoteVisits && remoteVisits.length > 0) {
          setSiteVisits(remoteVisits);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}site_visits`, JSON.stringify(remoteVisits)); } catch {}
        }
        if (remoteMessages && remoteMessages.length > 0) {
          setMessages(remoteMessages);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(remoteMessages)); } catch {}
        }
        if (remoteCms && remoteCms.heroHeadlineEn) {
          setCmsContent(remoteCms);
        }
        if (remoteOffers && remoteOffers.length > 0) {
          setOffers(remoteOffers);
        }

        // Authoritative Session Check: Authenticate strictly with active Supabase session
        if (authSession && authSession.user) {
          const profile = await fetchProfileByAuthId(authSession.user.id);
          if (profile && profile.isActive) {
            setCurrentUser(profile);
            try { localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(profile)); } catch {}
          } else {
            console.warn('[Supabase Auth] Profile not found or account deactivated.');
            setCurrentUser(null);
            try { localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`); } catch {}
          }
        } else {
          // If no active auth session exists, client state is unauthenticated
          setCurrentUser(null);
          try { localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`); } catch {}
        }
      } catch (err) {
        console.warn('[Supabase Sync] Remote hydration notice:', err);
      }
    }

    syncWithSupabase();

    const unsubscribeAuth = supabaseOnAuthStateChange(async (session) => {
      if (!session || !session.user) {
        // Session ended or logged out: wipe client authenticated identity immediately
        setCurrentUser(null);
        try { localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`); } catch {}
      } else {
        const profile = await fetchProfileByAuthId(session.user.id);
        if (profile && profile.isActive) {
          setCurrentUser(profile);
          try { localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(profile)); } catch {}
        } else {
          setCurrentUser(null);
          try { localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`); } catch {}
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
    } catch {
      // Ignore
    }
  };

  // Hardened Credentials Login with strict environment security boundaries
  const loginWithCredentials = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; profile?: Profile }> => {
    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      return { success: false, error: 'Please enter both login identifier and password.' };
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Authenticate with Supabase Auth Provider if configured
    if (isSupabaseConfigured) {
      try {
        const res = await supabaseSignIn(trimmedId, password);
        if (res?.error) {
          return {
            success: false,
            error: res.error.message || 'Invalid login credentials. Please verify your ID and password.'
          };
        }
        if (res?.data?.user) {
          const authUser = res.data.user;
          let profile = await fetchProfileByAuthId(authUser.id);

          // Self-healing profile reconciliation on login:
          // If an authenticated user exists in Supabase Auth but their database profile row is missing
          // (e.g. from an asynchronous registration flow or delayed email verification), reconstruct and persist it.
          if (!profile) {
            const userMeta = authUser.user_metadata || {};
            const fallbackName =
              (userMeta.full_name as string) ||
              (userMeta.name as string) ||
              authUser.email?.split('@')[0] ||
              'Registered User';
            const fallbackPhone = (userMeta.phone as string) || '';

            // Authoritative sponsor validation: Never trust user_metadata sponsor_id without verification
            let verifiedSponsorId: string | undefined = undefined;
            const candidateSponsor = typeof userMeta.sponsor_id === 'string' ? userMeta.sponsor_id.trim() : undefined;
            if (candidateSponsor) {
              const sponsorCheck = await resolveAndValidateSponsor(candidateSponsor, authUser.id, authUser.id);
              if (sponsorCheck.valid) {
                verifiedSponsorId = sponsorCheck.canonicalSponsorId;
              } else {
                console.warn('[Security Audit] Untrusted sponsor_id in user_metadata rejected during profile reconciliation:', candidateSponsor, sponsorCheck.error);
              }
            }

            const reconciledProfile: Profile = {
              id: authUser.id,
              authUserId: authUser.id,
              email: authUser.email || '',
              fullName: fallbackName,
              phone: fallbackPhone,
              role: 'buyer', // Reconciled public users are strictly assigned buyer role
              sponsorId: verifiedSponsorId,
              kycStatus: 'pending',
              isActive: true,
              permissions: undefined, // Client metadata cannot grant permissions
              createdAt: authUser.created_at || new Date().toISOString(),
            };

            const saveRes = await saveProfileToSupabase(reconciledProfile, authUser.id);
            if (saveRes.success) {
              profile = reconciledProfile;
              setAllProfiles((prev) => {
                const existingIdx = prev.findIndex(
                  (p) => p.id === reconciledProfile.id || p.email.toLowerCase() === reconciledProfile.email.toLowerCase()
                );
                if (existingIdx >= 0) {
                  const next = [...prev];
                  next[existingIdx] = reconciledProfile;
                  return next;
                }
                return [...prev, reconciledProfile];
              });
            }
          }

          if (!profile) {
            return { success: false, error: 'Database profile not found for this authenticated user. Access denied.' };
          }

          if (!profile.isActive) {
            return { success: false, error: 'Your account has been deactivated or suspended. Please contact company management.' };
          }

          setCurrentUser(profile);
          try {
            localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(profile));
          } catch {}
          return { success: true, profile };
        }
      } catch (err: unknown) {
        console.warn('[Supabase Auth Notice]', err);
        const errMsg = err instanceof Error ? err.message : 'Authentication service error.';
        return { success: false, error: errMsg };
      }
      return { success: false, error: 'Authentication failed. Please verify your credentials.' };
    }

    // In production, fallback logins without active provider are strictly prohibited
    if (isProduction) {
      return { success: false, error: 'Authentication provider is offline or not configured in production.' };
    }

    // 2. Offline / local test sandbox environment: strictly verify password without hardcoded bypass
    const found =
      allProfiles.find(
        (p) =>
          p.email.toLowerCase() === trimmedId.toLowerCase() ||
          p.phone === trimmedId ||
          (p.memberId && p.memberId.toLowerCase() === trimmedId.toLowerCase())
      ) ||
      DEMO_PROFILES.find(
        (p) =>
          p.email.toLowerCase() === trimmedId.toLowerCase() ||
          p.phone === trimmedId ||
          (p.memberId && p.memberId.toLowerCase() === trimmedId.toLowerCase())
      );

    if (found) {
      if (!found.isActive) {
        return { success: false, error: 'Your account has been deactivated or suspended. Please contact company management.' };
      }
      // Require genuine matching password in offline sandbox - never master backdoor
      const isAuthorizedPass = Boolean(found.password && found.password === password);

      if (isAuthorizedPass) {
        setCurrentUser(found);
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(found));
        } catch {}
        return { success: true, profile: found };
      } else {
        return { success: false, error: 'Incorrect password.' };
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
  }): Promise<{
    success: boolean;
    error?: string;
    emailConfirmationRequired?: boolean;
    profile?: Profile;
  }> => {
    // Security Enforcement: Public registrations are strictly forced to 'buyer' role
    // Associate member IDs, permissions, or admin/staff roles are prohibited
    const isProduction = process.env.NODE_ENV === 'production';
    const assignedRole: UserRole = 'buyer';

    const trimmedName = data.fullName.trim();
    const trimmedEmail = data.email.trim();
    const trimmedPhone = data.phone.trim();
    const trimmedPass = data.password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedPass) {
      return { success: false, error: 'All fields (name, email, phone, and password) are required.' };
    }

    if (trimmedPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (!isSupabaseConfigured) {
      if (isProduction) {
        return {
          success: false,
          error: 'Registration is currently unavailable. Authentication service is unconfigured.',
        };
      }
      return {
        success: false,
        error: 'Authentication provider is not configured. Please configure Supabase credentials.',
      };
    }

    // Authoritative sponsor validation against database - resolve canonical internal ID / memberId
    const sponsorTrimmed = data.sponsorId?.trim();
    let verifiedSponsorId: string | undefined = undefined;
    if (sponsorTrimmed) {
      const sponsorResult = await resolveAndValidateSponsor(sponsorTrimmed);
      if (!sponsorResult.valid) {
        return {
          success: false,
          error: sponsorResult.error || 'Invalid sponsor code. The specified sponsor ID does not exist or is inactive.',
        };
      }
      verifiedSponsorId = sponsorResult.canonicalSponsorId;
    }

    // 1. Attempt Supabase Auth Registration
    let authUser: { id: string; email?: string } | null = null;
    let authSession: unknown = null;

    try {
      const res = await supabaseSignUp({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: trimmedPass,
        role: assignedRole,
        sponsorId: verifiedSponsorId,
      });

      if (res?.error) {
        return {
          success: false,
          error: res.error.message || 'Registration failed on authentication provider.',
        };
      }

      if (!res?.data?.user) {
        return {
          success: false,
          error: 'Registration failed on authentication provider. No user returned.',
        };
      }

      authUser = res.data.user;
      authSession = res.data.session;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed on authentication provider.';
      return { success: false, error: msg };
    }

    const authUserId = authUser.id;

    // Buyer registrations NEVER assign an associate memberId, joining kit, or elevated permissions
    const newProfile: Profile = {
      id: authUserId,
      authUserId: authUserId,
      email: trimmedEmail,
      fullName: trimmedName,
      phone: trimmedPhone,
      role: assignedRole,
      memberId: undefined, // Buyers are customer accounts, not MLM network associates
      sponsorId: verifiedSponsorId,
      city: data.city || 'Varanasi',
      branchLocation: data.branchLocation || 'Rampur Head Office',
      kycStatus: 'pending',
      isActive: true,
      permissions: undefined, // No elevated staff permissions
      createdAt: new Date().toISOString(),
    };

    // Await and verify profile persistence in Supabase
    const saveRes = await saveProfileToSupabase(newProfile, authUserId);
    if (!saveRes.success) {
      console.warn('[Supabase Sync] Profile persistence notice on signup:', saveRes.error);
      return {
        success: false,
        error: saveRes.error || 'Account created in authentication service, but database profile creation failed. Please contact support.',
      };
    }

    // Update local cached profiles list
    setAllProfiles((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.id === newProfile.id || p.email.toLowerCase() === newProfile.email.toLowerCase()
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newProfile;
        return next;
      }
      const next = [...prev, newProfile];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Check if email confirmation is required (session is null when email confirmation is enabled)
    if (!authSession) {
      // Do NOT set currentUser or write to localStorage without an active authenticated session!
      return {
        success: true,
        emailConfirmationRequired: true,
        profile: newProfile,
      };
    }

    // Only set currentUser when there is an active authenticated session
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

  const updatePassword = async (newPassword: string) => {
    const res = await supabaseUpdatePassword(newPassword);
    if (res && res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true };
  };

  const loginUser = (identifier: string): Profile | null => {
    if (process.env.NODE_ENV === 'production' || isSupabaseConfigured) {
      console.warn('[Security] Quick-login bypass is disabled when authentication provider is active or in production builds.');
      return null;
    }
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
    if (process.env.NODE_ENV === 'production' || isSupabaseConfigured) {
      console.warn('[Security] Role switching is strictly disabled when authentication provider is active or in production builds.');
      return;
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const assignedRole: UserRole = isAdmin ? (data.role || 'junior_member') : 'buyer';
    const newMemberId = generateUniqueMemberId(allProfiles);
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: assignedRole,
      memberId: newMemberId,
      sponsorId: data.sponsorId,
      kycStatus: isAdmin ? 'verified' : 'pending',
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
    password?: string;
  }): Profile => {
    // Authorization Check: Must be admin or authorized senior member
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const isAuthorizedSenior = currentUser?.role === 'senior_member' && Boolean(currentUser?.permissions?.canCreateDownline);

    if (!isAdmin && !isAuthorizedSenior) {
      throw new Error('Access denied: You do not have permission to register network members.');
    }

    // Role Escalation Prevention: Non-admin seniors may ONLY onboard junior_members
    let assignedRole: UserRole = data.role;
    if (!isAdmin) {
      assignedRole = 'junior_member';
    }

    // Hierarchy Check: Non-admin seniors must be the direct sponsor of their onboarded recruits
    let effectiveSponsorId = data.sponsorId;
    if (!isAdmin && currentUser?.memberId) {
      effectiveSponsorId = currentUser.memberId;
    }

    const newMemberId = generateUniqueMemberId(allProfiles);
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.slice(0, 10);

    const defaultLevel = data.level || (assignedRole === 'senior_member' ? 4 : assignedRole === 'sub_admin' ? 5 : 1);
    const defaultRank =
      data.rankTitle ||
      (assignedRole === 'super_admin'
        ? 'Director'
        : assignedRole === 'sub_admin'
        ? 'Platinum Leader'
        : assignedRole === 'senior_member'
        ? 'Diamond Star'
        : assignedRole === 'buyer'
        ? 'Verified Client'
        : 'Sales Assistant');

    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: assignedRole,
      memberId: newMemberId,
      sponsorId: effectiveSponsorId,
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
      invitationStatus: 'pending',
      invitationSentAt: nowIso,
      invitedBy: currentUser?.id,
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const isSelf = currentUser?.id === id;

    if (!isAdmin && !isSelf) {
      throw new Error('Access denied: You cannot modify another user profile.');
    }

    // Privilege Escalation Prevention: Non-admin users cannot alter privileged administrative fields
    const sanitizedData: Partial<Profile> = { ...data };
    if (!isAdmin) {
      delete sanitizedData.role;
      delete sanitizedData.kycStatus;
      delete sanitizedData.isActive;
      delete sanitizedData.permissions;
      delete sanitizedData.level;
      delete sanitizedData.rankTitle;
      delete sanitizedData.totalBusinessVolumeInr;
      delete sanitizedData.plotsClosedCount;
    }

    let updatedMember: Profile | null = null;
    setAllProfiles((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          updatedMember = { ...p, ...sanitizedData };
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
      setCurrentUser((prev) => (prev ? { ...prev, ...sanitizedData } : null));
    }
  };

  const deleteMember = (id: string) => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can remove members.');
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can toggle account activation status.');
    }
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

  const setPlotStatusInternal = (plotId: string, newStatus: PlotStatus, reason?: string) => {
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
      if (reason) {
        console.info(`[PlotStatus] Plot ${plotId} status changed to ${newStatus}: ${reason}`);
      }
      void savePlotToSupabase(targetPlot);
    }
  };

  const updatePlotStatus = (plotId: string, newStatus: PlotStatus, reason?: string) => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can manually update plot statuses.');
    }
    setPlotStatusInternal(plotId, newStatus, reason);
  };

  const addPlot = (plotData: Omit<Plot, 'id'>): Plot => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can add new plots.');
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can edit plot configurations.');
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete plots.');
    }
    setPlots((prev) => {
      const updated = prev.filter((p) => p.id !== plotId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}plots`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    void deletePlotFromSupabase(plotId);
  };

  const createBookingRequest = async (
    plotId: string,
    buyerName: string,
    buyerPhone: string,
    houseModelId?: string
  ): Promise<Booking> => {
    if (!currentUser?.id) {
      throw new Error('Authentication required: You must be signed in to submit a plot booking request.');
    }

    const plot = plots.find((p) => p.id === plotId);
    if (!plot) throw new Error('Plot not found');

    if (plot.status !== 'available_green') {
      throw new Error(`Plot ${plot.plotNumber} is not available for booking (status: ${plot.status}).`);
    }

    const existingActiveBooking = bookings.find(
      (b) => b.plotId === plotId && ['confirmed', 'under_review', 'hold', 'pending'].includes(b.status)
    );
    if (existingActiveBooking) {
      throw new Error(`Plot ${plot.plotNumber} already has an active reservation (${existingActiveBooking.bookingNumber}).`);
    }

    const buyerId = currentUser.id;
    const totalAmount = plot.basePriceInr || 1500000;

    // Call atomic RPC if Supabase is connected
    const rpcRes = await callCreatePlotBookingAtomic({
      plotId,
      buyerId,
      buyerName,
      buyerPhone,
      totalAmount,
      sponsorId: currentUser?.sponsorId,
      houseModelId,
    });

    if (rpcRes.error) {
      if (isSupabaseConfigured) {
        throw new Error(rpcRes.error.message || 'Plot booking failed via server RPC.');
      }
    } else if (rpcRes.data && !rpcRes.data.success) {
      throw new Error(rpcRes.data.error || 'Plot booking failed.');
    }

    const bookingId = rpcRes.data?.booking_id || `bk-${Date.now()}`;
    const bookingNumber = rpcRes.data?.booking_number || `BK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const holdExpiresAt = rpcRes.data?.hold_expires_at || new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    const newBooking: Booking = {
      id: bookingId,
      bookingNumber,
      plotId,
      plotNumber: plot.plotNumber,
      buyerId,
      buyerName,
      buyerPhone,
      sponsorId: currentUser?.sponsorId,
      status: 'pending',
      houseModelId,
      totalAmountInr: totalAmount,
      paidAmountInr: 0,
      holdExpiresAt,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => {
      const next = [newBooking, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setPlotStatusInternal(plotId, 'hold_pending', 'Booking request initiated by buyer');
    return newBooking;
  };

  const confirmBooking = (bookingId: string) => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can confirm bookings.');
    }
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
      setPlotStatusInternal((targetBooking as Booking).plotId, 'booked_yellow', 'Booking confirmed by administrator');
    }
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) throw new Error('Booking not found');
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const isOwner = currentUser?.id && target.buyerId === currentUser.id;
    if (!isAdmin && !isOwner) {
      throw new Error('Access denied: You can only cancel your own bookings.');
    }

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
      if (reason) {
        console.info(`[Booking] Booking ${bookingId} cancelled: ${reason}`);
      }
      void saveBookingToSupabase(targetBooking);
      setPlotStatusInternal((targetBooking as Booking).plotId, 'available_green', reason || 'Booking cancelled and released');
    }
  };

  const submitPaymentProof = async (
    bookingId: string,
    amount: number,
    txRef: string,
    method: 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE'
  ): Promise<PaymentRecord> => {
    if (!currentUser?.id) {
      throw new Error('Authentication required: You must be logged in to submit payment proof.');
    }
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount: Amount must be greater than zero.');
    }
    if (!txRef || !txRef.trim()) {
      throw new Error('Transaction reference number is required.');
    }
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin && booking.buyerId !== currentUser.id) {
      throw new Error('Unauthorized: You can only submit payment proofs for your own bookings.');
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionRef: txRef.trim(),
      bookingId,
      plotNumber: booking.plotNumber || 'A-01',
      payerId: currentUser.id,
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
      } catch {}
      return next;
    });
    await savePaymentToSupabase(newPayment);
    return newPayment;
  };

  const verifyPayment = async (paymentId: string, approved: boolean, reason?: string): Promise<void> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const canVerify = isAdmin || Boolean(currentUser?.permissions?.canVerifyPayments);

    if (!canVerify) {
      throw new Error('Access denied: Only authorized administrators or finance managers can verify payments.');
    }

    const existingPayment = payments.find((p) => p.id === paymentId);
    if (!existingPayment) {
      throw new Error('Payment record not found.');
    }

    // Separation of Duties: An administrator or agent cannot approve their own payment proof
    const isSelfApproval =
      (currentUser?.id && existingPayment.payerId === currentUser.id) ||
      (currentUser?.fullName && existingPayment.payerName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()) ||
      (currentUser?.phone && existingPayment.payerPhone && currentUser.phone === existingPayment.payerPhone);

    if (isSelfApproval) {
      throw new Error('Separation of duties violation: An administrator or agent cannot approve their own payment proof.');
    }

    let receiptNum = existingPayment.receiptNumber;
    if (approved && !receiptNum) {
      receiptNum = `RCP-AKGV-${Date.now().toString().slice(-6)}`;
    }

    if (isSupabaseConfigured) {
      const rpcRes = await callVerifyPaymentAtomic({
        paymentId,
        approved,
        reason,
      });

      if (rpcRes.error) {
        throw new Error(rpcRes.error.message || 'Payment verification failed on server.');
      }
      if (rpcRes.data && !rpcRes.data.success) {
        throw new Error(rpcRes.data.error || 'Payment verification failed.');
      }
      if (rpcRes.data?.receipt_number) {
        receiptNum = rpcRes.data.receipt_number;
      }
    }

    const nowIso = new Date().toISOString();

    setPayments((prev) => {
      const next = prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: approved ? ('verified' as const) : ('rejected' as const),
            receiptNumber: approved ? receiptNum : undefined,
            verifiedAt: nowIso,
            verifiedBy: currentUser?.fullName || currentUser?.id || 'admin',
            rejectionReason: !approved ? reason : undefined,
          };
        }
        return p;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (approved) {
      // Transition booking to confirmed and update paid amount
      setBookings((prev) => {
        const next = prev.map((b) => {
          if (b.id === existingPayment.bookingId) {
            return {
              ...b,
              status: 'confirmed' as const,
              paidAmountInr: (b.paidAmountInr || 0) + existingPayment.amountInr,
              confirmedAt: nowIso,
            };
          }
          return b;
        });
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(next));
        } catch {}
        return next;
      });

      // Transition plot to booked_yellow
      const booking = bookings.find((b) => b.id === existingPayment.bookingId);
      if (booking) {
        setPlotStatusInternal(booking.plotId, 'booked_yellow', `Payment verified and receipt ${receiptNum} issued`);
      }
    }
  };

  const recordKitIssue = (data: Omit<JoiningKitIssue, 'id' | 'receiptNumber'>): JoiningKitIssue => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can record joining kit issues.');
    }
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
      buyerId: data.buyerId || currentUser?.id,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSiteVisits((prev) => {
      const next = [newVisit, ...prev];
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}site_visits`, JSON.stringify(next)); } catch {}
      return next;
    });
    void saveSiteVisitToSupabase(newVisit);

    // Automatically generate an urgent administrative action task so the booking is immediately visible and actionable
    const adminTask: TaskReminder = {
      id: `task-admin-sv-${newVisit.id}`,
      assigneeId: 'usr-admin-01',
      assignedToMemberId: 'AKGV-HQ-001',
      assignedToName: 'Admin Desk',
      title: `Assign Site Visit: ${newVisit.visitorName} (${newVisit.locationName})`,
      description: `New visit booked on website. Visitor: ${newVisit.visitorName} (Phone: ${newVisit.visitorPhone}). Preferred Date: ${newVisit.preferredDate} ${newVisit.preferredTimeSlot || ''}. Pickup: ${newVisit.pickupRequired ? 'Required' : 'No'}. Assign a field associate immediately.`,
      category: 'site_visit',
      relatedRecordType: 'site_visit',
      relatedRecordId: newVisit.id,
      targetRoute: `/admin?tab=site_visits&id=${newVisit.id}`,
      dueDate: newVisit.preferredDate || new Date().toISOString().split('T')[0],
      dueTime: newVisit.preferredTimeSlot ? newVisit.preferredTimeSlot.split('-')[0].trim() : '11:00 AM',
      priority: 'urgent',
      status: 'pending',
      isCompleted: false,
      createdBy: 'system',
      createdByName: 'Website Public Booking',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const next = [adminTask, ...prev];
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next)); } catch {}
      return next;
    });
    void saveTaskToSupabase(adminTask);

    return newVisit;
  };

  const assignSiteVisit = async (
    visitId: string,
    staffProfileId: string,
    staffName: string,
    staffMemberId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only administrators can assign site visits.' };
    }

    const patch: Partial<SiteVisit> = {
      assignedStaffId: staffProfileId,
      assignedStaffName: staffName,
      assignedStaffMemberId: staffMemberId,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    };

    setSiteVisits((prev) => {
      const next = prev.map((v) => (v.id === visitId ? { ...v, ...patch } : v));
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}site_visits`, JSON.stringify(next)); } catch {}
      return next;
    });

    // Automatically create / sync high-priority task for assigned member
    const visit = siteVisits.find((v) => v.id === visitId);
    const visitorTitle = visit ? `Site Visit Escort: ${visit.visitorName} (${visit.locationName})` : `Site Visit Escort: #${visitId}`;
    const visitDesc = visit
      ? `Client: ${visit.visitorName} (Phone: ${visit.visitorPhone}). Date: ${visit.preferredDate} (${visit.preferredTimeSlot || 'Standard'}). Pickup: ${visit.pickupRequired ? 'Required' : 'Self-arrival'}. Notes: ${visit.notes || 'None'}`
      : `Coordinate and escort customer for site visit inspection.`;

    const generatedTask: TaskReminder = {
      id: `task-sv-${visitId}`,
      assigneeId: staffProfileId,
      assignedToMemberId: staffMemberId || staffProfileId,
      assignedToName: staffName,
      title: visitorTitle,
      description: visitDesc,
      category: 'site_visit',
      relatedRecordType: 'site_visit',
      relatedRecordId: visitId,
      targetRoute: `/member?tab=site_visits&id=${visitId}`,
      dueDate: visit?.preferredDate || new Date().toISOString().split('T')[0],
      dueTime: visit?.preferredTimeSlot ? visit.preferredTimeSlot.split('-')[0].trim() : '11:00 AM',
      priority: 'high',
      status: 'pending',
      isCompleted: false,
      createdBy: currentUser?.id || 'usr-admin-01',
      createdByName: currentUser?.fullName || 'Admin Desk',
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => {
      const filtered = prev.filter((t) => t.relatedRecordId !== visitId && t.id !== `task-sv-${visitId}`);
      const next = [generatedTask, ...filtered];
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next)); } catch {}
      return next;
    });
    void saveTaskToSupabase(generatedTask);

    const ok = await updateSiteVisitInSupabase(visitId, patch);
    return ok ? { success: true } : { success: false, error: 'Failed to persist site visit assignment to database.' };
  };

  const updateSiteVisitStatus = async (
    visitId: string,
    status: SiteVisit['status'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const patch: Partial<SiteVisit> = {
      status,
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString(),
    };

    setSiteVisits((prev) => {
      const next = prev.map((v) => (v.id === visitId ? { ...v, ...patch } : v));
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}site_visits`, JSON.stringify(next)); } catch {}
      return next;
    });

    const ok = await updateSiteVisitInSupabase(visitId, patch);
    return ok ? { success: true } : { success: false, error: 'Failed to update site visit status in database.' };
  };

  const deleteSiteVisit = async (visitId: string): Promise<boolean> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete site visits.');
    }
    setSiteVisits((prev) => {
      const next = prev.filter((v) => v.id !== visitId);
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}site_visits`, JSON.stringify(next)); } catch {}
      return next;
    });
    return await deleteSiteVisitFromSupabase(visitId);
  };

  const submitGpsEvidence = async (evidence: Omit<FieldGpsEvidence, 'id' | 'status'>): Promise<FieldGpsEvidence> => {
    if (!currentUser) {
      throw new Error('Unauthorized: Authentication required to submit field GPS evidence.');
    }
    const newEvidence: FieldGpsEvidence = {
      ...evidence,
      id: `gps-${Date.now()}`,
      status: 'pending_review',
    };
    setGpsEvidences((prev) => [newEvidence, ...prev]);
    await saveGpsEvidenceToSupabase(newEvidence);
    return newEvidence;
  };

  const approveFieldGpsEvidence = async (evidenceId: string, adminNotes?: string): Promise<void> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can approve field GPS evidence.');
    }
    let updatedEvidence: FieldGpsEvidence | null = null;
    setGpsEvidences((prev) =>
      prev.map((e) => {
        if (e.id === evidenceId) {
          updatedEvidence = {
            ...e,
            status: 'approved' as const,
            adminNotes: adminNotes || e.adminNotes,
            reviewedBy: currentUser?.fullName || 'Director',
            reviewedAt: new Date().toISOString(),
          };
          return updatedEvidence;
        }
        return e;
      })
    );
    if (updatedEvidence) {
      await saveGpsEvidenceToSupabase(updatedEvidence);
    }
  };

  const rejectFieldGpsEvidence = async (evidenceId: string, reason: string): Promise<void> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can reject field GPS evidence.');
    }
    let updatedEvidence: FieldGpsEvidence | null = null;
    setGpsEvidences((prev) =>
      prev.map((e) => {
        if (e.id === evidenceId) {
          updatedEvidence = {
            ...e,
            status: 'rejected' as const,
            rejectionReason: reason,
            reviewedBy: currentUser?.fullName || 'Director',
            reviewedAt: new Date().toISOString(),
          };
          return updatedEvidence;
        }
        return e;
      })
    );
    if (updatedEvidence) {
      await saveGpsEvidenceToSupabase(updatedEvidence);
    }
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
    if (!currentUser) {
      throw new Error('Unauthorized: Authentication required to reply to support tickets.');
    }
    const isStaff = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const targetTicket = supportTickets.find((t) => t.id === ticketId);
    if (!targetTicket) {
      throw new Error('Ticket not found.');
    }
    if (!isStaff && targetTicket.userId !== currentUser.id) {
      throw new Error("Access denied: You cannot reply to another user's support ticket.");
    }
    const safeInternalNote = isStaff && Boolean(isInternalNote);

    setSupportTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.fullName || 'Member',
            isStaff,
            isInternalNote: safeInternalNote,
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const newReview: ReviewRecord = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      status: isAdmin ? 'approved' : 'pending',
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can update review status.');
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can reply to reviews.');
    }
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
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete reviews.');
    }
    const updated = reviews.filter((r) => r.id !== reviewId);
    saveReviews(updated);
    void deleteReviewFromSupabase(reviewId);
  };

  // Client Enquiries Management
  const addEnquiry = (data: Omit<ClientEnquiry, 'id' | 'createdAt'>): ClientEnquiry => {
    const newEnquiry: ClientEnquiry = {
      ...data,
      id: `enq-${Date.now()}`,
      status: data.status || 'new',
      createdAt: new Date().toISOString(),
      followUps: data.followUps || [],
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

  const assignEnquiry = async (
    enquiryId: string,
    memberProfileId: string,
    memberName: string,
    memberId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only administrators can assign enquiries.' };
    }

    const patch: Partial<ClientEnquiry> = {
      assignedProfileId: memberProfileId,
      assignedMemberId: memberId || memberProfileId,
      assignedMemberName: memberName,
    };

    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === enquiryId ? { ...e, ...patch } : e));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Automatically create / sync high-priority task for assigned member
    const enq = enquiries.find((e) => e.id === enquiryId);
    const enqTitle = enq ? `Client Lead Follow-up: ${enq.clientName}` : `Client Lead Follow-up: #${enquiryId}`;
    const enqDesc = enq
      ? `Client: ${enq.clientName} (Phone: ${enq.clientPhone}). Budget: ₹${enq.budgetInr ? (enq.budgetInr / 100000).toFixed(1) + ' Lakh' : 'Flexible'}. Notes: ${enq.notes || 'Interested customer lead'}`
      : `Follow up with customer lead.`;

    const generatedTask: TaskReminder = {
      id: `task-enq-${enquiryId}`,
      assigneeId: memberProfileId,
      assignedToMemberId: memberId || memberProfileId,
      assignedToName: memberName,
      title: enqTitle,
      description: enqDesc,
      category: 'client_followup',
      relatedRecordType: 'enquiry',
      relatedRecordId: enquiryId,
      targetRoute: `/member?tab=enquiries&id=${enquiryId}`,
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '12:00 PM',
      priority: 'urgent',
      status: 'pending',
      isCompleted: false,
      createdBy: currentUser?.id || 'usr-admin-01',
      createdByName: currentUser?.fullName || 'Admin Desk',
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => {
      const filtered = prev.filter((t) => t.relatedRecordId !== enquiryId && t.id !== `task-enq-${enquiryId}`);
      const next = [generatedTask, ...filtered];
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next)); } catch {}
      return next;
    });
    void saveTaskToSupabase(generatedTask);

    const ok = await updateEnquiryInSupabase(enquiryId, patch);
    return ok ? { success: true } : { success: false, error: 'Failed to persist enquiry assignment.' };
  };

  const addEnquiryFollowUp = async (
    enquiryId: string,
    summary: string,
    nextDate?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = enquiries.find((e) => e.id === enquiryId);
    if (!target) return { success: false, error: 'Enquiry not found.' };

    const newFollowUp = {
      id: `flw-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      summary,
      nextFollowUpDate: nextDate,
    };
    const updatedFollowUps = [...(target.followUps || []), newFollowUp];
    const patch: Partial<ClientEnquiry> = {
      followUps: updatedFollowUps,
      status: target.status === 'new' ? 'contacted' : target.status,
    };

    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === enquiryId ? { ...e, ...patch } : e));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });

    const ok = await updateEnquiryInSupabase(enquiryId, patch);
    return ok ? { success: true } : { success: false, error: 'Failed to persist follow-up note.' };
  };

  const updateEnquiryStatus = async (
    id: string,
    status: ClientEnquiry['status'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const isStaff = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin' || currentUser?.role === 'senior_member' || currentUser?.role === 'junior_member';
    if (!isStaff) {
      throw new Error('Access denied: Only staff can update enquiry status.');
    }
    const patch: Partial<ClientEnquiry> = {
      status,
      ...(notes !== undefined ? { notes } : {}),
    };

    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });

    const ok = await updateEnquiryInSupabase(id, patch);
    return ok ? { success: true } : { success: false, error: 'Failed to update enquiry status in database.' };
  };

  const deleteEnquiry = async (enquiryId: string): Promise<boolean> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete enquiries.');
    }
    setEnquiries((prev) => {
      const next = prev.filter((e) => e.id !== enquiryId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}enquiries`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return await deleteEnquiryFromSupabase(enquiryId);
  };

  // Sales Targets
  const updateTarget = async (
    targetId: string,
    patch: Partial<SalesTarget>
  ): Promise<{ success: boolean; error?: string }> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      return { success: false, error: 'Access denied: Only administrators can update sales targets.' };
    }
    let updatedTarget: SalesTarget | null = null;
    setTargets((prev) => {
      const next = prev.map((t) => {
        if (t.id === targetId) {
          updatedTarget = { ...t, ...patch, updatedAt: new Date().toISOString() };
          return updatedTarget;
        }
        return t;
      });
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}targets`, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (updatedTarget) {
      const ok = await saveTargetToSupabase(updatedTarget);
      return ok ? { success: true } : { success: false, error: 'Failed to persist target changes.' };
    }
    return { success: false, error: 'Target not found.' };
  };

  const assignTarget = async (
    targetData: Omit<SalesTarget, 'id' | 'updatedAt'>
  ): Promise<SalesTarget> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can assign sales targets.');
    }
    const newTarget: SalesTarget = {
      ...targetData,
      id: `tgt-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setTargets((prev) => {
      const next = [newTarget, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}targets`, JSON.stringify(next));
      } catch {}
      return next;
    });
    await saveTargetToSupabase(newTarget);
    return newTarget;
  };

  const deleteTarget = async (targetId: string): Promise<boolean> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete sales targets.');
    }
    setTargets((prev) => {
      const next = prev.filter((t) => t.id !== targetId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}targets`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return await deleteTargetFromSupabase(targetId);
  };

  // Task Reminders (Aaj ke Kaam)
  const addTask = async (
    taskData: Omit<TaskReminder, 'id' | 'createdAt' | 'isCompleted'>
  ): Promise<TaskReminder> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    const isSelfTask = currentUser && (
      taskData.assigneeId === currentUser.id ||
      taskData.assigneeId === currentUser.memberId ||
      taskData.assignedToMemberId === currentUser.memberId ||
      taskData.assignedToMemberId === currentUser.id
    );
    if (!isAdmin && !isSelfTask) {
      throw new Error('Access denied: Members can create personal tasks for themselves, or administrators can assign tasks.');
    }
    const newTask: TaskReminder = {
      ...taskData,
      id: `task-${Date.now()}`,
      assigneeId: taskData.assigneeId || taskData.assignedToMemberId,
      status: taskData.status || 'pending',
      isCompleted: false,
      createdBy: currentUser?.id || 'usr-admin-01',
      createdByName: currentUser?.fullName || 'Admin Desk',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const next = [newTask, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });
    const ok = await saveTaskToSupabase(newTask);
    if (!ok) {
      console.warn('[AppContext] saveTask notice: database sync offline or table pending');
    }
    return newTask;
  };

  const updateTask = async (
    taskId: string,
    patch: Partial<TaskReminder>
  ): Promise<{ success: boolean; error?: string }> => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });

    return await updateTaskInSupabase(taskId, patch);
  };

  const toggleTask = async (
    taskId: string,
    completionNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return { success: false, error: 'Task not found.' };

    const newCompleted = !target.isCompleted;
    const patch: Partial<TaskReminder> = {
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
      status: newCompleted ? 'completed' : 'in_progress',
      ...(completionNotes !== undefined ? { completionNotes } : {}),
    };

    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Synchronize underlying records if this task was linked to a site visit or enquiry
    if (target.relatedRecordType === 'site_visit' && target.relatedRecordId) {
      void updateSiteVisitStatus(target.relatedRecordId, newCompleted ? 'completed' : 'confirmed', completionNotes);
    }
    if (target.relatedRecordType === 'enquiry' && target.relatedRecordId) {
      void updateEnquiryStatus(target.relatedRecordId, newCompleted ? 'visit_scheduled' : 'contacted');
      if (completionNotes) {
        void addEnquiryFollowUp(target.relatedRecordId, completionNotes);
      }
    }

    return await updateTaskInSupabase(taskId, patch);
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete tasks.');
    }
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return await deleteTaskFromSupabase(taskId);
  };

  // In-App Messages
  const sendMessage = async (
    msgData: Omit<InAppMessage, 'id' | 'createdAt' | 'isRead'>
  ): Promise<InAppMessage> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can broadcast or send messages.');
    }
    const newMsg: InAppMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      senderName: msgData.senderName || currentUser?.fullName || 'AKGV Corporate Desk',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => {
      const next = [newMsg, ...prev];
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(next));
      } catch {}
      return next;
    });
    await saveInAppMessageToSupabase(newMsg);
    return newMsg;
  };

  const markMessageRead = async (msgId: string): Promise<boolean> => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.id === msgId ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
      );
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return await markInAppMessageReadInSupabase(msgId);
  };

  const deleteMessage = async (msgId: string): Promise<boolean> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can delete messages.');
    }
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== msgId);
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}messages`, JSON.stringify(next));
      } catch {}
      return next;
    });
    return await deleteInAppMessageFromSupabase(msgId);
  };

  // Dynamic CMS Content (No-Code Routine Changes)
  const updateCmsContent = async (patch: Partial<CmsContent>): Promise<void> => {
    const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
    if (!isAdmin) {
      throw new Error('Access denied: Only administrators can update CMS content.');
    }
    const updated: CmsContent = {
      ...cmsContent,
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.fullName || 'Director (Rajesh Kumar Patel)'
    };
    setCmsContent(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}cms`, JSON.stringify(updated));
    } catch {}
    await saveCmsContentToSupabase(updated);
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
        updatePassword,
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
        assignSiteVisit,
        updateSiteVisitStatus,
        deleteSiteVisit,
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
        assignEnquiry,
        addEnquiryFollowUp,
        updateEnquiryStatus,
        deleteEnquiry,
        offers,
        targets,
        updateTarget,
        assignTarget,
        deleteTarget,
        tasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        messages,
        sendMessage,
        markMessageRead,
        deleteMessage,
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
