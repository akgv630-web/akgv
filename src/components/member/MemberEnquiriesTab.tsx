'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  Plus,
  Search,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ClientEnquiry } from '@/types';

export function MemberEnquiriesTab() {
  const { enquiries, currentUser, updateEnquiryStatus, addEnquiryFollowUp } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientEnquiry['status']>('ALL');

  // Follow-up modal
  const [activeFollowUpEnquiry, setActiveFollowUpEnquiry] = useState<ClientEnquiry | null>(null);
  const [followUpSummary, setFollowUpSummary] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (!currentUser) return null;

  // Enquiries assigned to current member
  const myEnquiries = enquiries.filter((e) => {
    const isMine =
      e.assignedProfileId === currentUser.id ||
      e.assignedMemberId === currentUser.memberId ||
      e.assignedMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (e.assignedMemberId === 'usr-sponsor-01' || e.assignedMemberId === 'AKGV-3498'));

    if (!isMine) return false;

    const matchesSearch =
      e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.clientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAssigned = enquiries.filter(
    (e) =>
      e.assignedProfileId === currentUser.id ||
      e.assignedMemberId === currentUser.memberId ||
      e.assignedMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (e.assignedMemberId === 'usr-sponsor-01' || e.assignedMemberId === 'AKGV-3498'))
  );

  const newCount = totalAssigned.filter((e) => e.status === 'new').length;
  const contactedCount = totalAssigned.filter((e) => e.status === 'contacted').length;
  const visitScheduledCount = totalAssigned.filter((e) => e.status === 'visit_scheduled').length;
  const bookedCount = totalAssigned.filter((e) => e.status === 'booked').length;

  const handleStatusChange = async (enquiryId: string, newStatus: ClientEnquiry['status']) => {
    setIsSubmitting(true);
    const res = await updateEnquiryStatus(enquiryId, newStatus);
    setIsSubmitting(false);

    if (res.success) {
      showNotification(`Enquiry status updated to ${newStatus}`);
    } else {
      showNotification(res.error || 'Failed to update status', 'error');
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUpEnquiry || !followUpSummary.trim()) {
      showNotification('Follow-up summary is required', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await addEnquiryFollowUp(
      activeFollowUpEnquiry.id,
      followUpSummary.trim(),
      nextFollowUpDate || undefined
    );
    setIsSubmitting(false);

    if (res.success) {
      showNotification(`Follow-up note logged for ${activeFollowUpEnquiry.clientName}`);
      setActiveFollowUpEnquiry(null);
      setFollowUpSummary('');
    } else {
      showNotification(res.error || 'Failed to save follow-up', 'error');
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
          <span className="text-xs text-gray-400 block">Total Assigned Leads</span>
          <span className="font-serif text-2xl font-bold text-white">{totalAssigned.length}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Directly allocated to you</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block">New Inquiries</span>
          <span className="font-serif text-2xl font-bold text-amber-400">{newCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Awaiting first call/outreach</span>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Visit Scheduled</span>
          <span className="font-serif text-2xl font-bold text-sky-400">{visitScheduledCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Ready for on-site inspection</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Converted / Booked</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{bookedCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Successful township sales</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search buyer name or phone..."
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
            <option value="new">New ({newCount})</option>
            <option value="contacted">Contacted ({contactedCount})</option>
            <option value="visit_scheduled">Visit Scheduled ({visitScheduledCount})</option>
            <option value="booked">Booked ({bookedCount})</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <strong className="text-white">{myEnquiries.length}</strong> inquiries
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-3">
        {myEnquiries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <MessageSquare className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No assigned client inquiries found</p>
            <p className="text-xs mt-1">New prospective buyers assigned to you by administration will appear here.</p>
          </div>
        ) : (
          myEnquiries.map((enq) => (
            <div
              key={enq.id}
              id={enq.id}
              data-record-id={enq.id}
              className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3 transition hover:border-[#C7A35A]/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-base font-bold text-white">{enq.clientName}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        enq.status === 'booked'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : enq.status === 'visit_scheduled'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : enq.status === 'lost'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : enq.status === 'contacted'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {enq.status.replace('_', ' ')}
                    </span>
                    {enq.budgetInr && (
                      <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                        Budget: ₹{(enq.budgetInr / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                    <a
                      href={`tel:${enq.clientPhone}`}
                      className="flex items-center gap-1.5 text-[#DFC382] font-semibold hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{enq.clientPhone} (Call Client)</span>
                    </a>
                    {enq.clientEmail && (
                      <span className="text-gray-400">{enq.clientEmail}</span>
                    )}
                    {enq.interestedPlotId && (
                      <span className="text-gray-400">
                        Interested Plot: <strong className="text-white">{enq.interestedPlotId}</strong>
                      </span>
                    )}
                  </div>

                  {enq.notes && (
                    <p className="rounded-xl bg-[#050A17] p-2.5 text-xs text-gray-300 border border-white/5">
                      <strong className="text-gray-400">Client Requirements:</strong> {enq.notes}
                    </p>
                  )}
                </div>

                {/* Status Dropdown & Follow-up Button */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value as ClientEnquiry['status'])}
                    className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="visit_scheduled">Visit Scheduled</option>
                    <option value="booked">Booked (Won)</option>
                    <option value="lost">Lost</option>
                  </select>

                  <button
                    onClick={() => {
                      setActiveFollowUpEnquiry(enq);
                      setFollowUpSummary('');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-3 py-2 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Call / Follow-up</span>
                  </button>
                </div>
              </div>

              {/* Follow-up History */}
              {enq.followUps && enq.followUps.length > 0 && (
                <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                  <span className="text-[11px] font-semibold text-gray-400 block">Follow-up Log:</span>
                  <div className="space-y-1">
                    {enq.followUps.map((f) => (
                      <div
                        key={f.id}
                        className="flex flex-wrap items-center justify-between rounded-lg bg-[#050A17] px-3 py-1.5 text-xs text-gray-300 border border-white/5"
                      >
                        <span>{f.summary}</span>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span>{new Date(f.date).toLocaleDateString('en-IN')}</span>
                          {f.nextFollowUpDate && (
                            <span className="text-amber-400">
                              Next: {f.nextFollowUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Log Follow-up Modal */}
      {activeFollowUpEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#C7A35A]" />
                <h3 className="font-serif text-lg font-bold text-white">Log Call / Follow-up</h3>
              </div>
              <button
                onClick={() => setActiveFollowUpEnquiry(null)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#050A17] p-3 text-xs space-y-1 border border-white/10">
              <div className="text-gray-400">Client: <strong className="text-white">{activeFollowUpEnquiry.clientName}</strong></div>
              <div className="text-gray-400">Phone: <strong className="text-[#DFC382]">{activeFollowUpEnquiry.clientPhone}</strong></div>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Call Summary / Client Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={followUpSummary}
                  onChange={(e) => setFollowUpSummary(e.target.value)}
                  placeholder="e.g. Discussed pricing for Plot A-04; client asked for layout plan on WhatsApp..."
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFollowUpEnquiry(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
