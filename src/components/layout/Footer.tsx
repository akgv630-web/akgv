'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { useApp } from '@/context/AppContext';

export function Footer() {
  const { language, t } = useApp();
  const c = t.footer;

  return (
    <footer className="w-full max-w-full overflow-hidden border-t border-[#C7A35A]/30 bg-[#050A17] text-gray-300">
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
              &ldquo;{t.tagline}&rdquo;
            </p>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              {c.tagline}
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-2.5 border border-white/10 text-xs">
              <Phone className="h-4 w-4 text-[#C7A35A] shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">{c.bookingLine}</span>
                <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-[#DFC382] hover:underline">
                  {COMPANY_DETAILS.displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Flagship Project Locations */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              {c.locationsTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              {PROJECT_LOCATIONS.map((loc) => {
                const localizedCity = language === 'hi' 
                  ? (loc.slug === 'rampur' ? 'रामपुर (वाराणसी)' : loc.slug === 'lahartara' ? 'लहरतारा (वाराणसी)' : 'मिर्ज़ा मुराद (वाराणसी)')
                  : loc.name;
                const localizedHeadline = language === 'hi'
                  ? (loc.slug === 'rampur' ? '30 फीट चौड़े मुख्य मार्ग के साथ गेटेड टाउनशिप' : loc.slug === 'lahartara' ? 'कैंट रेलवे स्टेशन के पास प्राइम आवासीय प्लॉट्स' : 'NH-19 एक्सप्रेसवे कॉरिडोर पर विकसित प्लॉट्स')
                  : loc.headline;

                return (
                  <li key={loc.id} className="group">
                    <Link href={`/projects#${loc.slug}`} className="flex items-start gap-2 hover:text-[#DFC382] transition">
                      <MapPin className="h-3.5 w-3.5 text-[#C7A35A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block group-hover:text-[#DFC382]">{localizedCity}</span>
                        <span className="text-gray-400 text-[11px]">{localizedHeadline}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Quick Portals & Tools */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              {c.portalsTitle}
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/master-plan" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.masterPlanLink}
                </Link>
              </li>
              <li>
                <Link href="/house-viewer-3d" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.houseViewerLink}
                </Link>
              </li>
              <li>
                <Link href="/rewards-plan" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.rewardsLink}
                </Link>
              </li>
              <li>
                <Link href="/joining-kit" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.joiningKitLink}
                </Link>
              </li>
              <li>
                <Link href="/buyer" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.buyerPortalLink}
                </Link>
              </li>
              <li>
                <Link href="/member" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.memberPortalLink}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <span className="text-[#C7A35A]">▸</span> {c.adminPortalLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal Policies */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-white border-b border-[#C7A35A]/30 pb-2">
              {c.complianceTitle}
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> {language === 'hi' ? 'हमारे बारे में' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'FAQs'}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> {c.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> {c.termsConditions}
                </Link>
              </li>
              <li>
                <Link href="/booking-policy" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> {c.bookingPolicy}
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-[#DFC382] transition flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {c.grievanceSupport}
                </Link>
              </li>
            </ul>

            <div className="mt-5 rounded-lg border border-[#C7A35A]/30 bg-[#0B1734] p-2.5 text-[11px] text-gray-300">
              <span className="font-semibold text-[#DFC382] block">{c.blueprintRefTitle}</span>
              {c.blueprintRefText}
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 pb-16 sm:pb-0 text-center text-xs text-gray-400">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong className="text-gray-300">{language === 'hi' ? 'अस्वीकरण:' : language === 'hinglish' ? 'Disclaimer:' : 'Disclaimer:'}</strong> {c.disclaimer}
          </p>
          <p className="mt-4 text-gray-300">
            © 2026 {COMPANY_DETAILS.legalName}. {c.allRights}
          </p>
        </div>
      </div>
    </footer>
  );
}
