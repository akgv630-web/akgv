'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Phone,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AREA_SCHEDULE, HOUSE_MODELS } from '@/data/groundTruth';
import { Plot, PlotStatus } from '@/types';
import Link from 'next/link';

export function MasterPlanViewer({ onSelectPlotFor3D }: { onSelectPlotFor3D?: (plot: Plot) => void }) {
  const { plots, createBookingRequest, setSelectedPlotForViewer } = useApp();
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(plots[3]); // default A-04
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [filterBlock, setFilterBlock] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | PlotStatus>('ALL');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedHouseModelId, setSelectedHouseModelId] = useState<string>('model-royal-villa');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const filteredPlots = plots.filter((plot) => {
    if (filterBlock !== 'ALL' && plot.block !== filterBlock) return false;
    if (filterStatus !== 'ALL' && plot.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'available_green':
        return {
          fill: '#16A34A',
          stroke: '#22C55E',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          label: 'Available for Booking',
        };
      case 'booked_yellow':
        return {
          fill: '#CA8A04',
          stroke: '#EAB308',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          label: 'Confirmed Booked',
        };
      case 'vacant_red':
      default:
        return {
          fill: '#DC2626',
          stroke: '#EF4444',
          text: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/30',
          label: 'Vacant / Reserved',
        };
    }
  };

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
    setSelectedPlotForViewer(plot);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlot) return;
    if (!buyerName || !buyerPhone) {
      alert('Please provide your name and phone number');
      return;
    }

    try {
      const booking = createBookingRequest(
        selectedPlot.id,
        buyerName,
        buyerPhone,
        selectedHouseModelId
      );
      setBookingSuccessMsg(
        `Booking request #${booking.bookingNumber} generated successfully! A hold has been placed. Complete your payment verification in the Buyer Portal.`
      );
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccessMsg(null);
      }, 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      alert(message);
    }
  };

  const currentStatusMeta = selectedPlot ? getStatusColor(selectedPlot.status) : null;
  const suitableHouses = selectedPlot
    ? HOUSE_MODELS.filter((hm) => selectedPlot.suitableHouseModelIds.includes(hm.id))
    : [];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/80 p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1EA275] animate-ping" />
            <h2 className="font-serif text-lg font-bold text-white tracking-wide">
              A.K.G.V. Infraa City — Varanasi Layout Plan
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Scale: {AREA_SCHEDULE.scale} | Er. Rajesh Kumar Patel (R.P. Home Design)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Blueprint Photo CTA */}
          <button
            onClick={() => setShowBrochureModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#C7A35A] bg-[#0B1734] px-3 py-1.5 text-xs font-semibold text-[#DFC382] transition hover:bg-[#C7A35A] hover:text-[#0B1734]"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Original Blueprint Photo</span>
          </button>

          {/* Block Filters */}
          <div className="flex rounded-lg border border-white/10 bg-[#0B1734] p-0.5 text-xs">
            {(['ALL', 'A', 'B', 'C'] as const).map((block) => (
              <button
                key={block}
                onClick={() => setFilterBlock(block)}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  filterBlock === block
                    ? 'bg-[#C7A35A] text-[#0B1734] font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {block === 'ALL' ? 'All Blocks' : `Block ${block}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Map Layout Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Vector Canvas Master Plan (8 Cols) */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#070D1E] p-4 lg:col-span-8 shadow-2xl">
          {/* Compass & North Indicator */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-center rounded-xl border border-white/10 bg-[#0B1734]/90 p-2 shadow-lg backdrop-blur">
            <Compass className="h-6 w-6 text-[#C7A35A] animate-spin-slow" />
            <span className="text-[10px] font-bold text-white mt-1">N</span>
            <span className="text-[8px] text-gray-400">Orientation</span>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0B1734]/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#16A34A]" />
              <span className="text-gray-300 text-[11px]">Green: Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#CA8A04]" />
              <span className="text-gray-300 text-[11px]">Yellow: Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#DC2626]" />
              <span className="text-gray-300 text-[11px]">Red: Vacant/Reserved</span>
            </div>
          </div>

          {/* SVG Vector Map Container */}
          <div className="w-full overflow-x-auto pb-4">
            <svg
              viewBox="0 0 960 620"
              className="min-w-[760px] w-full select-none"
              style={{ filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Road Hatch Pattern */}
                <pattern id="roadStripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="20" stroke="#1E293B" strokeWidth="6" />
                </pattern>
                {/* Boundary Glow */}
                <filter id="plotGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#C7A35A" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Master Site Boundary */}
              <rect
                x="20"
                y="20"
                width="920"
                height="580"
                rx="8"
                fill="#0B132B"
                stroke="#C7A35A"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Outer Boundary Dimensions */}
              <text x="480" y="38" fill="#DFC382" fontSize="11" textAnchor="middle" fontWeight="bold">
                BOUNDARY: 282&apos;-0&quot;
              </text>
              <text x="930" y="310" fill="#DFC382" fontSize="11" textAnchor="middle" transform="rotate(90, 930, 310)" fontWeight="bold">
                275&apos;-0&quot; / 260&apos;-0&quot;
              </text>

              {/* Main Entry Road Corridor: 30&apos;-0&quot; Wide */}
              <g id="main-road-30ft">
                <rect x="20" y="380" width="920" height="35" fill="#1A243D" />
                <line x1="20" y1="397" x2="940" y2="397" stroke="#DFC382" strokeWidth="2" strokeDasharray="10 10" />
                <rect x="60" y="385" width="280" height="25" rx="4" fill="#0B1734" opacity="0.9" />
                <text x="200" y="402" fill="#DFC382" fontSize="11" textAnchor="middle" fontWeight="bold">
                  PROPOSED ROAD - 30&apos;-0&quot; WIDE (MAIN BOULEVARD)
                </text>
              </g>

              {/* Internal Access Roads: 25&apos;-0&quot; Wide Corridors */}
              <g id="internal-roads-25ft">
                {/* Horizontal Internal Road 1 */}
                <rect x="20" y="240" width="920" height="32" fill="#162035" />
                <line x1="20" y1="256" x2="940" y2="256" stroke="#94A3B8" strokeWidth="1" strokeDasharray="6 6" />
                <text x="500" y="260" fill="#94A3B8" fontSize="10" textAnchor="middle">
                  PROPOSED ROAD - 25&apos;-0&quot; WIDE
                </text>

                {/* Vertical Road separating Block A and Block B */}
                <rect x="315" y="40" width="30" height="540" fill="#162035" />
                <line x1="330" y1="40" x2="330" y2="580" stroke="#94A3B8" strokeWidth="1" strokeDasharray="6 6" />
                <text x="330" y="160" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(-90, 330, 160)">
                  PROPOSED ROAD - 25&apos;-0&quot; WIDE
                </text>

                {/* Vertical Road separating Block B and Block C */}
                <rect x="575" y="40" width="22" height="540" fill="#162035" />
                <line x1="586" y1="40" x2="586" y2="580" stroke="#94A3B8" strokeWidth="1" strokeDasharray="6 6" />
                <text x="586" y="160" fill="#94A3B8" fontSize="8" textAnchor="middle" transform="rotate(-90, 586, 160)">
                  ROAD 25&apos;-0&quot;
                </text>

                {/* Vertical Road inside Block C */}
                <rect x="722" y="40" width="16" height="540" fill="#162035" />
              </g>

              {/* Block Labels */}
              <text x="170" y="70" fill="#C7A35A" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing="2">
                BLOCK &apos;A&apos;
              </text>
              <text x="440" y="70" fill="#C7A35A" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing="2">
                BLOCK &apos;B&apos;
              </text>
              <text x="750" y="70" fill="#C7A35A" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing="2">
                BLOCK &apos;C&apos;
              </text>

              {/* Render Plots */}
              {plots.map((plot) => {
                const isSelected = selectedPlot?.id === plot.id;
                const statusMeta = getStatusColor(plot.status);

                return (
                  <g
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className="cursor-pointer transition duration-150"
                  >
                    {/* Plot Rectangle */}
                    <rect
                      x={plot.x}
                      y={plot.y}
                      width={plot.width}
                      height={plot.height}
                      fill={statusMeta.fill}
                      stroke={isSelected ? '#FFFFFF' : statusMeta.stroke}
                      strokeWidth={isSelected ? 3 : 1.5}
                      rx="3"
                      className="transition-all hover:brightness-125"
                      style={isSelected ? { filter: 'url(#plotGlow)' } : undefined}
                    />

                    {/* Plot Label */}
                    <text
                      x={plot.x + plot.width / 2}
                      y={plot.y + plot.height / 2 - 8}
                      fill="#FFFFFF"
                      fontSize={plot.width < 50 ? '9' : '11'}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {plot.plotNumber}
                    </text>

                    {/* Plot Sqft */}
                    <text
                      x={plot.x + plot.width / 2}
                      y={plot.y + plot.height / 2 + 6}
                      fill="#FFFFFF"
                      fontSize={plot.width < 50 ? '7' : '9'}
                      opacity="0.95"
                      textAnchor="middle"
                    >
                      {plot.areaSqft} sqft
                    </text>

                    {/* Plot Dimensions */}
                    <text
                      x={plot.x + plot.width / 2}
                      y={plot.y + plot.height / 2 + 18}
                      fill="#FFFFFF"
                      fontSize="7"
                      opacity="0.8"
                      textAnchor="middle"
                    >
                      {plot.dimensions}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Interactive Plot Details & Actions (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPlot && currentStatusMeta ? (
            <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-5 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold text-white">
                      Plot {selectedPlot.plotNumber}
                    </span>
                    <span className="rounded bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382]">
                      Block {selectedPlot.block}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Rampur Township, Varanasi
                  </p>
                </div>

                {/* Status Badge */}
                <div className={`rounded-full px-3 py-1 text-xs font-bold border ${currentStatusMeta.bg} ${currentStatusMeta.text}`}>
                  {currentStatusMeta.label}
                </div>
              </div>

              {/* Dimensions & Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#050A17] p-3 border border-white/5">
                  <span className="text-gray-400 block text-[11px]">Area</span>
                  <span className="font-bold text-base text-white">{selectedPlot.areaSqft} sqft</span>
                  <span className="text-[10px] text-gray-400 block">Verified schedule</span>
                </div>
                <div className="rounded-xl bg-[#050A17] p-3 border border-white/5">
                  <span className="text-gray-400 block text-[11px]">Dimensions</span>
                  <span className="font-bold text-base text-white">{selectedPlot.dimensions}</span>
                  <span className="text-[10px] text-gray-400 block">Front x Depth</span>
                </div>
                <div className="rounded-xl bg-[#050A17] p-3 border border-white/5">
                  <span className="text-gray-400 block text-[11px]">Frontage Road</span>
                  <span className="font-bold text-sm text-[#DFC382]">{selectedPlot.roadWidth}</span>
                  <span className="text-[10px] text-gray-400 block">Facing {selectedPlot.roadFacing}</span>
                </div>
                <div className="rounded-xl bg-[#050A17] p-3 border border-white/5">
                  <span className="text-gray-400 block text-[11px]">Guide Price</span>
                  <span className="font-bold text-sm text-emerald-400">
                    {selectedPlot.basePriceInr
                      ? `₹${(selectedPlot.basePriceInr / 100000).toFixed(2)} Lakh`
                      : 'On Request'}
                  </span>
                  <span className="text-[10px] text-gray-400 block">Immediate Registry</span>
                </div>
              </div>

              {/* 3D House Model Recommendation */}
              {suitableHouses.length > 0 && (
                <div className="rounded-xl border border-[#C7A35A]/20 bg-[#050A17]/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#DFC382]">
                      <Building2 className="h-4 w-4 text-[#C7A35A]" />
                      Recommended 3D House Design
                    </span>
                    <span className="text-[10px] text-gray-400">Dimension Verified</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">{suitableHouses[0].name}</p>
                    <p className="text-[11px] text-gray-400">{suitableHouses[0].subtitle}</p>
                  </div>
                  <Link
                    href={`/house-viewer-3d?plot=${selectedPlot.plotNumber}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#C7A35A]/20 py-1.5 text-xs font-semibold text-[#DFC382] border border-[#C7A35A]/40 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Launch in 3D House Viewer</span>
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {selectedPlot.status === 'available_green' ? (
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#146B4D] to-[#1EA275] py-3 text-center text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95"
                  >
                    Request Plot Booking Now
                  </button>
                ) : (
                  <div className="rounded-xl bg-white/5 p-3 text-center text-xs text-gray-400 border border-white/10">
                    {selectedPlot.status === 'booked_yellow'
                      ? '⚠️ This plot is confirmed booked and unavailable for new booking requests.'
                      : '🔒 This plot is in vacant/reserved designation. Contact sales administration to request availability.'}
                  </div>
                )}

                <Link
                  href={`/site-visit?plot=${selectedPlot.plotNumber}&location=Rampur`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/20 bg-[#050A17] py-2.5 text-center text-xs font-semibold text-gray-200 hover:border-[#C7A35A] hover:text-white transition"
                >
                  <Calendar className="h-4 w-4 text-[#C7A35A]" />
                  <span>Schedule Site Visit</span>
                </Link>
              </div>

              {/* Call-to-action Phone */}
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400">
                <span>Immediate Booking Inquiries:</span>
                <a href="tel:6306917991" className="font-bold text-[#DFC382] hover:underline">
                  +91 6306917991
                </a>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-[#0B1734] p-6 text-center text-gray-400 text-sm">
              Click any plot on the layout map to inspect full dimensions, price, and compatible 3D house models.
            </div>
          )}

          {/* Area Schedule Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-[#050A17] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-serif font-bold text-white">Area Schedule (Approved)</span>
              <span className="text-[#C7A35A] font-semibold">{AREA_SCHEDULE.roadPercentage}% Roads</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded bg-white/5 p-2">
                <span className="text-gray-400 block">Total Area</span>
                <strong className="text-white">{AREA_SCHEDULE.totalAreaSqft}</strong>
                <span className="text-[9px] text-gray-400 block">sqft</span>
              </div>
              <div className="rounded bg-white/5 p-2">
                <span className="text-gray-400 block">Plot Area</span>
                <strong className="text-[#1EA275]">{AREA_SCHEDULE.plotAreaSqft}</strong>
                <span className="text-[9px] text-gray-400 block">sqft</span>
              </div>
              <div className="rounded bg-white/5 p-2">
                <span className="text-gray-400 block">Road Area</span>
                <strong className="text-[#DFC382]">{AREA_SCHEDULE.roadAreaSqft}</strong>
                <span className="text-[9px] text-gray-400 block">sqft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Request Modal */}
      {bookingModalOpen && selectedPlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#C7A35A] bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Booking Request — Plot {selectedPlot.plotNumber}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedPlot.areaSqft} sqft ({selectedPlot.dimensions}) | Rampur, Varanasi
                </p>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-xs text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                <p className="font-semibold text-sm">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Buyer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pradeep Verma"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Contact Phone (Mobile Number)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9812345678"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Preferred House Model</label>
                  <select
                    value={selectedHouseModelId}
                    onChange={(e) => setSelectedHouseModelId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#050A17] px-3 py-2 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    {HOUSE_MODELS.map((hm) => (
                      <option key={hm.id} value={hm.id}>
                        {hm.name} ({hm.bhk} - Est. ₹{(hm.estimatedCostInr / 100000).toFixed(1)} Lakh)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg bg-white/5 p-3 text-[11px] text-gray-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#DFC382]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>72-Hour Temporary Hold Guarantee</span>
                  </div>
                  <p>
                    Upon submitting this booking request, a 72-hour hold is registered in your name. Payment proof (UPI / Bank Transfer) can be uploaded in the Buyer Portal for administrative verification.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2 font-bold text-[#0B1734] shadow hover:brightness-110"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Blueprint Original Photograph Lightbox Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-h-[95vh] max-w-4xl w-full overflow-hidden rounded-2xl border border-[#C7A35A] bg-[#050A17] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0B1734]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#C7A35A]" />
                <span className="font-serif text-sm font-bold text-white">
                  Original Blueprint Photograph — A.K.G.V. Infraa City Varanasi
                </span>
              </div>
              <button
                onClick={() => setShowBrochureModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center">
              <Image
                src="/assets/layout_plan_brochure.png"
                alt="Original Layout Plan Brochure of AKGV Infra City"
                width={800}
                height={1200}
                className="rounded-lg object-contain max-h-[80vh] w-auto border border-white/10"
              />
            </div>
            <div className="border-t border-white/10 bg-[#0B1734] px-4 py-2 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Authentic blueprint photograph supplied by AKGV Infra City Private Limited.</span>
              <span className="text-[#DFC382]">Scale 1:500 | Area: 77550 sqft</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
