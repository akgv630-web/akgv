'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle2, Layers, MapPin, PhoneCall } from 'lucide-react';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
          Strategic Real Estate Corridors
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Townships & Project Locations
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          AKGV Infra City Private Limited is developing master-planned residential colonies across Rampur, Lahartara, and Mirza Murad with verified civil infrastructure.
        </p>
      </div>

      <div className="space-y-10">
        {PROJECT_LOCATIONS.map((loc, index) => (
          <div
            id={loc.slug}
            key={loc.id}
            className="overflow-hidden rounded-3xl border border-[#C7A35A]/30 bg-[#0B1734] shadow-2xl grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="relative h-64 lg:h-auto lg:col-span-5">
              <Image
                src={loc.imageUrl}
                alt={loc.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1734] via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 rounded-full bg-[#050A17]/80 px-3 py-1 text-xs font-bold text-[#DFC382] border border-[#C7A35A]/40 backdrop-blur">
                Project #{index + 1}
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#DFC382] font-semibold">
                  <MapPin className="h-4 w-4 text-[#C7A35A]" />
                  <span>{loc.city}, {loc.state}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white">{loc.name}</h2>
                <p className="text-xs font-medium text-[#C7A35A]">{loc.headline}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{loc.description}</p>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">Key Township Infrastructure:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  {loc.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1EA275] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                <Link
                  href="/master-plan"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Explore Plots on Master Plan</span>
                </Link>
                <Link
                  href={`/site-visit?location=${loc.name}`}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  <Calendar className="h-3.5 w-3.5 text-[#1EA275]" />
                  <span>Schedule Site Visit</span>
                </Link>
                <a
                  href={`tel:${COMPANY_DETAILS.phone}`}
                  className="flex items-center gap-1.5 text-xs text-[#DFC382] font-semibold hover:underline ml-auto"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-[#C7A35A]" />
                  <span>{COMPANY_DETAILS.displayPhone}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
