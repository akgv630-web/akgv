'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';
import { ClientEnquiry } from '@/types';

export function AdminEnquiriesTab() {
  const {
    enquiries,
    addEnquiry,
    assignEnquiry,
    addEnquiryFollowUp,
    updateEnquiryStatus,
    deleteEnquiry,
    allProfiles,
    currentUser,
    language
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientEnquiry['status']>('ALL');
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  // Assign Modal State
  const [assigningEnquiry, setAssigningEnquiry] = useState<ClientEnquiry | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Follow-up Modal State
  const [followUpEnquiry, setFollowUpEnquiry] = useState<ClientEnquiry | null>(null);
  const [followUpSummary, setFollowUpSummary] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Create Enquiry Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBudget, setNewBudget] = useState<number>(1500000);
  const [newNotes, setNewNotes] = useState('');

  const eligibleAssignees = allProfiles.filter((p) => p.isActive && p.role !== 'buyer');

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = e.clientName.toLowerCase().includes(q);
      const matchPhone = e.clientPhone.includes(q);
      const matchAssigned = (e.assignedMemberName || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAssigned && !matchNotes) return false;
    }
    return true;
  });

  const handleAssignConfirm = async () => {
    if (!assigningEnquiry || !selectedStaffId) return;
    const staff = eligibleAssignees.find((p) => p.id === selectedStaffId);
    if (!staff) return;

    const res = await assignEnquiry(assigningEnquiry.id, staff.id, staff.fullName, staff.memberId);
    if (res.success) {
      setActionNotice({
        text: tLang(
          language,
          `Lead "${assigningEnquiry.clientName}" successfully assigned to ${staff.fullName}.`,
          `लीड "${assigningEnquiry.clientName}" सफलतापूर्वक ${staff.fullName} को सौंपी गई।`,
          `Lead "${assigningEnquiry.clientName}" safaltapoorvak ${staff.fullName} ko assign ho gayi.`
        )
      });
      setAssigningEnquiry(null);
      setSelectedStaffId('');
    } else {
      setActionNotice({
        text: res.error || tLang(language, 'Assignment failed.', 'असाइनमेंट विफल रहा।', 'Assignment fail ho gaya.'),
        isError: true
      });
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpEnquiry || !followUpSummary.trim()) return;

    const res = await addEnquiryFollowUp(followUpEnquiry.id, followUpSummary.trim(), nextFollowUpDate || undefined);
    if (res.success) {
      setActionNotice({
        text: tLang(language, 'Follow-up details recorded successfully.', 'फॉलो-अप विवरण सफलतापूर्वक दर्ज किया गया।', 'Follow-up details record ho gayi.')
      });
      setFollowUpEnquiry(null);
      setFollowUpSummary('');
      setNextFollowUpDate('');
    } else {
      setActionNotice({
        text: res.error || tLang(language, 'An error occurred.', 'त्रुटि दर्ज हुई।', 'Error hua.'),
        isError: true
      });
    }
  };

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      setActionNotice({
        text: tLang(language, 'Client name and phone number are required.', 'ग्राहक का नाम और फ़ोन नंबर अनिवार्य हैं।', 'Client name aur phone number zaroori hain.'),
        isError: true
      });
      return;
    }

    addEnquiry({
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim(),
      clientEmail: newClientEmail.trim() || undefined,
      budgetInr: newBudget,
      status: 'new',
      assignedMemberId: '',
      assignedMemberName: 'Unassigned',
      notes: newNotes.trim() || undefined,
    });

    setActionNotice({
      text: tLang(
        language,
        `New lead "${newClientName}" registered successfully.`,
        `नयी लीड "${newClientName}" सफलतापूर्वक पंजीकृत की गई।`,
        `Nayi lead "${newClientName}" register ho gayi.`
      )
    });
    setIsCreateModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4 shadow-lg">
          <span className="text-xs text-gray-400 block font-medium">
            {tLang(language, 'Total Inquiries', 'कुल पूछताछ', 'Total Inquiries')}
          </span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">{enquiries.length}</span>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-lg">
          <span className="text-xs text-blue-300 block font-medium">
            {tLang(language, 'New Leads', 'नयी लीड्स', 'New Leads')}
          </span>
          <span className="text-2xl font-serif font-bold text-blue-400 mt-1 block">
            {enquiries.filter((e) => e.status === 'new').length}
          </span>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-lg">
          <span className="text-xs text-amber-300 block font-medium">
            {tLang(language, 'Contacted / Scheduled', 'संपर्क / विजिट शेड्यूल्ड', 'Contacted / Scheduled')}
          </span>
          <span className="text-2xl font-serif font-bold text-amber-400 mt-1 block">
            {enquiries.filter((e) => e.status === 'contacted' || e.status === 'visit_scheduled').length}
          </span>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-lg">
          <span className="text-xs text-emerald-300 block font-medium">
            {tLang(language, 'Converted to Bookings', 'बुकिंग में परिवर्तित', 'Booked Leads')}
          </span>
          <span className="text-2xl font-serif font-bold text-emerald-400 mt-1 block">
            {enquiries.filter((e) => e.status === 'booked').length}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-sm font-semibold border ${
            actionNotice.isError
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-current hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={tLang(language, 'Search client name, phone or member...', 'ग्राहक नाम, फ़ोन या सदस्य खोजें...', 'Client name, phone ya member search karein...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ClientEnquiry['status'])}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">{tLang(language, 'All Statuses', 'सभी स्थितियां', 'All Statuses')}</option>
            <option value="new">{tLang(language, 'New', 'नयी लीड', 'New')}</option>
            <option value="contacted">{tLang(language, 'Contacted', 'संपर्क किया', 'Contacted')}</option>
            <option value="visit_scheduled">{tLang(language, 'Visit Scheduled', 'विजिट निर्धारित', 'Visit Scheduled')}</option>
            <option value="booked">{tLang(language, 'Booked', 'बुक किया', 'Booked')}</option>
            <option value="lost">{tLang(language, 'Lost', 'बंद / रुचि नहीं', 'Lost')}</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>{tLang(language, 'Add Lead', 'नयी लीड जोड़ें', 'Nayi Lead Jodein')}</span>
        </button>
      </div>

      {/* Enquiries List */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1734] overflow-hidden shadow-xl divide-y divide-white/10">
        {filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <User className="h-12 w-12 mx-auto text-gray-500 mb-3 opacity-60" />
            <p className="text-sm font-semibold">
              {tLang(language, 'No Inquiries Found', 'कोई पूछताछ नहीं मिली', 'Koi Inquiry Nahi Mili')}
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div key={enq.id} id={enq.id} data-record-id={enq.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{enq.clientName}</h3>
                  <a
                    href={`tel:${enq.clientPhone}`}
                    className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-mono text-[#DFC382] hover:bg-white/20 transition"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{enq.clientPhone}</span>
                  </a>

                  {enq.clientEmail && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                      <Mail className="h-3 w-3" />
                      <span>{enq.clientEmail}</span>
                    </span>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      enq.status === 'booked'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : enq.status === 'visit_scheduled'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : enq.status === 'contacted'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : enq.status === 'lost'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}
                  >
                    {enq.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {enq.notes && (
                  <p className="text-xs text-gray-300 leading-relaxed">{enq.notes}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-[#DFC382]" />
                    <span>
                      {tLang(language, 'Assigned to:', 'सौंपा गया:', 'Assigned:')}{' '}
                      {enq.assignedMemberName ? (
                        <strong className="text-white">{enq.assignedMemberName}</strong>
                      ) : (
                        <span className="text-red-400">{tLang(language, 'Unassigned', 'अनसाइंड', 'Unassigned')}</span>
                      )}
                    </span>
                  </span>

                  {enq.budgetInr && (
                    <span>
                      {tLang(language, 'Budget:', 'बजट:', 'Budget:')}{' '}
                      <strong className="text-emerald-400 font-mono">₹{(enq.budgetInr / 100000).toFixed(1)} Lakh</strong>
                    </span>
                  )}

                  <span>
                    {tLang(language, 'Registered:', 'पंजीकृत:', 'Registered:')}{' '}
                    {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                  </span>

                  {enq.followUps && enq.followUps.length > 0 && (
                    <span className="text-[#DFC382] font-semibold">
                      {tLang(language, 'Follow-up Notes:', 'फॉलो-अप नोट्स:', 'Follow-up Notes:')} {enq.followUps.length}
                    </span>
                  )}
                </div>

                {/* Follow ups drawer */}
                {enq.followUps && enq.followUps.length > 0 && (
                  <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-[#C7A35A]/30">
                    {enq.followUps.map((flw) => (
                      <div key={flw.id} className="text-[11px] text-gray-300">
                        <span className="text-gray-400 font-mono">{flw.date}:</span> {flw.summary}
                        {flw.nextFollowUpDate && (
                          <span className="text-amber-400 ml-2">
                            ({tLang(language, 'Next follow-up:', 'अगला फॉलो-अप:', 'Next follow-up:')} {flw.nextFollowUpDate})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                <select
                  value={enq.status}
                  onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as ClientEnquiry['status'])}
                  className="rounded-xl border border-white/10 bg-[#050A17] px-2.5 py-1.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="new">{tLang(language, 'New', 'नयी लीड', 'New')}</option>
                  <option value="contacted">{tLang(language, 'Contacted', 'संपर्क किया', 'Contacted')}</option>
                  <option value="visit_scheduled">{tLang(language, 'Visit Scheduled', 'विजिट निर्धारित', 'Visit Scheduled')}</option>
                  <option value="booked">{tLang(language, 'Booked', 'बुक किया', 'Booked')}</option>
                  <option value="lost">{tLang(language, 'Lost', 'बंद / रुचि नहीं', 'Lost')}</option>
                </select>

                <button
                  onClick={() => {
                    setAssigningEnquiry(enq);
                    setSelectedStaffId(enq.assignedProfileId || '');
                  }}
                  className="rounded-xl border border-[#C7A35A]/40 bg-[#C7A35A]/10 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                >
                  {tLang(language, 'Assign', 'असाइन करें', 'Assign Karein')}
                </button>

                <button
                  onClick={() => setFollowUpEnquiry(enq)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition"
                >
                  {tLang(language, 'Add Follow-up', 'फॉलो-अप जोड़ें', 'Follow-up Jodein')}
                </button>

                <button
                  onClick={async () => {
                    if (
                      confirm(
                        tLang(
                          language,
                          `Are you sure you want to delete lead "${enq.clientName}"?`,
                          `क्या आप लीड "${enq.clientName}" को हटाना चाहते हैं?`,
                          `Kya aap lead "${enq.clientName}" delete karna chahte hain?`
                        )
                      )
                    ) {
                      await deleteEnquiry(enq.id);
                      setActionNotice({
                        text: tLang(language, 'Lead deleted.', 'लीड हटा दी गई।', 'Lead delete ho gayi.')
                      });
                    }
                  }}
                  className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {assigningEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[#C7A35A]/50 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              {tLang(language, 'Assign Lead', 'लीड सौंपें', 'Lead Assign Karein')}
            </h3>
            <p className="text-xs text-gray-300">
              {tLang(language, 'Client:', 'ग्राहक:', 'Client:')} <strong className="text-white">{assigningEnquiry.clientName}</strong> ({assigningEnquiry.clientPhone})
            </p>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">
                {tLang(language, 'Select Active Member', 'सक्रिय सदस्य चुनें', 'Active Member Select Karein')}
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-[#C7A35A]/50 bg-[#050A17] p-2.5 text-xs text-[#DFC382] focus:outline-none"
              >
                <option value="">{tLang(language, '-- Select Member --', '-- सदस्य चुनें --', '-- Member Select Karein --')}</option>
                {eligibleAssignees.map((mem) => (
                  <option key={mem.id} value={mem.id}>
                    {mem.fullName} ({mem.memberId || mem.id}) • {mem.branchLocation || 'Head Office'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAssigningEnquiry(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
              >
                {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
              </button>
              <button
                onClick={handleAssignConfirm}
                disabled={!selectedStaffId}
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] disabled:opacity-50 hover:brightness-110 transition"
              >
                {tLang(language, 'Confirm Assignment', 'पुष्टि करें', 'Confirm Assignment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[#C7A35A]/50 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              {tLang(language, 'Log Follow-up', 'फॉलो-अप लॉग दर्ज करें', 'Follow-up Log Karein')}
            </h3>
            <p className="text-xs text-gray-300">
              {tLang(language, 'Client:', 'ग्राहक:', 'Client:')} <strong className="text-white">{followUpEnquiry.clientName}</strong>
            </p>

            <form onSubmit={handleFollowUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Discussion Summary *', 'बातचीत का सारांश *', 'Discussion Summary *')}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={tLang(language, 'e.g. Discussed with client over phone, requested plot boundary visit this Sunday...', 'उदा. ग्राहक से फोन पर बात हुई, उन्होंने रविवार को रामपुर साइट पर पिलर देखने की इच्छा जताई...', 'e.g. Phone par baat hui, Sunday ko site visit chahte hain...')}
                  value={followUpSummary}
                  onChange={(e) => setFollowUpSummary(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Next Follow-up Date', 'अगली फॉलो-अप तिथि', 'Next Follow-up Date')}
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFollowUpEnquiry(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
                >
                  {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 transition"
                >
                  {tLang(language, 'Save Follow-up', 'सहेजें', 'Save Karein')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Enquiry Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#C7A35A]/50 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              {tLang(language, 'Register New Client Inquiry', 'नयी ग्राहक पूछताछ पंजीकृत करें', 'Nayi Client Inquiry Register Karein')}
            </h3>

            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Client Name *', 'ग्राहक का नाम *', 'Client Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tLang(language, 'e.g. Rameshwar Nath Tripathi', 'उदा. श्री रामेश्वर नाथ त्रिपाठी', 'e.g. Rameshwar Nath Tripathi')}
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Phone Number *', 'फ़ोन नंबर *', 'Phone Number *')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9415012345"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Estimated Budget (₹)', 'अनुमानित बजट (₹)', 'Estimated Budget (₹)')}
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Email (Optional)', 'ईमेल (वैकल्पिक)', 'Email (Optional)')}
                </label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Requirement / Notes', 'प्राथमिक आवश्यकता / विवरण', 'Requirement / Notes')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tLang(language, 'Corner plot, 30ft main road, registry mutation, etc.', 'कॉर्नर प्लॉट, 30 फीट मुख्य सड़क, दाखिल-खारिज आदि...', 'Corner plot, 30ft road, dakhil-kharij etc.')}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
                >
                  {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 transition"
                >
                  {tLang(language, 'Add Lead', 'लीड जोड़ें', 'Lead Jodein')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
