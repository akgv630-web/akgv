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
    currentUser
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
      setActionNotice({ text: `लीड "${assigningEnquiry.clientName}" सफलतापूर्वक ${staff.fullName} को सौंपी गई।` });
      setAssigningEnquiry(null);
      setSelectedStaffId('');
    } else {
      setActionNotice({ text: res.error || 'असाइनमेंट विफल रहा।', isError: true });
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpEnquiry || !followUpSummary.trim()) return;

    const res = await addEnquiryFollowUp(followUpEnquiry.id, followUpSummary.trim(), nextFollowUpDate || undefined);
    if (res.success) {
      setActionNotice({ text: 'फॉलो-अप विवरण सफलतापूर्वक दर्ज किया गया।' });
      setFollowUpEnquiry(null);
      setFollowUpSummary('');
      setNextFollowUpDate('');
    } else {
      setActionNotice({ text: res.error || 'त्रुटि दर्ज हुई।', isError: true });
    }
  };

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) {
      setActionNotice({ text: 'ग्राहक का नाम और फ़ोन नंबर अनिवार्य हैं।', isError: true });
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

    setActionNotice({ text: `नयी लीड "${newClientName}" सफलतापूर्वक पंजीकृत की गई।` });
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
          <span className="text-xs text-gray-400 block font-medium">कुल लीड्स (Total Inquiries)</span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">{enquiries.length}</span>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-lg">
          <span className="text-xs text-blue-300 block font-medium">नयी लीड्स (New)</span>
          <span className="text-2xl font-serif font-bold text-blue-400 mt-1 block">
            {enquiries.filter((e) => e.status === 'new').length}
          </span>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-lg">
          <span className="text-xs text-amber-300 block font-medium">संपर्क / विजिट शेड्यूल्ड</span>
          <span className="text-2xl font-serif font-bold text-amber-400 mt-1 block">
            {enquiries.filter((e) => e.status === 'contacted' || e.status === 'visit_scheduled').length}
          </span>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-lg">
          <span className="text-xs text-emerald-300 block font-medium">बुकिंग में परिवर्तित (Booked)</span>
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
              placeholder="ग्राहक नाम, फ़ोन या सदस्य खोजें..."
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
            <option value="ALL">सभी स्थितियां (All Status)</option>
            <option value="new">नयी लीड (New)</option>
            <option value="contacted">संपर्क किया (Contacted)</option>
            <option value="visit_scheduled">विजिट निर्धारित (Visit Scheduled)</option>
            <option value="booked">बुक किया (Booked)</option>
            <option value="lost">बंद / रुचि नहीं (Lost)</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>नयी लीड जोड़ें (Add Lead)</span>
        </button>
      </div>

      {/* Enquiries List */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1734] overflow-hidden shadow-xl divide-y divide-white/10">
        {filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <User className="h-12 w-12 mx-auto text-gray-500 mb-3 opacity-60" />
            <p className="text-sm font-semibold">कोई पूछताछ नहीं मिली (No Inquiries Found)</p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div key={enq.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
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
                      सौंपा गया: {enq.assignedMemberName ? <strong className="text-white">{enq.assignedMemberName}</strong> : <span className="text-red-400">अनसाइंड (Unassigned)</span>}
                    </span>
                  </span>

                  {enq.budgetInr && (
                    <span>बजट: <strong className="text-emerald-400 font-mono">₹{(enq.budgetInr / 100000).toFixed(1)} Lakh</strong></span>
                  )}

                  <span>पंजीकृत: {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>

                  {enq.followUps && enq.followUps.length > 0 && (
                    <span className="text-[#DFC382] font-semibold">
                      फॉलो-अप नोट्स: {enq.followUps.length}
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
                          <span className="text-amber-400 ml-2">(अगला फॉलो-अप: {flw.nextFollowUpDate})</span>
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
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="visit_scheduled">Visit Scheduled</option>
                  <option value="booked">Booked</option>
                  <option value="lost">Lost</option>
                </select>

                <button
                  onClick={() => {
                    setAssigningEnquiry(enq);
                    setSelectedStaffId(enq.assignedProfileId || '');
                  }}
                  className="rounded-xl border border-[#C7A35A]/40 bg-[#C7A35A]/10 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                >
                  असाइन करें
                </button>

                <button
                  onClick={() => setFollowUpEnquiry(enq)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition"
                >
                  फॉलो-अप जोड़ें
                </button>

                <button
                  onClick={async () => {
                    if (confirm(`क्या आप लीड "${enq.clientName}" को हटाना चाहते हैं?`)) {
                      await deleteEnquiry(enq.id);
                      setActionNotice({ text: 'लीड हटा दी गई।' });
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
            <h3 className="text-base font-serif font-bold text-white">लीड सौंपें (Assign Lead)</h3>
            <p className="text-xs text-gray-300">
              ग्राहक: <strong className="text-white">{assigningEnquiry.clientName}</strong> ({assigningEnquiry.clientPhone})
            </p>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1">सक्रिय सदस्य चुनें</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full rounded-xl border border-[#C7A35A]/50 bg-[#050A17] p-2.5 text-xs text-[#DFC382] focus:outline-none"
              >
                <option value="">-- सदस्य चुनें --</option>
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
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300"
              >
                रद्द करें
              </button>
              <button
                onClick={handleAssignConfirm}
                disabled={!selectedStaffId}
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] disabled:opacity-50"
              >
                पुष्टि करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[#C7A35A]/50 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-white">फॉलो-अप लॉग दर्ज करें</h3>
            <p className="text-xs text-gray-300">
              ग्राहक: <strong className="text-white">{followUpEnquiry.clientName}</strong>
            </p>

            <form onSubmit={handleFollowUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">बातचीत का सारांश (Summary) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="उदा. ग्राहक से फोन पर बात हुई, उन्होंने रविवार को रामपुर साइट पर पिलर देखने की इच्छा जताई..."
                  value={followUpSummary}
                  onChange={(e) => setFollowUpSummary(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">अगली फॉलो-अप तिथि (Next Date)</label>
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
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734]"
                >
                  सहेजें
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
            <h3 className="text-base font-serif font-bold text-white">नयी ग्राहक पूछताछ पंजीकृत करें</h3>

            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">ग्राहक का नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री रामेश्वर नाथ त्रिपाठी"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">फ़ोन नंबर *</label>
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
                  <label className="block text-gray-300 font-semibold mb-1">अनुमानित बजट (₹)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">ईमेल (वैकल्पिक)</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">प्राथमिक आवश्यकता / विवरण</label>
                <textarea
                  rows={2}
                  placeholder="कॉर्नर प्लॉट, 30 फीट मुख्य सड़क, दाखिल-खारिज आदि..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734]"
                >
                  लीड जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
