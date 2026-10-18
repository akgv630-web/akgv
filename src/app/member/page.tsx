'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gift,
  HelpCircle,
  Package,
  QrCode,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
  CheckSquare,
  Car,
  MessageSquare,
  Target,
  Bell
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateMemberLevel } from '@/lib/store';
import { COMMISSION_LEVELS_GROUND_TRUTH, COMPANY_DETAILS } from '@/data/groundTruth';
import { FieldGpsCameraCapture } from '@/components/gps-camera/FieldGpsCameraCapture';
import { AssociateIdCard } from '@/components/member/AssociateIdCard';
import { ProfilePhotoStudioModal } from '@/components/common/ProfilePhotoStudioModal';
import { MemberTaskInbox } from '@/components/member/MemberTaskInbox';
import { MemberEnquiriesTab } from '@/components/member/MemberEnquiriesTab';
import { MemberSiteVisitsTab } from '@/components/member/MemberSiteVisitsTab';
import { MemberTargetsTab } from '@/components/member/MemberTargetsTab';
import { InAppNotificationDrawer } from '@/components/common/InAppNotificationDrawer';
import { AuthBarrier, UnauthorizedBarrier } from '@/components/auth/AuthBarrier';
import { tLang } from '@/lib/i18n';

export function MemberPortalPage() {
  const { currentUser, kitIssues, language, allProfiles, updateMember, tasks, enquiries, siteVisits, targets } = useApp();
  const [activeTab, setActiveTab] = useState<
    | 'tasks'
    | 'enquiries'
    | 'site_visits'
    | 'targets'
    | 'id_card'
    | 'hierarchy'
    | 'commission'
    | 'rewards'
    | 'field_gps'
  >('tasks');
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);

  // Deep-link support from tasks or notifications: ?tab=tasks, ?tab=visits, ?tab=inbox, ?id=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const normalized = tabParam.toLowerCase();
        if (normalized === 'tasks' || normalized === 'inbox') setActiveTab('tasks');
        else if (normalized === 'enquiries' || normalized === 'leads') setActiveTab('enquiries');
        else if (normalized === 'visits' || normalized === 'site_visits') setActiveTab('site_visits');
        else if (normalized === 'targets') setActiveTab('targets');
        else if (normalized === 'id_card') setActiveTab('id_card');
        else if (normalized === 'hierarchy' || normalized === 'team') setActiveTab('hierarchy');
        else if (normalized === 'commission') setActiveTab('commission');
        else if (normalized === 'rewards') setActiveTab('rewards');
        else if (normalized === 'field_gps' || normalized === 'gps') setActiveTab('field_gps');
      }

      const recordId = params.get('id') || params.get('task') || params.get('visit') || params.get('enquiry');
      if (recordId) {
        setTimeout(() => {
          const el = document.getElementById(recordId) || document.querySelector(`[data-record-id="${recordId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[#C7A35A]', 'animate-pulse');
            setTimeout(() => {
              el.classList.remove('animate-pulse');
            }, 3000);
          }
        }, 500);
      }
    }
  }, []);

  if (!currentUser) {
    return <AuthBarrier requiredRole="member" />;
  }

  if (currentUser.role === 'buyer') {
    return <UnauthorizedBarrier currentRole={currentUser.role} requiredRole="Associate / Senior Manager" />;
  }

  // Member Business Volume (Simulated/Calculated)
  const memberBusinessVolumeInr = currentUser.totalBusinessVolumeInr || 8500000;
  const currentLevel = calculateMemberLevel(memberBusinessVolumeInr);
  const myKitRecord = kitIssues.find((k) => k.memberId === currentUser.memberId);

  // Downline team members (filtered from dynamic allProfiles)
  const downlineMembers = allProfiles.filter(
    (p) =>
      p.sponsorId === currentUser.id ||
      p.sponsorId === currentUser.memberId ||
      (currentUser.memberId === 'AKGV-3498' && (p.sponsorId === 'usr-sponsor-01' || p.sponsorId === 'AKGV-3498'))
  );

  // Task, CRM, Site Visit & Target Counts for Current Member
  const isMatchUser = (assigneeId?: string, assignedToMemberId?: string) => {
    if (!currentUser) return false;
    const uid = currentUser.id;
    const memId = currentUser.memberId;
    const isPreet =
      memId === 'AKGV-2117' ||
      currentUser.fullName?.toLowerCase().includes('preet') ||
      memId === 'AKGV-HQ-001';

    if (assigneeId === uid || assigneeId === memId) return true;
    if (assignedToMemberId === uid || assignedToMemberId === memId) return true;
    if (memId && assignedToMemberId && assignedToMemberId.toLowerCase() === memId.toLowerCase()) return true;
    if (isPreet && (assignedToMemberId === 'AKGV-2117' || assigneeId === 'AKGV-2117')) return true;
    if (currentUser.memberId === 'AKGV-3498' && (assignedToMemberId === 'usr-sponsor-01' || assignedToMemberId === 'AKGV-3498')) return true;
    return false;
  };

  const myPendingTasksCount = tasks.filter(
    (t) => isMatchUser(t.assigneeId, t.assignedToMemberId) && !t.isCompleted
  ).length;

  const myEnquiriesCount = enquiries.filter(
    (e) =>
      e.assignedProfileId === currentUser.id ||
      e.assignedMemberId === currentUser.memberId ||
      e.assignedMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-2117' && e.assignedMemberId === 'AKGV-2117') ||
      (currentUser.memberId === 'AKGV-3498' && (e.assignedMemberId === 'usr-sponsor-01' || e.assignedMemberId === 'AKGV-3498'))
  ).length;

  const myVisitsCount = siteVisits.filter(
    (v) =>
      (v.assignedStaffId === currentUser.id ||
        v.assignedStaffMemberId === currentUser.memberId ||
        v.assignedStaffMemberId === currentUser.id ||
        (currentUser.memberId === 'AKGV-2117' && v.assignedStaffMemberId === 'AKGV-2117') ||
        (currentUser.memberId === 'AKGV-3498' && (v.assignedStaffMemberId === 'usr-sponsor-01' || v.assignedStaffMemberId === 'AKGV-3498'))) &&
      v.status !== 'completed' &&
      v.status !== 'cancelled'
  ).length;

  const myTargetsCount = targets.filter(
    (t) =>
      t.profileId === currentUser.id ||
      t.memberId === currentUser.memberId ||
      t.memberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-2117' && t.memberId === 'AKGV-2117') ||
      (currentUser.memberId === 'AKGV-3498' && (t.memberId === 'usr-sponsor-01' || t.memberId === 'AKGV-3498'))
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Luxury Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Interactive Profile Avatar */}
          <div className="relative group">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#050A17] border-2 border-[#C7A35A] text-[#DFC382] shadow-lg overflow-hidden">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#DFC382]">
                  {currentUser.fullName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Camera Trigger Badge */}
            <button
              onClick={() => setIsPhotoStudioOpen(true)}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-[#C7A35A] text-[#0B1734] shadow-md hover:brightness-110 active:scale-90 transition border-2 border-[#0B1734]"
              title="Change Profile Photo & Filters"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {currentUser.fullName}
              </h1>
              <span className="rounded-full bg-[#C7A35A]/20 px-3 py-0.5 text-xs font-bold text-[#DFC382] border border-[#C7A35A]/40">
                {tLang(language, currentLevel.rankTitleEn, currentLevel.rankTitleHi, currentLevel.rankTitleEn)}
              </span>
              <button
                onClick={() => setIsPhotoStudioOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#DFC382] border border-[#C7A35A]/30 transition"
              >
                <Camera className="h-3 w-3" />
                <span>{currentUser.avatarUrl ? tLang(language, 'Change Photo', 'फोटो बदलें', 'Photo Badlein') : tLang(language, 'Upload Photo', 'फोटो लगाएं', 'Photo Lagayein')}</span>
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Member ID: <strong className="font-mono text-[#DFC382]">{currentUser.memberId || 'AKGV0001'}</strong> • Sponsor: Vikram Singh (AKGV-HQ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#050A17]/80 px-4 py-2.5 text-right text-xs">
            <span className="text-gray-400 block text-[11px]">Total Eligible Business Volume</span>
            <span className="font-serif text-lg font-bold text-emerald-400">
              ₹{(memberBusinessVolumeInr / 100000).toFixed(1)} Lakh
            </span>
            <span className="text-[10px] text-[#DFC382] block">Level {currentLevel.levelNumber} Commission: {currentLevel.commissionPercent}%</span>
          </div>

          {/* In-App Broadcast Notification Bell */}
          <InAppNotificationDrawer />
        </div>
      </div>

      {/* Action Alert Banner for Active Tasks */}
      {myPendingTasksCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#0B1734] to-[#0B1734] p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-white">
                {tLang(
                  language,
                  `You have ${myPendingTasksCount} active task${myPendingTasksCount > 1 ? 's' : ''} requiring action today`,
                  `आपके पास आज ${myPendingTasksCount} कार्य कार्रवाई के लिए लंबित हैं`,
                  `Aapke paas aaj ${myPendingTasksCount} active task action lene ke liye pending hain`
                )}
              </h3>
              <p className="text-[11px] text-gray-300">
                {tLang(
                  language,
                  'Escort client visits, follow up with inquiries, and mark items complete to maintain high performance.',
                  'साइट विजिट का मार्गदर्शन करें, पूछताछ पर कॉल करें और कार्य पूरा चिह्नित करें।',
                  'Site visits escort karein, inquiries ko follow up karein aur kaam complete karein.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="self-start sm:self-auto shrink-0 rounded-xl bg-[#C7A35A] px-4 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 transition"
          >
            {tLang(language, 'View & Complete Tasks', 'कार्य देखें एवं पूरा करें', 'Tasks Dekhein Aur Complete Karein')}
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 text-xs sm:text-sm font-semibold gap-1 whitespace-nowrap pb-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'tasks'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>{tLang(language, 'My Daily Tasks', 'आज के काम / टास्क', 'Aaj Ke Kaam / Task')}</span>
          {myPendingTasksCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              {myPendingTasksCount}
            </span>
          )}
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
          <span>My Leads / CRM</span>
          {myEnquiriesCount > 0 && (
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
              {myEnquiriesCount}
            </span>
          )}
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
          <span>Assigned Site Visits</span>
          {myVisitsCount > 0 && (
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              {myVisitsCount}
            </span>
          )}
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
          <span>Sales Quotas ({myTargetsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('id_card')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'id_card'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Digital ID Card</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'hierarchy'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team Hierarchy ({downlineMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'commission'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Commission Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 sm:px-5 py-3 transition ${
            activeTab === 'rewards'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Rewards Status</span>
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
          <span>Plot GPS Capture</span>
        </button>
      </div>

      {/* Tab: Aaj Ke Kaam (Daily Task Inbox) */}
      {activeTab === 'tasks' && <MemberTaskInbox />}

      {/* Tab: Assigned Leads CRM */}
      {activeTab === 'enquiries' && <MemberEnquiriesTab />}

      {/* Tab: Assigned Site Visits */}
      {activeTab === 'site_visits' && <MemberSiteVisitsTab />}

      {/* Tab: Sales Quotas & Targets */}
      {activeTab === 'targets' && <MemberTargetsTab />}

      {/* Tab 1: Digital ID Card */}
      {activeTab === 'id_card' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Virtual Card Graphic */}
          <div className="md:col-span-6 flex flex-col items-center gap-3">
            <AssociateIdCard
              name={currentUser.fullName}
              memberId={currentUser.memberId || 'AKGV0001'}
              rank={tLang(language, currentLevel.rankTitleEn, currentLevel.rankTitleHi, currentLevel.rankTitleEn)}
              phone={currentUser.phone}
              email={currentUser.email}
              joinedDate="15 Jan 2026"
              kitStatus="VERIFIED"
              avatarUrl={currentUser.avatarUrl}
              onChangePhoto={() => setIsPhotoStudioOpen(true)}
            />

            <button
              onClick={() => setIsPhotoStudioOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#C7A35A]/50 bg-[#0B1734] px-4 py-2 text-xs font-bold text-[#DFC382] shadow hover:bg-white/5 active:scale-95 transition"
            >
              <Camera className="h-4 w-4 text-[#C7A35A]" />
              <span>
                {currentUser.avatarUrl
                  ? tLang(language, 'Edit Photo & Filters', 'आईडी फोटो बदलें एवं फिल्टर लगाएं', 'Photo Badlein & Filters Lagayein')
                  : tLang(language, 'Upload ID Photo', 'आईडी कार्ड में अपनी फोटो लगाएं', 'ID Photo Upload Karein')}
              </span>
            </button>
          </div>

          {/* Joining Kit Handover Verification */}
          <div className="md:col-span-6 space-y-4 text-xs">
            <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C7A35A]" />
                  Joining Kit Handover Status
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  ₹999 Cash Settled
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your ₹999 physical joining kit containing the Executive Bag, Metallic Pen, Diary and Project File was issued and registered in the offline branch cash ledger.
              </p>
              {myKitRecord && (
                <div className="rounded-xl bg-[#050A17] p-3 space-y-1 font-mono text-[11px] text-gray-300">
                  <div>Receipt: <strong className="text-sky-400">{myKitRecord.receiptNumber}</strong></div>
                  <div>Handed over by: <strong className="text-white">{myKitRecord.collectorStaffName}</strong></div>
                  <div>Issue Date: {myKitRecord.collectionDate}</div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-2">
              <span className="font-serif text-sm font-bold text-white block">
                Company Member Governance Rules
              </span>
              <ul className="space-y-1.5 text-gray-400">
                <li>• Company members cannot alter reporting hierarchy without Admin authorization.</li>
                <li>• No commission is paid for member sign-ups; revenue is derived only from legally registered plot sales.</li>
                <li>• Keep your digital ID card accessible during all township client site visits.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hierarchy */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Your Authorized Downline Team</h2>
            <span className="text-xs text-gray-400">Directly Reporting Members ({downlineMembers.length})</span>
          </div>

          {/* Invitation Banner with Sponsor Code */}
          <div className="rounded-2xl border border-[#C7A35A]/40 bg-[#0B1734] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-gray-400 block">Your Official Sponsor Code:</span>
                <span className="font-mono text-xl font-bold text-[#DFC382] tracking-wider">
                  {currentUser.memberId || 'AKGV-3498'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const code = currentUser.memberId || 'AKGV-3498';
                    navigator.clipboard.writeText(code);
                    alert(`Copied Sponsor Code: ${code}`);
                  }}
                  className="rounded-xl bg-[#C7A35A] px-3.5 py-2 font-bold text-[#0B1734] text-xs hover:brightness-110 transition"
                >
                  Copy Sponsor Code
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Namaste! Join my team at AKGV Infra City Private Limited. Use my Sponsor ID: ${currentUser.memberId || 'AKGV-3498'} when registering.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#25D366] px-3.5 py-2 font-bold text-white text-xs hover:bg-emerald-600 transition flex items-center gap-1.5"
                >
                  Share via WhatsApp
                </a>
              </div>
            </div>
            <p className="text-[11px] text-gray-300">
              When new field associates or buyers register using your code, they will automatically appear in your team network below.
            </p>
          </div>

          {downlineMembers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#050A17] p-8 text-center text-xs text-gray-400 space-y-2">
              <Users className="h-8 w-8 text-gray-500 mx-auto" />
              <p className="text-white font-semibold">No direct downlines enrolled yet.</p>
              <p>Share your Sponsor Code above to enroll your first field associates under your hierarchy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {downlineMembers.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm">{member.fullName}</div>
                    <span className="rounded-full bg-[#C7A35A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382]">
                      {member.role}
                    </span>
                  </div>
                  <div className="text-gray-400 space-y-1">
                    <div>Member ID: <strong className="font-mono text-white">{member.memberId}</strong></div>
                    <div>Phone: {member.phone}</div>
                    <div>KYC: <strong className="text-emerald-400">Verified</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Commission Ledger */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Calculated Commission & Payout History</h2>
            <span className="text-xs text-emerald-400 font-semibold">Active Tier: {currentLevel.commissionPercent}%</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Source Booking</th>
                  <th className="px-4 py-3">Plot #</th>
                  <th className="px-4 py-3">Sale Amount</th>
                  <th className="px-4 py-3">Commission %</th>
                  <th className="px-4 py-3">Earned Amount</th>
                  <th className="px-4 py-3">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                <tr className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono">BK-2026-001</td>
                  <td className="px-4 py-3 font-bold text-[#DFC382]">A-03</td>
                  <td className="px-4 py-3">₹15,00,000</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">6%</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">₹90,000</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      Approved & Paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono">BK-2026-002</td>
                  <td className="px-4 py-3 font-bold text-[#DFC382]">B-03</td>
                  <td className="px-4 py-3">₹12,00,000</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">6%</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">₹72,000</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      Calculated (Pending Clearance)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Rewards Status */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Your Unlocked Rewards Catalog</h2>
            <Link href="/rewards-plan" className="text-xs text-[#DFC382] hover:underline">
              View All 11 Brochure Rewards ▸
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/40 bg-[#0B1734] p-5 space-y-3">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {tLang(language, 'Level 1 Achieved', 'लेवल 1 प्राप्त', 'Level 1 Achieved')}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {tLang(language, 'Smartphone', 'स्मार्टफोन', 'Smartphone')}
              </h3>
              <p className="text-xs text-gray-400">
                {tLang(language, 'Business Target: ₹1L - ₹20L achieved.', 'बिजनेस टारगेट: ₹1L - ₹20L पूर्ण', 'Business Target: ₹1L - ₹20L complete')}
              </p>
              <span className="block text-xs font-semibold text-emerald-400">
                {tLang(language, '✓ Fulfilled & Handed Over', '✓ सफलतापूर्वक वितरित', '✓ Fulfilled & Handed Over')}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-[#0B1734] p-5 space-y-3">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {tLang(language, 'Level 2 Achieved', 'लेवल 2 प्राप्त', 'Level 2 Achieved')}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {tLang(language, 'Goa Trip', 'गोवा यात्रा (ट्रिप)', 'Goa Trip')}
              </h3>
              <p className="text-xs text-gray-400">
                {tLang(language, 'Business Target: ₹21L - ₹80L achieved.', 'बिजनेस टारगेट: ₹21L - ₹80L पूर्ण', 'Business Target: ₹21L - ₹80L complete')}
              </p>
              <span className="block text-xs font-semibold text-emerald-400">
                {tLang(language, '✓ Fulfilled & Handed Over', '✓ सफलतापूर्वक वितरित', '✓ Fulfilled & Handed Over')}
              </span>
            </div>

            <div className="rounded-2xl border border-[#C7A35A] bg-[#050A17] p-5 space-y-3">
              <span className="rounded-full bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382]">
                {tLang(language, 'Level 3 (Current Milestone)', 'लेवल 3 (वर्तमान लक्ष्य)', 'Level 3 (Current Goal)')}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {tLang(language, 'Sports Bike', 'स्पोर्ट्स बाइक', 'Sports Bike')}
              </h3>
              <p className="text-xs text-gray-400">
                {tLang(language, 'Business Target: ₹81L - ₹1.5 Cr in progress.', 'बिजनेस टारगेट: ₹81L - ₹1.5 Cr प्रगति पर', 'Business Target: ₹81L - ₹1.5 Cr progress par')}
              </p>
              <span className="block text-xs font-semibold text-[#DFC382]">
                {tLang(language, 'Eligible — Claim under review', 'पात्र — दावा समीक्षाधीन', 'Eligible — Claim review mein')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Field GPS Evidence Capture */}
      {activeTab === 'field_gps' && (
        <div className="space-y-4">
          <FieldGpsCameraCapture />
        </div>
      )}

      {/* Profile Photo Studio Modal */}
      <ProfilePhotoStudioModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        currentAvatarUrl={currentUser.avatarUrl}
        memberName={currentUser.fullName}
        onSave={(newAvatarUrl) => {
          updateMember(currentUser.id, { avatarUrl: newAvatarUrl });
        }}
      />
    </div>
  );
}

export default MemberPortalPage;
