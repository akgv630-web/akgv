'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Filter,
  Flame,
  Home,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TreePine,
  X,
  ZoomIn,
  ZoomOut,
  Car
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AREA_SCHEDULE, HOUSE_MODELS } from '@/data/groundTruth';
import { Plot, PlotStatus } from '@/types';
import { MiniVillaSvg } from './MiniVillaSvg';
import { PlotHoldCertificateModal } from '@/components/common/PlotHoldCertificateModal';

export function MasterPlanViewer({ onSelectPlotFor3D }: { onSelectPlotFor3D?: (plot: Plot) => void }) {
  const { plots, createBookingRequest, setSelectedPlotForViewer, t, language } = useApp();
  const c = t.masterPlan;

  // Selected plot state (default A-04)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(plots.find(p => p.plotNumber === 'A-04') || plots[0]);
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);

  // View modes: 'villas' (mini houses), 'cad' (technical engineering), 'landscape' (green satellite)
  const [viewMode, setViewMode] = useState<'villas' | 'cad' | 'landscape'>('villas');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showLandscaping, setShowLandscaping] = useState(true);

  // Zoom & Pan Engine
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filters
  const [filterBlock, setFilterBlock] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | PlotStatus>('ALL');
  const [filterSize, setFilterSize] = useState<'ALL' | 'compact' | 'mid' | 'luxury'>('ALL');

  // Modals
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [activeBrochureTab, setActiveBrochureTab] = useState<'layout' | 'photo' | 'rewards'>('layout');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedHouseModelId, setSelectedHouseModelId] = useState<string>('model-royal-villa');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Filtered plots computation
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      if (filterBlock !== 'ALL' && plot.block !== filterBlock) return false;
      if (filterStatus !== 'ALL' && plot.status !== filterStatus) return false;
      if (filterSize !== 'ALL') {
        if (filterSize === 'compact' && plot.areaSqft >= 1000) return false;
        if (filterSize === 'mid' && (plot.areaSqft < 1000 || plot.areaSqft >= 1500)) return false;
        if (filterSize === 'luxury' && plot.areaSqft < 1500) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!plot.plotNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [plots, filterBlock, filterStatus, filterSize, searchQuery]);

  // Status Meta
  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'available_green':
        return {
          fill: '#16A34A',
          stroke: '#22C55E',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          label: language === 'hi' ? 'बुकिंग हेतु उपलब्ध' : language === 'hinglish' ? 'Booking Ke Liye Available' : 'Available for Booking',
        };
      case 'booked_yellow':
        return {
          fill: '#CA8A04',
          stroke: '#EAB308',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          label: language === 'hi' ? 'बुक किया जा चुका है' : language === 'hinglish' ? 'Book Ho Chuka Hai' : 'Confirmed Booked',
        };
      case 'vacant_red':
      default:
        return {
          fill: '#DC2626',
          stroke: '#EF4444',
          text: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/30',
          label: language === 'hi' ? 'आरक्षित / रिक्त' : language === 'hinglish' ? 'Reserved / Vacant' : 'Vacant / Reserved',
        };
    }
  };

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
    setSelectedPlotForViewer(plot);
    if (onSelectPlotFor3D) onSelectPlotFor3D(plot);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.75, Number((prev + delta).toFixed(2))), 2.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setSearchQuery('');
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
        `Booking request #${booking.bookingNumber} generated successfully! A hold has been placed for Plot ${selectedPlot.plotNumber}. Complete payment in the Buyer Portal.`
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

  // Vastu compliance logic
  const getVastuInfo = (facing: string) => {
    switch (facing) {
      case 'East':
        return { score: '100% Vastu Approved', note: 'East facing: Promotes health, solar warmth, and financial prosperity.' };
      case 'North':
        return { score: '100% Vastu Approved', note: 'North facing: Governed by Kuber; ideal for abundance and career growth.' };
      case 'South':
        return { score: 'Vastu Compliant with Portico', note: 'South facing: Elevated entry design recommended; high energy and vitality.' };
      default:
        return { score: 'Vastu Approved', note: 'Balanced energy alignment with wide frontage.' };
    }
  };

  const vastuData = selectedPlot ? getVastuInfo(selectedPlot.roadFacing) : null;

  return (
    <div className={`w-full space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-[#040814] p-6' : ''}`}>
      {/* 1. Header Toolbar with Authentic Branding, View Modes & Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/90 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1EA275] animate-ping" />
              <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                A.K.G.V. INFRAA CITY VARANASI — COMPLETE MASTER LAYOUT PLAN
              </h2>
              <span className="rounded bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382] uppercase tracking-wider">
                55 Approved Plots
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Approved Blueprint Scale: {AREA_SCHEDULE.scale} | Area: {AREA_SCHEDULE.totalAreaSqft.toLocaleString()} sqft | Er. Rajesh Kumar Patel (R.P. Home Design)
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Original Brochure Photo Modal */}
            <button
              onClick={() => setShowBrochureModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#C7A35A] bg-[#0B1734] px-3 py-1.5 text-xs font-semibold text-[#DFC382] shadow-sm transition hover:bg-[#C7A35A] hover:text-[#0B1734]"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Original Brochure Photo</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0B1734] px-3 py-1.5 text-xs text-gray-300 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Control Bar: View Modes, Layers & Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0B1734] p-1 text-xs">
            <button
              onClick={() => setViewMode('villas')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                viewMode === 'villas'
                  ? 'bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] text-[#0B1734] shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>{c.viewModes.villas}</span>
            </button>
            <button
              onClick={() => setViewMode('cad')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                viewMode === 'cad'
                  ? 'bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] text-[#0B1734] shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{c.viewModes.cad}</span>
            </button>
            <button
              onClick={() => setViewMode('landscape')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                viewMode === 'landscape'
                  ? 'bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] text-[#0B1734] shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TreePine className="h-3.5 w-3.5" />
              <span>{c.viewModes.landscape}</span>
            </button>
          </div>

          {/* Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                showDimensions
                  ? 'border-[#C7A35A]/50 bg-[#C7A35A]/10 text-[#DFC382]'
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              📏 {c.showDimensions}
            </button>
            <button
              onClick={() => setShowVehicles(!showVehicles)}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                showVehicles
                  ? 'border-[#C7A35A]/50 bg-[#C7A35A]/10 text-[#DFC382]'
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              🚗 {c.showVehicles}
            </button>
            <button
              onClick={() => setShowLandscaping(!showLandscaping)}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                showLandscaping
                  ? 'border-[#C7A35A]/50 bg-[#C7A35A]/10 text-[#DFC382]'
                  : 'border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              🌿 {c.showLandscaping}
            </button>
          </div>

          {/* Quick Search & Zoom Controls */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={c.filters.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-lg border border-white/10 bg-[#0B1734] py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg border border-white/10 bg-[#0B1734] p-0.5 text-xs">
              <button
                onClick={() => handleZoom(-0.15)}
                className="rounded p-1 text-gray-300 hover:bg-white/10 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 font-mono font-bold text-gray-300 text-[11px]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.15)}
                className="rounded p-1 text-gray-300 hover:bg-white/10 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                title={c.filters.reset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Block & Status Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-2 text-xs">
          {/* Block Selection Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Blocks:</span>
            {(['ALL', 'A', 'B', 'C'] as const).map((block) => (
              <button
                key={block}
                onClick={() => setFilterBlock(block)}
                className={`rounded-md px-2.5 py-0.5 font-bold transition ${
                  filterBlock === block
                    ? 'bg-[#C7A35A] text-[#0B1734]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {block === 'ALL' ? `${c.filters.allBlocks} (55)` : `Block ${block} (${plots.filter(p => p.block === block).length})`}
              </button>
            ))}
          </div>

          {/* Status Selection Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Status:</span>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`rounded-md px-2.5 py-0.5 font-medium transition ${
                filterStatus === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {c.filters.allStatus}
            </button>
            <button
              onClick={() => setFilterStatus('available_green')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                filterStatus === 'available_green' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-emerald-400/70 hover:text-emerald-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{language === 'hi' ? 'उपलब्ध' : language === 'hinglish' ? 'Available' : 'Available'} ({plots.filter(p => p.status === 'available_green').length})</span>
            </button>
            <button
              onClick={() => setFilterStatus('booked_yellow')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                filterStatus === 'booked_yellow' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-amber-400/70 hover:text-amber-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>{language === 'hi' ? 'बुक' : language === 'hinglish' ? 'Booked' : 'Booked'} ({plots.filter(p => p.status === 'booked_yellow').length})</span>
            </button>
            <button
              onClick={() => setFilterStatus('vacant_red')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                filterStatus === 'vacant_red' ? 'bg-red-500/30 text-red-300 font-bold' : 'text-red-400/70 hover:text-red-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>{language === 'hi' ? 'आरक्षित' : language === 'hinglish' ? 'Reserved' : 'Reserved'} ({plots.filter(p => p.status === 'vacant_red').length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Vector Canvas Master Plan (8 Cols) */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#070D1E] p-3 lg:col-span-8 shadow-2xl">
          {/* Compass & North Vastu Rose */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-center rounded-xl border border-white/10 bg-[#0B1734]/95 p-2 shadow-xl backdrop-blur">
            <Compass className="h-7 w-7 text-[#C7A35A]" />
            <span className="text-[10px] font-bold text-white mt-1">N (North)</span>
            <span className="text-[8px] text-[#DFC382]">Vastu Aligned</span>
          </div>

          {/* Floating Plot Direct Booking Quick-Bar */}
          {selectedPlot && (
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-[#C7A35A] bg-[#0B1734]/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
              <div className="flex items-center gap-2 px-1">
                <span className="font-serif text-sm font-bold text-white">Plot {selectedPlot.plotNumber}</span>
                <span className="text-[11px] text-[#DFC382] font-semibold">{selectedPlot.areaSqft} sqft</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedPlot.status === 'available_green' ? 'bg-emerald-500/20 text-emerald-400' : selectedPlot.status === 'booked_yellow' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {selectedPlot.status === 'available_green' ? '● Available' : selectedPlot.status === 'booked_yellow' ? '● Booked' : '● Reserved'}
                </span>
              </div>

              {selectedPlot.status === 'available_green' && (
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-3 py-1.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition"
                >
                  <span>⚡ Book Plot #{selectedPlot.plotNumber}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const text = `Namaste AKGV Infra City! I am interested in booking Plot ${selectedPlot.plotNumber} (${selectedPlot.areaSqft} sqft, Block ${selectedPlot.block}) in Varanasi. Please share booking procedures and bank details for ₹50,000 token hold.`;
                  window.open(`https://wa.me/916306917991?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-600 transition"
                title="Direct WhatsApp Inquiry"
              >
                <span>💬 WhatsApp</span>
              </button>
            </div>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0B1734]/95 px-3.5 py-2 text-xs shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#16A34A]" />
              <span className="text-gray-300 text-[11px] font-medium">Green: Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#CA8A04]" />
              <span className="text-gray-300 text-[11px] font-medium">Yellow: Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#DC2626]" />
              <span className="text-gray-300 text-[11px] font-medium">Red: Vacant/Reserved</span>
            </div>
          </div>

          {/* SVG Vector Map Container with Smooth Scaling */}
          <div className="w-full overflow-x-auto pb-4 pt-2">
            <div
              className="transition-transform duration-200 origin-top-left"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 1100 960"
                className="min-w-[840px] w-full select-none"
                style={{ filter: 'drop-shadow(0px 8px 30px rgba(0,0,0,0.6))' }}
              >
                <defs>
                  {/* Glowing selection filter */}
                  <filter id="plotGlow">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#C7A35A" floodOpacity="0.9" />
                  </filter>
                  {/* Streetlight Radial Light Halo */}
                  <radialGradient id="lightHalo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                  </radialGradient>
                  {/* Boulevard Asphalt Texture */}
                  <pattern id="asphalt" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect width="10" height="10" fill="#131B2E" />
                    <circle cx="2" cy="2" r="0.5" fill="#1E293B" />
                    <circle cx="7" cy="7" r="0.5" fill="#1E293B" />
                  </pattern>
                </defs>

                {/* 1. MASTER SITE BOUNDARY (282' x 260' / 275') */}
                <rect
                  x="40"
                  y="40"
                  width="1020"
                  height="880"
                  rx="10"
                  fill="#080E21"
                  stroke="#C7A35A"
                  strokeWidth="2.5"
                  strokeDasharray="8 5"
                />

                {/* Outer Boundary Dimensions */}
                <text x="550" y="32" fill="#DFC382" fontSize="13" textAnchor="middle" fontWeight="bold" letterSpacing="1">
                  BOUNDARY: 282&apos;-0&quot;
                </text>
                <text x="1075" y="480" fill="#DFC382" fontSize="12" textAnchor="middle" transform="rotate(90, 1075, 480)" fontWeight="bold">
                  275&apos;-0&quot; / 260&apos;-0&quot; (SETBACK 15&apos; 10&quot;)
                </text>
                <text x="25" y="480" fill="#DFC382" fontSize="12" textAnchor="middle" transform="rotate(-90, 25, 480)" fontWeight="bold">
                  BOUNDARY: 282&apos;-0&quot;
                </text>

                {/* 2. ROAD NETWORK & HIGHWAYS */}
                {/* Horizontal Cross Boulevard: 25'-0" Wide (between Block C and Blocks A & B) */}
                <g id="cross-road-25ft">
                  <rect x="40" y="525" width="1020" height="60" fill="url(#asphalt)" />
                  <line x1="40" y1="555" x2="1060" y2="555" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="12 8" />
                  <line x1="40" y1="527" x2="1060" y2="527" stroke="#EAB308" strokeWidth="1.5" />
                  <line x1="40" y1="583" x2="1060" y2="583" stroke="#EAB308" strokeWidth="1.5" />
                  <text x="550" y="559" fill="#DFC382" fontSize="11" textAnchor="middle" fontWeight="bold" letterSpacing="1">
                    PROPOSED ROAD - 25&apos;-0&quot; WIDE
                  </text>
                </g>

                {/* Main Entry Road: 30'-0" Wide Boulevard running vertically through Blocks A & B */}
                <g id="main-boulevard-30ft">
                  <rect x="490" y="525" width="80" height="355" fill="url(#asphalt)" />
                  <line x1="530" y1="525" x2="530" y2="880" stroke="#FDE047" strokeWidth="2" strokeDasharray="14 10" />
                  <line x1="492" y1="525" x2="492" y2="880" stroke="#FFFFFF" strokeWidth="1" />
                  <line x1="568" y1="525" x2="568" y2="880" stroke="#FFFFFF" strokeWidth="1" />
                  <text
                    x="530"
                    y="720"
                    fill="#DFC382"
                    fontSize="11"
                    textAnchor="middle"
                    transform="rotate(-90, 530, 720)"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    PROPOSED ROAD - 30&apos;-0&quot; WIDE (MAIN BOULEVARD)
                  </text>

                  {/* Zebra Crosswalk at T-junction */}
                  <g opacity="0.9">
                    {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72].map((off) => (
                      <rect key={off} x={494 + off} y="582" width="5" height="18" fill="#FFFFFF" rx="1" />
                    ))}
                  </g>

                  {/* Grand Entrance Gate Arch at Bottom */}
                  <g id="entrance-gate">
                    <rect x="480" y="870" width="100" height="20" rx="3" fill="#0B1734" stroke="#C7A35A" strokeWidth="1.5" />
                    <text x="530" y="884" fill="#DFC382" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.8">
                      AKGV INFRA CITY — MAIN GATE (30&apos; WIDE)
                    </text>
                    {/* Security guard kiosk */}
                    <rect x="465" y="865" width="12" height="15" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.8" />
                  </g>
                </g>

                {/* Block C Internal Access Roads: 25'-0" Wide Corridors */}
                <g id="block-c-roads-25ft">
                  {/* Road 1: Between Section 1 and Section 2 */}
                  <rect x="204" y="60" width="46" height="465" fill="url(#asphalt)" />
                  <line x1="227" y1="60" x2="227" y2="525" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="8 6" />
                  <text x="227" y="290" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(-90, 227, 290)">
                    PROPOSED ROAD - 25&apos;-0&quot; WIDE
                  </text>

                  {/* Road 2: Between Section 2 and Section 3 */}
                  <rect x="516" y="60" width="50" height="465" fill="url(#asphalt)" />
                  <line x1="541" y1="60" x2="541" y2="525" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="8 6" />
                  <text x="541" y="290" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(-90, 541, 290)">
                    PROPOSED ROAD - 25&apos;-0&quot; WIDE
                  </text>

                  {/* Road 3: Far right perimeter road along Section 3 */}
                  <rect x="833" y="60" width="46" height="465" fill="url(#asphalt)" />
                  <line x1="856" y1="60" x2="856" y2="525" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="8 6" />
                  <text x="856" y="290" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(-90, 856, 290)">
                    PROPOSED ROAD - 25&apos;-0&quot; WIDE
                  </text>
                </g>

                {/* 3. Landscaped Green Buffer on Right Side (Setback 15' 10") */}
                <g id="right-buffer-park">
                  <rect x="883" y="60" width="167" height="465" rx="6" fill="#0C2417" stroke="#166534" strokeWidth="1" />
                  {/* Decorative Park Trees & Jogging Trail */}
                  <path d="M 910 80 Q 940 200 920 320 T 950 500" stroke="#15803D" strokeWidth="2.5" fill="none" strokeDasharray="4 4" />
                  <text x="965" y="260" fill="#4ADE80" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(90, 965, 260)">
                    LANDSCAPED BOTANICAL BUFFER (15&apos;-10&quot;)
                  </text>
                  {/* Trees in Park */}
                  {[90, 150, 220, 300, 380, 450].map((treeY) => (
                    <circle key={treeY} cx="940" cy={treeY} r="9" fill="#15803D" opacity="0.8" />
                  ))}
                </g>

                {/* 4. Avenue Palm Trees & Streetlights along Boulevard */}
                <g id="boulevard-avenue-trees">
                  {[550, 610, 670, 730, 790, 850].map((lampY) => (
                    <g key={lampY}>
                      {/* Left curb tree & light */}
                      <circle cx="482" cy={lampY} r="7" fill="#15803D" />
                      <circle cx="482" cy={lampY} r="14" fill="url(#lightHalo)" />
                      {/* Right curb tree & light */}
                      <circle cx="578" cy={lampY} r="7" fill="#15803D" />
                      <circle cx="578" cy={lampY} r="14" fill="url(#lightHalo)" />
                    </g>
                  ))}
                </g>

                {/* 5. BLOCK LABELS & TITLE WATERMARKS */}
                <text x="280" y="582" fill="#C7A35A" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="2">
                  BLOCK &apos;B&apos; (TOP ROW)
                </text>
                <text x="280" y="718" fill="#C7A35A" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="2">
                  BLOCK &apos;A&apos; (FRONT ROW)
                </text>
                <text x="780" y="582" fill="#C7A35A" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="2">
                  BLOCK &apos;B&apos; (TOP ROW)
                </text>
                <text x="780" y="718" fill="#C7A35A" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="2">
                  BLOCK &apos;A&apos; (FRONT ROW)
                </text>
                <text x="541" y="80" fill="#C7A35A" fontSize="14" fontWeight="800" textAnchor="middle" letterSpacing="2">
                  BLOCK &apos;C&apos; (35 PREMIUM RESIDENTIAL PLOTS)
                </text>

                {/* 6. RENDER ALL 55 PLOTS WITH MINIATURE VILLAS */}
                {plots.map((plot) => {
                  const isSelected = selectedPlot?.id === plot.id;
                  const isHovered = hoveredPlot?.id === plot.id;

                  return (
                    <g
                      key={plot.id}
                      onClick={() => handlePlotClick(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                    >
                      <MiniVillaSvg
                        plot={plot}
                        isSelected={isSelected}
                        isHovered={isHovered}
                        viewMode={viewMode}
                        showDimensions={showDimensions}
                        showVehicles={showVehicles}
                        showLandscaping={showLandscaping}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Plot Inspector & Booking Details (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPlot && currentStatusMeta ? (
            <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-5 shadow-2xl space-y-5">
              {/* Plot Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-3xl font-bold text-white tracking-wide">
                      Plot {selectedPlot.plotNumber}
                    </span>
                    <span className="rounded bg-[#C7A35A]/20 px-2.5 py-0.5 text-xs font-bold text-[#DFC382]">
                      Block {selectedPlot.block}
                    </span>
                    {selectedPlot.isCornerPlot && (
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                        {c.inspector.cornerPlot}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    AKGV Infra City — Rampur Layout (Approved Er. Rajesh Kumar Patel)
                  </p>
                </div>

                <div className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${currentStatusMeta.bg} ${currentStatusMeta.text}`}>
                  {currentStatusMeta.label}
                </div>
              </div>

              {/* Vastu Compliance Badge */}
              {vastuData && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Compass className="h-4 w-4" />
                    <span>{vastuData.score} ({selectedPlot.roadFacing} Facing)</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    {vastuData.note}
                  </p>
                </div>
              )}

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 space-y-1">
                  <span className="text-gray-400">{c.inspector.totalArea}</span>
                  <div className="text-base font-bold text-white">{selectedPlot.areaSqft} sqft</div>
                  <span className="text-[10px] text-[#DFC382]">
                    {(selectedPlot.areaSqft / 9).toFixed(1)} {c.inspector.squareYards}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 space-y-1">
                  <span className="text-gray-400">{c.inspector.dimensions}</span>
                  <div className="text-base font-bold text-white">{selectedPlot.dimensions}</div>
                  <span className="text-[10px] text-gray-400">{c.inspector.dimensionsSub}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 space-y-1">
                  <span className="text-gray-400">{c.inspector.roadFrontage}</span>
                  <div className="text-xs font-bold text-white">{selectedPlot.roadWidth}</div>
                  <span className="text-[10px] text-gray-400">{c.inspector.roadFrontageSub}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#050A17] p-3 space-y-1">
                  <span className="text-gray-400">{c.inspector.basePrice}</span>
                  <div className="text-base font-bold text-[#DFC382]">
                    ₹{((selectedPlot.basePriceInr || 1200000) / 100000).toFixed(2)} Lakh
                  </div>
                  <span className="text-[10px] text-gray-400">
                    @ ₹{Math.round((selectedPlot.basePriceInr || 1200000) / selectedPlot.areaSqft)}/sqft
                  </span>
                </div>
              </div>

              {/* Sample House Elevations for Future Construction */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-[#C7A35A]" />
                    <span>{c.inspector.sampleElevationTitle}</span>
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {c.inspector.sampleElevationNote}
                  </p>
                </div>

                <div className="space-y-2">
                  {suitableHouses.map((house) => (
                    <div
                      key={house.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#050A17] p-3 text-xs transition hover:border-[#C7A35A]/50"
                    >
                      <div>
                        <div className="font-bold text-white">{house.name}</div>
                        <div className="text-[11px] text-gray-400">
                          {house.bhk} • {house.carpetAreaSqft} sqft • {c.inspector.estimatedConstruction} ₹{(house.estimatedCostInr / 100000).toFixed(1)}L
                        </div>
                      </div>

                      <Link
                        href="/house-viewer-3d"
                        className="rounded-lg border border-[#C7A35A] bg-[#0B1734] px-2.5 py-1 text-[11px] font-bold text-[#DFC382] transition hover:bg-[#C7A35A] hover:text-[#0B1734]"
                      >
                        {c.inspector.inspect3dBtn}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedPlot.status === 'available_green' ? (
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-3 text-sm font-bold text-[#0B1734] shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                  >
                    {c.inspector.holdPlotBtn}
                  </button>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-xs text-gray-400">
                    {c.inspector.vacantNotice}
                  </div>
                )}

                <Link
                  href="/site-visit"
                  className="block w-full text-center rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                >
                  {c.inspector.scheduleVisitBtn}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-[#0B1734] p-6 text-center text-gray-400 text-xs">
              Select any plot on the master plan to inspect dimensions, road width, and suitable 3D house designs.
            </div>
          )}

          {/* Area Schedule Authentic Information Card */}
          <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-serif font-bold text-white tracking-wide">
                {c.inspector.areaScheduleTitle}
              </span>
              <span className="text-[10px] text-[#DFC382]">{c.inspector.scaleText}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400">{c.inspector.townshipArea}</span>
                <span className="font-bold text-white block">{AREA_SCHEDULE.totalAreaSqft.toLocaleString()} sqft</span>
              </div>
              <div>
                <span className="text-gray-400">{c.inspector.netPlotArea}</span>
                <span className="font-bold text-white block">{AREA_SCHEDULE.plotAreaSqft.toLocaleString()} sqft</span>
              </div>
              <div>
                <span className="text-gray-400">{c.inspector.internalRoadArea}</span>
                <span className="font-bold text-white block">{AREA_SCHEDULE.roadAreaSqft.toLocaleString()} sqft</span>
              </div>
              <div>
                <span className="text-gray-400">{c.inspector.roadRatio}</span>
                <span className="font-bold text-[#DFC382] block">{AREA_SCHEDULE.roadPercentage}%</span>
              </div>
            </div>

            {/* Authentic Slogan from Brochure */}
            <div className="rounded-lg bg-[#0B1734] p-2.5 text-[11px] text-gray-300 space-y-1 border border-white/5">
              <p className="font-bold text-[#DFC382]">{c.inspector.sloganTitle}</p>
              <p className="text-[10px] text-gray-400">
                {c.inspector.sloganSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official 72-Hour Plot Hold Certificate Modal */}
      <PlotHoldCertificateModal
        plot={selectedPlot}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preferredHouseModelId={selectedHouseModelId}
        onConfirmBooking={(name, phone, houseModelId) => {
          if (selectedPlot) {
            createBookingRequest(selectedPlot.id, name, phone, houseModelId);
          }
        }}
      />

      {/* Blueprint Original Photograph Lightbox Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="relative max-h-[95vh] max-w-4xl w-full overflow-hidden rounded-2xl border border-[#C7A35A] bg-[#050A17] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0B1734]">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#C7A35A]" />
                <span className="font-serif text-sm font-bold text-white">
                  Original Approved Brochure Photographs — AKGV Infra City
                </span>
              </div>
              <button
                onClick={() => setShowBrochureModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 bg-[#0B1734]/80 px-4 pt-2 text-xs">
              <button
                onClick={() => setActiveBrochureTab('layout')}
                className={`border-b-2 px-4 py-2 font-bold transition ${
                  activeBrochureTab === 'layout'
                    ? 'border-[#C7A35A] text-[#DFC382]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Blueprint Layout Plan
              </button>
              <button
                onClick={() => setActiveBrochureTab('photo')}
                className={`border-b-2 px-4 py-2 font-bold transition ${
                  activeBrochureTab === 'photo'
                    ? 'border-[#C7A35A] text-[#DFC382]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Physical Yellow Brochure Photo
              </button>
              <button
                onClick={() => setActiveBrochureTab('rewards')}
                className={`border-b-2 px-4 py-2 font-bold transition ${
                  activeBrochureTab === 'rewards'
                    ? 'border-[#C7A35A] text-[#DFC382]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                11-Tier Rewards & Commission Plan
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center bg-[#02050E]">
              {activeBrochureTab === 'layout' && (
                <Image
                  src="/assets/layout_plan_brochure.png"
                  alt="Original Layout Plan Brochure of AKGV Infra City"
                  width={800}
                  height={1200}
                  className="rounded-lg object-contain max-h-[75vh] w-auto border border-white/10"
                />
              )}
              {activeBrochureTab === 'photo' && (
                <Image
                  src="/assets/brochure_full_photo.png"
                  alt="Physical Brochure Photograph of AKGV Infra City"
                  width={800}
                  height={1200}
                  className="rounded-lg object-contain max-h-[75vh] w-auto border border-white/10"
                />
              )}
              {activeBrochureTab === 'rewards' && (
                <Image
                  src="/assets/rewards_plan_brochure.jpg"
                  alt="11-Tier Rewards Brochure of AKGV Infra City"
                  width={800}
                  height={1200}
                  className="rounded-lg object-contain max-h-[75vh] w-auto border border-white/10"
                />
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0B1734] px-4 py-2 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Authentic documents provided by AKGV Infra City Private Limited.</span>
              <span className="text-[#DFC382]">Scale 1:500 | Area: 77,550 sqft</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
