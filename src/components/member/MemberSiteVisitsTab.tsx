'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SiteVisit, SiteVisitStatus } from '@/types';

export function MemberSiteVisitsTab() {
  const { siteVisits, currentUser, updateSiteVisitStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SiteVisitStatus>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (!currentUser) return null;

  // Filter site visits assigned to current member
  const myVisits = siteVisits.filter((v) => {
    const isMine =
      v.assignedStaffId === currentUser.id ||
      v.assignedStaffMemberId === currentUser.memberId ||
      v.assignedStaffMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (v.assignedStaffMemberId === 'usr-sponsor-01' || v.assignedStaffMemberId === 'AKGV-3498'));

    if (!isMine) return false;

    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorPhone.includes(searchQuery) ||
      v.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAssigned = siteVisits.filter(
    (v) =>
      v.assignedStaffId === currentUser.id ||
      v.assignedStaffMemberId === currentUser.memberId ||
      v.assignedStaffMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (v.assignedStaffMemberId === 'usr-sponsor-01' || v.assignedStaffMemberId === 'AKGV-3498'))
  );

  const confirmedCount = totalAssigned.filter((v) => v.status === 'confirmed').length;
  const completedCount = totalAssigned.filter((v) => v.status === 'completed').length;

  const handleStatusChange = async (visitId: string, newStatus: SiteVisitStatus) => {
    setIsSubmitting(true);
    const res = await updateSiteVisitStatus(visitId, newStatus);
    setIsSubmitting(false);

    if (res.success) {
      showNotification(`Site visit status updated to ${newStatus}`);
    } else {
      showNotification(res.error || 'Failed to update visit status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-semibold shadow-lg ${
            actionNotice.type === 'success'
              ? 'border border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
              : 'border border-red-500/40 bg-red-950/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Assigned Site Tours</span>
          <span className="font-serif text-2xl font-bold text-white">{totalAssigned.length}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Township client inspections</span>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Upcoming / Confirmed</span>
          <span className="font-serif text-2xl font-bold text-sky-400">{confirmedCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Ready for on-site escort</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Completed Tours</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{completedCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Successfully guided clients</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Pickups Required</span>
          <span className="font-serif text-2xl font-bold text-amber-400">
            {totalAssigned.filter((v) => v.pickupRequired).length}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Station / Cantt pickup</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitor or corridor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Statuses ({totalAssigned.length})</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <strong className="text-white">{myVisits.length}</strong> site visits
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {myVisits.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <Car className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No assigned site visits found</p>
            <p className="text-xs mt-1">Township client tours assigned to you by administration will appear here.</p>
          </div>
        ) : (
          myVisits.map((visit) => (
            <div
              key={visit.id}
              id={visit.id}
              data-record-id={visit.id}
              className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3 transition hover:border-[#C7A35A]/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-base font-bold text-white">{visit.visitorName}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        visit.status === 'confirmed'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : visit.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : visit.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {visit.status}
                    </span>
                    {visit.pickupRequired && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                        <Car className="h-3 w-3" />
                        <span>Pickup Required</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                    <a
                      href={`tel:${visit.visitorPhone}`}
                      className="flex items-center gap-1.5 text-[#DFC382] font-semibold hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{visit.visitorPhone} (Call Client)</span>
                    </a>
                    <span className="flex items-center gap-1 text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-[#C7A35A]" />
                      <span>{visit.locationName}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="h-3.5 w-3.5 text-sky-400" />
                      <span>{visit.preferredDate}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>{visit.preferredTimeSlot}</span>
                    </span>
                  </div>

                  {visit.notes && (
                    <p className="rounded-xl bg-[#050A17] p-2.5 text-xs text-gray-300 border border-white/5">
                      <strong className="text-gray-400">Instructions:</strong> {visit.notes}
                    </p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="shrink-0">
                  <select
                    value={visit.status}
                    onChange={(e) => handleStatusChange(visit.id, e.target.value as SiteVisitStatus)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed (Scheduled)</option>
                    <option value="in_progress">In Progress (Tour Underway)</option>
                    <option value="completed">Completed (Client Visited)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
