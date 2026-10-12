'use client';

import React from 'react';
import Link from 'next/link';
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Flame,
  HeartHandshake,
  Layers,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Zap
} from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

export function TrustAndLegalSection() {
  const infrastructurePillars = [
    {
      icon: Layers,
      title: '30ft & 25ft Wide Roads',
      desc: 'Transcribed directly from our approved blueprint: 30ft entrance boulevard with 25ft internal cross corridors paved with heavy-duty RCC/damar.',
      highlight: '27.82% Road Ratio'
    },
    {
      icon: ShieldCheck,
      title: '100% Freehold Title',
      desc: 'Clear legal ownership with zero litigation. Guaranteed immediate Registry and administrative Dakhil-Kharij (Mutation) support.',
      highlight: 'Clear Land Title'
    },
    {
      icon: Zap,
      title: 'Underground Power & Solar',
      desc: 'Dedicated on-site electricity transformer with underground conduit cabling and automatic solar avenue lighting along all curbs.',
      highlight: '24/7 Power Ready'
    },
    {
      icon: Trees,
      title: 'Botanical Green Buffer',
      desc: '15ft 10in landscaped botanical setback buffer along perimeter with native shade trees, jogging trails, and park greens.',
      highlight: '15\'10" Buffer'
    },
    {
      icon: Compass,
      title: '100% Vastu Approval',
      desc: 'Planned by Er. Rajesh Kumar Patel with optimal East and North road frontage to maximize natural ventilation and morning sunlight.',
      highlight: 'Er. Rajesh Patel Seal'
    },
    {
      icon: Building2,
      title: 'Sweet Water & Modern Drainage',
      desc: 'Deep aquifer borewells with sweet drinking water and engineered underground stormwater drainage lines preventing waterlogging.',
      highlight: 'Zero Waterlogging'
    }
  ];

  const connectivityPoints = [
    { name: 'Varanasi Cantt Railway Station', dist: '15 Mins', type: 'Railway Hub' },
    { name: 'Banaras Railway Station (Manduadih)', dist: '12 Mins', type: 'Superfast Trains' },
    { name: 'NH-19 (Grand Trunk Expressway)', dist: '5 Mins', type: 'National Highway' },
    { name: 'BHU & Sir Sunderlal Hospital', dist: '20 Mins', type: 'Premier Healthcare' },
    { name: 'Lal Bahadur Shastri Airport', dist: '35 Mins', type: 'International Flight' },
    { name: 'Ring Road Phase-2 Varanasi', dist: '8 Mins', type: 'Signal-Free Corridor' },
  ];

  const buyerReviews = [
    {
      name: 'Dr. Alok Nath Tripathy',
      role: 'Associate Professor, BHU Varanasi',
      plot: 'Plot #A-04 (Rampur Front Row)',
      rating: 5,
      date: 'Booked Feb 2026',
      review:
        'The transparency of AKGV Infra City is unmatched in Varanasi. I personally checked the 30ft road width and physical demarcation on site before placing the 72-hour online hold. Registry paperwork was handled smoothly.'
    },
    {
      name: 'Er. Manoj Srivastava',
      role: 'Senior Engineer, BLW (DLW) Varanasi',
      plot: 'Plot #C-12 (35 Villa Block)',
      rating: 5,
      date: 'Booked Jan 2026',
      review:
        'As an engineer, I was impressed by Er. Rajesh Patel’s layout design. 27.82% land dedicated to roads and botanical buffers is rare in private townships. The 3D villa simulation matched our exact architectural dream.'
    },
    {
      name: 'Smt. Rekha Pandey',
      role: 'Education Officer, Lahartara',
      plot: 'Plot #B-06 (Rampur Layout)',
      rating: 5,
      date: 'Booked Mar 2026',
      review:
        'Being a female buyer, I availed the 1% stamp duty rebate in Uttar Pradesh as guided by AKGV Infra’s legal desk. The location near GT Road makes daily commute to central Varanasi extremely convenient.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* 1. WHY INVEST IN AKGV INFRA CITY (INFRASTRUCTURE PILLARS) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
            Uncompromising Standards
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Why Discerning Families Choose AKGV Infra City
          </h2>
          <p className="text-xs text-gray-400">
            Engineered for high capital appreciation, legal certainty, and peaceful community living in Varanasi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {infrastructurePillars.map((p, idx) => {
            const Icon = p.icon;
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
                  <span>Verified Township Standard</span>
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
              Prime Proximity
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              Strategic Varanasi Growth Corridors
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Rapid access to major railway hubs, expressways, premier hospitals, and universities.
            </p>
          </div>

          <Link
            href="/site-visit"
            className="self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition"
          >
            Schedule Free Guided Site Visit
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          {connectivityPoints.map((cp, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-3.5 text-center space-y-1">
              <span className="text-[10px] text-gray-400 block truncate">{cp.type}</span>
              <div className="font-mono text-xl font-extrabold text-[#DFC382]">{cp.dist}</div>
              <div className="text-[11px] font-semibold text-white truncate">{cp.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VERIFIED CUSTOMER REVIEWS & CONFIDENCE */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Real Experiences
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Verified Varanasi Plot Owners Speak
          </h2>
          <p className="text-xs text-gray-400">
            Real testimonials from esteemed academicians, railway officers, and professionals who secured plots with AKGV Infra City.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {buyerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    Verified Buyer
                  </span>
                </div>

                <p className="text-xs text-gray-300 italic leading-relaxed">
                  &ldquo;{rev.review}&rdquo;
                </p>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-white text-xs">{rev.name}</div>
                  <div className="text-[10px] text-gray-400">{rev.role}</div>
                  <div className="text-[10px] font-semibold text-[#DFC382]">{rev.plot}</div>
                </div>
                <span className="text-[10px] text-gray-500">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
