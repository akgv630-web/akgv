'use client';

import React from 'react';
import Link from 'next/link';
import {
  Award,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Layers,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS, PROJECT_LOCATIONS } from '@/data/groundTruth';
import { tLang } from '@/lib/i18n';

export default function AboutPage() {
  const { language } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 space-y-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#0B1734] via-[#050A17] to-[#0B1734] p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-3.5 py-1 text-xs font-semibold text-[#DFC382]">
            <Sparkles className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>
              {tLang(language, 'Premier Residential Plotted Township Developer', 'वाराणसी का प्रतिष्ठित आवासीय टाउनशिप विकासक', 'Premier Residential Plotted Township Developer')}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {tLang(language, 'AKGV Infra City Private Limited', 'एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड', 'AKGV Infra City Private Limited')}
          </h1>

          <p className="font-serif text-base sm:text-lg italic text-[#DFC382]">
            &ldquo;{tLang(language, COMPANY_DETAILS.taglineEn, COMPANY_DETAILS.taglineHi, 'Jahan Sapne Paate Hain Apna Address')}&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {tLang(
              language,
              'AKGV Infra City Private Limited is dedicated to developing world-class, legally demarcated, clear-title residential townships across Varanasi, Uttar Pradesh. Equipped with 30ft asphalt entrance boulevards, 25ft internal avenues, underground drainage, transformers, and immediate registry.',
              'एकेजीवी इन्फ्रा सिटी वाराणसी और पूर्वांचल में सुव्यवस्थित, कानूनी रूप से वैध और स्पष्ट स्वामित्व वाले आवासीय प्लॉट्स का विकास एवं विक्रय करती है। हमारे टाउनशिप प्रोजेक्ट्स 30 फीट चौड़े मुख्य मार्ग, 25 फीट आंतरिक सड़कों, भूमिगत जल निकासी, विद्युत ट्रांसफार्मर और हरित परिवेश के साथ विकसित किए जाते हैं।',
              'AKGV Infra City Varanasi aur Purvanchal me suvyavasthit, legally verified aur clear-title residential plots ka vikas aur bikri karti hai. Hamare projects 30ft wide main entrance, 25ft internal roads, drainage, transformer aur immediate registry ke saath aate hain.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4 text-xs">
            <Link
              href="/projects"
              className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-3 font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              {tLang(language, 'Explore Township Locations', 'टाउनशिप लोकेशन्स देखें', 'Township Locations Dekhein')}
            </Link>
            <Link
              href="/master-plan"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              {tLang(language, 'Master Layout Plan', 'मास्टर लेआउट प्लान', 'Master Layout Plan')}
            </Link>
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-5 py-3 font-semibold text-emerald-300 hover:bg-emerald-950/40 transition flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>{COMPANY_DETAILS.displayPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Crucial Statutory Clarification Box */}
      <div className="rounded-3xl border-2 border-[#C7A35A] bg-[#050A17] p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B1734] border border-[#C7A35A] text-[#C7A35A]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <h2 className="font-serif text-lg font-bold text-[#DFC382]">
              {tLang(
                language,
                'Statutory Notice: Plotted Land Sales Only (No House Construction)',
                'वैधानिक स्पष्टीकरण: कंपनी केवल प्लॉट्स विक्रय करती है (मकान निर्माण नहीं)',
                'Statutory Notice: Company Sirf Approved Plots Sell Karti Hai (House Construction Nahi)'
              )}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {tLang(
                language,
                'AKGV Infra City Private Limited develops, demarcates, and sells approved residential plots. The company does NOT construct houses or buildings. All 3D elevations and villa designs displayed on the platform are provided solely as architectural and structural guidance for buyers planning their own homes.',
                'एकेजीवी इन्फ्रा सिटी प्राइवेट लिमिटेड पूरी तरह से अनुमोदित आवासीय भूखंडों (Residential Plots) के विकास एवं रजिस्ट्री में कार्यरत है। कंपनी स्वयं मकान या बिल्डिंग निर्माण का कार्य नहीं करती है। वेबसाइट पर दिखाए गए 3डी एलिवेशन एवं विला मॉडल केवल आपके खरीदे गए प्लॉट पर भविष्य के वास्तुशिल्प मार्गदर्शन (Architectural Guidance) के लिए प्रस्तुत किए गए हैं।',
                'AKGV Infra City Private Limited fully approved residential plots develop aur sell karti hai. Company khud ghar ya building construction ka contract nahi karti. Platform par dikhaye gaye 3D villa designs sirf architectural layout guidance ke purpose se hain.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Development */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#050A17] border border-[#C7A35A]/50 text-[#C7A35A]">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-white">
            {tLang(language, '30ft & 25ft Wide Roads', '30 फीट व 25 फीट चौड़े मार्ग', '30ft & 25ft Wide Roads')}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {tLang(
              language,
              'Engineered with 30ft wide entrance boulevards and 25ft internal avenues allowing seamless dual four-wheeler movement.',
              'प्रत्येक प्रोजेक्ट में 30-0" चौड़े मुख्य प्रवेश द्वार और 25-0" चौड़े आंतरिक रास्ते तैयार किए जाते हैं, जिससे दो चारपहिया वाहन सरलता से निकल सकें।',
              'Har project me 30ft wide entrance aur 25ft internal roads engineered hain jisse dono side vehicles aaram se nikal sakein.'
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#050A17] border border-emerald-500/50 text-emerald-400">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-white">
            {tLang(language, 'Immediate Registry & Mutation', 'तत्काल रजिस्ट्री व दाखिल खारिज', 'Immediate Registry Aur Dakhil Kharij')}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {tLang(
              language,
              '100% clear-title, dispute-free freehold land parcels ready for immediate official deed registration and municipal mutation.',
              '100% विवाद-रहित दाखिल-खारिज योग्य भूमि। टोकन और पूर्ण भुगतान के साथ ही विधिक रजिस्ट्री की सुविधा उपलब्ध।',
              '100% dispute-free dakhil-kharij yogya zameen. Token aur full payment ke saath turant registry facility.'
            )}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#050A17] border border-[#DFC382]/50 text-[#DFC382]">
            <Building className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-white">
            {tLang(language, 'Drainage, Power & Potable Water', 'नाली, बिजली व जल आपूर्ति', 'Drainage, Power Aur Water Supply')}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {tLang(
              language,
              'Full infrastructure including underground drainage lines, dedicated electrical transformers, street lighting, and water supply.',
              'भूमिगत सीवेज, समर्पित विद्युत ट्रांसफार्मर, एलईडी स्ट्रीट लाइट और प्रत्येक प्लॉट तक शुद्ध पेयजल पाइपलाइन की सुविधा।',
              'Underground drainage, dedicated transformer, LED street lights aur water pipeline ki poori suvidha.'
            )}
          </p>
        </div>
      </div>

      {/* Regional Branch Offices */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7A35A]/40 bg-[#0B1734] px-3 py-1 text-xs font-semibold text-[#DFC382]">
            <Building className="h-3.5 w-3.5 text-[#C7A35A]" />
            <span>{tLang(language, 'Branch Office Network', 'शाखा कार्यालय नेटवर्क', 'Branch Office Network')}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {tLang(language, 'Our 3 Regional Branch Offices in Varanasi', 'वाराणसी में हमारे 3 शाखा कार्यालय', 'Varanasi Me Hamare 3 Branch Offices')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {tLang(
              language,
              'Visit our nearest branch office for authenticated plot documentation, registry consultation, and site visit departures.',
              'प्लॉट बुकिंग परामर्श, मूल दस्तावेज़ जांच और साइट विजिट सुविधा के लिए हमारी निकटतम शाखा पर पधारें।',
              'Plot booking guidance, original document check aur site visit ke liye hamari nearest branch par visit karein.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECT_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="rounded-3xl border border-[#C7A35A]/30 bg-[#0B1734] overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#DFC382] font-semibold text-xs">
                    <MapPin className="h-4 w-4 text-[#C7A35A]" />
                    <span>{loc.city}, {loc.state}</span>
                  </div>
                  <span className="rounded-full bg-[#146B4D]/30 border border-[#146B4D]/60 px-2.5 py-0.5 text-[10px] font-bold text-[#1EA275]">
                    {tLang(language, 'Branch Office', 'शाखा कार्यालय', 'Branch Office')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{loc.name}</h3>
                  <p className="text-xs text-[#DFC382] font-medium mt-0.5">{loc.headline}</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2">{loc.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1EA275] shrink-0 mt-0.5" />
                    <span>{loc.address || loc.roadConnectivity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Clock className="h-3.5 w-3.5 text-[#C7A35A] shrink-0" />
                    <span>{loc.workingHours || '9:30 AM – 6:30 PM (Mon – Sat)'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-4 bg-[#050A17] flex items-center justify-between gap-3">
                <a
                  href={`tel:${COMPANY_DETAILS.phone}`}
                  className="flex-1 text-center rounded-xl bg-white/5 py-2 font-bold text-xs text-[#DFC382] hover:bg-white/10 transition"
                >
                  {COMPANY_DETAILS.displayPhone}
                </a>
                <Link
                  href={`/site-visit?location=${encodeURIComponent(loc.name)}`}
                  className="flex-1 text-center rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2 font-bold text-xs text-[#0B1734] hover:brightness-110 transition"
                >
                  {tLang(language, 'Book Visit', 'विजिट बुक करें', 'Visit Book Karein')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Planning & Architect Credit */}
      <div className="rounded-3xl border border-[#C7A35A]/30 bg-[#050A17] p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-[#C7A35A]" />
          <div>
            <h3 className="font-serif text-base font-bold text-white">
              {tLang(language, 'Township Layout & Blueprint Architecture', 'टाउनशिप लेआउट एवं वास्तुशिल्प योजना', 'Township Layout & Blueprint Architecture')}
            </h3>
            <p className="text-xs text-gray-400">
              Approved Scale 1:500 • Area 77,550 Sq.Ft. • Er. Rajesh Kumar Patel (R.P. Home Design)
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {tLang(
            language,
            'The Rampur, Lahartara, and Mirza Murad master plans were meticulously surveyed and transcribed by experienced civil planning engineers ensuring accurate Vastu-oriented plot orientations, optimal turning radiuses for fire safety, and direct boulevard access for all corner plots.',
            'रामपुर, लहरतारा और मिर्ज़ा मुराद के मास्टर प्लान अनुभवी सिविल एवं टाउन प्लानिंग इंजीनियरों द्वारा सटीक वास्तु दिशा, सुरक्षा टर्निंग रेडियस और कॉर्नर प्लॉट्स तक सीधी पहुँच को ध्यान में रखकर तैयार किए गए हैं।',
            'Rampur, Lahartara aur Mirza Murad ke master plans experienced civil engineers dwara accurate Vastu orientation aur smooth fire safety turning radius ke saath plan kiye gaye hain.'
          )}
        </p>
      </div>

      {/* Official Contact Desk */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-8 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-white">
          {tLang(language, 'Schedule a Guided Site Visit Today', 'साइट विजिट बुक करें अथवा जानकारी प्राप्त करें', 'Schedule Karein Guided Site Visit')}
        </h3>
        <p className="text-xs text-gray-300 max-w-lg mx-auto">
          {tLang(
            language,
            'Our team provides private four-wheeler pickup from Varanasi Cantt Station or Babatpur Airport for escorted plot tours.',
            'हमारी टीम वाराणसी कैंट स्टेशन या बाबतपुर एयरपोर्ट से निजी वाहन द्वारा निःशुल्क साइट विजिट प्रदान करती है।',
            'Hamari team Varanasi Cantt station ya Babatpur airport se personal car se free site visit provide karti hai.'
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={`tel:${COMPANY_DETAILS.phone}`}
            className="rounded-xl bg-[#C7A35A] px-6 py-3 font-bold text-xs text-[#0B1734] shadow-md hover:brightness-110 transition"
          >
            {tLang(language, `Call Helpline: ${COMPANY_DETAILS.displayPhone}`, `हेल्पलाइन: ${COMPANY_DETAILS.displayPhone}`, `Call Helpline: ${COMPANY_DETAILS.displayPhone}`)}
          </a>
          <a
            href="mailto:akgvinfacity@gmail.com"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-xs text-white hover:bg-white/10 transition"
          >
            {tLang(language, 'Email: akgvinfacity@gmail.com', 'ईमेल: akgvinfacity@gmail.com', 'Email: akgvinfacity@gmail.com')}
          </a>
          <Link
            href="/contact"
            className="rounded-xl border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-6 py-3 font-semibold text-xs text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
          >
            {tLang(language, 'Contact Office', 'कार्यालय से संपर्क करें', 'Contact Office')}
          </Link>
        </div>
      </div>
    </div>
  );
}
