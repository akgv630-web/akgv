'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Compass,
  Layers,
  ShieldCheck,
  Trees,
  Zap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

import { ReviewsLiveSection } from '@/components/reviews/ReviewsLiveSection';

export function TrustAndLegalSection() {
  const { t } = useApp();
  const pillarIcons = [Layers, ShieldCheck, Zap, Trees, Compass, Building2];

  return (
    <div className="space-y-16">
      {/* 1. WHY INVEST IN AKGV INFRA CITY (INFRASTRUCTURE PILLARS) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            {t.trust.badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.trust.title}
          </h2>
          <p className="text-xs text-gray-400">
            {t.trust.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.trust.pillars.map((p, idx) => {
            const Icon = pillarIcons[idx % pillarIcons.length];
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/10 bg-[#0B1734] p-6 shadow-xl transition hover:border-[#C7A35A]/50 hover:bg-[#0E1E42] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A]/30 text-[#C7A35A] group-hover:scale-110 transition">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-[#C7A35A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382]">
                      {p.highlight}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-white group-hover:text-[#DFC382] transition">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.trust.verifiedStandard}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. STRATEGIC CONNECTIVITY & DISTANCE MATRIX */}
      <div className="rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block">
              {t.trust.proximityBadge}
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              {t.trust.proximityTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t.trust.proximitySub}
            </p>
          </div>

          <Link
            href="/site-visit"
            className="self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition"
          >
            {t.trust.scheduleVisitBtn}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          {t.trust.connectivity.map((cp, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-3.5 text-center space-y-1">
              <span className="text-[10px] text-gray-400 block truncate">{cp.type}</span>
              <div className="font-mono text-xl font-extrabold text-[#DFC382]">{cp.dist}</div>
              <div className="text-[11px] font-semibold text-white truncate">{cp.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. OFFICIAL STATUTORY CORPORATE GUARANTEES */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            {t.trust.reviewsBadge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {t.trust.reviewsTitle}
          </h2>
          <p className="text-xs text-gray-400">
            {t.trust.reviewsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.trust.reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#C7A35A]/60 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#DFC382]">
                    <ShieldCheck className="h-5 w-5 text-[#C7A35A]" />
                  </div>
                  <span className="rounded bg-[#C7A35A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#DFC382] border border-[#C7A35A]/30">
                    {t.trust.verifiedBuyer}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-white text-sm">
                  {rev.name}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {rev.review}
                </p>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#DFC382]">{rev.role}</div>
                  <div className="text-[10px] text-gray-400">{rev.plot}</div>
                </div>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400 border border-white/10 font-mono">
                  {rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REAL INTERACTIVE CUSTOMER & VISITOR REVIEW REGISTRY */}
      <ReviewsLiveSection />
    </div>
  );
}
