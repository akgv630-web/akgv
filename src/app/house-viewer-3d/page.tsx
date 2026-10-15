'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Box, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const HouseViewer3D = dynamic(
  () => import('@/components/3d/HouseViewer3D').then((mod) => mod.HouseViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#050A17] text-center p-8">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#C7A35A] border-t-transparent" />
        <p className="font-serif text-lg font-bold text-[#DFC382]">Initializing 3D Villa Studio...</p>
        <p className="text-xs text-gray-400">Loading WebGL architectural viewport and materials</p>
      </div>
    ),
  }
);

export default function HouseViewerPage() {
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-[#070D1D] text-white">
      {/* Studio Header Bar */}
      <div className="border-b border-white/10 bg-[#0B1734]/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/master-plan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-[#C7A35A] hover:text-[#DFC382]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{language === 'hi' ? 'मास्टर प्लान' : language === 'hinglish' ? 'Master Plan' : 'Master Plan'}</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-[#C7A35A]" />
              <h1 className="font-serif text-sm font-bold text-white sm:text-base">
                {language === 'hi'
                  ? '3D विला आर्किटेक्चरल स्टूडियो'
                  : language === 'hinglish'
                  ? '3D Villa Architectural Studio'
                  : '3D Villa Architectural Studio'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Interactive 3D WebGL</span>
            </span>
            <span className="hidden text-xs text-gray-400 sm:inline">
              AKGV Infra City • Rampur, Varanasi
            </span>
          </div>
        </div>
      </div>

      {/* 3D Studio Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <HouseViewer3D />
      </div>
    </div>
  );
}
