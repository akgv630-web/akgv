'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
  XCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FieldGpsEvidence } from '@/types';

export function AdminFieldGpsTab() {
  const {
    gpsEvidences,
    approveFieldGpsEvidence,
    rejectFieldGpsEvidence,
    addPlot,
    plots
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending_review' | 'approved' | 'rejected' | 'recapture_requested'>('ALL');

  // Modals
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [rejectingEvidence, setRejectingEvidence] = useState<FieldGpsEvidence | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const counts = {
    all: gpsEvidences.length,
    pending: gpsEvidences.filter((e) => e.status === 'pending_review').length,
    approved: gpsEvidences.filter((e) => e.status === 'approved').length,
    rejected: gpsEvidences.filter((e) => e.status === 'rejected').length,
  };

  const filteredEvidences = gpsEvidences.filter((e) => {
    const matchesSearch =
      e.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.capturedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.locationId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (evidence: FieldGpsEvidence) => {
    setIsSubmitting(true);
    try {
      await approveFieldGpsEvidence(evidence.id, 'Approved via Admin Inspection Desk');
      showNotification(`Plot ${evidence.plotNumber} GPS evidence verified and approved`);
    } catch {
      showNotification('Failed to approve evidence', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReject = (evidence: FieldGpsEvidence) => {
    setRejectingEvidence(evidence);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvidence) return;
    if (!rejectionReason.trim()) {
      showNotification('Rejection reason is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectFieldGpsEvidence(rejectingEvidence.id, rejectionReason.trim());
      showNotification(`Plot ${rejectingEvidence.plotNumber} evidence rejected`);
      setRejectingEvidence(null);
    } catch {
      showNotification('Failed to reject evidence', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInventory = (evidence: FieldGpsEvidence) => {
    // Check if plot already exists
    const exists = plots.some((p) => p.plotNumber.toUpperCase() === evidence.plotNumber.toUpperCase());
    if (exists) {
      showNotification(`Plot ${evidence.plotNumber} already exists in inventory`, 'error');
      return;
    }

    try {
      const match = evidence.plotNumber.match(/[A-Ca-c]/);
      const rawBlock = match ? match[0].toUpperCase() : 'A';
      const blockChar: 'A' | 'B' | 'C' = rawBlock === 'B' || rawBlock === 'C' ? rawBlock : 'A';
      const area = evidence.measuredAreaSqft || 1200;
      const rate = evidence.proposedRatePerSqft || 1600;
      const totalPrice = evidence.expectedPriceInr || area * rate;

      addPlot({
        plotNumber: evidence.plotNumber,
        block: blockChar,
        locationId: evidence.locationId || 'rampur',
        areaSqft: area,
        dimensions: evidence.measuredDimensions || "30' x 40'",
        roadWidth: evidence.roadAccessWidth ? `${evidence.roadAccessWidth} WIDE` : "30'-0\" WIDE",
        roadFacing: 'North-East',
        status: 'available_green',
        basePriceInr: totalPrice,
        suitableHouseModelIds: ['villa-luxury-01'],
        notes: `Verified through field GPS inspection by ${evidence.capturedByName}. Features ${evidence.roadAccessWidth || '30 ft'} road access.`,
        x: 100,
        y: 100,
        width: 80,
        height: 50,
      });

      showNotification(`Plot ${evidence.plotNumber} converted and added to live Plot Inventory!`);
    } catch {
      showNotification('Error converting evidence to plot inventory', 'error');
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
          <span className="text-xs text-gray-400 block">Total GPS Uploads</span>
          <span className="font-serif text-2xl font-bold text-white">{counts.all}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Field-captured boundary evidence</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block">Pending Inspection</span>
          <span className="font-serif text-2xl font-bold text-amber-400">{counts.pending}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Awaiting Super Admin review</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Approved Boundaries</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{counts.approved}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Verified on ground</span>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-red-300 block">Rejected / Inaccurate</span>
          <span className="font-serif text-2xl font-bold text-red-400">{counts.rejected}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Sent back for recapture</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plot number, associate..."
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
            <option value="ALL">All Statuses ({counts.all})</option>
            <option value="pending_review">Pending Review ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <strong className="text-white">{filteredEvidences.length}</strong> field submissions
        </div>
      </div>

      {/* Evidences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidences.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <Camera className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No field GPS evidence found</p>
            <p className="text-xs mt-1">Field associates can capture live GPS plot photos using the mobile camera desk.</p>
          </div>
        ) : (
          filteredEvidences.map((evidence) => {
            const mapsUrl = `https://www.google.com/maps?q=${evidence.latitude},${evidence.longitude}`;
            const existsInPlots = plots.some((p) => p.plotNumber.toUpperCase() === evidence.plotNumber.toUpperCase());

            return (
              <div
                key={evidence.id}
                className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-4 transition hover:border-[#C7A35A]/40"
              >
                {/* Photo & Plot Details Header */}
                <div className="flex gap-4">
                  {/* Photo Thumbnail */}
                  <div className="relative shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-[#050A17] border border-white/10 group cursor-pointer"
                    onClick={() => setSelectedPhotoModal(evidence.photoUrl)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evidence.photoUrl}
                      alt={`Plot ${evidence.plotNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-white">
                        Plot {evidence.plotNumber}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          evidence.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : evidence.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {evidence.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-gray-300">
                      Corridor: <strong className="text-white capitalize">{evidence.locationId}</strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                      <span className="font-mono text-[11px]">
                        {evidence.latitude.toFixed(5)}, {evidence.longitude.toFixed(5)} (±{evidence.accuracyMeters.toFixed(1)}m)
                      </span>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#DFC382] hover:underline inline-flex items-center ml-1"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="text-gray-400">
                      Captured by: <strong className="text-white">{evidence.capturedByName}</strong>{' '}
                      <span className="font-mono text-[11px] text-[#DFC382]">({evidence.capturedByMemberId})</span>
                    </div>

                    <div className="text-[11px] text-gray-400">
                      Date: {new Date(evidence.captureTimestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Dimensions & Proposed Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-[#050A17] p-3 text-xs border border-white/5">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Dimensions:</span>
                    <span className="font-semibold text-white">{evidence.measuredDimensions || '30 x 40 ft'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Area:</span>
                    <span className="font-semibold text-white">{evidence.measuredAreaSqft || 1200} sqft</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Road Width:</span>
                    <span className="font-semibold text-white">{evidence.roadAccessWidth || '30 ft'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Proposed Rate:</span>
                    <span className="font-semibold text-emerald-400">₹{evidence.proposedRatePerSqft || 1600}/sqft</span>
                  </div>
                </div>

                {/* Admin notes or Rejection Reason if any */}
                {evidence.rejectionReason && (
                  <div className="rounded-xl bg-red-950/40 border border-red-500/20 p-2.5 text-xs text-red-200">
                    <strong>Rejection Reason:</strong> {evidence.rejectionReason}
                  </div>
                )}
                {evidence.adminNotes && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-gray-300">
                    <strong>Admin Note:</strong> {evidence.adminNotes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2">
                    {evidence.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(evidence)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(evidence)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 px-3 py-1.5 text-xs font-bold transition"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>

                  {evidence.status === 'approved' && !existsInPlots && (
                    <button
                      onClick={() => handleConvertToInventory(evidence)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-3.5 py-1.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Convert to Plot Inventory</span>
                    </button>
                  )}

                  {existsInPlots && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      In Live Inventory
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Photo Preview Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden border border-[#C7A35A]/50 bg-[#0B1734]">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotoModal}
                alt="Enlarged Plot Photo"
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <h3 className="font-serif text-lg font-bold text-white">Reject GPS Evidence</h3>
              </div>
              <button
                onClick={() => setRejectingEvidence(null)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Provide specific instructions for Plot <strong>{rejectingEvidence.plotNumber}</strong> so the field associate can recapture boundary coordinates or clearer photos.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. GPS accuracy too low (±25m); boundary pillar not visible in photo..."
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-red-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEvidence(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-bold text-white shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
