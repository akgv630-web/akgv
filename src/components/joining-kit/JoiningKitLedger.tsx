'use client';

import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { JoiningKitIssue } from '@/types';

export function JoiningKitLedger() {
  const { kitIssues, recordKitIssue, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<JoiningKitIssue | null>(null);

  // New Issue Form State
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [collectionDate, setCollectionDate] = useState('2026-10-11');
  const [hasBag, setHasBag] = useState(true);
  const [hasPen, setHasPen] = useState(true);
  const [hasDiary, setHasDiary] = useState(true);
  const [hasFile, setHasFile] = useState(true);
  const [recipientAck, setRecipientAck] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredIssues = kitIssues.filter(
    (k) =>
      k.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCashCollected = kitIssues.reduce((sum, item) => sum + item.amountReceivedInr, 0);
  const totalKitsIssued = kitIssues.length;

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !memberName) {
      alert('Member ID and Full Name are required.');
      return;
    }

    const created = recordKitIssue({
      memberId: memberId.toUpperCase(),
      memberName,
      memberPhone,
      amountReceivedInr: COMPANY_DETAILS.joiningKitPriceInr,
      collectionDate,
      collectorStaffName: currentUser.fullName,
      collectorStaffId: currentUser.id,
      itemsIncluded: {
        bag: hasBag,
        pen: hasPen,
        diary: hasDiary,
        file: hasFile,
      },
      deliveryStatus: 'acknowledged',
      recipientSignatureAck: recipientAck || 'Acknowledged on receipt in branch ledger',
      auditNotes: auditNotes || 'Physical cash ₹999 received into authorized treasury box.',
    });

    setSuccessNotice(`Cash receipt ${created.receiptNumber} successfully created!`);
    setTimeout(() => {
      setIssueModalOpen(false);
      setSuccessNotice(null);
      setMemberId('');
      setMemberName('');
      setMemberPhone('');
      setRecipientAck('');
      setAuditNotes('');
    }, 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/90 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#C7A35A]" />
            <h2 className="font-serif text-xl font-bold text-white tracking-wide">
              Joining Kit — Offline Cash Ledger (₹999)
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Physical Welcome Kit: 1 Bag, 1 Pen, 1 Diary, 1 Document File | Offline Cash Tracking
          </p>
        </div>

        <button
          onClick={() => setIssueModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Record New ₹999 Cash Kit</span>
        </button>
      </div>

      {/* Cash Reconciliation Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Offline Cash Collected</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">
            ₹{totalCashCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Verified offline treasury</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Physical Kits Issued</span>
          <span className="font-serif text-2xl font-bold text-white">{totalKitsIssued} Kits</span>
          <span className="text-[10px] text-gray-400 block mt-1">Acknowledged by members</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Standard Kit Amount</span>
          <span className="font-serif text-2xl font-bold text-[#DFC382]">₹999 / Kit</span>
          <span className="text-[10px] text-gray-400 block mt-1">Non-commissionable</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Kit Physical Inventory</span>
          <span className="font-serif text-2xl font-bold text-sky-400">184 in Stock</span>
          <span className="text-[10px] text-gray-400 block mt-1">Central office warehouse</span>
        </div>
      </div>

      {/* Kit Contents Card */}
      <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif font-bold text-white flex items-center gap-1.5">
            <Archive className="h-4 w-4 text-[#C7A35A]" />
            Official Member Joining Kit Mandatory Contents
          </span>
          <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
            ₹999 Cash Offline
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center gap-2">
            <span className="text-[#C7A35A] font-bold text-lg">01</span>
            <div>
              <strong className="text-white block">Executive Bag</strong>
              <span className="text-[10px] text-gray-400">AKGV Embossed Logo</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center gap-2">
            <span className="text-[#C7A35A] font-bold text-lg">01</span>
            <div>
              <strong className="text-white block">Metallic Pen</strong>
              <span className="text-[10px] text-gray-400">Gold Plated Finish</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center gap-2">
            <span className="text-[#C7A35A] font-bold text-lg">01</span>
            <div>
              <strong className="text-white block">Executive Diary</strong>
              <span className="text-[10px] text-gray-400">Leatherette Hardbound</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center gap-2">
            <span className="text-[#C7A35A] font-bold text-lg">01</span>
            <div>
              <strong className="text-white block">Portfolio Folder / File</strong>
              <span className="text-[10px] text-gray-400">Project Blueprint Slots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Ledger Records Table */}
      <div className="overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0B1734] px-6 py-4">
          <div>
            <h3 className="font-serif text-base font-bold text-white">
              Joining Kit Cash Issue Records & Receipts
            </h3>
            <p className="text-xs text-gray-400">
              Complete audit history of cash transactions, issuing staff, and member acknowledgements
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Member ID / Receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#050A17] py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#0B1734]/80 text-[#DFC382] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Member ID & Name</th>
                <th className="px-4 py-3">Amount Received</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Authorized Collector</th>
                <th className="px-4 py-3">Delivery Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3 font-mono font-bold text-sky-400">
                    {issue.receiptNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{issue.memberName}</div>
                    <span className="font-mono text-[11px] text-[#DFC382]">{issue.memberId}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    ₹{issue.amountReceivedInr} (Cash)
                  </td>
                  <td className="px-4 py-3 text-gray-300">{issue.collectionDate}</td>
                  <td className="px-4 py-3 text-gray-300">{issue.collectorStaffName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Acknowledged
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(issue)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#C7A35A]/50 bg-[#0B1734] px-2.5 py-1 text-[11px] font-semibold text-[#DFC382] hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Kit Issue Modal */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#C7A35A] bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Record ₹999 Offline Cash Joining Kit
                </h3>
                <p className="text-xs text-gray-400">
                  Issue receipt and acknowledge handover of bag, pen, diary and file
                </p>
              </div>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successNotice ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-xs text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                <p className="font-semibold text-sm">{successNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Member ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AKGV0088"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Gupta"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Mobile Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9839123456"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Collection Date</label>
                    <input
                      type="date"
                      value={collectionDate}
                      onChange={(e) => setCollectionDate(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white focus:border-[#C7A35A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 space-y-2">
                  <span className="font-semibold text-[#DFC382] block text-[11px]">
                    Handover Checklist (Verify All 4 Items Handed to Member):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasBag}
                        onChange={(e) => setHasBag(e.target.checked)}
                        className="rounded accent-[#C7A35A]"
                      />
                      <span>1 Official Bag</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPen}
                        onChange={(e) => setHasPen(e.target.checked)}
                        className="rounded accent-[#C7A35A]"
                      />
                      <span>1 Official Pen</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDiary}
                        onChange={(e) => setHasDiary(e.target.checked)}
                        className="rounded accent-[#C7A35A]"
                      />
                      <span>1 Official Diary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasFile}
                        onChange={(e) => setHasFile(e.target.checked)}
                        className="rounded accent-[#C7A35A]"
                      />
                      <span>1 Portfolio File</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Recipient Acknowledgement Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received in person at head office"
                    value={recipientAck}
                    onChange={(e) => setRecipientAck(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="text-gray-400">
                    Amount: <strong className="text-emerald-400 text-sm">₹999 Cash</strong>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIssueModalOpen(false)}
                      className="rounded-lg px-3 py-2 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-4 py-2 font-bold text-[#0B1734] shadow hover:brightness-110"
                    >
                      Issue & Generate Receipt
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border-2 border-[#C7A35A] bg-[#050A17] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#C7A35A]/30 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#C7A35A]" />
                <span className="font-serif text-sm font-bold text-[#DFC382]">
                  OFFICIAL CASH RECEIPT
                </span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="rounded-xl border border-white/10 bg-[#0B1734] p-4 text-xs space-y-3 font-mono">
              <div className="text-center border-b border-white/10 pb-2">
                <strong className="text-base text-[#DFC382] font-serif block">
                  AKGV INFRA CITY PRIVATE LIMITED
                </strong>
                <span className="text-[10px] text-gray-400">
                  Head Office: Varanasi, Uttar Pradesh | Helpline: +91 6306917991
                </span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Receipt No:</span>
                <span className="text-white font-bold">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">{selectedReceipt.collectionDate}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Member ID:</span>
                <span className="text-[#DFC382] font-bold">{selectedReceipt.memberId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Received From:</span>
                <span className="text-white">{selectedReceipt.memberName}</span>
              </div>

              <div className="border-t border-dashed border-white/20 pt-2 pb-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-300">Amount (Cash Offline):</span>
                  <span className="text-emerald-400">₹{selectedReceipt.amountReceivedInr}.00</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  (Nine Hundred and Ninety-Nine Rupees Only)
                </span>
              </div>

              <div className="rounded bg-white/5 p-2 text-[10px] text-gray-300">
                <strong>Items Handed Over:</strong> 1 Bag, 1 Pen, 1 Diary, 1 Portfolio File.
              </div>

              <div className="flex justify-between items-end pt-3 text-[10px] text-gray-400 border-t border-white/10">
                <div>
                  <span>Collector: {selectedReceipt.collectorStaffName}</span>
                </div>
                <div className="text-right">
                  <span className="border-t border-gray-500 pt-1 block">Authorized Signatory</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-[#C7A35A] px-4 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
