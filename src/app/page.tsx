'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Award,
  Building,
  Calendar,
  CheckCircle,
  Compass,
  FileCheck,
  Gift,
  HelpCircle,
  Layers,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { MasterPlanViewer } from '@/components/master-plan/MasterPlanViewer';
import { HouseViewer3D } from '@/components/3d/HouseViewer3D';
import { CommissionRewardsView } from '@/components/rewards/CommissionRewardsView';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';
import { TrustAndLegalSection } from '@/components/home/TrustAndLegalSection';
import { LoanEmiCalculator } from '@/components/calculator/LoanEmiCalculator';

export default function HomePage() {
  const { t, language } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Does AKGV Infra City build houses or only sell residential plots? (क्या कंपनी मकान बनाती है या सिर्फ प्लॉट बेचती है?)',
      a: 'AKGV Infra City Private Limited केवल सुव्यवस्थित एवं कानूनी रूप से प्रमाणित आवासीय प्लॉट्स (Developed Residential Plots) की बिक्री करती है। हम 30ft व 25ft चौड़ी पक्की सड़कें, भूमिगत नाली, बिजली ट्रांसफार्मर, सोलर स्ट्रीट लाइट्स, मीठा पानी एवं बाउंड्री जैसी पूर्ण टाउनशिप सुविधाएं विकसित करके देते हैं। वेबसाइट पर दिया गया 3D हाउस व्यूअर केवल संदर्भ व विज़ुअलाइज़ेशन के लिए है ताकि आप देख सकें कि आपके प्लॉट पर भविष्य का मकान कैसा बन सकता है। मकान निर्माण खरीदार स्वयं अपनी पसंद से कराते हैं।',
    },
    {
      q: 'Where are the flagship project locations of AKGV Infra City?',
      a: 'Initial flagship townships are strategically located in Rampur (outskirts with direct 30ft entrance roads), Lahartara (central Varanasi near Cantt Station), and Mirza Murad (industrial & expressway growth corridor along NH-19).',
    },
    {
      q: 'What road widths and infrastructure amenities are provided?',
      a: 'As transcribed in our official blueprint, the development features a 30\'-0" wide main proposed boulevard and 25\'-0" wide internal cross-roads, complete with underground drainage lines, electricity transformer infrastructure, and water connectivity ready for immediate residential construction.',
    },
    {
      q: 'How does the plot booking and hold workflow function?',
      a: 'Buyers can select an available green plot on our interactive digital master plan and place a 72-hour temporary hold. Payment proofs (UPI QR or Bank NEFT) are verified manually by authorized staff before issuing an official receipt and marking the plot yellow.',
    },
    {
      q: 'What is the ₹999 Joining Kit and how is payment collected?',
      a: 'The ₹999 Joining Kit is strictly collected in cash offline and provides physical business materials: 1 Executive Bag, 1 Metallic Pen, 1 Executive Diary, and 1 Project File. An official printed cash receipt is generated in the portal.',
    },
    {
      q: 'Can buyers visualize compatible houses in 3D before booking?',
      a: 'Yes! Our interactive 3D House Viewer allows you to rotate suitable house designs 360 degrees, inspect dimensions, switch daylight and exterior finishes, and verify that the layout fits your selected plot dimensions.',
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#C7A35A]/30 bg-gradient-to-b from-[#050A17] via-[#0B1734] to-[#050A17] px-4 py-20">
        {/* Subtle Luxury Architectural Backdrop */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#C7A35A_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7A35A]/50 bg-[#0B1734]/90 px-4 py-1.5 text-xs font-semibold text-[#DFC382] shadow-lg backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#C7A35A]" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {language === 'hi' ? (
              <>
                अपने सपनों का प्लॉट खरीदें <br />
                <span className="gold-gradient-text">सुव्यवस्थित सुविधाओं के साथ</span>
              </>
            ) : language === 'hinglish' ? (
              <>
                Apne Sapno Ka Plot Kharidein <br />
                <span className="gold-gradient-text">Full Amenities & 30ft Wide Roads Ke Sath</span>
              </>
            ) : (
              <>
                Build Your Future on Verified Land <br />
                <span className="gold-gradient-text">AKGV Infra City Private Limited</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-gray-300 leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="#master-plan"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-3.5 text-sm font-bold text-[#0B1734] shadow-xl hover:brightness-110 transition active:scale-95"
            >
              <Layers className="h-4 w-4" />
              <span>{t.hero.explorePlots}</span>
            </Link>

            <Link
              href="#house-viewer-3d"
              className="flex items-center gap-2 rounded-xl border border-[#C7A35A]/50 bg-[#0B1734]/80 px-6 py-3.5 text-sm font-semibold text-[#DFC382] hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              <Building className="h-4 w-4" />
              <span>{t.hero.watch3d}</span>
            </Link>

            <Link
              href="/site-visit"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <Calendar className="h-4 w-4 text-[#1EA275]" />
              <span>{t.hero.bookVisit}</span>
            </Link>

            <a
              href="https://wa.me/916306917991?text=Namaste%20AKGV%20Infra%20City!%20I%20am%20interested%20in%20booking%20a%20plot%20in%20Varanasi.%20Please%20share%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-emerald-600 transition active:scale-95"
            >
              <span>💬 WhatsApp (6306917991)</span>
            </a>
          </div>

          {/* Direct Phone Assistance Bar */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050A17]/80 px-5 py-2.5 text-xs text-gray-300 shadow">
              <PhoneCall className="h-4 w-4 text-[#C7A35A]" />
              <span>Direct Sales Desk:</span>
              <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-[#DFC382] hover:underline">
                {COMPANY_DETAILS.displayPhone}
              </a>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="hidden sm:inline text-emerald-400">Immediate Site Visit Assistance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE FLAGSHIP PROJECT LOCATIONS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            Prime Growth Corridors
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Township Locations in Uttar Pradesh
          </h2>
          <p className="text-xs text-gray-400">
            Selected for high capital appreciation, rapid infrastructural expansion, and pristine residential living.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROJECT_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="group overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] transition hover:border-[#C7A35A] hover:shadow-2xl flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={loc.imageUrl}
                  alt={loc.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1734] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 rounded-full bg-[#050A17]/80 px-3 py-1 text-[11px] font-bold text-[#DFC382] border border-[#C7A35A]/40 backdrop-blur">
                  {loc.availablePlots} Plots Available
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#DFC382] transition">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-[#DFC382] font-medium mt-0.5">{loc.headline}</p>
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
                      <span>⚡ Book Plot in {loc.city}</span>
                    </Link>

                    <Link
                      href={`/projects#${loc.slug}`}
                      className="flex items-center justify-between text-xs font-semibold text-[#DFC382] hover:underline pt-0.5"
                    >
                      <span>View Location Inventory & Map</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE MASTER PLAN (EMBEDDED) */}
      <section id="master-plan" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#1EA275] uppercase tracking-wider">
            Blueprint-Accurate Digital Map
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

      {/* 4. 3D HOUSE VIEWER (EMBEDDED) */}
      <section id="house-viewer-3d" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            Sample Elevation & Fitment Simulation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Visualize Your Future Home on Your Purchased Plot in 3D
          </h2>
          <p className="text-xs text-gray-400">
            AKGV Infra City केवल पूर्ण विकसित आवासीय प्लॉट्स बेचती है। यह 3D सिम्युलेटर केवल यह देखने के लिए है कि आपके खरीदे गए प्लॉट पर भविष्य का मकान (वास्तु, सेटबैक व कार पार्किंग) कैसा बन सकता है।
          </p>
        </div>

        <HouseViewer3D />
      </section>

      {/* 5. TRUST, LEGAL GUARANTEE & INFRASTRUCTURE STANDARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <TrustAndLegalSection />
      </section>

      {/* 6. LEVEL COMMISSION & REWARD PLAN (EMBEDDED) */}
      <section id="rewards" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider">
            Growth & Recognition
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

      {/* 7. BANK LOAN, EMI & STAMP DUTY ESTIMATOR */}
      <section id="loan-calculator" className="mx-auto max-w-7xl px-4 sm:px-6">
        <LoanEmiCalculator />
      </section>

      {/* 8. OFFLINE JOINING KIT LEDGER SECTION */}
      <section id="joining-kit" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Offline Transparency
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Member Joining Kit (₹999 Cash Ledger)
          </h2>
          <p className="text-xs text-gray-400">
            Physical onboarding kit with Bag, Pen, Diary and File. Strictly collected in cash offline and tracked in our administrative ledger.
          </p>
        </div>

        <JoiningKitLedger />
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-400">
            Clear answers regarding plot bookings, registry process, and company operations.
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

      {/* 8. BOTTOM BOOKING CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#C7A35A] bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-8 sm:p-12 text-center shadow-2xl">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Ready to Secure Your Plot in Varanasi?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Schedule a guided site inspection with our senior representatives in Rampur, Lahartara or Mirza Murad today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-3.5 text-sm font-bold text-[#0B1734] shadow hover:brightness-110"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call {COMPANY_DETAILS.displayPhone}</span>
              </a>
              <Link
                href="/site-visit"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4 text-[#1EA275]" />
                <span>Book Site Visit Online</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
