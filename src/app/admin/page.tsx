'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  Eye,
  FileCheck,
  Filter,
  HelpCircle,
  Layers,
  MapPin,
  Package,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Plot, PlotStatus } from '@/types';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';

export default function SuperAdminPage() {
  const {
    plots,
    updatePlotStatus,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'plots' | 'payments' | 'bookings' | 'kits' | 'support'>('overview');
  const [plotFilterBlock, setPlotFilterBlock] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [plotFilterStatus, setPlotFilterStatus] = useState<'ALL' | PlotStatus>('ALL');
  const [paymentActionNotice, setPaymentActionNotice] = useState<string | null>(null);

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
    if (plotFilterBlock !== 'ALL' && p.block !== plotFilterBlock) return false;
    if (plotFilterStatus !== 'ALL' && p.status !== plotFilterStatus) return false;
    return true;
  });

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
      <div className="flex flex-wrap border-b border-white/10 text-xs sm:text-sm font-semibold gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            activeTab === 'overview'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Metrics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('plots')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
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
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
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
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
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
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            activeTab === 'kits'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>₹999 Cash Kit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            activeTab === 'support'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support CRM ({openTickets.length})</span>
        </button>
      </div>

      {/* Tab 1: Database-Derived Metrics Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-1">
              <span className="text-xs text-gray-400">Total Transcribed Plots</span>
              <span className="font-serif text-3xl font-bold text-white block">{totalPlots}</span>
              <span className="text-[11px] text-gray-400">Rampur Blueprint Model</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-[#0B1734] p-5 space-y-1">
              <span className="text-xs text-emerald-300">Available Green Plots</span>
              <span className="font-serif text-3xl font-bold text-emerald-400 block">{availablePlots}</span>
              <span className="text-[11px] text-gray-400">Bookable by Buyers</span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#0B1734] p-5 space-y-1">
              <span className="text-xs text-amber-300">Confirmed Booked (Yellow)</span>
              <span className="font-serif text-3xl font-bold text-amber-400 block">{bookedPlots}</span>
              <span className="text-[11px] text-gray-400">Locked Inventory</span>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-[#0B1734] p-5 space-y-1">
              <span className="text-xs text-red-300">Vacant / Reserved (Red)</span>
              <span className="font-serif text-3xl font-bold text-red-400 block">{vacantPlots}</span>
              <span className="text-[11px] text-gray-400">Admin-Managed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment Verification Queue</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {pendingPayments.length} Pending
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-white block">
                {pendingPayments.length} Proofs to Review
              </span>
              <p className="text-[11px] text-gray-400">
                Staff must verify transaction references against bank statement before issuing receipt.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Offline Cash Kit Treasury</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {kitIssues.length} Kits
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-emerald-400 block">
                ₹{totalOfflineCash.toLocaleString('en-IN')} Cash
              </span>
              <p className="text-[11px] text-gray-400">
                Collected strictly in cash offline for Bags, Pens, Diaries, and Files.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#050A17] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Open Customer Support</span>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  {openTickets.length} Open
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-white block">
                {openTickets.length} Active Tickets
              </span>
              <p className="text-[11px] text-gray-400">
                Customer inquiries regarding registry documentation, site appointments, and plots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Plot Inventory Manager */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1734] p-4 rounded-2xl border border-white/10">
            <div>
              <h2 className="font-serif text-base font-bold text-white">Plot Status & Inventory Governance</h2>
              <p className="text-xs text-gray-400">
                Toggle plot availability between Green (Bookable), Yellow (Confirmed Booked), and Red (Vacant/Reserved).
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex rounded-lg border border-white/10 bg-[#050A17] p-0.5">
                {(['ALL', 'A', 'B', 'C'] as const).map((blk) => (
                  <button
                    key={blk}
                    onClick={() => setPlotFilterBlock(blk)}
                    className={`rounded px-2.5 py-1 ${plotFilterBlock === blk ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'text-gray-300'}`}
                  >
                    {blk === 'ALL' ? 'All Blocks' : `Block ${blk}`}
                  </button>
                ))}
              </div>

              <div className="flex rounded-lg border border-white/10 bg-[#050A17] p-0.5">
                {(['ALL', 'available_green', 'booked_yellow', 'vacant_red'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPlotFilterStatus(st)}
                    className={`rounded px-2.5 py-1 ${plotFilterStatus === st ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'text-gray-300'}`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#050A17] text-[#DFC382] uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Plot #</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Area & Dimensions</th>
                  <th className="px-4 py-3">Road Corridor</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredPlots.map((plot) => (
                  <tr key={plot.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-serif font-bold text-white text-sm">{plot.plotNumber}</td>
                    <td className="px-4 py-3 font-semibold text-[#DFC382]">{plot.block}</td>
                    <td className="px-4 py-3">
                      <div>{plot.areaSqft} sqft</div>
                      <span className="text-[10px] text-gray-400 font-mono">{plot.dimensions}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{plot.roadWidth}</td>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {plot.status !== 'available_green' && (
                          <button
                            onClick={() => updatePlotStatus(plot.id, 'available_green', 'Admin marked available')}
                            className="rounded px-2 py-1 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white"
                            title="Make Available for Booking"
                          >
                            Set Green
                          </button>
                        )}
                        {plot.status !== 'booked_yellow' && (
                          <button
                            onClick={() => updatePlotStatus(plot.id, 'booked_yellow', 'Admin marked booked')}
                            className="rounded px-2 py-1 bg-amber-600/30 text-amber-400 border border-amber-500/40 hover:bg-amber-600 hover:text-white"
                            title="Mark as Confirmed Booked"
                          >
                            Set Yellow
                          </button>
                        )}
                        {plot.status !== 'vacant_red' && (
                          <button
                            onClick={() => updatePlotStatus(plot.id, 'vacant_red', 'Admin marked vacant')}
                            className="rounded px-2 py-1 bg-red-600/30 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white"
                            title="Set to Vacant/Reserved"
                          >
                            Set Red
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full text-left text-xs">
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
                            onClick={() => {
                              verifyPayment(p.id, true);
                              setPaymentActionNotice(`Payment ${p.transactionRef} verified and official receipt issued!`);
                              setTimeout(() => setPaymentActionNotice(null), 3000);
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-500 text-xs"
                          >
                            Approve & Issue Receipt
                          </button>
                          <button
                            onClick={() => {
                              verifyPayment(p.id, false, 'Invalid reference code or deposit not found');
                              setPaymentActionNotice(`Payment ${p.transactionRef} rejected.`);
                              setTimeout(() => setPaymentActionNotice(null), 3000);
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

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1734]">
            <table className="w-full text-left text-xs">
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
    </div>
  );
}
