'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Layers,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { COMPANY_DETAILS, MAIN_TOWNSHIP_PROJECT, PROJECT_LOCATIONS } from '@/data/groundTruth';

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-14">
      {/* 1. PAGE HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7A35A]/50 bg-[#0B1734] px-3.5 py-1 text-xs font-semibold text-[#DFC382]">
          <Sparkles className="h-3.5 w-3.5 text-[#C7A35A]" />
          <span>Approved Plotted Township & Branch Network</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          A.K.G.V. Infra City — Plotted Township & Branches
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Residential plot development in Varanasi with complete civil infrastructure, backed by our 3 official branch offices across Rampur, Lahartara, and Mirza Murad for customer consultation and site visit assistance.
        </p>
      </div>

      {/* 2. THE CENTRAL 55-PLOT TOWNSHIP SPECIFICATION */}
      <div className="rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#1EA275] uppercase tracking-wider">
              Flagship Plotted Development • Varanasi
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {MAIN_TOWNSHIP_PROJECT.name}
            </h2>
            <p className="text-xs text-gray-400">
              Architectural Blueprint: {MAIN_TOWNSHIP_PROJECT.architect} | Blueprint Scale: {MAIN_TOWNSHIP_PROJECT.blueprintScale}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#C7A35A]/40 bg-[#0B1734] px-4 py-2 text-center">
              <span className="font-serif text-lg font-bold text-[#DFC382] block">55 Plots</span>
              <span className="text-[10px] text-gray-400">Approved Layout</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1734] px-4 py-2 text-center">
              <span className="font-serif text-lg font-bold text-white block">77,550 sqft</span>
              <span className="text-[10px] text-gray-400">Total Township Area</span>
            </div>
          </div>
        </div>

        {/* Township Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-4">
            <span className="text-[11px] text-gray-400 block">Total Area</span>
            <span className="font-serif text-base font-bold text-white mt-1 block">77,550 sq.ft.</span>
            <span className="text-[10px] text-gray-500">Master layout perimeter</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-4">
            <span className="text-[11px] text-gray-400 block">Net Plot Area</span>
            <span className="font-serif text-base font-bold text-[#DFC382] mt-1 block">55,970 sq.ft.</span>
            <span className="text-[10px] text-[#DFC382]/70">Demarcated residential land</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-4">
            <span className="text-[11px] text-gray-400 block">Road Network Area</span>
            <span className="font-serif text-base font-bold text-emerald-400 mt-1 block">21,580 sq.ft.</span>
            <span className="text-[10px] text-emerald-400/70">27.82% devoted to wide roads</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-4">
            <span className="text-[11px] text-gray-400 block">Road Width Specs</span>
            <span className="font-serif text-base font-bold text-white mt-1 block">30ft & 25ft</span>
            <span className="text-[10px] text-gray-500">Asphalt wide access</span>
          </div>
        </div>

        {/* Infrastructure Highlights */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1EA275]" />
            <span>Township Civil & Legal Infrastructure:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-300">
            {MAIN_TOWNSHIP_PROJECT.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-white/5 p-3 border border-white/5">
                <CheckCircle2 className="h-4 w-4 text-[#1EA275] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTAs for the Township */}
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          <Link
            href="/master-plan"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-3 text-xs sm:text-sm font-bold text-[#0B1734] shadow-xl hover:brightness-110 transition active:scale-95"
          >
            <Layers className="h-4 w-4" />
            <span>Explore 55 Plots on Interactive Master Plan</span>
          </Link>
          <Link
            href="/site-visit"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            <Calendar className="h-4 w-4 text-[#1EA275]" />
            <span>Book Guided Site Visit</span>
          </Link>
          <a
            href="https://wa.me/916306917991?text=Namaste%20AKGV%20Infra%20City!%20I%20am%20interested%20in%20inspecting%20plots%20in%20your%20Varanasi%20township."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-600 transition"
          >
            <span>💬 WhatsApp Desk (6306917991)</span>
          </a>
        </div>
      </div>

      {/* 3. REGIONAL BRANCH OFFICES (NO FAKE IMAGES) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7A35A]/40 bg-[#0B1734] px-3 py-1 text-xs font-semibold text-[#DFC382]">
            <Building className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>Regional Customer Support Centers</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Our 3 Branch Offices in Varanasi
          </h2>
          <p className="text-xs text-gray-400">
            Visit our nearest branch office for physical document verification, plot booking consultation, and escorted site visit arrangements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECT_LOCATIONS.map((loc) => (
            <div
              id={loc.slug}
              key={loc.id}
              className="group rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-6 shadow-xl flex flex-col justify-between space-y-6 hover:border-[#C7A35A] transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1734] border border-[#C7A35A]/50 text-[#C7A35A] shadow-inner group-hover:scale-105 transition">
                    <Building className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#146B4D]/30 border border-[#146B4D]/60 px-3 py-1 text-[11px] font-bold text-[#1EA275]">
                    Branch Office
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#DFC382] transition">
                    {loc.name}
                  </h3>
                  <p className="text-xs font-medium text-[#DFC382] mt-0.5">{loc.headline}</p>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    {loc.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Branch Services & Helpdesk:
                  </span>
                  {loc.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1EA275] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <MapPin className="h-4 w-4 text-[#C7A35A] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{loc.address || loc.roadConnectivity}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Clock className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                  <span>{loc.workingHours || '9:30 AM – 6:30 PM (Mon – Sat)'}</span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`tel:${COMPANY_DETAILS.phone}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition active:scale-95"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call Branch ({COMPANY_DETAILS.displayPhone})</span>
                  </a>

                  <Link
                    href={`/site-visit?location=${encodeURIComponent(loc.name)}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#1EA275]" />
                    <span>Book Site Visit from this Branch</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
