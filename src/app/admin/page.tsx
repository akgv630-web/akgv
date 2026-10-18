'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  Filter,
  HelpCircle,
  Home,
  Key,
  Layers,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  Plus,
  Power,
  Receipt,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
  CheckSquare,
  Car,
  Target,
  Camera,
  Megaphone,
  Globe,
  Radio,
  MessageSquare
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';
import { KycStatus, Plot, PlotStatus, Profile, UserRole } from '@/types';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';
import { PlotManagementModal } from '@/components/admin/PlotManagementModal';
import { AdminTaskCenter } from '@/components/admin/AdminTaskCenter';
import { AdminEnquiriesTab } from '@/components/admin/AdminEnquiriesTab';
import { AdminSiteVisitsTab } from '@/components/admin/AdminSiteVisitsTab';
import { AdminTargetsTab } from '@/components/admin/AdminTargetsTab';
import { AdminFieldGpsTab } from '@/components/admin/AdminFieldGpsTab';
import { AdminBroadcastTab } from '@/components/admin/AdminBroadcastTab';
import { AdminCmsTab } from '@/components/admin/AdminCmsTab';
import { AuthBarrier, UnauthorizedBarrier } from '@/components/auth/AuthBarrier';
import { COMMISSION_LEVELS_GROUND_TRUTH } from '@/data/groundTruth';
import { serverInviteMember, supabaseGetSession } from '@/lib/supabase/syncService';

function formatTenure(dateStr?: string): { joinedFormatted: string; tenureFormatted: string } {
  if (!dateStr) return { joinedFormatted: 'Recent', tenureFormatted: 'Active' };
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { joinedFormatted: 'Recent', tenureFormatted: 'Active' };

  const now = new Date();
  const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  const joinedFormatted = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let tenureFormatted = '';
  if (diffMonths >= 12) {
    const yrs = Math.floor(diffMonths / 12);
    const rem = diffMonths % 12;
    tenureFormatted = rem > 0 ? `${yrs}y ${rem}m active` : `${yrs} yr active`;
  } else if (diffMonths >= 1) {
    tenureFormatted = `${diffMonths} mo${diffMonths > 1 ? 's' : ''} active`;
  } else if (diffDays >= 1) {
    tenureFormatted = `${diffDays} day${diffDays > 1 ? 's' : ''} active`;
  } else {
    tenureFormatted = 'Joined today';
  }

  return { joinedFormatted, tenureFormatted };
}

function formatBusinessVolume(amountInr?: number): string {
  if (!amountInr || amountInr === 0) return '₹0';
  if (amountInr >= 10000000) {
    return `₹${(amountInr / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
  }
  if (amountInr >= 100000) {
    return `₹${(amountInr / 100000).toFixed(1).replace(/\.0$/, '')} Lakh`;
  }
  return `₹${amountInr.toLocaleString('en-IN')}`;
}

function getLevelInfo(level?: number) {
  const lvl = Math.min(Math.max(level || 1, 1), COMMISSION_LEVELS_GROUND_TRUTH.length);
  const rule = COMMISSION_LEVELS_GROUND_TRUTH.find((r) => r.levelNumber === lvl) || COMMISSION_LEVELS_GROUND_TRUTH[0];
  return {
    level: rule.levelNumber,
    percent: rule.commissionPercent,
    defaultRank: rule.rankTitleEn,
  };
}

export default function AdminPage() {
  const {
    plots,
    updatePlotStatus,
    addPlot,
    updatePlot,
    deletePlot,
    bookings,
    confirmBooking,
    cancelBooking,
    payments,
    verifyPayment,
    kitIssues,
    supportTickets,
    replyToTicket,
    allProfiles,
    currentUser,
    createSponsorMember,
    updateMember,
    deleteMember,
    toggleMemberStatus,
    reviews,
    updateReviewStatus,
    replyToReview,
    deleteReview,
    tasks,
    toggleTask,
    enquiries,
    siteVisits,
    targets,
    gpsEvidences,
    messages,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'tasks'
    | 'enquiries'
    | 'site_visits'
    | 'targets'
    | 'field_gps'
    | 'broadcast'
    | 'cms'
    | 'members'
    | 'plots'
    | 'payments'
    | 'bookings'
    | 'kits'
    | 'support'
    | 'reviews'
  >('overview');

  const [deepLinkTargetId, setDeepLinkTargetId] = useState<string | null>(null);
  const [deepLinkNotFoundNotice, setDeepLinkNotFoundNotice] = useState<string | null>(null);

  // Deep-link query parameter synchronization (?tab=... and specific record params)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const normalized = tabParam.toLowerCase();
        if (normalized === 'overview') setActiveTab('overview');
        else if (normalized === 'tasks' || normalized === 'inbox') setActiveTab('tasks');
        else if (normalized === 'enquiries' || normalized === 'leads') setActiveTab('enquiries');
        else if (normalized === 'site_visits' || normalized === 'visits') setActiveTab('site_visits');
        else if (normalized === 'targets') setActiveTab('targets');
        else if (normalized === 'field_gps' || normalized === 'gps') setActiveTab('field_gps');
        else if (normalized === 'broadcast') setActiveTab('broadcast');
        else if (normalized === 'cms') setActiveTab('cms');
        else if (normalized === 'members' || normalized === 'associates') setActiveTab('members');
        else if (normalized === 'plots' || normalized === 'inventory') setActiveTab('plots');
        else if (normalized === 'payments' || normalized === 'transactions') setActiveTab('payments');
        else if (normalized === 'bookings' || normalized === 'orders') setActiveTab('bookings');
        else if (normalized === 'kits' || normalized === 'joining_kits') setActiveTab('kits');
        else if (normalized === 'support' || normalized === 'tickets') setActiveTab('support');
        else if (normalized === 'reviews') setActiveTab('reviews');
      }

      // Check specific entity deep link parameters
      const paymentParam = params.get('payment');
      const bookingParam = params.get('booking');
      const taskParam = params.get('task');
      const visitParam = params.get('visit') || params.get('site_visit');
      const enquiryParam = params.get('enquiry');
      const plotParam = params.get('plot') || params.get('plotNumber');
      const memberParam = params.get('member') || params.get('memberId');
      const genericParam = params.get('id') || params.get('recordId');

      if (paymentParam) {
        setActiveTab('payments');
        setDeepLinkTargetId(paymentParam);
      } else if (bookingParam) {
        setActiveTab('bookings');
        setDeepLinkTargetId(bookingParam);
      } else if (taskParam) {
        setActiveTab('tasks');
        setDeepLinkTargetId(taskParam);
      } else if (visitParam) {
        setActiveTab('site_visits');
        setDeepLinkTargetId(visitParam);
      } else if (enquiryParam) {
        setActiveTab('enquiries');
        setDeepLinkTargetId(enquiryParam);
      } else if (plotParam) {
        setActiveTab('plots');
        setDeepLinkTargetId(plotParam);
      } else if (memberParam) {
        setActiveTab('members');
        setDeepLinkTargetId(memberParam);
      } else if (genericParam) {
        setDeepLinkTargetId(genericParam);
      }
    }
  }, []);

  // Reactive DOM element locator & highlighter with missing-record handling
  useEffect(() => {
    if (!deepLinkTargetId) return;

    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 150;

    const intervalId = setInterval(() => {
      attempts += 1;
      const el =
        document.getElementById(deepLinkTargetId) ||
        document.querySelector(`[data-record-id="${deepLinkTargetId}"]`) ||
        document.querySelector(`[data-plot-number="${deepLinkTargetId}"]`) ||
        document.querySelector(`[data-member-id="${deepLinkTargetId}"]`);

      if (el) {
        clearInterval(intervalId);
        setDeepLinkNotFoundNotice(null);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-[#C7A35A]', 'animate-pulse');
        setTimeout(() => {
          el.classList.remove('animate-pulse');
        }, 3500);
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        setDeepLinkNotFoundNotice(
          `Record "${deepLinkTargetId}" could not be located in current dataset or may require different filter settings.`
        );
      }
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [deepLinkTargetId, activeTab, payments, bookings, tasks, siteVisits, enquiries, plots, allProfiles]);

  const [reviewFilterStatus, setReviewFilterStatus] = useState<'ALL' | 'approved' | 'pending' | 'rejected'>('ALL');
  const [reviewReplyInputs, setReviewReplyInputs] = useState<Record<string, string>>({});
  const [plotFilterBlock, setPlotFilterBlock] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [plotFilterStatus, setPlotFilterStatus] = useState<'ALL' | PlotStatus>('ALL');
  const [plotSearchQuery, setPlotSearchQuery] = useState('');
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [deletingPlot, setDeletingPlot] = useState<Plot | null>(null);
  const [plotActionNotice, setPlotActionNotice] = useState<string | null>(null);
  const [isAuditDossierExpanded, setIsAuditDossierExpanded] = useState(false);
  const [paymentActionNotice, setPaymentActionNotice] = useState<string | null>(null);

  // Member Management State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'ALL' | 'associates' | UserRole>('ALL');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<Profile | null>(null);
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [deletingMember, setDeletingMember] = useState<Profile | null>(null);
  const [copiedMemberCode, setCopiedMemberCode] = useState<string | null>(null);
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(null);

  // Add Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('junior_member');
  const [newMemberSponsorId, setNewMemberSponsorId] = useState('AKGV-3498');
  const [newMemberCity, setNewMemberCity] = useState('Varanasi');
  const [newMemberBranch, setNewMemberBranch] = useState('Rampur Head Office');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberLevel, setNewMemberLevel] = useState<number>(1);
  const [newMemberPassword, setNewMemberPassword] = useState('Akgv@2026');
  const [showNewMemberPassword, setShowNewMemberPassword] = useState(false);
  const [createdSponsorFeedback, setCreatedSponsorFeedback] = useState<{
    code: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
    oneClickLoginUrl?: string;
    activationUrl: string;
    loginUrl: string;
    invitationStatus?: string;
    emailDelivered?: boolean;
    dispatchNote?: string;
  } | null>(null);

  // Edit Member Form State
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('junior_member');
  const [editSponsorId, setEditSponsorId] = useState('');
  const [editKycStatus, setEditKycStatus] = useState<KycStatus>('verified');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editCity, setEditCity] = useState('Varanasi');
  const [editBranchLocation, setEditBranchLocation] = useState('Rampur Head Office');
  const [editAddress, setEditAddress] = useState('');
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editRankTitle, setEditRankTitle] = useState('');
  const [editBusinessVolume, setEditBusinessVolume] = useState<number>(0);
  const [editPlotsClosed, setEditPlotsClosed] = useState<number>(0);
  const [editJoinedDate, setEditJoinedDate] = useState('');

  // Database-Derived Metrics
  const totalPlots = plots.length;
  const availablePlots = plots.filter((p) => p.status === 'available_green').length;
  const bookedPlots = plots.filter((p) => p.status === 'booked_yellow').length;
  const vacantPlots = plots.filter((p) => p.status === 'vacant_red').length;
  const holdPlots = plots.filter((p) => p.status === 'hold_pending').length;

  const pendingPayments = payments.filter((p) => p.status === 'under_review');
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const totalOfflineCash = kitIssues.reduce((sum, item) => sum + item.amountReceivedInr, 0);
  const openTickets = supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const pendingAdminTasks = tasks.filter((t) => !t.isCompleted);
  const completedAdminTasks = tasks.filter((t) => t.isCompleted);

  const filteredPlots = plots.filter((p) => {
    if (plotFilterBlock !== 'ALL' && p.block.toUpperCase() !== plotFilterBlock.toUpperCase()) return false;
    if (plotFilterStatus !== 'ALL' && p.status !== plotFilterStatus) return false;
    if (plotSearchQuery.trim()) {
      const q = plotSearchQuery.toLowerCase().trim();
      const matchNum = p.plotNumber.toLowerCase().includes(q);
      const matchFacing = (p.roadFacing || '').toLowerCase().includes(q);
      const matchArea = p.areaSqft.toString().includes(q);
      const matchDim = (p.dimensions || '').toLowerCase().includes(q);
      const matchRoad = (p.roadWidth || '').toLowerCase().includes(q);
      if (!matchNum && !matchFacing && !matchArea && !matchDim && !matchRoad) return false;
    }
    return true;
  });

  // Member Analytics & Governance
  const totalMembers = allProfiles.length;
  const activeMembers = allProfiles.filter((p) => p.isActive).length;
  const suspendedMembers = allProfiles.filter((p) => !p.isActive).length;
  const workingAssociates = allProfiles.filter(
    (p) => p.role === 'senior_member' || p.role === 'junior_member' || p.role === 'sub_admin'
  ).length;
  const totalBuyers = allProfiles.filter((p) => p.role === 'buyer').length;

  const filteredMembers = allProfiles.filter((p) => {
    if (memberRoleFilter !== 'ALL') {
      if (memberRoleFilter === 'associates') {
        if (p.role !== 'senior_member' && p.role !== 'junior_member' && p.role !== 'sub_admin') {
          return false;
        }
      } else if (p.role !== memberRoleFilter) {
        return false;
      }
    }
    if (memberStatusFilter === 'active' && !p.isActive) return false;
    if (memberStatusFilter === 'inactive' && p.isActive) return false;
    if (memberSearchQuery.trim()) {
      const q = memberSearchQuery.toLowerCase().trim();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPhone = p.phone.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchCode = (p.memberId || '').toLowerCase().includes(q);
      const matchSponsor = (p.sponsorId || '').toLowerCase().includes(q);
      const matchCity = (p.city || '').toLowerCase().includes(q);
      const matchBranch = (p.branchLocation || '').toLowerCase().includes(q);
      const matchRank = (p.rankTitle || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchCode || matchSponsor || matchCity || matchBranch || matchRank;
    }
    return true;
  });

  const handleOpenEditMember = (member: Profile) => {
    setEditingMember(member);
    setEditFullName(member.fullName);
    setEditPhone(member.phone);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditSponsorId(member.sponsorId || '');
    setEditKycStatus(member.kycStatus || 'verified');
    setEditIsActive(member.isActive);
    setEditCity(member.city || 'Varanasi');
    setEditBranchLocation(member.branchLocation || 'Rampur Head Office');
    setEditAddress(member.address || '');
    setEditLevel(member.level || 1);
    setEditRankTitle(member.rankTitle || getLevelInfo(member.level).defaultRank);
    setEditBusinessVolume(member.totalBusinessVolumeInr || 0);
    setEditPlotsClosed(member.plotsClosedCount || 0);
    setEditJoinedDate(member.joinedDate || (member.createdAt ? member.createdAt.slice(0, 10) : ''));
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editFullName.trim() || !editPhone.trim()) {
      alert('Please fill in member name and phone number.');
      return;
    }
    updateMember(editingMember.id, {
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      role: editRole,
      sponsorId: editSponsorId.trim() || undefined,
      kycStatus: editKycStatus,
      isActive: editIsActive,
      city: editCity.trim(),
      branchLocation: editBranchLocation.trim(),
      address: editAddress.trim(),
      level: Number(editLevel) || 1,
      rankTitle: editRankTitle.trim() || undefined,
      totalBusinessVolumeInr: Number(editBusinessVolume) || 0,
      plotsClosedCount: Number(editPlotsClosed) || 0,
      joinedDate: editJoinedDate || undefined,
    });
    setMemberActionNotice(`Member "${editFullName.trim()}" dossier updated successfully.`);
    setEditingMember(null);
    setTimeout(() => setMemberActionNotice(null), 4000);
  };

  const handleToggleStatus = (member: Profile) => {
    toggleMemberStatus(member.id);
    const updatedStatus = member.isActive ? 'suspended' : 'activated';
    setMemberActionNotice(`Member "${member.fullName}" has been ${updatedStatus}.`);
    setTimeout(() => setMemberActionNotice(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    if (currentUser && deletingMember.id === currentUser.id) {
      alert('Security Protection: You cannot delete your own logged-in administrator account.');
      setDeletingMember(null);
      return;
    }
    deleteMember(deletingMember.id);
    setMemberActionNotice(`Member "${deletingMember.fullName}" was removed from the roster.`);
    setDeletingMember(null);
    setTimeout(() => setMemberActionNotice(null), 4000);
  };

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedMemberCode(code);
    setTimeout(() => setCopiedMemberCode(null), 2500);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'ADMIN', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'sub_admin':
        return { label: 'SUB-ADMIN', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'senior_member':
        return { label: 'SENIOR MANAGER', bg: 'bg-[#C7A35A]/20 text-[#DFC382] border-[#C7A35A]/40' };
      case 'junior_member':
        return { label: 'FIELD ASSOCIATE', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'buyer':
        return { label: 'PLOT BUYER', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: role, bg: 'bg-gray-500/20 text-gray-300 border-gray-500/40' };
    }
  };

  if (!currentUser) {
    return <AuthBarrier requiredRole="admin" />;
  }

  if (currentUser.role !== 'super_admin' && currentUser.role !== 'sub_admin') {
    return <UnauthorizedBarrier currentRole={currentUser.role} requiredRole="Admin" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-r from-[#050A17] via-[#0B1734] to-[#050A17] p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1734] border-2 border-[#C7A35A] text-[#DFC382] shadow-lg">
            <ShieldCheck className="h-8 w-8 text-[#C7A35A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-white">
                Admin Control Centre
              </h1>
              <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                Full Authorization
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Logged in as: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-[#050A17] px-4 py-2 text-xs text-emerald-400 font-mono font-semibold">
            System Status: 100% Operational
          </span>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 text-xs sm:text-sm font-semibold gap-1 whitespace-nowrap pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'overview'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Metrics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'tasks'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Daily Task Center ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'enquiries'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>CRM Leads ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('site_visits')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'site_visits'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Site Visits ({siteVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('targets')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'targets'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Sales Quotas ({targets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'members'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Members & Sponsors ({allProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plots')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'plots'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Plot Inventory ({totalPlots})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'payments'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Reviews ({pendingPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'bookings'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Bookings & Holds ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kits')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'kits'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>₹999 Cash Kit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('field_gps')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'field_gps'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Field GPS Queue ({gpsEvidences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'support'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support CRM ({openTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'reviews'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Star className="h-4 w-4 text-amber-400" />
          <span>Real Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'broadcast'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Broadcast Alerts ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'cms'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Website CMS</span>
        </button>
      </div>

      {deepLinkNotFoundNotice && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{deepLinkNotFoundNotice}</span>
          </div>
          <button
            onClick={() => setDeepLinkNotFoundNotice(null)}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Database-Derived Metrics Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* 1. Total Transcribed Plots */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('plots');
                setPlotFilterStatus('ALL');
                setPlotFilterBlock('ALL');
                setPlotSearchQuery('');
              }}
              className="text-left rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-2 hover:border-[#C7A35A]/60 hover:bg-[#0B1734]/80 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Total Transcribed Plots</span>
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-[#DFC382] group-hover:translate-x-0.5 transition" />
              </div>
              <span className="font-serif text-3xl font-bold text-white block">{totalPlots}</span>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
                <span>Rampur Blueprint Model</span>
                <span className="text-[10px] text-[#DFC382] font-semibold group-hover:underline">View All →</span>
              </div>
            </button>

            {/* 2. Available Green Plots */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('plots');
                setPlotFilterStatus('available_green');
                setPlotFilterBlock('ALL');
                setPlotSearchQuery('');
              }}
              className="text-left rounded-2xl border border-emerald-500/30 bg-[#0B1734] p-5 space-y-2 hover:border-emerald-400 hover:bg-emerald-950/20 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span>Available Green Plots</span>
                <ChevronRight className="h-4 w-4 text-emerald-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition" />
              </div>
              <span className="font-serif text-3xl font-bold text-emerald-400 block">{availablePlots}</span>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-emerald-500/10">
                <span>Bookable by Buyers</span>
                <span className="text-[10px] text-emerald-400 font-semibold group-hover:underline">Filter Available →</span>
              </div>
            </button>

            {/* 3. Confirmed Booked (Yellow) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('plots');
                setPlotFilterStatus('booked_yellow');
                setPlotFilterBlock('ALL');
                setPlotSearchQuery('');
              }}
              className="text-left rounded-2xl border border-amber-500/30 bg-[#0B1734] p-5 space-y-2 hover:border-amber-400 hover:bg-amber-950/20 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between text-xs text-amber-300">
                <span>Confirmed Booked (Yellow)</span>
                <ChevronRight className="h-4 w-4 text-amber-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition" />
              </div>
              <span className="font-serif text-3xl font-bold text-amber-400 block">{bookedPlots}</span>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-amber-500/10">
                <span>Locked Inventory</span>
                <span className="text-[10px] text-amber-400 font-semibold group-hover:underline">Filter Booked →</span>
              </div>
            </button>

            {/* 4. Vacant / Reserved (Red) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('plots');
                setPlotFilterStatus('vacant_red');
                setPlotFilterBlock('ALL');
                setPlotSearchQuery('');
              }}
              className="text-left rounded-2xl border border-red-500/30 bg-[#0B1734] p-5 space-y-2 hover:border-red-400 hover:bg-red-950/20 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between text-xs text-red-300">
                <span>Vacant / Reserved (Red)</span>
                <ChevronRight className="h-4 w-4 text-red-500 group-hover:text-red-300 group-hover:translate-x-0.5 transition" />
              </div>
              <span className="font-serif text-3xl font-bold text-red-400 block">{vacantPlots}</span>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-red-500/10">
                <span>Admin-Managed</span>
                <span className="text-[10px] text-red-400 font-semibold group-hover:underline">Filter Vacant →</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 5. Payment Verification Queue */}
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className="text-left rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2 hover:border-amber-400/50 hover:bg-amber-950/10 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment Verification Queue</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {pendingPayments.length} Pending
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-white block group-hover:text-amber-200 transition">
                {pendingPayments.length} Proofs to Review
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Staff must verify transaction references against bank statement before issuing receipt.
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#DFC382] font-semibold">
                <span>Open Verification Queue</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 6. Offline Cash Kit Treasury */}
            <button
              type="button"
              onClick={() => setActiveTab('kits')}
              className="text-left rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2 hover:border-emerald-400/50 hover:bg-emerald-950/10 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Offline Cash Kit Treasury</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {kitIssues.length} Kits
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-emerald-400 block group-hover:brightness-110 transition">
                ₹{totalOfflineCash.toLocaleString('en-IN')} Cash
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Collected strictly in cash offline for Bags, Pens, Diaries, and Files.
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Open ₹999 Cash Ledger</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* 7. Open Customer Support */}
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className="text-left rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2 hover:border-sky-400/50 hover:bg-sky-950/10 transition group active:scale-[0.99] cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Open Customer Support</span>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  {openTickets.length} Open
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-white block group-hover:text-sky-200 transition">
                {openTickets.length} Active Tickets
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Customer inquiries regarding registry documentation, site appointments, and plots.
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-sky-400 font-semibold">
                <span>Manage Tickets & Replies</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>

          {/* Daily Task Action Center Widget on Overview */}
          <div className="rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0B1734] via-[#050A17] to-[#0B1734] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-white">
                      {tLang(language, 'Daily Task Action Center (आज के काम)', 'दैनिक कार्य डेस्क', 'Daily Task Action Center')}
                    </h3>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                      {pendingAdminTasks.length} {tLang(language, 'Pending', 'लंबित', 'Pending')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {tLang(
                      language,
                      'Escort site visits, verify token payments, follow up with inquiries, and track staff completion.',
                      'साइट विजिट, टोकन भुगतान सत्यापन और पूछताछ का तुरंत निपटारा करें।',
                      'Site visits, token payment verification aur inquiries ko track karein.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition"
                >
                  <span>{tLang(language, 'Open Full Task Desk', 'पूरा कार्य डेस्क खोलें', 'Open Full Task Desk')}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Priority Task Cards (Top 4 Pending) */}
            {pendingAdminTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white">All pending tasks are complete!</p>
                <p className="text-gray-400 mt-0.5">Click "Open Full Task Desk" to assign new directives to field staff.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingAdminTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#050A17]/90 p-4 space-y-3 hover:border-[#C7A35A]/50 transition shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : task.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Due: <strong className="text-gray-300">{task.dueDate}</strong>
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                      <span className="text-gray-400 text-[11px]">
                        Assignee: <strong className="text-white">{task.assignedToName}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {task.targetRoute && (
                          <Link
                            href={task.targetRoute}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#DFC382] hover:bg-white/10 transition"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold transition active:scale-95"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Members & Team Management (Admin Controls) */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Action Notification Alert */}
          {memberActionNotice && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-5 py-3 text-xs text-emerald-300 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{memberActionNotice}</span>
              </div>
              <button
                onClick={() => setMemberActionNotice(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header & Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C7A35A]/40 bg-[#0B1734] p-5 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C7A35A]" />
                <h2 className="font-serif text-lg font-bold text-white">
                  {tLang(language, 'Team & Associates Governance', 'सदस्य एवं टीम नियंत्रण', 'Team & Associates Governance')}
                </h2>
              </div>
              <p className="text-xs text-gray-300">
                {tLang(
                  language,
                  'View every associate, manager, sub-admin, and buyer working on the platform. Add new members, edit profile details, toggle active access, or remove accounts.',
                  'प्लेटफ़ॉर्म पर कार्यरत प्रत्येक सहयोगी, प्रबंधक, उप-प्रशासक और खरीदार को देखें। नए सदस्य जोड़ें, प्रोफ़ाइल विवरण संपादित करें, सक्रिय पहुंच टॉगल करें, या खाते हटाएं।',
                  'Platform par active har associate, manager, sub-admin aur buyer ko dekhein. Naye members add karein, profile edit karein ya access manage karein.'
                )}
              </p>
            </div>

            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow-lg transition hover:brightness-110 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>{tLang(language, 'Enroll New Member', 'नया सदस्य जोड़ें', 'Naya Member Add Karein')}</span>
            </button>
          </div>

          {/* Member KPIs Summary Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            {/* Total Registered */}
            <button
              type="button"
              onClick={() => {
                setMemberRoleFilter('ALL');
                setMemberStatusFilter('ALL');
                setMemberSearchQuery('');
              }}
              className={`text-left rounded-2xl border p-4 space-y-1 transition group active:scale-[0.98] cursor-pointer shadow-md ${
                memberRoleFilter === 'ALL' && memberStatusFilter === 'ALL'
                  ? 'border-[#C7A35A] bg-[#C7A35A]/10 ring-1 ring-[#C7A35A]/40'
                  : 'border-white/10 bg-[#050A17] hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px] block">Total Registered</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 flex items-center gap-0.5">
                  All <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
              <div className="font-serif text-2xl font-bold text-white group-hover:text-[#DFC382] transition">
                {totalMembers}
              </div>
              <span className="text-[10px] text-gray-400 block">All system profiles</span>
            </button>

            {/* Working Associates */}
            <button
              type="button"
              onClick={() => {
                setMemberRoleFilter('associates');
                setMemberStatusFilter('ALL');
                setMemberSearchQuery('');
              }}
              className={`text-left rounded-2xl border p-4 space-y-1 transition group active:scale-[0.98] cursor-pointer shadow-md ${
                memberRoleFilter === 'associates'
                  ? 'border-[#C7A35A] bg-[#C7A35A]/15 ring-2 ring-[#C7A35A]/50'
                  : 'border-[#C7A35A]/30 bg-[#050A17] hover:border-[#C7A35A] hover:bg-[#C7A35A]/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px] block">Working Associates</span>
                <span className="text-[10px] text-[#DFC382] flex items-center gap-0.5 font-medium">
                  Filter <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#DFC382] group-hover:brightness-110 transition">
                {workingAssociates}
              </div>
              <span className="text-[10px] text-emerald-400 block">Sponsors & Field staff</span>
            </button>

            {/* Verified Buyers */}
            <button
              type="button"
              onClick={() => {
                setMemberRoleFilter('buyer');
                setMemberStatusFilter('ALL');
                setMemberSearchQuery('');
              }}
              className={`text-left rounded-2xl border p-4 space-y-1 transition group active:scale-[0.98] cursor-pointer shadow-md ${
                memberRoleFilter === 'buyer'
                  ? 'border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-400/50'
                  : 'border-emerald-500/20 bg-[#050A17] hover:border-emerald-400/60 hover:bg-emerald-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px] block">Verified Buyers</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
                  Filter <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
              <div className="font-serif text-2xl font-bold text-emerald-400 group-hover:brightness-110 transition">
                {totalBuyers}
              </div>
              <span className="text-[10px] text-gray-400 block">Plot investors</span>
            </button>

            {/* Suspended / Inactive */}
            <button
              type="button"
              onClick={() => {
                setMemberRoleFilter('ALL');
                setMemberStatusFilter('inactive');
                setMemberSearchQuery('');
              }}
              className={`text-left rounded-2xl border p-4 space-y-1 transition group active:scale-[0.98] cursor-pointer shadow-md ${
                memberStatusFilter === 'inactive'
                  ? 'border-red-400 bg-red-950/30 ring-2 ring-red-400/50'
                  : 'border-red-500/20 bg-[#050A17] hover:border-red-400/60 hover:bg-red-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px] block">Suspended / Inactive</span>
                <span className="text-[10px] text-red-400 flex items-center gap-0.5 font-medium">
                  Filter <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
              <div className="font-serif text-2xl font-bold text-red-400 group-hover:brightness-110 transition">
                {suspendedMembers}
              </div>
              <span className="text-[10px] text-gray-400 block">Blocked accounts</span>
            </button>
          </div>

          {/* Search & Filtering Toolbar */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0B1734] p-4 text-xs">
            {/* Search Input Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search member by Name, Phone, Email, Member Code (AKGV-...) or Reporting Sponsor..."
                className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
              {memberSearchQuery && (
                <button
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
              {/* Role Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-gray-400 font-semibold mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-[#C7A35A]" /> Role:
                </span>
                {(['ALL', 'associates', 'super_admin', 'sub_admin', 'senior_member', 'junior_member', 'buyer'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setMemberRoleFilter(r)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      memberRoleFilter === r
                        ? 'bg-[#C7A35A] text-[#0B1734]'
                        : 'bg-[#050A17] text-gray-400 hover:text-white'
                    }`}
                  >
                    {r === 'ALL'
                      ? `All (${allProfiles.length})`
                      : r === 'associates'
                      ? `Team (${workingAssociates})`
                      : r === 'super_admin'
                      ? 'Admin'
                      : r === 'sub_admin'
                      ? 'Sub-Admin'
                      : r === 'senior_member'
                      ? 'Senior'
                      : r === 'junior_member'
                      ? 'Associate'
                      : 'Buyer'}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-semibold mr-1">Status:</span>
                {(['ALL', 'active', 'inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMemberStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      memberStatusFilter === st
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-[#050A17] text-gray-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'active'
                      ? `Active (${activeMembers})`
                      : `Suspended (${suspendedMembers})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Members Roster List / Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>
                Showing <strong className="text-white">{filteredMembers.length}</strong> of{' '}
                <strong className="text-white">{allProfiles.length}</strong> members
              </span>
              {memberSearchQuery && (
                <button
                  onClick={() => {
                    setMemberSearchQuery('');
                    setMemberRoleFilter('ALL');
                    setMemberStatusFilter('ALL');
                  }}
                  className="text-[#DFC382] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#050A17] p-12 text-center text-xs space-y-3">
                <Users className="h-10 w-10 text-gray-500" />
                <p className="text-gray-300 font-semibold">No members match your criteria</p>
                <p className="text-gray-500 max-w-sm">
                  Try adjusting the role filter or search query, or enroll a new associate into the team.
                </p>
                <button
                  onClick={() => {
                    setMemberSearchQuery('');
                    setMemberRoleFilter('ALL');
                    setMemberStatusFilter('ALL');
                  }}
                  className="rounded-xl bg-[#C7A35A] px-4 py-2 font-bold text-[#0B1734]"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((profile) => {
                  const directDownlines = allProfiles.filter(
                    (child) => child.sponsorId === profile.id || child.sponsorId === profile.memberId
                  );
                  const roleBadge = getRoleBadge(profile.role);
                  const isCurrentLoggedAdmin = profile.id === currentUser.id;
                  const { joinedFormatted, tenureFormatted } = formatTenure(profile.joinedDate || profile.createdAt);
                  const levelInfo = getLevelInfo(profile.level);
                  const memberBookings = bookings.filter(
                    (b) => b.buyerId === profile.id || b.buyerPhone === profile.phone
                  );

                  return (
                    <div
                      key={profile.id}
                      id={profile.id}
                      data-record-id={profile.id}
                      data-member-id={profile.memberId}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 text-xs shadow-md transition hover:border-[#C7A35A]/50 ${
                        profile.isActive
                          ? 'border-white/10 bg-[#0B1734]'
                          : 'border-red-500/20 bg-[#12080E] opacity-80'
                      }`}
                    >
                      {/* Top Header with Avatar, Role & Status Dot */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A]/40 text-[#DFC382] font-bold text-sm shadow overflow-hidden">
                              {profile.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={profile.avatarUrl}
                                  alt={profile.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                profile.fullName.slice(0, 2).toUpperCase()
                              )}
                              {/* Online / Active Pulse */}
                              <span
                                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0B1734] ${
                                  profile.isActive ? 'bg-emerald-400' : 'bg-red-500'
                                }`}
                                title={profile.isActive ? 'Active Working Account' : 'Account Suspended'}
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-white text-sm line-clamp-1">
                                  {profile.fullName}
                                </h4>
                                {isCurrentLoggedAdmin && (
                                  <span className="rounded bg-[#C7A35A]/20 px-1 py-0.2 text-[9px] font-bold text-[#DFC382]">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-300 font-mono text-[11px] block">{profile.phone}</span>
                            </div>
                          </div>

                          {/* Role Badge */}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border shrink-0 ${roleBadge.bg}`}
                          >
                            {roleBadge.label}
                          </span>
                        </div>

                        {/* Location & Tenure Highlights */}
                        <div className="space-y-1.5 pt-1 border-t border-white/5">
                          {/* Location & Assigned Branch */}
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                            <span className="truncate">
                              <strong className="text-white">{profile.city || 'Varanasi'}</strong> •{' '}
                              <span className="text-[#DFC382]">{profile.branchLocation || 'Rampur Head Office'}</span>
                            </span>
                          </div>

                          {/* Joined Date & Tenure Duration */}
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            <span>
                              Joined <strong className="text-gray-200">{joinedFormatted}</strong>{' '}
                              <span className="text-emerald-400 font-medium">({tenureFormatted})</span>
                            </span>
                          </div>
                        </div>

                        {/* Level & Sales Performance OR Buyer Portfolio */}
                        {profile.role !== 'buyer' ? (
                          <div className="rounded-xl bg-[#050A17] p-2.5 space-y-1 border border-white/5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-[#DFC382] font-semibold">
                                <Award className="h-3.5 w-3.5 text-[#C7A35A]" />
                                <span>Level {profile.level || levelInfo.level}:</span>
                                <span className="text-white">{profile.rankTitle || levelInfo.defaultRank}</span>
                              </div>
                              <span className="rounded bg-[#C7A35A]/15 px-1.5 py-0.2 text-[10px] font-bold text-[#DFC382]">
                                {levelInfo.percent}% Comm
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-400 text-[10px] pt-0.5">
                              <span>
                                Vol: <strong className="text-emerald-400">{formatBusinessVolume(profile.totalBusinessVolumeInr)}</strong>
                              </span>
                              <span>
                                Closed: <strong className="text-white">{profile.plotsClosedCount || 0} Plots</strong>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[#050A17] p-2.5 space-y-1 border border-white/5 text-[11px]">
                            <div className="flex items-center justify-between text-emerald-400 font-semibold">
                              <div className="flex items-center gap-1">
                                <Home className="h-3.5 w-3.5 text-emerald-400" />
                                <span>
                                  {memberBookings.length > 0
                                    ? `Plots: ${memberBookings.map((b) => b.plotNumber).join(', ')}`
                                    : 'Prospective Client'}
                                </span>
                              </div>
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                                {memberBookings.length} Booked
                              </span>
                            </div>
                            <div className="text-gray-400 text-[10px] pt-0.5 flex justify-between">
                              <span>
                                Paid: <strong className="text-emerald-300">₹{memberBookings.reduce((sum, b) => sum + b.paidAmountInr, 0).toLocaleString('en-IN')}</strong>
                              </span>
                              <span>
                                Total: <strong className="text-white">₹{memberBookings.reduce((sum, b) => sum + b.totalAmountInr, 0).toLocaleString('en-IN')}</strong>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Member Details Matrix */}
                        <div className="rounded-xl bg-[#050A17] p-3 space-y-2 border border-white/5 font-mono text-[11px]">
                          {/* Member ID with Copy */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-sans text-[10px]">Member ID:</span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-[#DFC382] font-mono">
                                {profile.memberId || 'N/A'}
                              </strong>
                              {profile.memberId && (
                                <button
                                  onClick={() => handleCopyCode(profile.memberId!)}
                                  className="text-gray-400 hover:text-white p-0.5"
                                  title="Copy Member Code"
                                >
                                  {copiedMemberCode === profile.memberId ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reporting Sponsor */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-sans text-[10px]">Sponsor:</span>
                            <span className="text-white text-[11px] truncate max-w-[150px]">
                              {profile.sponsorId || 'Company HQ (Head Office)'}
                            </span>
                          </div>

                          {/* Direct Team Downlines */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-sans text-[10px]">Team Size:</span>
                            <span className="font-bold text-emerald-400 font-sans text-[11px]">
                              {directDownlines.length} Direct Partners
                            </span>
                          </div>

                          {/* KYC Status & Active State */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] font-sans">
                            <span
                              className={`flex items-center gap-1 font-semibold ${
                                profile.kycStatus === 'verified'
                                  ? 'text-emerald-400'
                                  : profile.kycStatus === 'rejected'
                                  ? 'text-red-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              KYC {profile.kycStatus?.toUpperCase() || 'VERIFIED'}
                            </span>

                            <span
                              className={`rounded px-1.5 py-0.2 font-bold ${
                                profile.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {profile.isActive ? 'Active Access' : 'Suspended'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Toolbar */}
                      <div className="border-t border-white/10 pt-3 mt-3 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {/* View Details Button */}
                          <button
                            onClick={() => setViewingMember(profile)}
                            className="flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-gray-200 transition"
                            title="View Complete Profile & Downlines"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#C7A35A]" />
                            <span>View</span>
                          </button>

                          {/* Edit Member Button */}
                          <button
                            onClick={() => handleOpenEditMember(profile)}
                            className="flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-gray-200 transition"
                            title="Edit Member Information"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-400" />
                            <span>Edit</span>
                          </button>

                          {/* WhatsApp Share Button */}
                          <a
                            href={`https://wa.me/91${(profile.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `🏢 *AKGV INFRA CITY PRIVATE LIMITED*\nनमस्ते *${profile.fullName}* जी,\n\n📋 *आपके खाते की जानकारी:*\n🆔 ID: ${profile.memberId || profile.phone}\n👤 नाम: ${profile.fullName}\n📧 ईमेल: ${profile.email}\n📱 फोन: ${profile.phone}\n🌐 पोर्टल लॉगिन: ${typeof window !== 'undefined' ? window.location.origin : 'https://akgv.pages.dev'}/login?identifier=${encodeURIComponent(profile.email || profile.memberId || profile.phone)}\n\n📞 सहायता: +91 94152 02627`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-2 py-1.5 text-[11px] font-semibold transition"
                            title="Share Details via WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Toggle Active / Suspended Button */}
                          <button
                            onClick={() => handleToggleStatus(profile)}
                            disabled={isCurrentLoggedAdmin}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                              isCurrentLoggedAdmin
                                ? 'opacity-40 cursor-not-allowed text-gray-500'
                                : profile.isActive
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                            title={
                              isCurrentLoggedAdmin
                                ? 'Cannot suspend self'
                                : profile.isActive
                                ? 'Suspend Member Access'
                                : 'Reactivate Member Access'
                            }
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span>{profile.isActive ? 'Suspend' : 'Activate'}</span>
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingMember(profile)}
                          disabled={isCurrentLoggedAdmin}
                          className={`rounded-lg p-1.5 transition ${
                            isCurrentLoggedAdmin
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                          }`}
                          title={isCurrentLoggedAdmin ? 'Cannot delete self' : 'Delete Member from System'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= MODAL 1: ADD NEW MEMBER ================= */}
          {isAddMemberModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
              <div className="relative my-auto w-full max-w-lg rounded-2xl border border-[#C7A35A] bg-[#070D1E] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1734] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-[#C7A35A]" />
                    <h3 className="font-serif text-sm font-bold text-white">
                      {tLang(language, 'Enroll New Team Member', 'नया टीम सदस्य जोड़ें', 'Naya Team Member Add Karein')}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddMemberModalOpen(false);
                      setCreatedSponsorFeedback(null);
                    }}
                    className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newMemberName.trim() || !newMemberPhone.trim()) {
                      alert(tLang(language, 'Please provide member name and phone number.', 'कृपया सदस्य का नाम और फोन नंबर दर्ज करें।', 'Kripya member ka naam aur phone number enter karein.'));
                      return;
                    }
                    const targetEmail = newMemberEmail.trim() || `${newMemberPhone.trim()}@akgvinfacity.com`;
                    const assignedPassword = newMemberPassword.trim() || 'Akgv@2026';

                    const profile = createSponsorMember({
                      fullName: newMemberName.trim(),
                      phone: newMemberPhone.trim(),
                      email: targetEmail,
                      password: assignedPassword,
                      role: newMemberRole,
                      sponsorId: newMemberSponsorId,
                      city: newMemberCity.trim(),
                      branchLocation: newMemberBranch.trim(),
                      address: newMemberAddress.trim(),
                      level: Number(newMemberLevel) || 1,
                    });

                    // Trigger server-side invitation email directly to recipient Gmail
                    let realActionLink: string | null = null;
                    let emailDelivered = false;
                    let dispatchNote = '';
                    let serverOneClickUrl: string | null = null;

                    try {
                      const session = await supabaseGetSession();
                      if (session?.access_token) {
                        const inviteRes = await serverInviteMember(session.access_token, {
                          email: targetEmail,
                          fullName: newMemberName.trim(),
                          phone: newMemberPhone.trim(),
                          password: assignedPassword,
                          role: newMemberRole,
                          sponsorId: newMemberSponsorId,
                          city: newMemberCity.trim(),
                          branchLocation: newMemberBranch.trim(),
                          address: newMemberAddress.trim(),
                          level: Number(newMemberLevel) || 1,
                        });
                        if (inviteRes.success) {
                          realActionLink = inviteRes.actionLink || null;
                          emailDelivered = Boolean(inviteRes.emailDelivered);
                          dispatchNote = inviteRes.note || '';
                          serverOneClickUrl = inviteRes.oneClickLoginUrl || null;
                        }
                      }
                    } catch (err) {
                      console.warn('Server invitation notice:', err);
                    }

                    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://akgv.pages.dev';
                    const oneClickLoginUrl = serverOneClickUrl || `${appOrigin}/login?identifier=${encodeURIComponent(targetEmail)}&password=${encodeURIComponent(assignedPassword)}&auto=1`;
                    const activationUrl = realActionLink || `${appOrigin}/auth/reset?type=invite&email=${encodeURIComponent(profile.email)}`;
                    const loginUrl = `${appOrigin}/login`;

                    setCreatedSponsorFeedback({
                      code: profile.memberId || profile.email || 'AKGV-NEW',
                      name: profile.fullName,
                      email: profile.email,
                      phone: profile.phone,
                      role: profile.role,
                      password: assignedPassword,
                      oneClickLoginUrl,
                      activationUrl,
                      loginUrl,
                      invitationStatus: emailDelivered ? 'delivered' : (profile.invitationStatus || 'pending'),
                      emailDelivered,
                      dispatchNote,
                    });
                    setMemberActionNotice(
                      tLang(
                        language,
                        `New account "${profile.fullName}" created successfully! ID: ${profile.memberId || profile.email}.${emailDelivered ? ' Welcome email sent.' : ' Ready to share via WhatsApp/Gmail.'}`,
                        `नया खाता "${profile.fullName}" सफलतापूर्वक बनाया गया! आईडी: ${profile.memberId || profile.email}। ${emailDelivered ? 'ईमेल भेज दिया गया है।' : 'व्हाट्सएप/जीमेल पर भेजने हेतु तैयार।'}`,
                        `Naya account "${profile.fullName}" create ho gaya! ID: ${profile.memberId || profile.email}.${emailDelivered ? ' Email bhej diya gaya hai.' : ' WhatsApp/Gmail par bhejne ke liye ready hai.'}`
                      )
                    );
                    setNewMemberName('');
                    setNewMemberPhone('');
                    setNewMemberEmail('');
                    setNewMemberAddress('');
                    setTimeout(() => setMemberActionNotice(null), 6000);
                  }}
                  className="p-5 space-y-4 text-xs"
                >
                  {/* Feedback Banner on Generation */}
                  {createdSponsorFeedback && (() => {
                    const cleanPhone = (createdSponsorFeedback.phone || '').replace(/[^0-9]/g, '');
                    const roleBadge = getRoleBadge(createdSponsorFeedback.role as UserRole);
                    const dossierText = `🏢 *AKGV INFRA CITY PRIVATE LIMITED*
*आधिकारिक स्वागत एवं खाता लॉगिन विवरण (Account Dossier)*

नमस्ते *${createdSponsorFeedback.name}* जी,
AKGV Infra City में आपका हार्दिक स्वागत है! आपका अधिकृत खाता सफलतापूर्वक सक्रिय कर दिया गया है।

📋 *आपकी लॉगिन क्रेडेंशियल्स (Login Credentials):*
👤 नाम: *${createdSponsorFeedback.name}*
🆔 सदस्य/ग्राहक ID: *${createdSponsorFeedback.code}*
🏷️ पद / रोल: *${roleBadge.label}*
📧 पंजीकृत ईमेल: *${createdSponsorFeedback.email}*
📱 पंजीकृत मोबाइल: *${createdSponsorFeedback.phone}*
🔑 लॉगिन पासवर्ड: *${createdSponsorFeedback.password || 'Akgv@2026'}*

⚡ *1-क्लिक डायरेक्ट लॉगिन लिंक (तुरंत डैशबोर्ड खोलें):*
👉 ${createdSponsorFeedback.oneClickLoginUrl}
*(इस लिंक पर क्लिक करते ही आप सीधे अपने डैशबोर्ड में ऑटो-लॉगिन हो जाएंगे)*

🌐 मुख्य पोर्टल: ${createdSponsorFeedback.loginUrl}
🏢 कार्यालय: रामपुर (निकट कैंट), वाराणसी - 221002 (उ.प्र.)
📞 हेल्पलाइन: +91 94152 02627 / 0542-2500123
🌐 वेबसाइट: https://akgv.pages.dev

_नोट: सुरक्षा हेतु लॉगिन के बाद आप अपना पासवर्ड अपनी प्रोफाइल से बदल सकते हैं।_`;

                    return (
                      <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-b from-emerald-950/60 to-[#070D1E] p-4 space-y-3 text-xs animate-in fade-in shadow-xl">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <span>{tLang(language, 'Profile Created & Welcome Dossier Ready!', 'प्रोफ़ाइल बन गई! लॉगिन विवरण तैयार है', 'Profile Created & Welcome Dossier Ready!')}</span>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            100% Ready
                          </span>
                        </div>

                        {/* Dossier Card */}
                        <div className="rounded-xl border border-[#C7A35A]/40 bg-[#050A17] p-3.5 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                            <span className="text-[#DFC382] font-sans font-bold text-[11px]">
                              {tLang(language, 'Official Account Dossier', 'आधिकारिक खाता विवरण', 'Official Account Dossier')}
                            </span>
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${roleBadge.bg} border`}>
                              {roleBadge.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="text-white">
                              👤 <span className="text-gray-400">Name:</span> <strong className="text-emerald-300">{createdSponsorFeedback.name}</strong>
                            </div>
                            <div className="text-white">
                              🆔 <span className="text-gray-400">ID:</span> <strong className="text-[#DFC382] bg-black/60 px-2 py-0.5 rounded border border-[#C7A35A]/30">{createdSponsorFeedback.code}</strong>
                            </div>
                            <div className="text-white">
                              📧 <span className="text-gray-400">Email:</span> <span className="text-gray-200">{createdSponsorFeedback.email}</span>
                            </div>
                            <div className="text-white">
                              📱 <span className="text-gray-400">Phone:</span> <span className="text-gray-200">{createdSponsorFeedback.phone}</span>
                            </div>
                            <div className="text-white col-span-1 sm:col-span-2 flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                              <div>
                                🔑 <span className="text-gray-400">Login Password:</span> <strong className="text-amber-300 ml-1.5">{createdSponsorFeedback.password || 'Akgv@2026'}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(createdSponsorFeedback.password || 'Akgv@2026');
                                  setMemberActionNotice('Password copied to clipboard!');
                                  setTimeout(() => setMemberActionNotice(null), 3000);
                                }}
                                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-sans"
                                title="Copy Password"
                              >
                                <Copy className="h-3.5 w-3.5 text-[#C7A35A]" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>

                          {/* 1-Click Login URL Preview */}
                          <div className="border-t border-white/10 pt-2 space-y-1">
                            <span className="text-[10px] text-gray-400 font-sans block">
                              ⚡ {tLang(language, '1-Click Auto-Login Link (Opens Dashboard Directly):', '1-क्लिक ऑटो-लॉगिन लिंक (सीधे डैशबोर्ड खुलेगा):', '1-Click Auto-Login Link:')}
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                readOnly
                                value={createdSponsorFeedback.oneClickLoginUrl}
                                className="w-full rounded-lg bg-black/50 border border-white/10 px-2.5 py-1 text-[10px] text-sky-300 truncate focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (createdSponsorFeedback.oneClickLoginUrl) {
                                    navigator.clipboard.writeText(createdSponsorFeedback.oneClickLoginUrl);
                                    setMemberActionNotice('1-Click Login URL copied to clipboard!');
                                    setTimeout(() => setMemberActionNotice(null), 3000);
                                  }
                                }}
                                className="shrink-0 rounded-lg bg-white/10 hover:bg-white/20 p-1.5 text-gray-200 transition"
                                title="Copy 1-Click URL"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Email Status Indicator */}
                          {createdSponsorFeedback.emailDelivered ? (
                            <div className="text-emerald-300 font-sans font-semibold text-[11px] pt-1 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{tLang(language, 'Invitation email dispatched directly to recipient inbox!', 'आमंत्रण ईमेल सीधे प्राप्तकर्ता के इनबॉक्स में भेजा गया!', 'Invite email recipient ke inbox me bhej diya gaya!')}</span>
                            </div>
                          ) : (
                            <div className="text-amber-300/90 font-sans text-[11px] pt-1 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-amber-400" />
                              <span>{tLang(language, 'Direct email queued. You can also dispatch instantly via WhatsApp or Gmail below:', 'ईमेल कतारबद्ध है। आप नीचे दिए गए बटनों से व्हाट्सएप या जीमेल द्वारा तुरंत भेज सकते हैं:', 'Email queued hai. Aap turant WhatsApp ya Gmail se bhej sakte hain:')}</span>
                            </div>
                          )}
                        </div>

                        {/* Dispatch Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* WhatsApp Share Button */}
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(dossierText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-[#25D366] hover:bg-emerald-600 px-4 py-2 font-bold text-white text-[11px] flex items-center gap-1.5 shadow-md transition"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{tLang(language, 'Share on WhatsApp', 'व्हाट्सएप पर भेजें', 'WhatsApp Par Bhejein')}</span>
                          </a>

                          {/* Gmail Compose Button */}
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(createdSponsorFeedback.email)}&su=${encodeURIComponent(`AKGV Infra City — स्वागत एवं लॉगिन क्रेडेंशियल्स (${createdSponsorFeedback.code})`)}&body=${encodeURIComponent(dossierText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 font-bold text-white text-[11px] flex items-center gap-1.5 shadow-md transition"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>{tLang(language, 'Send via Gmail', 'Gmail से भेजें', 'Gmail Se Bhejein')}</span>
                          </a>

                          {/* Copy Full Credentials */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(dossierText);
                              setMemberActionNotice(tLang(language, 'Complete credentials copied to clipboard!', 'पूरा क्रेडेंशियल्स विवरण क्लिपबोर्ड पर कॉपी हो गया!', 'Complete credentials clipboard par copy ho gaya!'));
                              setTimeout(() => setMemberActionNotice(null), 4000);
                            }}
                            className="rounded-xl bg-[#C7A35A] hover:bg-[#DFC382] px-4 py-2 font-bold text-[#0B1734] text-[11px] flex items-center gap-1.5 shadow-md transition"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{tLang(language, 'Copy All Credentials', 'सभी क्रेडेंशियल्स कॉपी करें', 'Copy All Credentials')}</span>
                          </button>

                          {/* Test 1-Click Login Link */}
                          {createdSponsorFeedback.oneClickLoginUrl && (
                            <a
                              href={createdSponsorFeedback.oneClickLoginUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 px-3.5 py-2 font-bold text-sky-300 text-[11px] flex items-center gap-1.5 transition ml-auto"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{tLang(language, 'Test 1-Click Login', '1-क्लिक लॉगिन टेस्ट', 'Test 1-Click Login')}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {tLang(language, 'Full Name', 'पूरा नाम', 'Poora Naam')} <span className="text-[#C7A35A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Patel"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Mobile Number', 'मोबाइल नंबर', 'Mobile Number')} <span className="text-[#C7A35A]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9839012345"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Email Address (Gmail / Any Email)', 'ईमेल आईडी (Gmail / कोई भी ईमेल)', 'Email Address (Gmail / Any Email)')}
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@gmail.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                      <p className="mt-1 text-[10px] text-gray-400">
                        {tLang(
                          language,
                          'Normal Gmail supported. An invitation email will be dispatched to this address.',
                          'सामान्य Gmail समर्थित है। आमंत्रण ईमेल इसी पते पर भेजा जाएगा।',
                          'Normal Gmail supported hai. Invite email isi address par jayega.'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Login Password Input Field */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {tLang(language, 'Login Password', 'लॉगिन पासवर्ड', 'Login Password')} <span className="text-[#C7A35A]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewMemberPassword ? 'text' : 'password'}
                        required
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        placeholder="e.g. Akgv@2026"
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 pr-28 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none font-mono text-xs"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowNewMemberPassword(!showNewMemberPassword)}
                          className="text-gray-400 hover:text-white p-1 text-[10px]"
                          title={showNewMemberPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewMemberPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMemberPassword(`Akgv@${Math.floor(1000 + Math.random() * 9000)}`)}
                          className="rounded bg-[#C7A35A]/20 text-[#DFC382] hover:bg-[#C7A35A]/30 px-2 py-0.5 text-[10px] font-bold"
                          title="Auto Generate Password"
                        >
                          Auto Generate
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {tLang(
                        language,
                        'Default: Akgv@2026. This password will be included in the dossier sent via WhatsApp and Email, and auto-fills on 1-click login.',
                        'डिफ़ॉल्ट: Akgv@2026। यह पासवर्ड व्हाट्सएप और ईमेल द्वारा भेजे जाने वाले विवरण में शामिल होगा और 1-क्लिक लॉगिन में स्वतः भर जाएगा।',
                        'Default: Akgv@2026. Yeh password WhatsApp/Email me bheja jayega aur 1-click login par auto-fill hoga.'
                      )}
                    </p>
                  </div>

                  {/* Location & Assigned Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Native City / District', 'गृह जिला / शहर', 'Native City / District')}
                      </label>
                      <select
                        value={newMemberCity}
                        onChange={(e) => setNewMemberCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="Varanasi">{tLang(language, 'Varanasi', 'वाराणसी', 'Varanasi')}</option>
                        <option value="Chandauli">{tLang(language, 'Chandauli', 'चंदौली', 'Chandauli')}</option>
                        <option value="Mirzapur">{tLang(language, 'Mirzapur', 'मिर्जापुर', 'Mirzapur')}</option>
                        <option value="Prayagraj">{tLang(language, 'Prayagraj', 'प्रयागराज', 'Prayagraj')}</option>
                        <option value="Ghazipur">{tLang(language, 'Ghazipur', 'गाजीपुर', 'Ghazipur')}</option>
                        <option value="Bhadohi">{tLang(language, 'Bhadohi', 'भदोही', 'Bhadohi')}</option>
                        <option value="Jaunpur">{tLang(language, 'Jaunpur', 'जौनपुर', 'Jaunpur')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Assigned Branch Office', 'संबद्ध शाखा कार्यालय', 'Assigned Branch Office')}
                      </label>
                      <select
                        value={newMemberBranch}
                        onChange={(e) => setNewMemberBranch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="Rampur Head Office">{tLang(language, 'Rampur Head Office', 'रामपुर प्रधान कार्यालय', 'Rampur Head Office')}</option>
                        <option value="Lahartara Branch">{tLang(language, 'Lahartara Branch (Near Cantt)', 'लहरतारा शाखा (निकट कैंट)', 'Lahartara Branch (Cantt ke paas)')}</option>
                        <option value="Mirza Murad Branch">{tLang(language, 'Mirza Murad Branch (NH-19)', 'मिर्जामुराद शाखा (NH-19)', 'Mirza Murad Branch (NH-19)')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Role Assignment', 'पद आवंटन', 'Role Assignment')}
                      </label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="sub_admin">{tLang(language, 'Sub-Admin (Branch Coordinator)', 'सब-एडमिन (शाखा समन्वयक)', 'Sub-Admin (Branch Coordinator)')}</option>
                        <option value="senior_member">{tLang(language, 'Senior Manager / Sponsor', 'वरिष्ठ प्रबंधक / स्पॉन्सर', 'Senior Manager / Sponsor')}</option>
                        <option value="junior_member">{tLang(language, 'Field Associate / Agent', 'फील्ड एसोसिएट / एजेंट', 'Field Associate / Agent')}</option>
                        <option value="buyer">{tLang(language, 'Client / Plot Buyer', 'ग्राहक / प्लॉट खरीदार', 'Client / Plot Buyer')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Initial MLM Level', 'प्रारंभिक एमएलएम लेवल', 'Initial MLM Level')}
                      </label>
                      <select
                        value={newMemberLevel}
                        onChange={(e) => setNewMemberLevel(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value={1}>{tLang(language, 'Level 1: Sales Assistant (4% Comm)', 'लेवल 1: सेल्स असिस्टेंट (4% कमीशन)', 'Level 1: Sales Assistant (4% Comm)')}</option>
                        <option value={2}>{tLang(language, 'Level 2: Star Associate (5% Comm)', 'लेवल 2: स्टार एसोसिएट (5% कमीशन)', 'Level 2: Star Associate (5% Comm)')}</option>
                        <option value={3}>{tLang(language, 'Level 3: Gold Star (6% Comm)', 'लेवल 3: गोल्ड स्टार (6% कमीशन)', 'Level 3: Gold Star (6% Comm)')}</option>
                        <option value={4}>{tLang(language, 'Level 4: Diamond Star (7% Comm)', 'लेवल 4: डायमंड स्टार (7% कमीशन)', 'Level 4: Diamond Star (7% Comm)')}</option>
                        <option value={5}>{tLang(language, 'Level 5: Platinum Leader (8% Comm)', 'लेवल 5: प्लेटिनम लीडर (8% कमीशन)', 'Level 5: Platinum Leader (8% Comm)')}</option>
                        <option value={6}>{tLang(language, 'Level 6: Crown Leader (9% Comm)', 'लेवल 6: क्राउन लीडर (9% कमीशन)', 'Level 6: Crown Leader (9% Comm)')}</option>
                        <option value={7}>{tLang(language, 'Level 7: Director (10% Comm)', 'लेवल 7: निदेशक (10% कमीशन)', 'Level 7: Director (10% Comm)')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {tLang(language, 'Reporting Sponsor', 'सीनियर स्पॉन्सर', 'Reporting Sponsor')}
                    </label>
                    <select
                      value={newMemberSponsorId}
                      onChange={(e) => setNewMemberSponsorId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                    >
                      <option value="AKGV-HQ-001">Admin (AKGV-HQ-001)</option>
                      <option value="AKGV-3498">Vikram Singh (AKGV-3498)</option>
                      <option value="AKGV-SUB-101">Suresh Yadav Sub-Admin (AKGV-SUB-101)</option>
                      {allProfiles
                        .filter((p) => p.role === 'senior_member' && p.memberId !== 'AKGV-3498')
                        .map((p) => (
                          <option key={p.id} value={p.memberId || p.id}>
                            {p.fullName} ({p.memberId})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {tLang(language, 'Residential Address', 'स्थायी पता', 'Residential Address')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shiv Mandir, Mohalla, City"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>

                  {/* Secure Account Onboarding Notice */}
                  <div className="rounded-xl border border-[#C7A35A]/30 bg-gradient-to-r from-[#0F1E3D] to-[#070D1E] p-3 text-xs text-gray-300 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">
                        {tLang(language, 'Multi-Channel Onboarding & 1-Click Login Ready', 'मल्टी-चैनल नामांकन एवं 1-क्लिक लॉगिन तैयार', 'Multi-Channel Onboarding & 1-Click Login Ready')}
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-400 leading-relaxed">
                        {tLang(
                          language,
                          'Upon enrollment, an official login dossier with initial password and a 1-click auto-login link is generated. You can dispatch it immediately via WhatsApp or Gmail with one tap.',
                          'नामांकन पर, प्रारंभिक पासवर्ड और 1-क्लिक ऑटो-लॉगिन लिंक के साथ आधिकारिक विवरण तैयार होता है जिसे आप सीधे व्हाट्सएप या जीमेल से भेज सकते हैं।',
                          'Enrollment par initial password aur 1-click direct auto login link generate hoga jise aap turant WhatsApp ya Gmail se bhej sakte hain.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddMemberModalOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-2.5 font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
                    >
                      Save & Issue Member Code
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 2: EDIT MEMBER ================= */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
              <div className="relative my-auto w-full max-w-lg rounded-2xl border border-blue-500/40 bg-[#070D1E] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1734] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-blue-400" />
                    <h3 className="font-serif text-sm font-bold text-white">
                      Edit Member Details — {editingMember.fullName}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingMember(null)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditMember} className="p-5 space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        disabled={editingMember.id === currentUser.id}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
                      >
                        <option value="super_admin">Admin</option>
                        <option value="sub_admin">Sub-Admin (Coordinator)</option>
                        <option value="senior_member">Senior Manager</option>
                        <option value="junior_member">Field Associate</option>
                        <option value="buyer">Plot Buyer</option>
                      </select>
                      {editingMember.id === currentUser.id && (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Cannot change own admin role
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Reporting Sponsor ID</label>
                      <input
                        type="text"
                        value={editSponsorId}
                        onChange={(e) => setEditSponsorId(e.target.value)}
                        placeholder="e.g. AKGV-3498"
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">KYC Status</label>
                      <select
                        value={editKycStatus}
                        onChange={(e) => setEditKycStatus(e.target.value as KycStatus)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="verified">{tLang(language, 'Verified', 'सत्यापित', 'Verified')}</option>
                        <option value="pending">{tLang(language, 'Pending Review', 'समीक्षाधीन', 'Pending Review')}</option>
                        <option value="submitted">{tLang(language, 'Submitted', 'जमा किया', 'Submitted')}</option>
                        <option value="rejected">{tLang(language, 'Rejected', 'अस्वीकृत', 'Rejected')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Account Access', 'खाता पहुंच', 'Account Access')}
                      </label>
                      <select
                        value={editIsActive ? 'active' : 'suspended'}
                        onChange={(e) => setEditIsActive(e.target.value === 'active')}
                        disabled={editingMember.id === currentUser.id}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
                      >
                        <option value="active">{tLang(language, 'Active Access', 'सक्रिय पहुंच', 'Active Access')}</option>
                        <option value="suspended">{tLang(language, 'Suspended / Blocked', 'निलंबित / अवरुद्ध', 'Suspended / Blocked')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Assigned Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Native City / District', 'गृह जिला / शहर', 'City / District')}
                      </label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="Varanasi">{tLang(language, 'Varanasi', 'वाराणसी', 'Varanasi')}</option>
                        <option value="Chandauli">{tLang(language, 'Chandauli', 'चंदौली', 'Chandauli')}</option>
                        <option value="Mirzapur">{tLang(language, 'Mirzapur', 'मिर्जापुर', 'Mirzapur')}</option>
                        <option value="Prayagraj">{tLang(language, 'Prayagraj', 'प्रयागराज', 'Prayagraj')}</option>
                        <option value="Ghazipur">{tLang(language, 'Ghazipur', 'गाजीपुर', 'Ghazipur')}</option>
                        <option value="Bhadohi">{tLang(language, 'Bhadohi', 'भदोही', 'Bhadohi')}</option>
                        <option value="Jaunpur">{tLang(language, 'Jaunpur', 'जौनपुर', 'Jaunpur')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Assigned Branch Office', 'संबद्ध शाखा कार्यालय', 'Assigned Branch Office')}
                      </label>
                      <select
                        value={editBranchLocation}
                        onChange={(e) => setEditBranchLocation(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="Rampur Head Office">{tLang(language, 'Rampur Head Office', 'रामपुर प्रधान कार्यालय', 'Rampur Head Office')}</option>
                        <option value="Lahartara Branch">{tLang(language, 'Lahartara Branch (Near Cantt)', 'लहरतारा शाखा (निकट कैंट)', 'Lahartara Branch (Cantt ke paas)')}</option>
                        <option value="Mirza Murad Branch">{tLang(language, 'Mirza Murad Branch (NH-19)', 'मिर्जामुराद शाखा (NH-19)', 'Mirza Murad Branch (NH-19)')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Level & Rank Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'MLM Tier Level', 'एमएलएम लेवल', 'MLM Tier Level')}
                      </label>
                      <select
                        value={editLevel}
                        onChange={(e) => {
                          const lvl = Number(e.target.value);
                          setEditLevel(lvl);
                          setEditRankTitle(getLevelInfo(lvl).defaultRank);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value={1}>{tLang(language, 'Level 1: Sales Assistant (4% Comm)', 'लेवल 1: सेल्स असिस्टेंट (4% कमीशन)', 'Level 1: Sales Assistant (4% Comm)')}</option>
                        <option value={2}>{tLang(language, 'Level 2: Star Associate (5% Comm)', 'लेवल 2: स्टार एसोसिएट (5% कमीशन)', 'Level 2: Star Associate (5% Comm)')}</option>
                        <option value={3}>{tLang(language, 'Level 3: Gold Star (6% Comm)', 'लेवल 3: गोल्ड स्टार (6% कमीशन)', 'Level 3: Gold Star (6% Comm)')}</option>
                        <option value={4}>{tLang(language, 'Level 4: Diamond Star (7% Comm)', 'लेवल 4: डायमंड स्टार (7% कमीशन)', 'Level 4: Diamond Star (7% Comm)')}</option>
                        <option value={5}>{tLang(language, 'Level 5: Platinum Leader (8% Comm)', 'लेवल 5: प्लेटिनम लीडर (8% कमीशन)', 'Level 5: Platinum Leader (8% Comm)')}</option>
                        <option value={6}>{tLang(language, 'Level 6: Crown Leader (9% Comm)', 'लेवल 6: क्राउन लीडर (9% कमीशन)', 'Level 6: Crown Leader (9% Comm)')}</option>
                        <option value={7}>{tLang(language, 'Level 7: Director (10% Comm)', 'लेवल 7: निदेशक (10% कमीशन)', 'Level 7: Director (10% Comm)')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Official Rank Title', 'आधिकारिक पदनाम', 'Official Rank Title')}
                      </label>
                      <input
                        type="text"
                        value={editRankTitle}
                        onChange={(e) => setEditRankTitle(e.target.value)}
                        placeholder="e.g. Star Associate / Senior Manager"
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Volume & Plots Closed */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Business Volume (₹)', 'कुल बिज़नेस (₹)', 'Business Volume (₹)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={editBusinessVolume}
                        onChange={(e) => setEditBusinessVolume(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Plots Closed Count', 'पूर्ण किए गए प्लॉट्स', 'Plots Closed Count')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editPlotsClosed}
                        onChange={(e) => setEditPlotsClosed(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        {tLang(language, 'Joined Date', 'जुड़ने की तिथि', 'Joined Date')}
                      </label>
                      <input
                        type="date"
                        value={editJoinedDate}
                        onChange={(e) => setEditJoinedDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {tLang(language, 'Residential Address', 'स्थायी पता', 'Residential Address')}
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. Near Shiv Mandir, Mohalla, City"
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="rounded-xl px-4 py-2.5 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-500 active:scale-95 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL 3: VIEW MEMBER DETAILS (COMPREHENSIVE DOSSIER) ================= */}
          {viewingMember && (() => {
            const { joinedFormatted, tenureFormatted } = formatTenure(viewingMember.joinedDate || viewingMember.createdAt);
            const levelInfo = getLevelInfo(viewingMember.level);
            const memberBookings = bookings.filter(
              (b) => b.buyerId === viewingMember.id || b.buyerPhone === viewingMember.phone
            );
            const totalBuyerPaid = memberBookings.reduce((sum, b) => sum + b.paidAmountInr, 0);
            const totalBuyerCommitted = memberBookings.reduce((sum, b) => sum + b.totalAmountInr, 0);
            const directDownlines = allProfiles.filter(
              (p) => p.sponsorId === viewingMember.id || p.sponsorId === viewingMember.memberId
            );

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
                <div className="relative my-auto w-full max-w-2xl rounded-2xl border border-[#C7A35A] bg-[#070D1E] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1734] px-5 py-3.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[#C7A35A]" />
                      <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                        {tLang(language, 'Executive Member Dossier', 'सदस्य संपूर्ण विवरण', 'Executive Member Dossier')}
                      </h3>
                    </div>
                    <button
                      onClick={() => setViewingMember(null)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4 text-xs overflow-y-auto">
                    {/* Top Profile Card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#C7A35A] bg-[#050A17] font-serif text-lg font-bold text-[#DFC382] overflow-hidden shadow-lg">
                          {viewingMember.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={viewingMember.avatarUrl}
                              alt={viewingMember.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            viewingMember.fullName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-white">
                            {viewingMember.fullName}
                          </h4>
                          <span className="text-gray-400 text-xs block">{viewingMember.email}</span>
                          <span className="text-[#DFC382] font-mono text-xs">+91 {viewingMember.phone}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold border inline-block ${getRoleBadge(viewingMember.role).bg}`}>
                          {getRoleBadge(viewingMember.role).label}
                        </span>
                        <div className="text-[10px] text-gray-400">
                          {tLang(language, 'Account:', 'खाता स्थिति:', 'Account:')}{' '}
                          <strong className={viewingMember.isActive ? 'text-emerald-400' : 'text-red-400'}>
                            {viewingMember.isActive
                              ? tLang(language, 'ACTIVE ACCESS', 'सक्रिय पहुंच', 'ACTIVE ACCESS')
                              : tLang(language, 'SUSPENDED', 'निलंबित', 'SUSPENDED')}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: Geographic & Branch Information */}
                    <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#DFC382] font-bold text-xs border-b border-white/5 pb-1.5">
                        <MapPin className="h-4 w-4 text-[#C7A35A]" />
                        <span>{tLang(language, '1. Regional & Branch Details', '1. क्षेत्रीय एवं शाखा विवरण', '1. Regional aur Branch Details')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'Native City / District:', 'गृह जिला / शहर:', 'Native City / District:')}</span>
                          <strong className="text-white text-xs block font-serif">
                            {viewingMember.city || tLang(language, 'Varanasi', 'वाराणसी', 'Varanasi')}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'Assigned Branch Office:', 'संबद्ध शाखा कार्यालय:', 'Assigned Branch Office:')}</span>
                          <strong className="text-[#DFC382] text-xs block">
                            {viewingMember.branchLocation || tLang(language, 'Rampur Head Office', 'रामपुर प्रधान कार्यालय', 'Rampur Head Office')}
                          </strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'Permanent Residential / Office Address:', 'स्थायी निवास / कार्यालय पता:', 'Permanent Residential / Office Address:')}</span>
                          <p className="text-gray-200 text-xs mt-0.5">
                            {viewingMember.address || tLang(language, 'Address registered with branch records (Varanasi Region, Uttar Pradesh)', 'शाखा रिकॉर्ड में पंजीकृत पता (वाराणसी क्षेत्र, उत्तर प्रदेश)', 'Branch records me registered address (Varanasi Region, UP)')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Tenure & Enrollment Record */}
                    <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs border-b border-white/5 pb-1.5">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>{tLang(language, '2. Enrollment & Active Tenure', '2. नामांकन एवं सक्रिय कार्यकाल', '2. Enrollment aur Active Tenure')}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center sm:text-left">
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'Joining Date', 'जुड़ने की तिथि', 'Joining Date')}</span>
                          <strong className="text-white text-xs block">{joinedFormatted}</strong>
                        </div>
                        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/20 p-2.5">
                          <span className="text-emerald-300 text-[10px] block">{tLang(language, 'Active Duration', 'सक्रिय अवधि', 'Active Duration')}</span>
                          <strong className="text-emerald-400 text-xs block">{tenureFormatted}</strong>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'Member ID', 'सदस्य आईडी', 'Member ID')}</span>
                          <strong className="text-[#DFC382] font-mono text-xs block">
                            {viewingMember.memberId || 'N/A'}
                          </strong>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">{tLang(language, 'KYC Verification', 'केवाईसी सत्यापन', 'KYC Verification')}</span>
                          <strong className="text-emerald-400 text-xs block uppercase">
                            {viewingMember.kycStatus || 'VERIFIED'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Rank, MLM Level & Performance Record */}
                    <div className="rounded-xl border border-[#C7A35A]/30 bg-[#0B1734] p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1.5 text-[#DFC382] font-bold text-xs">
                          <Award className="h-4 w-4 text-[#C7A35A]" />
                          <span>{tLang(language, '3. Professional Rank, Level & Volume', '3. व्यावसायिक पद, स्तर एवं बिज़नेस', '3. Professional Rank, Level aur Volume')}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: levelInfo.level }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">MLM Tier Level</span>
                          <strong className="text-[#DFC382] text-sm block">
                            Level {viewingMember.level || levelInfo.level}
                          </strong>
                          <span className="text-[10px] text-gray-400">
                            {viewingMember.rankTitle || levelInfo.defaultRank}
                          </span>
                        </div>

                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">Commission Tier</span>
                          <strong className="text-emerald-400 text-sm block">
                            {levelInfo.percent}% Direct
                          </strong>
                          <span className="text-[10px] text-gray-400">Ground truth payout</span>
                        </div>

                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">Reporting Senior</span>
                          <strong className="text-white text-xs block truncate">
                            {viewingMember.sponsorId || 'AKGV-HQ-001 (Company HQ)'}
                          </strong>
                          <span className="text-[10px] text-gray-400">Executive upline</span>
                        </div>

                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">Cumulative Sales Volume</span>
                          <strong className="text-emerald-300 text-sm block">
                            {formatBusinessVolume(viewingMember.totalBusinessVolumeInr)}
                          </strong>
                          <span className="text-[10px] text-gray-400">
                            ₹{Number(viewingMember.totalBusinessVolumeInr || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">Plots Closed / Booked</span>
                          <strong className="text-white text-sm block">
                            {viewingMember.plotsClosedCount || 0} Plots
                          </strong>
                          <span className="text-[10px] text-gray-400">Verified contracts</span>
                        </div>

                        <div className="rounded-lg bg-[#050A17] p-2.5 border border-white/5">
                          <span className="text-gray-400 text-[10px] block">Direct Downlines</span>
                          <strong className="text-[#DFC382] text-sm block">
                            {directDownlines.length} Partners
                          </strong>
                          <span className="text-[10px] text-gray-400">Network team size</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Client / Buyer Specifics (If buyer or has bookings) */}
                    {(viewingMember.role === 'buyer' || memberBookings.length > 0) && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                            <Home className="h-4 w-4 text-emerald-400" />
                            <span>{tLang(language, '4. Client Property Portfolio', '4. खरीदार भूखंड विवरण एवं भुगतान', '4. Client Property Portfolio')}</span>
                          </div>
                          <span className="text-emerald-400 font-bold text-[11px]">
                            {memberBookings.length} {tLang(language, 'Plot(s) Linked', 'भूखंड जुड़े', 'Plot(s) Linked')}
                          </span>
                        </div>

                        {memberBookings.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">
                            Prospective Buyer / Client — Lead registered under {viewingMember.branchLocation || 'Rampur Branch'}. No confirmed plot allotment yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                                <span className="text-gray-400 text-[10px] block">Total Property Value</span>
                                <strong className="text-white text-xs block">
                                  ₹{totalBuyerCommitted.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                                <span className="text-gray-400 text-[10px] block">Total Paid to Date</span>
                                <strong className="text-emerald-400 text-xs block">
                                  ₹{totalBuyerPaid.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div className="rounded-lg bg-black/40 p-2 border border-white/5 col-span-2 sm:col-span-1">
                                <span className="text-gray-400 text-[10px] block">Payment Clearance</span>
                                <strong className="text-amber-300 text-xs block">
                                  {totalBuyerPaid >= totalBuyerCommitted ? '100% Fully Paid' : `₹${(totalBuyerCommitted - totalBuyerPaid).toLocaleString('en-IN')} Remaining`}
                                </strong>
                              </div>
                            </div>

                            <div className="space-y-1 pt-1">
                              {memberBookings.map((b) => (
                                <div
                                  key={b.id}
                                  className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 border border-white/5 text-[11px]"
                                >
                                  <div>
                                    <strong className="text-[#DFC382] font-mono">{b.plotNumber}</strong>{' '}
                                    <span className="text-gray-300">({b.bookingNumber})</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-emerald-400 font-bold">
                                      ₹{b.paidAmountInr.toLocaleString('en-IN')}
                                    </span>{' '}
                                    <span className="text-gray-400 text-[10px]">/ ₹{b.totalAmountInr.toLocaleString('en-IN')}</span>
                                    <span className="ml-2 rounded px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 uppercase">
                                      {b.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 5: Direct Downlines Team List */}
                    <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="font-bold text-gray-200">
                          5. Direct Network Downlines ({directDownlines.length})
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Recruited under this member code
                        </span>
                      </div>

                      {directDownlines.length === 0 ? (
                        <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-center text-gray-400 text-[11px]">
                          No direct downlines enrolled under this member code yet.
                        </div>
                      ) : (
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {directDownlines.map((downline) => (
                            <div
                              key={downline.id}
                              className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0B1734] px-3 py-2 text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-white block">{downline.fullName}</span>
                                <span className="text-gray-400 text-[10px]">
                                  {downline.phone} • {downline.city || 'Varanasi'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[#DFC382] font-semibold text-[10px] block">
                                  {downline.memberId || 'N/A'}
                                </span>
                                <span className="text-[9px] text-emerald-400 uppercase font-medium">
                                  Level {downline.level || 1}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action / Contact Buttons */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${viewingMember.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Namaste ${viewingMember.fullName}, this is regarding your AKGV Infra City account (${viewingMember.memberId || 'Member'}).`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white text-[11px] shadow-md hover:brightness-110 transition"
                        >
                          <span>WhatsApp Chat</span>
                        </a>
                        <a
                          href={`tel:${viewingMember.phone}`}
                          className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white text-[11px] hover:bg-white/10 transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Call</span>
                        </a>
                      </div>

                      <button
                        onClick={() => setViewingMember(null)}
                        className="rounded-xl border border-white/10 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition"
                      >
                        Close Dossier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= MODAL 4: DELETE MEMBER CONFIRMATION ================= */}
          {deletingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
              <div className="relative my-auto w-full max-w-md rounded-2xl border border-red-500/60 bg-[#070D1E] p-6 shadow-2xl space-y-4 text-xs">
                <div className="flex items-center gap-3 text-red-400">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      {tLang(language, 'Confirm Member Removal', 'सदस्य हटाने की पुष्टि करें', 'Member Removal Confirm Karein')}
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {tLang(language, 'Permanent System Action', 'स्थायी सिस्टम कार्रवाई', 'Permanent System Action')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Are you sure you want to remove <strong className="text-white">{deletingMember.fullName}</strong> (
                  <span className="font-mono text-[#DFC382]">{deletingMember.memberId || deletingMember.phone}</span>
                  )? This will revoke their platform access and remove them from the active associate directory.
                </p>

                <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-[11px] text-red-300">
                  Note: Reporting downlines and existing booking logs will be preserved under corporate archive.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeletingMember(null)}
                    className="rounded-xl px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white shadow-lg hover:bg-red-500 active:scale-95 transition"
                  >
                    Yes, Remove Member
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Plot Inventory Governance & Management */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          {/* Action Notification Alert */}
          {plotActionNotice && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-5 py-3 text-xs text-emerald-300 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{plotActionNotice}</span>
              </div>
              <button
                onClick={() => setPlotActionNotice(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Top Control Bar with Add Plot Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1734] p-5 rounded-3xl border border-[#C7A35A]/30 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white">Master Plan Plot Inventory Governance</h2>
                <span className="rounded-full bg-[#C7A35A]/15 border border-[#C7A35A]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382]">
                  1:500 Scale Blueprint
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Manage all demarcated plots, assign architectural elevations, update valuations, or register new plots directly into the master plan canvas.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPlot(null);
                setIsPlotModalOpen(true);
              }}
              type="button"
              className="self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 transition flex items-center gap-2 hover:scale-[1.02] shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{tLang(language, 'Register New Plot', 'नया प्लॉट जोड़ें', 'Naya Plot Register Karein')}</span>
            </button>
          </div>

          {/* Cadastral Inventory & Corporate Survey Reconciliation Audit Dossier */}
          {(() => {
            const totalCodedPlots = plots.length;
            const totalCodedAreaSqft = plots.reduce((acc, p) => acc + (Number(p.areaSqft) || 0), 0);
            const brochureNetAreaSqft = 55970;
            const varianceSqft = totalCodedAreaSqft - brochureNetAreaSqft;
            const blockA = plots.filter((p) => p.block === 'A');
            const blockB = plots.filter((p) => p.block === 'B');
            const blockC = plots.filter((p) => p.block === 'C');

            return (
              <div className="rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0F1E3D] to-[#070D1E] p-5 shadow-xl text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl border border-[#C7A35A]/40 bg-[#12234e] flex items-center justify-center shrink-0">
                      <FileCheck className="h-5 w-5 text-[#C7A35A]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-sm font-bold text-white">
                          {tLang(language, 'Cadastral Inventory & Survey Reconciliation Audit', 'कैडस्ट्रल इन्वेंट्री एवं सर्वेक्षण समाधान ऑडिट', 'Inventory & Survey Reconciliation Audit')}
                        </h3>
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{tLang(language, 'Awaiting Corporate Survey Re-Certification', 'कॉर्पोरेट सर्वेक्षण पुनः प्रमाणीकरण प्रतीक्षित', 'Awaiting Corporate Survey Re-Certification')}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {tLang(
                          language,
                          'Brochure marketing summary vs. actual master-plan demarcated plot dimensions reconciliation.',
                          'विपणन विवरणिका बनाम वास्तविक मास्टर-प्लान सीमांकित प्लॉट आयामों का मिलान विवरण।',
                          'Brochure marketing summary vs actual master plan plot dimensions reconciliation.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const csvRows = [
                          'Plot Number,Block,Dimensions,Area SqFt,Road Width,Road Facing,Base Price INR,Status,Audit Variance Note',
                          ...plots.map((p) => {
                            let note = 'Nominal';
                            if (['C-06', 'C-07', 'C-08', 'C-09', 'C-10'].includes(p.plotNumber)) {
                              note = 'Commercial Rounding: INR 13,60,000 recorded vs arithmetic INR 13,60,800 (-INR 800)';
                            }
                            return `"${p.plotNumber}","${p.block}","${p.dimensions}",${p.areaSqft},"${p.roadWidth}","${p.roadFacing}",${p.basePriceInr},"${p.status}","${note}"`;
                          }),
                          '',
                          `"SUMMARY TOTALS: Coded Plots: ${totalCodedPlots} | Coded Area: ${totalCodedAreaSqft} sqft | Brochure Net: ${brochureNetAreaSqft} sqft | Variance: +${varianceSqft} sqft"`
                        ];
                        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `akgv_inventory_reconciliation_audit_${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-gray-200 flex items-center gap-1.5 transition"
                    >
                      <Download className="h-3.5 w-3.5 text-[#C7A35A]" />
                      <span>{tLang(language, 'Export Audit CSV', 'ऑडिट सीएसवी डाउनलोड करें', 'Export Audit CSV')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAuditDossierExpanded(!isAuditDossierExpanded)}
                      className="rounded-xl border border-[#C7A35A]/30 bg-[#0B1734] hover:bg-[#12234e] px-3 py-1.5 text-[11px] font-bold text-[#DFC382] flex items-center gap-1.5 transition"
                    >
                      <span>{isAuditDossierExpanded ? tLang(language, 'Collapse', 'संक्षिप्त करें', 'Collapse') : tLang(language, 'View Reconciliation Ledger', 'समाधान खाता देखें', 'View Ledger')}</span>
                      {isAuditDossierExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Audit Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="rounded-2xl border border-white/10 bg-[#050A17]/80 p-3">
                    <span className="block text-[10px] text-gray-400 font-sans uppercase tracking-wider">{tLang(language, 'Brochure Net Area', 'विवरणिका शुद्ध क्षेत्रफल', 'Brochure Net Area')}</span>
                    <span className="font-serif text-base font-bold text-white mt-1 block">55,970 <span className="text-xs font-sans text-gray-400">sq ft</span></span>
                    <span className="text-[10px] text-gray-400">1,00,000 - 44,030 (Roads)</span>
                  </div>

                  <div className="rounded-2xl border border-[#C7A35A]/40 bg-[#050A17]/80 p-3">
                    <span className="block text-[10px] text-[#DFC382] font-sans uppercase tracking-wider">{tLang(language, 'Demarcated Total Area', 'सीमांकित कुल क्षेत्रफल', 'Demarcated Total Area')}</span>
                    <span className="font-serif text-base font-bold text-white mt-1 block">{totalCodedAreaSqft.toLocaleString('en-IN')} <span className="text-xs font-sans text-gray-400">sq ft</span></span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{totalCodedPlots} Demarcated Plots</span>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3">
                    <span className="block text-[10px] text-amber-300 font-sans uppercase tracking-wider">{tLang(language, 'Survey Variance', 'सर्वेक्षण अंतर', 'Survey Variance')}</span>
                    <span className="font-serif text-base font-bold text-amber-300 mt-1 block">+{varianceSqft.toLocaleString('en-IN')} <span className="text-xs font-sans text-amber-400/80">sq ft</span></span>
                    <span className="text-[10px] text-amber-400 font-medium">+2.68% Cadastral Difference</span>
                  </div>

                  <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-3">
                    <span className="block text-[10px] text-sky-300 font-sans uppercase tracking-wider">{tLang(language, 'Block-C Rounding', 'ब्लॉक-सी राउंडिंग', 'Block-C Rounding')}</span>
                    <span className="font-serif text-base font-bold text-sky-300 mt-1 block">5 Plots <span className="text-xs font-sans text-sky-400/80">(C-06..C-10)</span></span>
                    <span className="text-[10px] text-sky-300 font-medium">₹13.60L (-₹800/plot diff)</span>
                  </div>
                </div>

                {/* Expandable Reconciliation Ledger */}
                {isAuditDossierExpanded && (
                  <div className="rounded-2xl border border-white/10 bg-[#050A17]/90 p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/10 pb-2">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <span>{tLang(language, 'Corporate Survey Compliance Findings & Directives', 'कॉर्पोरेट सर्वेक्षण अनुपालन निष्कर्ष एवं निर्देश', 'Corporate Survey Findings')}</span>
                    </div>

                    <div className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
                      <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/30">
                        <strong className="text-amber-300">1. Area Discrepancy Reconciliation (+1,500 sq ft):</strong> Marketing summary brochure states net plot area of <code className="text-white bg-black/40 px-1.5 py-0.5 rounded">55,970 sq ft</code>. The actual individual sum across the 55 CAD-demarcated plots is <code className="text-white bg-black/40 px-1.5 py-0.5 rounded">57,470 sq ft</code>. In compliance with strict engineering governance, the master plan retains authoritative cadastral dimensions rather than mutating numbers, flagged under executive survey re-certification.
                      </div>

                      <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-950/30">
                        <strong className="text-sky-300">2. Commercial Rounding on Plots C-06 to C-10:</strong> Plots C-06, C-07, C-08, C-09, and C-10 are 27&apos; x 42&apos; (1,134 sq ft). At standard ₹1,200/sq ft base valuation, arithmetic equals <code className="text-white bg-black/40 px-1.5 py-0.5 rounded">₹13,60,800</code>. Official brochure establishes a published corporate price of <code className="text-white bg-black/40 px-1.5 py-0.5 rounded">₹13,60,000</code> (rounded incentive of ₹800 per plot).
                      </div>
                    </div>

                    {/* Block-wise Summary Table */}
                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400">
                            <th className="py-1.5 px-2">Block</th>
                            <th className="py-1.5 px-2">Demarcated Plots</th>
                            <th className="py-1.5 px-2">Cumulative Area</th>
                            <th className="py-1.5 px-2">Road Access</th>
                            <th className="py-1.5 px-2">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                          <tr>
                            <td className="py-2 px-2 font-bold text-white">Block A</td>
                            <td className="py-2 px-2">{blockA.length} Plots (A-01 to A-10)</td>
                            <td className="py-2 px-2 text-emerald-300 font-semibold">{blockA.reduce((a, p) => a + (Number(p.areaSqft) || 0), 0).toLocaleString('en-IN')} sq ft</td>
                            <td className="py-2 px-2 text-gray-400">30&apos;-0&quot; Wide Road</td>
                            <td className="py-2 px-2 text-emerald-400">Verified</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 font-bold text-white">Block B</td>
                            <td className="py-2 px-2">{blockB.length} Plots (B-01 to B-10)</td>
                            <td className="py-2 px-2 text-emerald-300 font-semibold">{blockB.reduce((a, p) => a + (Number(p.areaSqft) || 0), 0).toLocaleString('en-IN')} sq ft</td>
                            <td className="py-2 px-2 text-gray-400">30&apos;-0&quot; Wide Road</td>
                            <td className="py-2 px-2 text-emerald-400">Verified</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 font-bold text-white">Block C</td>
                            <td className="py-2 px-2">{blockC.length} Plots (C-01 to C-35)</td>
                            <td className="py-2 px-2 text-emerald-300 font-semibold">{blockC.reduce((a, p) => a + (Number(p.areaSqft) || 0), 0).toLocaleString('en-IN')} sq ft</td>
                            <td className="py-2 px-2 text-gray-400">25&apos;-0&quot; &amp; 30&apos;-0&quot; Roads</td>
                            <td className="py-2 px-2 text-amber-400">Rounding Reconciled</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#050A17] p-3.5 rounded-2xl border border-white/10 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={plotSearchQuery}
                onChange={(e) => setPlotSearchQuery(e.target.value)}
                placeholder="Search by Plot # (e.g. A-04), dimensions, area, or facing..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1734] pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
              {plotSearchQuery && (
                <button
                  onClick={() => setPlotSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-white/10 bg-[#0B1734] p-0.5">
                {(['ALL', 'A', 'B', 'C', 'D'] as const).map((blk) => (
                  <button
                    key={blk}
                    onClick={() => setPlotFilterBlock(blk)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                      plotFilterBlock === blk
                        ? 'bg-[#C7A35A] text-[#0B1734] font-bold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {blk === 'ALL' ? 'All Blocks' : `Block ${blk}`}
                  </button>
                ))}
              </div>

              <div className="flex rounded-lg border border-white/10 bg-[#0B1734] p-0.5">
                {(['ALL', 'available_green', 'booked_yellow', 'vacant_red'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPlotFilterStatus(st)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                      plotFilterStatus === st
                        ? 'bg-[#C7A35A] text-[#0B1734] font-bold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st === 'available_green' ? 'Available' : st === 'booked_yellow' ? 'Booked' : 'Vacant'}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-gray-400 ml-1">
                Showing {filteredPlots.length} of {plots.length}
              </span>
            </div>
          </div>

          {/* Plots Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1734] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Plot #</th>
                    <th className="px-4 py-3">Block & Facing</th>
                    <th className="px-4 py-3">Area & Dimensions</th>
                    <th className="px-4 py-3">Road Corridor</th>
                    <th className="px-4 py-3">Base Valuation</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {filteredPlots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No plots found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPlots.map((plot) => (
                      <tr key={plot.id} id={plot.id} data-record-id={plot.id} data-plot-number={plot.plotNumber} className="hover:bg-white/5 transition">
                        {/* Plot Number & Corner badge */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-white text-sm">{plot.plotNumber}</span>
                            {plot.isCornerPlot && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                Corner
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Block & Facing */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#DFC382]">Block {plot.block}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Compass className="h-3 w-3 text-gray-500" />
                            <span>{plot.roadFacing || 'North'}</span>
                          </div>
                        </td>

                        {/* Area & Dimensions */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{plot.areaSqft} sqft</div>
                          <span className="text-[10px] text-gray-400 font-mono">{plot.dimensions}</span>
                        </td>

                        {/* Road Corridor */}
                        <td className="px-4 py-3 text-gray-300">{plot.roadWidth}</td>

                        {/* Base Price */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-white">
                            ₹{((plot.basePriceInr || 1200000) / 100000).toFixed(2)} Lakh
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            ₹{Math.round((plot.basePriceInr || 1200000) / (plot.areaSqft || 1000))}/sqft
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              plot.status === 'available_green'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : plot.status === 'booked_yellow'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                          >
                            {plot.status === 'available_green'
                              ? 'Available (Green)'
                              : plot.status === 'booked_yellow'
                              ? 'Booked (Yellow)'
                              : 'Vacant (Red)'}
                          </span>
                        </td>

                        {/* Administrative Action Buttons */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast status toggles */}
                            {plot.status !== 'available_green' && (
                              <button
                                onClick={() => updatePlotStatus(plot.id, 'available_green', 'Admin marked available')}
                                className="rounded px-2 py-1 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition text-[11px]"
                                title="Make Available for Booking"
                              >
                                Set Green
                              </button>
                            )}
                            {plot.status !== 'booked_yellow' && (
                              <button
                                onClick={() => updatePlotStatus(plot.id, 'booked_yellow', 'Admin marked booked')}
                                className="rounded px-2 py-1 bg-amber-600/30 text-amber-400 border border-amber-500/40 hover:bg-amber-600 hover:text-white transition text-[11px]"
                                title="Mark as Confirmed Booked"
                              >
                                Set Yellow
                              </button>
                            )}
                            {plot.status !== 'vacant_red' && (
                              <button
                                onClick={() => updatePlotStatus(plot.id, 'vacant_red', 'Admin marked vacant')}
                                className="rounded px-2 py-1 bg-red-600/30 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white transition text-[11px]"
                                title="Set to Vacant/Reserved"
                              >
                                Set Red
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingPlot(plot);
                                setIsPlotModalOpen(true);
                              }}
                              className="rounded p-1.5 bg-white/5 border border-white/10 text-[#DFC382] hover:bg-white/10 transition"
                              title="Edit plot details"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingPlot(plot)}
                              className="rounded p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                              title="Delete plot"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Plot Confirmation Dialog */}
          {deletingPlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-6 shadow-2xl text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      Delete Plot #{deletingPlot.plotNumber}?
                    </h3>
                    <p className="text-xs text-gray-400">
                      Block {deletingPlot.block} • {deletingPlot.areaSqft} sqft
                    </p>
                  </div>
                </div>

                {bookings.some((b) => b.plotId === deletingPlot.id && b.status !== 'cancelled') ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    ⚠️ Cannot delete this plot because it has active client bookings. Please reassign or cancel the booking first.
                  </div>
                ) : (
                  <p className="text-xs text-gray-300">
                    Are you sure you want to permanently delete Plot <strong>#{deletingPlot.plotNumber}</strong> from the master plan layout? This action cannot be undone.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDeletingPlot(null)}
                    className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
                  >
                    {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
                  </button>
                  {!bookings.some((b) => b.plotId === deletingPlot.id && b.status !== 'cancelled') && (
                    <button
                      onClick={() => {
                        deletePlot(deletingPlot.id);
                        setPlotActionNotice(`Plot #${deletingPlot.plotNumber} successfully deleted.`);
                        setDeletingPlot(null);
                      }}
                      className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      {tLang(language, 'Confirm Delete', 'हटाने की पुष्टि करें', 'Delete Confirm Karein')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Plot Add & Edit Management Modal */}
          <PlotManagementModal
            isOpen={isPlotModalOpen}
            onClose={() => {
              setIsPlotModalOpen(false);
              setEditingPlot(null);
            }}
            plotToEdit={editingPlot}
            onSuccessNotice={(msg) => setPlotActionNotice(msg)}
          />
        </div>
      )}

      {/* Tab 3: Payment Verification Desk */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-white">Submitted Payment Verifications</h2>
              <p className="text-xs text-gray-400">
                Verify transaction references against bank account deposits before issuing official receipts
              </p>
            </div>
            {paymentActionNotice && (
              <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {paymentActionNotice}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Tx Ref & Mode</th>
                  <th className="px-4 py-3">Plot #</th>
                  <th className="px-4 py-3">Payer Name</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Supervisory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} id={p.id} data-record-id={p.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-white">{p.transactionRef}</div>
                      <span className="text-[10px] text-gray-400">{p.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#DFC382]">{p.plotNumber}</td>
                    <td className="px-4 py-3">
                      <div>{p.payerName}</div>
                      <span className="text-[10px] text-gray-400">{p.payerPhone}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ₹{p.amountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          p.status === 'verified'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : p.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'under_review' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await verifyPayment(p.id, true);
                                setPaymentActionNotice(`Payment ${p.transactionRef} verified and official receipt issued!`);
                                setTimeout(() => setPaymentActionNotice(null), 3000);
                              } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : 'Payment verification failed.';
                                alert(msg);
                              }
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-500 text-xs"
                          >
                            Approve & Issue Receipt
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await verifyPayment(p.id, false, 'Invalid reference code or deposit not found');
                                setPaymentActionNotice(`Payment ${p.transactionRef} rejected.`);
                                setTimeout(() => setPaymentActionNotice(null), 3000);
                              } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : 'Payment rejection failed.';
                                alert(msg);
                              }
                            }}
                            className="rounded-lg bg-red-600/30 text-red-400 border border-red-500/40 px-3 py-1 font-bold hover:bg-red-600 hover:text-white text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-sky-400">
                          {p.receiptNumber || 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bookings & Holds Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Active Plot Bookings & 72-Hour Holds</h2>
            <span className="text-xs text-gray-400">{bookings.length} Registered Bookings</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Plot #</th>
                  <th className="px-4 py-3">Buyer Name</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {bookings.map((b) => (
                  <tr key={b.id} id={b.id} data-record-id={b.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono font-bold text-white">{b.bookingNumber}</td>
                    <td className="px-4 py-3 font-bold text-[#DFC382]">{b.plotNumber}</td>
                    <td className="px-4 py-3">
                      <div>{b.buyerName}</div>
                      <span className="text-[10px] text-gray-400">{b.buyerPhone}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ₹{b.totalAmountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status !== 'confirmed' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await confirmBooking(b.id);
                              } catch (err: unknown) {
                                alert(err instanceof Error ? err.message : 'Failed to confirm booking.');
                              }
                            }}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-white font-bold hover:bg-emerald-500"
                          >
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => cancelBooking(b.id, 'Hold expired or cancelled by admin')}
                            className="rounded bg-red-600/30 border border-red-500/30 text-red-400 px-2.5 py-1 hover:bg-red-600 hover:text-white"
                          >
                            Release Hold
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-xs font-semibold">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Joining Kit Offline Cash Desk */}
      {activeTab === 'kits' && (
        <div className="space-y-4">
          <JoiningKitLedger />
        </div>
      )}

      {/* Tab 6: Support CRM */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-white">Support CRM & Grievance Responses</h2>

          <div className="space-y-4">
            {supportTickets.map((tkt) => (
              <div key={tkt.id} className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="font-mono text-sky-400 font-bold block">{tkt.ticketNumber}</span>
                    <strong className="text-white text-sm">{tkt.subject}</strong>
                    <span className="text-[11px] text-gray-400 block">From: {tkt.userName} ({tkt.userPhone})</span>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    {tkt.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {tkt.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl ${
                        m.isInternalNote
                          ? 'bg-amber-950/40 border border-amber-600/30 text-amber-200'
                          : m.isStaff
                          ? 'bg-[#050A17] border border-[#C7A35A]/30 text-[#DFC382]'
                          : 'bg-white/5 text-gray-200'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>{m.senderName} {m.isInternalNote ? '(INTERNAL NOTE)' : m.isStaff ? '(Staff Reply)' : '(Customer)'}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Staff Reply Box */}
                <div className="border-t border-white/10 pt-3 flex gap-2">
                  <input
                    type="text"
                    id={`reply-${tkt.id}`}
                    placeholder="Type official response to customer..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value) {
                          replyToTicket(tkt.id, input.value, false);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`reply-${tkt.id}`) as HTMLInputElement;
                      if (input && input.value) {
                        replyToTicket(tkt.id, input.value, false);
                        input.value = '';
                      }
                    }}
                    className="rounded-xl bg-[#C7A35A] px-4 py-2 font-bold text-[#0B1734] text-xs hover:brightness-110"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      const input = document.getElementById(`reply-${tkt.id}`) as HTMLInputElement;
                      if (input && input.value) {
                        replyToTicket(tkt.id, input.value, true);
                        input.value = '';
                      }
                    }}
                    className="rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-2 font-bold text-xs hover:bg-amber-600 hover:text-white"
                    title="Add private internal note visible only to staff"
                  >
                    Internal Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Real Reviews Moderation & Corporate Responses */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span>Real Customer & Visitor Reviews Management</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Approve, reject, or post official Director responses to public customer testimonials.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setReviewFilterStatus('ALL')}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  reviewFilterStatus === 'ALL'
                    ? 'bg-[#C7A35A] text-[#0B1734]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setReviewFilterStatus('approved')}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  reviewFilterStatus === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                Approved ({reviews.filter((r) => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setReviewFilterStatus('pending')}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  reviewFilterStatus === 'pending'
                    ? 'bg-amber-500 text-[#0B1734]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                Pending Review ({reviews.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setReviewFilterStatus('rejected')}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  reviewFilterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                Rejected ({reviews.filter((r) => r.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews
              .filter((r) => (reviewFilterStatus === 'ALL' ? true : r.status === reviewFilterStatus))
              .map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-4 text-xs shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A]/30 text-[#DFC382] font-serif font-bold text-sm">
                        {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{rev.authorName}</strong>
                          {rev.authorPhone && (
                            <span className="text-[11px] text-gray-400 font-mono">
                              ({rev.authorPhone})
                            </span>
                          )}
                          <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300 capitalize">
                            {rev.authorRole}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {rev.plotNumber ? `Plot: ${rev.plotNumber} • ` : ''}
                          {rev.branchLocation} • Category: {rev.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          rev.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : rev.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {rev.status ? rev.status.toUpperCase() : 'APPROVED'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm">{rev.title}</h4>
                    <p className="text-gray-300 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                  </div>

                  {/* Existing Admin Reply */}
                  {rev.adminReply && (
                    <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-[#DFC382] font-semibold">
                        <span>Corporate Reply from {rev.adminReply.replierName}</span>
                        <span>{new Date(rev.adminReply.repliedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-200">{rev.adminReply.replyText}</p>
                    </div>
                  )}

                  {/* Actions & Reply Form */}
                  <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={reviewReplyInputs[rev.id] || ''}
                        onChange={(e) =>
                          setReviewReplyInputs((prev) => ({ ...prev, [rev.id]: e.target.value }))
                        }
                        placeholder={
                          rev.adminReply
                            ? 'Update official corporate response...'
                            : 'Write official Director response to this review...'
                        }
                        className="flex-1 rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const replyTxt = reviewReplyInputs[rev.id];
                          if (replyTxt && replyTxt.trim()) {
                            replyToReview(rev.id, replyTxt.trim());
                            setReviewReplyInputs((prev) => ({ ...prev, [rev.id]: '' }));
                          }
                        }}
                        className="rounded-xl bg-[#C7A35A] px-4 py-2 font-bold text-[#0B1734] text-xs hover:brightness-110 whitespace-nowrap"
                      >
                        Post Reply
                      </button>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'approved')}
                          className="rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-2 font-semibold hover:bg-emerald-500 hover:text-white transition"
                        >
                          Approve
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'rejected')}
                          className="rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-2 font-semibold hover:bg-amber-500 hover:text-white transition"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-2 font-semibold hover:bg-red-500 hover:text-white transition"
                        title="Delete review permanently"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab: Daily Task Center */}
      {activeTab === 'tasks' && <AdminTaskCenter />}

      {/* Tab: CRM Enquiries & Lead Follow-ups */}
      {activeTab === 'enquiries' && <AdminEnquiriesTab />}

      {/* Tab: Site Visit Scheduling & Coordinator Allocation */}
      {activeTab === 'site_visits' && <AdminSiteVisitsTab />}

      {/* Tab: Sales Quotas & Targets */}
      {activeTab === 'targets' && <AdminTargetsTab />}

      {/* Tab: Field GPS Evidence & Approvals */}
      {activeTab === 'field_gps' && <AdminFieldGpsTab />}

      {/* Tab: Broadcast Announcements & In-App Messaging */}
      {activeTab === 'broadcast' && <AdminBroadcastTab />}

      {/* Tab: Website CMS & Dynamic Homepage */}
      {activeTab === 'cms' && <AdminCmsTab />}
    </div>
  );
}
