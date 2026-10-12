'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';

import { useApp } from '@/context/AppContext';

export function Footer() {
  const { language } = useApp();

  return (
    <footer className="border-t border-[#C7A35A]/30 bg-[#050A17] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1734] border border-[#C7A35A]">
                <span className="font-serif font-bold text-xs text-[#C7A35A]">AKGV</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-wider">AKGV</span>{' '}
                <span className="text-sm font-semibold text-[#C7A35A]">INFRA CITY</span>
                <p className="text-[10px] text-gray-400">PRIVATE LIMITED</p>
              </div>
            </div>
            <p className="mt-4 text-xs italic text-[#DFC382]">
              &ldquo;{language === 'hi' ? COMPANY_DETAILS.taglineHi : COMPANY_DETAILS.taglineEn}&rdquo;
            </p>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Leading township developers delivering planned residential colonies with 30ft and 25ft wide roads, underground electrification, and transparent registry readiness in Uttar Pradesh.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-2.5 border border-white/10 text-xs">
              <Phone className="h-4 w-4 text-[#C7A35A] shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">Official Booking Line</span>
                <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-[#DFC382] hover:underline">
                  {COMPANY_DETAILS.displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Flagship Project Locations */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              Project Locations
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              {PROJECT_LOCATIONS.map((loc) => (
                <li key={loc.id} className="group">
                  <Link href={`/projects#${loc.slug}`} className="flex items-start gap-2 hover:text-[#DFC382] transition">
                    <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block group-hover:text-[#DFC382]">{loc.name}</span>
                      <span className="text-gray-400 text-[11px]">{loc.headline}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Portals & Tools */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              Portals & Tools
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/master-plan" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Interactive Master Plan
                </Link>
              </li>
              <li>
                <Link href="/house-viewer-3d" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Interactive 3D House Viewer
                </Link>
              </li>
              <li>
                <Link href="/rewards-plan" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Level Commission & Rewards
                </Link>
              </li>
              <li>
                <Link href="/joining-kit" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Offline Joining Kit (₹999 Cash)
                </Link>
              </li>
              <li>
                <Link href="/buyer" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Buyer Portal & Booking Status
                </Link>
              </li>
              <li>
                <Link href="/member" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Member Hierarchy & Digital ID
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> Super Admin Control Centre
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal Policies */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              Compliance & Policies
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/booking-policy" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> Booking & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> Grievance & Customer Support
                </Link>
              </li>
            </ul>

            <div className="mt-5 rounded-lg border border-[#C7A35A]/30 bg-[#0B1734] p-2.5 text-[11px] text-gray-300">
              <span className="font-semibold text-[#DFC382] block">Verified Blueprint Reference</span>
              Layout Plan of A.K.G.V. Infraa City Varanasi designed by Er. Rajesh Kumar Patel (R.P. Home Design).
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong className="text-gray-300">Disclaimer:</strong> The company name displayed on this platform is AKGV Infra City Private Limited, subject to confirmation against official company registration records. Plot layouts, prices, 3D house renders, and commission structures reflect official company brochures. 3D models are conceptual visualizations and do not replace statutory architectural clearances.
          </p>
          <p className="mt-4 text-gray-300">
            © 2026 AKGV Infra City Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
