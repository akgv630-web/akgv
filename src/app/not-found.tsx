'use client';

import Link from 'next/link';
import { Home, Compass, MapPin, PhoneCall } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';

export default function NotFound() {
  const { language } = useApp();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-[#C7A35A]/30 bg-[#0B1734]/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C7A35A]/10 border border-[#C7A35A]/40 text-[#DFC382]">
          <span className="font-serif text-3xl font-bold">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-white">
            {tLang(language, 'Page Not Found', 'पृष्ठ नहीं मिला', 'Page Nahi Mila')}
          </h1>
          <p className="text-sm text-gray-400">
            {tLang(
              language,
              'The page you are looking for does not exist, has been removed, or has been relocated.',
              'आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।',
              'Aap jo page dhoondh rahe hain wo exist nahi karta ya relocate ho gaya hai.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#C7A35A] px-5 py-3 font-semibold text-xs text-[#0B1734] hover:brightness-110 transition shadow-lg shadow-[#C7A35A]/20"
          >
            <Home className="h-4 w-4" />
            <span>{tLang(language, 'Return to Home', 'मुख्य पृष्ठ पर जाएं', 'Home Page par jayein')}</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/master-plan"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#050A17] px-3 py-2.5 text-xs text-gray-300 hover:border-[#C7A35A]/50 hover:text-white transition"
            >
              <MapPin className="h-3.5 w-3.5 text-[#DFC382]" />
              <span>{tLang(language, 'Master Plan', 'मास्टर प्लान', 'Master Plan')}</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#050A17] px-3 py-2.5 text-xs text-gray-300 hover:border-[#C7A35A]/50 hover:text-white transition"
            >
              <Compass className="h-3.5 w-3.5 text-[#DFC382]" />
              <span>{tLang(language, 'Townships', 'टाउनशिप', 'Townships')}</span>
            </Link>
          </div>

          <Link
            href="/contact"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#050A17] px-4 py-2.5 text-xs text-gray-300 hover:text-white transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-[#DFC382]" />
            <span>{tLang(language, 'Contact Support', 'हेल्पलाइन से संपर्क करें', 'Support se contact karein')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
