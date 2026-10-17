'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  CreditCard,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  Filter,
  HelpCircle,
  Home,
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

export default function SuperAdminPage() {
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
    enquiries,
    siteVisits,
    targets,
    gpsEvidences,
    messages,
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
  const [reviewFilterStatus, setReviewFilterStatus] = useState<'ALL' | 'approved' | 'pending' | 'rejected'>('ALL');
  const [reviewReplyInputs, setReviewReplyInputs] = useState<Record<string, string>>({});
  const [plotFilterBlock, setPlotFilterBlock] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [plotFilterStatus, setPlotFilterStatus] = useState<'ALL' | PlotStatus>('ALL');
  const [plotSearchQuery, setPlotSearchQuery] = useState('');
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [deletingPlot, setDeletingPlot] = useState<Plot | null>(null);
  const [plotActionNotice, setPlotActionNotice] = useState<string | null>(null);
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
  const [newMemberPassword, setNewMemberPassword] = useState('akgv@2026');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('junior_member');
  const [newMemberSponsorId, setNewMemberSponsorId] = useState('AKGV-3498');
  const [newMemberCity, setNewMemberCity] = useState('Varanasi');
  const [newMemberBranch, setNewMemberBranch] = useState('Rampur Head Office');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberLevel, setNewMemberLevel] = useState<number>(1);
  const [createdSponsorFeedback, setCreatedSponsorFeedback] = useState<{
    code: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
    loginUrl: string;
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
        return { label: 'SUPER ADMIN', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
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
    return <UnauthorizedBarrier currentRole={currentUser.role} requiredRole="Super Admin or Sub Admin" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Super Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-r from-[#050A17] via-[#0B1734] to-[#050A17] p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1734] border-2 border-[#C7A35A] text-[#DFC382] shadow-lg">
            <ShieldCheck className="h-8 w-8 text-[#C7A35A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-white">
                Super Admin Control Centre
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
                  Team & Associates Governance (सदस्य एवं टीम नियंत्रण)
                </h2>
              </div>
              <p className="text-xs text-gray-300">
                View every associate, manager, sub-admin, and buyer working on the platform. Add new members, edit profile details, toggle active access, or remove accounts.
              </p>
            </div>

            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow-lg transition hover:brightness-110 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Enroll New Member (नया सदस्य जोड़ें)</span>
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
                      Enroll New Team Member (नया सदस्य जोड़ें)
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMemberName.trim() || !newMemberPhone.trim()) {
                      alert('Please provide member name and phone number.');
                      return;
                    }
                    const profile = createSponsorMember({
                      fullName: newMemberName.trim(),
                      phone: newMemberPhone.trim(),
                      email: newMemberEmail.trim() || `${newMemberPhone.trim()}@akgvinfacity.com`,
                      role: newMemberRole,
                      sponsorId: newMemberSponsorId,
                      city: newMemberCity.trim(),
                      branchLocation: newMemberBranch.trim(),
                      address: newMemberAddress.trim(),
                      level: Number(newMemberLevel) || 1,
                      password: newMemberPassword.trim() || 'akgv@2026',
                    });
                    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://akgvinfacity.com/login';
                    setCreatedSponsorFeedback({
                      code: profile.memberId || profile.email || 'AKGV-NEW',
                      name: profile.fullName,
                      email: profile.email,
                      phone: profile.phone,
                      role: profile.role,
                      password: newMemberPassword.trim() || 'akgv@2026',
                      loginUrl,
                    });
                    setMemberActionNotice(`नया सदस्य "${profile.fullName}" सफलतापूर्वक जोड़ा गया! आईडी: ${profile.memberId || profile.email}`);
                    setNewMemberName('');
                    setNewMemberPhone('');
                    setNewMemberEmail('');
                    setNewMemberAddress('');
                    setTimeout(() => setMemberActionNotice(null), 6000);
                  }}
                  className="p-5 space-y-4 text-xs"
                >
                  {/* Feedback Banner on Generation */}
                  {createdSponsorFeedback && (
                    <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-4 space-y-3 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span>खाता तैयार! लॉगिन क्रेडेंशियल (Login Credentials Generated)</span>
                      </div>
                      
                      <div className="rounded-xl border border-[#C7A35A]/30 bg-[#070D1E] p-3 text-xs space-y-1.5 font-mono">
                        <div className="text-gray-300 font-sans font-semibold text-[11px] text-[#DFC382]">
                          आधिकारिक लॉगिन विवरण (Official Login Details):
                        </div>
                        <div className="text-white">👤 नाम: <span className="font-bold text-emerald-300">{createdSponsorFeedback.name}</span></div>
                        <div className="text-white">🆔 लॉगिन आईडी: <span className="font-bold text-[#DFC382] bg-black/50 px-2 py-0.5 rounded border border-[#C7A35A]/30">{createdSponsorFeedback.code}</span></div>
                        <div className="text-white">📧 ईमेल: <span className="text-gray-300">{createdSponsorFeedback.email}</span></div>
                        <div className="text-white">📱 फोन: <span className="text-gray-300">{createdSponsorFeedback.phone}</span></div>
                        <div className="text-white">🔑 पासवर्ड: <span className="font-bold text-emerald-300 bg-black/50 px-2 py-0.5 rounded border border-emerald-500/30">{createdSponsorFeedback.password}</span></div>
                        <div className="text-white">🌐 लॉगिन लिंक: <span className="text-sky-300 underline">{createdSponsorFeedback.loginUrl}</span></div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = `🏢 AKGV INFRA CITY PRIVATE LIMITED\n🔐 आधिकारिक पोर्टल लॉगिन विवरण\n\n👤 नाम: ${createdSponsorFeedback.name}\n🆔 लॉगिन आईडी: ${createdSponsorFeedback.code} (या ईमेल: ${createdSponsorFeedback.email} / फोन: ${createdSponsorFeedback.phone})\n🔑 पासवर्ड: ${createdSponsorFeedback.password}\n🌐 लॉगिन लिंक: ${createdSponsorFeedback.loginUrl}\n\nसूचना: कृपया इस लिंक पर जाकर अपनी आईडी और पासवर्ड से लॉगिन करें।`;
                            navigator.clipboard.writeText(msg);
                            setMemberActionNotice('लॉगिन विवरण और लिंक क्लिपबोर्ड पर कॉपी हो गया!');
                            setTimeout(() => setMemberActionNotice(null), 4000);
                          }}
                          className="rounded-lg bg-[#C7A35A] px-3.5 py-1.5 font-bold text-[#0B1734] text-[11px] flex items-center gap-1.5 hover:brightness-110 transition"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Full Credentials & Link</span>
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `🏢 AKGV INFRA CITY PRIVATE LIMITED\n🔐 आधिकारिक पोर्टल लॉगिन विवरण\n\n👤 नाम: ${createdSponsorFeedback.name}\n🆔 लॉगिन आईडी: ${createdSponsorFeedback.code}\n📧 ईमेल: ${createdSponsorFeedback.email}\n🔑 पासवर्ड: ${createdSponsorFeedback.password}\n🌐 लॉगिन लिंक: ${createdSponsorFeedback.loginUrl}\n\nसूचना: कृपया इस लिंक पर जाकर अपनी आईडी और पासवर्ड से लॉगिन करें।`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-[#25D366] px-3.5 py-1.5 font-bold text-white text-[11px] flex items-center gap-1.5 hover:brightness-110 transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Share on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Full Name (पूरा नाम) <span className="text-[#C7A35A]">*</span>
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
                        Mobile Number (मोबाइल नंबर) <span className="text-[#C7A35A]">*</span>
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
                        Email Address (वैकल्पिक)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@gmail.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Location & Assigned Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Native City / District (गृह जिला / शहर)
                      </label>
                      <select
                        value={newMemberCity}
                        onChange={(e) => setNewMemberCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="Varanasi">Varanasi (वाराणसी)</option>
                        <option value="Chandauli">Chandauli (चंदौली)</option>
                        <option value="Mirzapur">Mirzapur (मिर्जापुर)</option>
                        <option value="Prayagraj">Prayagraj (प्रयागराज)</option>
                        <option value="Ghazipur">Ghazipur (गाजीपुर)</option>
                        <option value="Bhadohi">Bhadohi (भदोही)</option>
                        <option value="Jaunpur">Jaunpur (जौनपुर)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Assigned Branch Office (संबद्ध शाखा)
                      </label>
                      <select
                        value={newMemberBranch}
                        onChange={(e) => setNewMemberBranch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="Rampur Head Office">Rampur Head Office (रामपुर प्रधान कार्यालय)</option>
                        <option value="Lahartara Branch">Lahartara Branch (लहरतारा शाखा, निकट कैंट)</option>
                        <option value="Mirza Murad Branch">Mirza Murad Branch (मिर्जामुराद शाखा, NH-19)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Role Assignment (पद)
                      </label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value="sub_admin">Sub-Admin (Branch Coordinator)</option>
                        <option value="senior_member">Senior Manager / Sponsor</option>
                        <option value="junior_member">Field Associate / Agent</option>
                        <option value="buyer">Client / Plot Buyer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Initial MLM Level (लेवल)
                      </label>
                      <select
                        value={newMemberLevel}
                        onChange={(e) => setNewMemberLevel(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                      >
                        <option value={1}>Level 1: Sales Assistant (4% Comm)</option>
                        <option value={2}>Level 2: Star Associate (5% Comm)</option>
                        <option value={3}>Level 3: Gold Star (6% Comm)</option>
                        <option value={4}>Level 4: Diamond Star (7% Comm)</option>
                        <option value={5}>Level 5: Platinum Leader (8% Comm)</option>
                        <option value={6}>Level 6: Crown Leader (9% Comm)</option>
                        <option value={7}>Level 7: Director (10% Comm)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Reporting Sponsor (सीनियर स्पॉन्सर)
                    </label>
                    <select
                      value={newMemberSponsorId}
                      onChange={(e) => setNewMemberSponsorId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                    >
                      <option value="AKGV-HQ-001">Super Admin (AKGV-HQ-001)</option>
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
                      Residential Address (स्थायी पता)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shiv Mandir, Mohalla, City"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>

                  {/* Initial Assigned Password */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Portal Login Password (लॉगिन पासवर्ड) <span className="text-[#C7A35A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. akgv@2026"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      डिफ़ॉल्ट पासवर्ड <span className="font-mono text-[#DFC382]">akgv@2026</span> रखा गया है। एडमिन चाहें तो इसे बदल सकते हैं।
                    </p>
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
                        <option value="super_admin">Super Admin</option>
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
                        <option value="verified">Verified (सत्यापित)</option>
                        <option value="pending">Pending Review</option>
                        <option value="submitted">Submitted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Account Access</label>
                      <select
                        value={editIsActive ? 'active' : 'suspended'}
                        onChange={(e) => setEditIsActive(e.target.value === 'active')}
                        disabled={editingMember.id === currentUser.id}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
                      >
                        <option value="active">Active Access (सक्रिय)</option>
                        <option value="suspended">Suspended / Blocked (निलंबित)</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Assigned Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Native City / District (गृह जिला / शहर)
                      </label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="Varanasi">Varanasi (वाराणसी)</option>
                        <option value="Chandauli">Chandauli (चंदौली)</option>
                        <option value="Mirzapur">Mirzapur (मिर्जापुर)</option>
                        <option value="Prayagraj">Prayagraj (प्रयागराज)</option>
                        <option value="Ghazipur">Ghazipur (गाजीपुर)</option>
                        <option value="Bhadohi">Bhadohi (भदोही)</option>
                        <option value="Jaunpur">Jaunpur (जौनपुर)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Assigned Branch Office (संबद्ध शाखा)
                      </label>
                      <select
                        value={editBranchLocation}
                        onChange={(e) => setEditBranchLocation(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="Rampur Head Office">Rampur Head Office (रामपुर प्रधान कार्यालय)</option>
                        <option value="Lahartara Branch">Lahartara Branch (लहरतारा शाखा, निकट कैंट)</option>
                        <option value="Mirza Murad Branch">Mirza Murad Branch (मिर्जामुराद शाखा, NH-19)</option>
                      </select>
                    </div>
                  </div>

                  {/* Level & Rank Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        MLM Tier Level (लेवल)
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
                        <option value={1}>Level 1: Sales Assistant (4% Comm)</option>
                        <option value={2}>Level 2: Star Associate (5% Comm)</option>
                        <option value={3}>Level 3: Gold Star (6% Comm)</option>
                        <option value={4}>Level 4: Diamond Star (7% Comm)</option>
                        <option value={5}>Level 5: Platinum Leader (8% Comm)</option>
                        <option value={6}>Level 6: Crown Leader (9% Comm)</option>
                        <option value={7}>Level 7: Director (10% Comm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Official Rank Title (पदनाम)
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
                        Business Volume (₹)
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
                        Plots Closed Count
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
                        Joined Date (तारीख)
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
                      Residential Address (स्थायी पता)
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
                        Executive Member Dossier (सदस्य संपूर्ण विवरण)
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
                          Account:{' '}
                          <strong className={viewingMember.isActive ? 'text-emerald-400' : 'text-red-400'}>
                            {viewingMember.isActive ? 'ACTIVE ACCESS' : 'SUSPENDED'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1: Geographic & Branch Information (कहाँ के हैं) */}
                    <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#DFC382] font-bold text-xs border-b border-white/5 pb-1.5">
                        <MapPin className="h-4 w-4 text-[#C7A35A]" />
                        <span>1. Regional & Branch Details (कहाँ के निवासी हैं एवं संबद्ध शाखा)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-gray-400 text-[10px] block">Native City / District (गृह जिला / शहर):</span>
                          <strong className="text-white text-xs block font-serif">
                            {viewingMember.city || 'Varanasi (वाराणसी)'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">Assigned Branch Office (संबद्ध शाखा कार्यालय):</span>
                          <strong className="text-[#DFC382] text-xs block">
                            {viewingMember.branchLocation || 'Rampur Head Office'}
                          </strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-400 text-[10px] block">Permanent Residential / Office Address (स्थायी पता):</span>
                          <p className="text-gray-200 text-xs mt-0.5">
                            {viewingMember.address || 'Address registered with branch records (Varanasi Region, Uttar Pradesh)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Tenure & Enrollment Record (कब से जुड़े हैं) */}
                    <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs border-b border-white/5 pb-1.5">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>2. Enrollment & Active Tenure (कब से जुड़े हैं / कार्यकाल)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center sm:text-left">
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">Joining Date</span>
                          <strong className="text-white text-xs block">{joinedFormatted}</strong>
                        </div>
                        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/20 p-2.5">
                          <span className="text-emerald-300 text-[10px] block">Active Duration</span>
                          <strong className="text-emerald-400 text-xs block">{tenureFormatted}</strong>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">Member ID</span>
                          <strong className="text-[#DFC382] font-mono text-xs block">
                            {viewingMember.memberId || 'N/A'}
                          </strong>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <span className="text-gray-400 text-[10px] block">KYC Verification</span>
                          <strong className="text-emerald-400 text-xs block uppercase">
                            {viewingMember.kycStatus || 'VERIFIED'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Rank, MLM Level & Performance Record (लेवल एवं बिज़नेस) */}
                    <div className="rounded-xl border border-[#C7A35A]/30 bg-[#0B1734] p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1.5 text-[#DFC382] font-bold text-xs">
                          <Award className="h-4 w-4 text-[#C7A35A]" />
                          <span>3. Professional Rank, Level & Volume (पद, लेवल एवं बिज़नेस रिपोर्ट)</span>
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
                            <span>4. Client Property Portfolio (क्रेता भूखंड विवरण एवं भुगतान)</span>
                          </div>
                          <span className="text-emerald-400 font-bold text-[11px]">
                            {memberBookings.length} Plot(s) Linked
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
                      Confirm Member Removal (सदस्य हटाएं)
                    </h3>
                    <span className="text-[11px] text-gray-400">Permanent System Action</span>
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
              <span>Register New Plot / नया प्लॉट जोड़ें</span>
            </button>
          </div>

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
                      <tr key={plot.id} className="hover:bg-white/5 transition">
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
                    Cancel / रद्द करें
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
                      Confirm Delete / हटाएं
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
                  <tr key={p.id} className="hover:bg-white/5">
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
                  <tr key={b.id} className="hover:bg-white/5">
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
                            onClick={() => confirmBooking(b.id)}
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
