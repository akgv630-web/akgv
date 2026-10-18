'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Box,
  Building,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Layers,
  MapPin,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { MasterPlanViewer } from '@/components/master-plan/MasterPlanViewer';
import { CommissionRewardsView } from '@/components/rewards/CommissionRewardsView';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';
import { TrustAndLegalSection } from '@/components/home/TrustAndLegalSection';
import { tLang } from '@/lib/i18n';

export default function HomePage() {
  const { t, language, cmsContent, currentUser, tasks } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const isStaff = currentUser && currentUser.role !== 'buyer';
  const pendingTasksCount = currentUser
    ? tasks.filter((t) => !t.isCompleted).length
    : 0;

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
          {/* Active Associate Task & Lead Action Banner for Logged In Staff */}
          {isStaff && (
            <div className="mx-auto max-w-3xl w-full rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/70 via-[#0B1734] to-[#050A17] p-3.5 sm:p-4 text-left shadow-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#DFC382]">
                        {currentUser.role === 'super_admin' ? 'Admin Desk' : 'Associate Workspace'}:
                      </span>
                      <span className="text-xs text-white font-semibold">{currentUser.fullName}</span>
                    </div>
                    <p className="text-xs text-gray-200 mt-0.5">
                      {pendingTasksCount > 0
                        ? tLang(
                            language,
                            `⚡ You have ${pendingTasksCount} pending task${pendingTasksCount > 1 ? 's' : ''} to complete today.`,
                            `⚡ आपके पास आज पूरा करने के लिए ${pendingTasksCount} कार्य लंबित हैं।`,
                            `⚡ Aapke paas aaj complete karne ke liye ${pendingTasksCount} pending tasks hain.`
                          )
                        : tLang(
                            language,
                            'All assigned tasks completed! Check incoming leads or view dashboard.',
                            'सभी कार्य पूरे हैं! नई लीड्स देखें या डैशबोर्ड खोलें।',
                            'Sabhi tasks complete hain! Nayi leads dekhein ya dashboard kholein.'
                          )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    href={currentUser.role === 'super_admin' || currentUser.role === 'sub_admin' ? '/admin?tab=tasks' : '/member?tab=tasks'}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-3.5 py-1.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{tLang(language, 'Open Tasks Panel', 'टास्क पैनल खोलें', 'Tasks Panel Kholein')}</span>
                  </Link>
                  <Link
                    href={currentUser.role === 'super_admin' || currentUser.role === 'sub_admin' ? '/admin' : '/member'}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
                  >
                    <span>{tLang(language, 'Dashboard', 'डैशबोर्ड', 'Dashboard')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Announcement Banner from CMS */}
          {cmsContent?.announcementBanner?.isActive && (
            <div className="flex justify-center">
              <Link
                href={cmsContent.announcementBanner.linkUrl || '/master-plan'}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-md hover:bg-amber-500/20 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>
                  {tLang(
                    language,
                    cmsContent.announcementBanner.textEn,
                    cmsContent.announcementBanner.textHi,
                    cmsContent.announcementBanner.textEn
                  )}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

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
              href="#branches"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#0B1734]/80 px-3.5 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#DFC382] hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              <Building className="h-4 w-4 shrink-0" />
              <span>{tLang(language, 'Branch Offices', 'शाखा कार्यालय', 'Branch Offices')}</span>
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
              <span className="text-[9px] sm:text-xs text-gray-400">Varanasi Blueprint</span>
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

      {/* 2. REGIONAL BRANCH OFFICES (OFFICIAL HELPDESKS - NO FAKE IMAGES) */}
      <section id="branches" className="mx-auto max-w-7xl px-4 sm:px-6 w-full max-w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7A35A]/40 bg-[#0B1734] px-3 py-1 text-xs font-semibold text-[#DFC382]">
            <Building className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>{t.locations.badge}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.locations.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.locations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROJECT_LOCATIONS.map((loc) => {
            const localizedBranchName = tLang(
              language,
              loc.name,
              (loc.slug === 'rampur' ? 'एकेजीवी इन्फ्रा सिटी — रामपुर शाखा' : loc.slug === 'lahartara' ? 'एकेजीवी इन्फ्रा सिटी — लहरतारा शाखा' : 'एकेजीवी इन्फ्रा सिटी — मिर्ज़ा मुराद शाखा'),
              (loc.slug === 'rampur' ? 'AKGV Infra City — Rampur Branch' : loc.slug === 'lahartara' ? 'AKGV Infra City — Lahartara Branch' : 'AKGV Infra City — Mirza Murad Branch')
            );
            const localizedHeadline = tLang(
              language,
              loc.headline,
              (loc.slug === 'rampur' ? 'आधिकारिक शाखा कार्यालय एवं सहायता केंद्र' : loc.slug === 'lahartara' ? 'सेंट्रल सिटी शाखा कार्यालय (कैंट के पास)' : 'हाईवे कॉरिडोर शाखा कार्यालय (NH-19)'),
              (loc.slug === 'rampur' ? 'Official Branch Office & Support Center' : loc.slug === 'lahartara' ? 'Central City Branch Office (Near Cantt)' : 'Highway Corridor Branch Office (NH-19)')
            );

            return (
              <div
                key={loc.id}
                className="group rounded-2xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-5 sm:p-6 transition hover:border-[#C7A35A] hover:shadow-2xl flex flex-col justify-between space-y-5"
              >
                {/* Branch Header Badge & Icon */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1734] border border-[#C7A35A]/50 text-[#C7A35A] shadow-inner group-hover:border-[#DFC382] group-hover:scale-105 transition">
                      <Building className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#146B4D]/30 border border-[#146B4D]/60 px-3 py-1 text-[11px] font-bold text-[#1EA275]">
                      {t.locations.branchOffice}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#DFC382] transition">
                      {localizedBranchName}
                    </h3>
                    <p className="text-xs text-[#DFC382] font-medium mt-0.5">{localizedHeadline}</p>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  {/* Branch Services Provided */}
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      {t.locations.servicesTitle}
                    </span>
                    {loc.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1EA275] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address, Hours & Action CTAs */}
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{loc.address || loc.roadConnectivity}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Clock className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                    <span>{loc.workingHours || t.locations.officeHours}</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={`tel:${COMPANY_DETAILS.phone}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition active:scale-95"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{t.locations.callBranch} ({COMPANY_DETAILS.displayPhone})</span>
                    </a>

                    <Link
                      href={`/site-visit?location=${encodeURIComponent(loc.name)}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#1EA275]" />
                      <span>{t.locations.visitBranch}</span>
                    </Link>
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

      {/* 4. 3D VILLA ARCHITECTURAL EXPERIENCE & FITMENT SIMULATION */}
      <section id="house-viewer" className="w-full max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="relative overflow-hidden rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#0B1734] via-[#081226] to-[#050A17] p-6 sm:p-10 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C7A35A]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <Box className="h-3.5 w-3.5 text-emerald-400" />
                <span>{tLang(language, 'Interactive 3D Villa Experience', '3D विला आर्किटेक्चरल स्टूडियो', 'Interactive 3D Villa Experience')}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {tLang(
                  language,
                  'Visualize & Customize Your Dream Villa in Full 3D WebGL',
                  'अपने प्लॉट पर सपनों का विला 3D में देखें और कस्टमाइज़ करें',
                  'Apne Plot Par Sapno Ka Villa 3D Me Dekhein Aur Customize Karein'
                )}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {tLang(
                  language,
                  'Simulate procedural 3BHK and 4BHK architectural villa fitments directly on selected plots. Rotate, inspect floor spans, toggle day/golden-hour/night illumination, and preview luxury finishes with real-time carpet area calculations.',
                  'AKGV इन्फ्रा सिटी के प्रत्येक प्लॉट पर 3BHK एवं 4BHK विला का डिजिटल फिटमेंट सिम्युलेट करें। दिन, शाम और रात की लाइटिंग में एक्सटीरियर पेंट, पत्थर की फिनिश और कार पोर्च आर्किटेक्चर का वास्तविक 360° अनुभव लें।',
                  'AKGV Infra City ke har plot par 3BHK aur 4BHK villa ka digital fitment simulate karein. Din, shaam aur raat ki lighting me luxury finishes ka real 360° experience lein.'
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="text-[11px] font-semibold text-gray-400 block">{tLang(language, 'Villa Models', 'आर्किटेक्चर मॉडल', 'Villa Models')}</span>
                  <span className="font-serif text-sm font-bold text-[#DFC382]">3BHK & 4BHK Duplex</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="text-[11px] font-semibold text-gray-400 block">{tLang(language, 'Lighting Modes', 'लाइटिंग मोड', 'Lighting Modes')}</span>
                  <span className="font-serif text-sm font-bold text-[#DFC382]">Day • Golden • Night</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-gray-400 block">{tLang(language, 'Exterior Themes', 'फिनिश कस्टमाइजेशन', 'Exterior Themes')}</span>
                  <span className="font-serif text-sm font-bold text-[#DFC382]">Heritage & Modern</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/house-viewer-3d"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-3 text-xs sm:text-sm font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition"
                >
                  <Box className="h-4 w-4" />
                  <span>{tLang(language, 'Launch 3D Villa Studio', '3D विला स्टूडियो खोलें', 'Launch 3D Villa Studio')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/master-plan"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  <Layers className="h-4 w-4 text-[#C7A35A]" />
                  <span>{tLang(language, 'Explore Master Plan', 'प्लॉट मास्टर प्लान', 'Master Plan Dekhein')}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-white/10 bg-[#050A17]/80 p-5 backdrop-blur shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">WebGL 3D Engine</span>
                  </div>
                  <span className="rounded-full bg-[#C7A35A]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382]">
                    High Fidelity
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>{tLang(language, 'Sample Villa Configuration:', 'नमूना विला कॉन्फ़िगरेशन:', 'Sample Villa Configuration:')}</span>
                    <span className="font-semibold text-white">Royal Heritage 4BHK</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{tLang(language, 'Plot Fitment Simulation:', 'प्लॉट फिटमेंट सिमुलेशन:', 'Plot Fitment Simulation:')}</span>
                    <span className="font-semibold text-emerald-400">Plot #A-04 (1,200 sqft)</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{tLang(language, 'Ground Coverage:', 'ग्राउंड कवरेज:', 'Ground Coverage:')}</span>
                    <span className="font-semibold text-white">{tLang(language, '68% (Vastu Compliant)', '68% (वास्तु सम्मत)', '68% (Vastu Compliant)')}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{tLang(language, 'Estimated Construction:', 'अनुमानित निर्माण लागत:', 'Estimated Construction:')}</span>
                    <span className="font-semibold text-[#DFC382]">₹48.5 {tLang(language, 'Lakhs', 'लाख', 'Lakhs')}</span>
                  </div>
                </div>

                <Link
                  href="/house-viewer-3d"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-[#DFC382] border border-white/10 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C7A35A]" />
                  <span>{tLang(language, 'Simulate 3D Fitment →', '3D में इंटरैक्ट करें →', '3D Fitment Simulate Karein →')}</span>
                </Link>
              </div>
            </div>
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
            {tLang(language, 'Performance Recognition', 'प्रोत्साहन एवं पुरस्कार', 'Growth & Rewards')}
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
