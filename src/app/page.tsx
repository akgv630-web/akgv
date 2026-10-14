'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building,
  Calendar,
  CheckCircle2,
  Compass,
  FileCheck,
  Gift,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { MasterPlanViewer } from '@/components/master-plan/MasterPlanViewer';
import { CommissionRewardsView } from '@/components/rewards/CommissionRewardsView';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';
import { TrustAndLegalSection } from '@/components/home/TrustAndLegalSection';

export default function HomePage() {
  const { t, language } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = t.faqs;

  return (
    <div className="flex flex-col gap-8 sm:gap-14 lg:gap-16 pb-16 w-full max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION - 100% PLOTTED TOWNSHIP FOCUS */}
      <section className="relative min-h-0 sm:min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-[#C7A35A]/30 bg-gradient-to-b from-[#050A17] via-[#0B1734] to-[#050A17] px-3 sm:px-4 py-8 sm:py-14 lg:py-20">
        {/* Subtle Luxury Architectural Backdrop */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#C7A35A_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-4 sm:space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#C7A35A]/50 bg-[#0B1734]/90 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#DFC382] shadow-lg backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight">
            {t.hero.title} <br className="hidden sm:inline" />
            <span className="gold-gradient-text block sm:inline mt-1 sm:mt-0">{t.hero.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed px-1 sm:px-0">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mx-auto sm:max-w-none sm:flex sm:flex-wrap sm:justify-center sm:gap-3.5 pt-2 sm:pt-4">
            <Link
              href="#master-plan"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-[#0B1734] shadow-xl hover:brightness-110 transition active:scale-95"
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>{t.hero.explorePlots}</span>
            </Link>

            <Link
              href="/site-visit"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <Calendar className="h-4 w-4 text-[#1EA275] shrink-0" />
              <span>{t.hero.bookVisit}</span>
            </Link>

            <Link
              href="#locations"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#0B1734]/80 px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#DFC382] hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{t.hero.townshipLocations}</span>
            </Link>

            <a
              href="https://wa.me/916306917991?text=Namaste%20AKGV%20Infra%20City!%20I%20am%20interested%20in%20purchasing%20a%20residential%20plot%20in%20Varanasi.%20Please%20share%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl hover:bg-emerald-600 transition active:scale-95"
            >
              <span>💬 {t.hero.whatsappDesk} (6306917991)</span>
            </a>
          </div>

          {/* Hero Highlight Value Cards (Ensures page never looks empty/khali) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4 max-w-2xl mx-auto">
            <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17]/80 p-2 sm:p-3 text-center">
              <span className="font-serif text-xs sm:text-base font-bold text-[#DFC382] block">55 Plots</span>
              <span className="text-[9px] sm:text-xs text-gray-400">Rampur Blueprint</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#050A17]/80 p-2 sm:p-3 text-center">
              <span className="font-serif text-xs sm:text-base font-bold text-white block">30ft / 25ft</span>
              <span className="text-[9px] sm:text-xs text-gray-400">Wide Asphalt Roads</span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-[#050A17]/80 p-2 sm:p-3 text-center">
              <span className="font-serif text-xs sm:text-base font-bold text-emerald-400 block">Immediate</span>
              <span className="text-[9px] sm:text-xs text-emerald-300">Registry Ready</span>
            </div>
          </div>

          {/* Direct Phone Assistance Bar */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-[#050A17]/80 px-3.5 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-xs text-gray-300 shadow">
              <PhoneCall className="h-3.5 w-3.5 text-[#C7A35A]" />
              <span>{t.hero.directDesk}</span>
              <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-[#DFC382] hover:underline">
                {COMPANY_DETAILS.displayPhone}
              </a>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="hidden sm:inline text-emerald-400">{t.hero.immediateAssistance}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE FLAGSHIP PROJECT LOCATIONS */}
      <section id="locations" className="mx-auto max-w-7xl px-4 sm:px-6 w-full max-w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            {t.locations.badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.locations.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.locations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROJECT_LOCATIONS.map((loc) => {
            const localizedCityName = language === 'hi'
              ? (loc.slug === 'rampur' ? 'रामपुर (वाराणसी)' : loc.slug === 'lahartara' ? 'लहरतारा (वाराणसी)' : 'मिर्ज़ा मुराद (वाराणसी)')
              : loc.name;
            const localizedCityShort = language === 'hi'
              ? (loc.slug === 'rampur' ? 'रामपुर' : loc.slug === 'lahartara' ? 'लहरतारा' : 'मिर्ज़ा मुराद')
              : loc.city;
            const localizedHeadline = language === 'hi'
              ? (loc.slug === 'rampur' ? '30 फीट चौड़े मुख्य मार्ग के साथ गेटेड टाउनशिप' : loc.slug === 'lahartara' ? 'कैंट रेलवे स्टेशन के पास प्राइम आवासीय प्लॉट्स' : 'NH-19 एक्सप्रेसवे कॉरिडोर पर विकसित प्लॉट्स')
              : loc.headline;

            return (
              <div
                key={loc.id}
                className="group overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] transition hover:border-[#C7A35A] hover:shadow-2xl flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={loc.imageUrl}
                    alt={localizedCityName}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1734] via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-[#050A17]/80 px-3 py-1 text-[11px] font-bold text-[#DFC382] border border-[#C7A35A]/40 backdrop-blur">
                    {loc.availablePlots} {t.locations.plotsAvailable}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#DFC382] transition">
                      {localizedCityName}
                    </h3>
                    <p className="text-xs text-[#DFC382] font-medium mt-0.5">{localizedHeadline}</p>
                    <p className="text-xs text-gray-300 mt-2 line-clamp-3 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                      <span className="truncate">{loc.roadConnectivity}</span>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Link
                        href="/master-plan"
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition active:scale-95"
                      >
                        <span>⚡ {t.locations.bookPlotIn} {localizedCityShort}</span>
                      </Link>

                      <Link
                        href={`/projects#${loc.slug}`}
                        className="flex items-center justify-between text-xs font-semibold text-[#DFC382] hover:underline pt-0.5"
                      >
                        <span>{t.locations.viewInventory}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE MASTER PLAN (EMBEDDED) */}
      <section id="master-plan" className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#1EA275] uppercase tracking-wider">
            {t.masterPlan.badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.masterPlan.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.masterPlan.subtitle}
          </p>
        </div>

        <MasterPlanViewer />
      </section>

      {/* 4. ARCHITECTURAL GUIDANCE FOR YOUR PURCHASED PLOT (REPLACING 3D BUILDER ON HOME) */}
      <section id="architectural-guidance" className="w-full max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
              {t.architecturalGuidance.badge}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {t.architecturalGuidance.title}
            </h2>
            <p className="text-xs text-gray-300">
              {t.architecturalGuidance.subtitle}
            </p>
          </div>

          {/* Mandatory Business Policy Notice Banner */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-amber-300 text-sm block">
                  {t.architecturalGuidance.policyTitle}
                </span>
                <p className="text-gray-200 leading-relaxed">
                  {t.architecturalGuidance.policyNotice}
                </p>
                <p className="text-gray-300 text-[11px] pt-1">
                  {t.architecturalGuidance.visualizerIntro}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Sample Elevation Models for Plot Fitting */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {t.architecturalGuidance.models.map((model, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0B1734]/90 p-5 space-y-3 flex flex-col justify-between hover:border-[#C7A35A]/50 transition"
              >
                <div className="space-y-2">
                  <span className="rounded-full bg-[#C7A35A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382] border border-[#C7A35A]/30">
                    {model.suitablePlot}
                  </span>
                  <h3 className="font-serif text-base font-bold text-white">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {model.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#DFC382]">
                  <span>{t.architecturalGuidance.sampleTag}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Action to Launch Dedicated 3D Elevation Viewer */}
          <div className="text-center pt-2">
            <Link
              href="/house-viewer-3d"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-8 py-3.5 text-sm font-bold text-[#0B1734] shadow-xl hover:brightness-110 transition active:scale-95"
            >
              <Building className="h-4 w-4" />
              <span>{t.architecturalGuidance.exploreVisualizerBtn}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TRUST, LEGAL GUARANTEE & INFRASTRUCTURE STANDARDS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
        <TrustAndLegalSection />
      </section>

      {/* 6. LEVEL COMMISSION & REWARD PLAN (EMBEDDED) */}
      <section id="rewards" className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider">
            {language === 'hi' ? 'प्रोत्साहन एवं पुरस्कार' : language === 'hinglish' ? 'Growth & Rewards' : 'Performance Recognition'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.rewards.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.rewards.subtitle}
          </p>
        </div>

        <CommissionRewardsView />
      </section>

      {/* 7. OFFLINE JOINING KIT LEDGER SECTION */}
      <section id="joining-kit" className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            {t.joiningKit.badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.joiningKit.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.joiningKit.subtitle}
          </p>
        </div>

        <JoiningKitLedger />
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-6 overflow-hidden">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.faqSection.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.faqSection.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#0B1734] transition"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#DFC382]"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#C7A35A] text-lg font-bold">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 bg-[#050A17] p-4 text-xs text-gray-300 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. BOTTOM BOOKING CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#C7A35A] bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-8 sm:p-12 text-center shadow-2xl">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              {t.ctaBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              {t.ctaBanner.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-3.5 text-sm font-bold text-[#0B1734] shadow hover:brightness-110"
              >
                <PhoneCall className="h-4 w-4" />
                <span>{t.ctaBanner.callBtn} {COMPANY_DETAILS.displayPhone}</span>
              </a>
              <Link
                href="/site-visit"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4 text-[#1EA275]" />
                <span>{t.ctaBanner.siteVisitBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
