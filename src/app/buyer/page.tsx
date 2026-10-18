'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  MapPin,
  Plus,
  QrCode,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
  X,
  Camera
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { ProfilePhotoStudioModal } from '@/components/common/ProfilePhotoStudioModal';
import { AuthBarrier } from '@/components/auth/AuthBarrier';
import { uploadToR2 } from '@/lib/r2Storage';

export default function BuyerPortalPage() {
  const {
    currentUser,
    bookings,
    payments,
    submitPaymentProof,
    siteVisits,
    supportTickets,
    updateMember,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'visits' | 'support'>('bookings');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(150000);
  const [txRef, setTxRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE'>('UPI_QR');
  const [proofUrl, setProofUrl] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  if (!currentUser) {
    return <AuthBarrier requiredRole="buyer" />;
  }

  // Filter records for current user
  const myBookings = bookings.filter((b) => b.buyerId === currentUser.id || currentUser.role === 'super_admin');
  const myPayments = payments.filter((p) => p.payerId === currentUser.id || p.payerPhone === currentUser.phone || p.payerName === currentUser.fullName || currentUser.role === 'super_admin');
  const myVisits = siteVisits.filter((v) => v.visitorPhone === currentUser.phone || currentUser.role === 'super_admin');
  const myTickets = supportTickets.filter((t) => t.userId === currentUser.id || currentUser.role === 'super_admin');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !txRef) {
      alert('Please select a booking and provide transaction reference.');
      return;
    }

    try {
      const pay = await submitPaymentProof(selectedBookingId, paymentAmount, txRef, paymentMethod, proofUrl || undefined);
      setPaymentSuccess(`Payment reference ${pay.transactionRef} submitted successfully! Our supervisory finance staff will verify it shortly.`);
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPaymentSuccess(null);
        setTxRef('');
        setProofUrl('');
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment submission failed.';
      alert(msg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Buyer Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-r from-[#0B1734] to-[#050A17] p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#050A17] border border-[#C7A35A] text-[#DFC382] overflow-hidden shadow">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <button
              onClick={() => setIsPhotoStudioOpen(true)}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-[#C7A35A] text-[#0B1734] shadow hover:brightness-110 border border-[#0B1734] transition active:scale-90"
              title="Change Profile Photo"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {currentUser.fullName}
              </h1>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Verified Buyer
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Phone: {currentUser.phone} | Email: {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/master-plan"
            className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A] px-4 py-2 text-xs font-bold text-[#0B1734] shadow hover:brightness-110"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Browse Plots</span>
          </Link>
          <Link
            href="/site-visit"
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Calendar className="h-3.5 w-3.5 text-[#1EA275]" />
            <span>Book Site Visit</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
            activeTab === 'bookings'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>My Plot Bookings ({myBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
            activeTab === 'payments'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payments & Receipts ({myPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
            activeTab === 'visits'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Site Visits ({myVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
            activeTab === 'support'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support Tickets ({myTickets.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookings Content */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Your Reserved & Booked Plots</h2>
            <Link
              href="/master-plan"
              className="text-xs text-[#DFC382] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore More Plots</span>
              <span>▸</span>
            </Link>
          </div>

          {myBookings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-8 text-center space-y-3">
              <Layers className="h-10 w-10 mx-auto text-gray-500" />
              <p className="text-gray-300 text-sm">No plot bookings currently registered in your account.</p>
              <Link
                href="/master-plan"
                className="inline-block rounded-xl bg-[#C7A35A] px-4 py-2 text-xs font-bold text-[#0B1734]"
              >
                Open Master Plan & Reserve Plot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="font-serif text-xl font-bold text-white">
                        Plot {b.plotNumber}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                        Booking ID: {b.bookingNumber}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {b.status === 'confirmed' ? '✓ Confirmed Booked' : '⏳ 72h Hold Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-[#050A17] p-2.5">
                      <span className="text-gray-400 block text-[10px]">Total Consideration</span>
                      <span className="font-bold text-white">₹{b.totalAmountInr.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="rounded-lg bg-[#050A17] p-2.5">
                      <span className="text-gray-400 block text-[10px]">Verified Paid</span>
                      <span className="font-bold text-emerald-400">
                        ₹{b.paidAmountInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <button
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setPaymentModalOpen(true);
                      }}
                      className="rounded-lg bg-[#C7A35A] px-3 py-1.5 text-xs font-bold text-[#0B1734] hover:brightness-110"
                    >
                      Submit Payment Proof
                    </button>

                    <Link
                      href="/master-plan"
                      className="text-xs text-[#DFC382] hover:underline"
                    >
                      View on Master Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payments Content */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Submitted Payment Proofs & Receipts</h2>
            <button
              onClick={() => {
                if (myBookings.length > 0) setSelectedBookingId(myBookings[0].id);
                setPaymentModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A] px-3.5 py-1.5 text-xs font-bold text-[#0B1734]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Submit New Payment Proof</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Transaction Ref</th>
                  <th className="px-4 py-3">Plot #</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Receipt / Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {myPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono font-bold text-white">{p.transactionRef}</td>
                    <td className="px-4 py-3 font-bold text-[#DFC382]">{p.plotNumber}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ₹{p.amountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.paymentMethod}</td>
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
                        {p.status === 'verified'
                          ? '✓ Verified'
                          : p.status === 'rejected'
                          ? 'Rejected'
                          : 'Under Review'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-sky-400">
                      {p.receiptNumber || 'Pending verification'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Site Visits */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Your Scheduled Site Visits</h2>
            <Link
              href="/site-visit"
              className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A] px-3.5 py-1.5 text-xs font-bold text-[#0B1734]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule New Site Visit</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {myVisits.map((v) => (
              <div key={v.id} className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{v.locationName}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    {v.status}
                  </span>
                </div>
                <div className="text-xs text-gray-300 space-y-1.5">
                  <div>Date: <strong className="text-white">{v.preferredDate}</strong></div>
                  <div>Time Slot: <strong className="text-white">{v.preferredTimeSlot}</strong></div>
                  <div>
                    Assigned Coordinator:{' '}
                    <strong className="text-[#DFC382]">
                      {v.assignedStaffName
                        ? `${v.assignedStaffName} (${v.assignedStaffMemberId || 'Field Staff'})`
                        : 'Dispatched on arrival at township'}
                    </strong>
                  </div>
                  {v.pickupRequired && (
                    <div className="text-[11px] text-sky-400 font-semibold">
                      ✓ Cantt / Airport Station Pickup Arranged
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Support Tickets */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-white">Support Tickets & Grievances</h2>
            <Link
              href="/grievance"
              className="flex items-center gap-1.5 rounded-xl bg-[#C7A35A] px-3.5 py-1.5 text-xs font-bold text-[#0B1734]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Lodge New Support Ticket</span>
            </Link>
          </div>

          <div className="space-y-3">
            {myTickets.map((tkt) => (
              <div key={tkt.id} className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sky-400 font-bold text-[11px] block">{tkt.ticketNumber}</span>
                    <strong className="text-white text-sm">{tkt.subject}</strong>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    {tkt.status}
                  </span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  {tkt.messages
                    .filter((m) => !m.isInternalNote)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-xl p-3 ${
                          msg.isStaff ? 'bg-[#050A17] border border-[#C7A35A]/30 text-[#DFC382]' : 'bg-white/5 text-gray-200'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{msg.senderName} {msg.isStaff ? '(Staff)' : ''}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Proof Submission Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#C7A35A] bg-[#0B1734] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Submit Plot Payment Proof
                </h3>
                <p className="text-xs text-gray-400">
                  Manual supervisory verification against bank account statements
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Official Bank Account / QR Instructions */}
            <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-3 text-xs space-y-2">
              <span className="font-semibold text-[#DFC382] block">
                Company Approved Banking Details:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                <div>Account Name: <strong className="text-white block">AKGV Infra City Pvt Ltd</strong></div>
                <div>Bank: <strong className="text-white block">HDFC Bank, Varanasi</strong></div>
                <div>Account No: <strong className="text-white block font-mono">50200088912345</strong></div>
                <div>IFSC Code: <strong className="text-white block font-mono">HDFC0001234</strong></div>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold border-t border-white/10 pt-1.5 flex items-center gap-1">
                <QrCode className="h-3.5 w-3.5" />
                <span>UPI ID: akgvinfacity@hdfcbank</span>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs text-emerald-400 space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto" />
                <p className="font-bold">{paymentSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Select Booking</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    {myBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        Plot {b.plotNumber} ({b.bookingNumber} - Total ₹{b.totalAmountInr.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'UPI_QR' | 'NEFT_RTGS' | 'CASH_OFFLINE' | 'CHEQUE')}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                    >
                      <option value="UPI_QR">UPI QR Transfer</option>
                      <option value="NEFT_RTGS">NEFT / RTGS</option>
                      <option value="CHEQUE">Cheque / Demand Draft</option>
                      <option value="CASH_OFFLINE">Cash at Branch Counter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Amount Paid (₹)</label>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:border-[#C7A35A] focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Bank Transaction ID / UTR / Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPI-REF-9928192847 or UTR12345678"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">
                    Payment Receipt / Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingProof(true);
                        const res = await uploadToR2(file, { folder: 'payment-proofs' });
                        if (res.url) setProofUrl(res.url);
                        setIsUploadingProof(false);
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2 text-gray-300 text-xs focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#C7A35A] file:text-[#0B1734] file:font-bold file:text-xs hover:file:brightness-110"
                  />
                  {isUploadingProof && (
                    <span className="text-[10px] text-amber-300 animate-pulse mt-1 block">
                      Uploading receipt to Cloudflare R2...
                    </span>
                  )}
                  {proofUrl && (
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      ✓ Receipt attached and stored securely
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="rounded-lg px-3 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2 font-bold text-[#0B1734] shadow hover:brightness-110"
                  >
                    Submit for Staff Verification
                  </button>
                </div>
              </form>
            )}
          </div>
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
