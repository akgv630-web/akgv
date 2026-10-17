'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  X,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SiteVisit, SiteVisitStatus, Profile } from '@/types';

export function AdminSiteVisitsTab() {
  const {
    siteVisits,
    allProfiles,
    assignSiteVisit,
    updateSiteVisitStatus,
    deleteSiteVisit,
    bookSiteVisit
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SiteVisitStatus>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newVisitorPhone, setNewVisitorPhone] = useState('');
  const [newVisitorEmail, setNewVisitorEmail] = useState('');
  const [newLocationId, setNewLocationId] = useState('rampur');
  const [newLocationName, setNewLocationName] = useState('Rampur Industrial Green Corridor');
  const [newPreferredDate, setNewPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newPreferredTimeSlot, setNewPreferredTimeSlot] = useState('11:00 AM - 01:00 PM');
  const [newPickupRequired, setNewPickupRequired] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Eligible Active Staff/Members for assignment
  const eligibleStaff = allProfiles.filter(
    (p) => p.isActive && p.role !== 'buyer'
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Filter site visits
  const filteredVisits = siteVisits.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorPhone.includes(searchQuery) ||
      (v.assignedStaffName && v.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesLocation = locationFilter === 'ALL' || v.locationId === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const counts = {
    all: siteVisits.length,
    requested: siteVisits.filter((v) => v.status === 'requested').length,
    confirmed: siteVisits.filter((v) => v.status === 'confirmed').length,
    completed: siteVisits.filter((v) => v.status === 'completed').length,
    cancelled: siteVisits.filter((v) => v.status === 'cancelled').length,
  };

  const handleOpenAssign = (visit: SiteVisit) => {
    setSelectedVisit(visit);
    setSelectedStaffId(visit.assignedStaffId || '');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedVisit) return;
    const staff = allProfiles.find((p) => p.id === selectedStaffId);
    if (!staff) {
      showNotification('Please select an eligible staff member', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await assignSiteVisit(
      selectedVisit.id,
      staff.id,
      staff.fullName,
      staff.memberId
    );
    setIsSubmitting(false);

    if (result.success) {
      showNotification(`Site visit assigned to ${staff.fullName} (${staff.memberId || 'Staff'})`);
      setIsAssignModalOpen(false);
      setSelectedVisit(null);
    } else {
      showNotification(result.error || 'Failed to assign staff coordinator', 'error');
    }
  };

  const handleStatusChange = async (visitId: string, newStatus: SiteVisitStatus) => {
    setIsSubmitting(true);
    const res = await updateSiteVisitStatus(visitId, newStatus);
    setIsSubmitting(false);
    if (res.success) {
      showNotification(`Site visit status updated to ${newStatus}`);
    } else {
      showNotification(res.error || 'Failed to update status', 'error');
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!window.confirm('Are you sure you want to delete this site visit record?')) return;
    const ok = await deleteSiteVisit(visitId);
    if (ok) {
      showNotification('Site visit record removed');
    } else {
      showNotification('Failed to delete site visit', 'error');
    }
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorName || !newVisitorPhone) {
      showNotification('Visitor name and phone are required', 'error');
      return;
    }

    try {
      bookSiteVisit({
        visitorName: newVisitorName,
        visitorPhone: newVisitorPhone,
        visitorEmail: newVisitorEmail || undefined,
        locationId: newLocationId,
        locationName: newLocationName,
        preferredDate: newPreferredDate,
        preferredTimeSlot: newPreferredTimeSlot,
        pickupRequired: newPickupRequired,
        notes: newNotes || undefined,
      });

      showNotification('New site visit scheduled successfully');
      setIsNewVisitModalOpen(false);
      // Reset form
      setNewVisitorName('');
      setNewVisitorPhone('');
      setNewVisitorEmail('');
      setNewNotes('');
      setNewPickupRequired(false);
    } catch {
      showNotification('Error scheduling site visit', 'error');
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

      {/* KPI Stats Header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Requests</span>
          <span className="font-serif text-2xl font-bold text-white">{counts.all}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Across all Varanasi corridors</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block">Pending Requests</span>
          <span className="font-serif text-2xl font-bold text-amber-400">{counts.requested}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Awaiting coordinator allocation</span>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Confirmed Visits</span>
          <span className="font-serif text-2xl font-bold text-sky-400">{counts.confirmed}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Assigned & client notified</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Completed Tours</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{counts.completed}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Successful on-site client tours</span>
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitor, phone, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Statuses ({counts.all})</option>
            <option value="requested">Pending / Requested ({counts.requested})</option>
            <option value="confirmed">Confirmed ({counts.confirmed})</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed ({counts.completed})</option>
            <option value="cancelled">Cancelled ({counts.cancelled})</option>
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Townships</option>
            <option value="rampur">Rampur Industrial Corridor</option>
            <option value="lahartara">Lahartara Junction City</option>
            <option value="mirzamurad">Mirza Murad Express</option>
          </select>
        </div>

        {/* Schedule Visit Button */}
        <button
          onClick={() => setIsNewVisitModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Visit (नयी विजिट जोड़ें)</span>
        </button>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <Car className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No site visits found matching your criteria</p>
            <p className="text-xs mt-1">Try adjusting filters or schedule a new site inspection.</p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-2xl border border-white/10 bg-[#0B1734] p-4 sm:p-5 transition hover:border-[#C7A35A]/40"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Visitor Info & Schedule */}
                <div className="space-y-2">
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

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-300">
                    <a
                      href={`tel:${visit.visitorPhone}`}
                      className="flex items-center gap-1.5 text-[#DFC382] hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{visit.visitorPhone}</span>
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
                      <strong className="text-gray-400">Notes:</strong> {visit.notes}
                    </p>
                  )}
                </div>

                {/* Coordinator & Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  {/* Coordinator pill */}
                  <div className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs">
                    <span className="text-[10px] text-gray-400 block">Field Coordinator:</span>
                    {visit.assignedStaffName ? (
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{visit.assignedStaffName}</span>
                        {visit.assignedStaffMemberId && (
                          <span className="font-mono text-[10px] text-[#DFC382]">
                            ({visit.assignedStaffMemberId})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* Assign Button */}
                  <button
                    onClick={() => handleOpenAssign(visit)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-3 py-2 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{visit.assignedStaffName ? 'Reassign' : 'Assign Staff'}</span>
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={visit.status}
                    onChange={(e) => handleStatusChange(visit.id, e.target.value as SiteVisitStatus)}
                    className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteVisit(visit.id)}
                    className="rounded-xl p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Staff Coordinator Assignment Modal */}
      {isAssignModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#C7A35A]" />
                <h3 className="font-serif text-lg font-bold text-white">Assign Field Coordinator</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#050A17] p-3 text-xs space-y-1 border border-white/10">
              <div className="text-gray-400">Visitor: <strong className="text-white">{selectedVisit.visitorName}</strong></div>
              <div className="text-gray-400">Phone: <strong className="text-[#DFC382]">{selectedVisit.visitorPhone}</strong></div>
              <div className="text-gray-400">Corridor: <strong className="text-white">{selectedVisit.locationName}</strong></div>
              <div className="text-gray-400">Date/Time: <strong className="text-white">{selectedVisit.preferredDate} ({selectedVisit.preferredTimeSlot})</strong></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Select Active Member / Staff Coordinator
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              >
                <option value="">-- Choose active team member --</option>
                {eligibleStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.memberId || 'Staff'}) — {staff.role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                disabled={isSubmitting || !selectedStaffId}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Site Visit Modal */}
      {isNewVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-[#C7A35A]" />
                <h3 className="font-serif text-lg font-bold text-white">Schedule New Site Visit</h3>
              </div>
              <button
                onClick={() => setIsNewVisitModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Client / Visitor Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisitorName}
                    onChange={(e) => setNewVisitorName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newVisitorPhone}
                    onChange={(e) => setNewVisitorPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newVisitorEmail}
                    onChange={(e) => setNewVisitorEmail(e.target.value)}
                    placeholder="e.g. visitor@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Township Corridor *</label>
                  <select
                    value={newLocationId}
                    onChange={(e) => {
                      setNewLocationId(e.target.value);
                      if (e.target.value === 'rampur') setNewLocationName('Rampur Industrial Green Corridor');
                      else if (e.target.value === 'lahartara') setNewLocationName('Lahartara Junction City');
                      else setNewLocationName('Mirza Murad Express Township');
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="rampur">Rampur Industrial Green Corridor</option>
                    <option value="lahartara">Lahartara Junction City</option>
                    <option value="mirzamurad">Mirza Murad Express Township</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={newPreferredDate}
                    onChange={(e) => setNewPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Preferred Time Slot *</label>
                  <select
                    value={newPreferredTimeSlot}
                    onChange={(e) => setNewPreferredTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning Slot)</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Noon Slot)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening Slot)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pickupReq"
                  checked={newPickupRequired}
                  onChange={(e) => setNewPickupRequired(e.target.checked)}
                  className="rounded border-white/10 text-[#C7A35A] focus:ring-[#C7A35A]"
                />
                <label htmlFor="pickupReq" className="text-xs text-gray-300">
                  Station or hotel pickup required (Varanasi Cantt / Manduadih / Babatpur)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Special Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Client interested in 1500 sq ft corner plot in Block B..."
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewVisitModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
