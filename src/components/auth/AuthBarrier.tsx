'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Home,
  KeyRound
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useApp } from '@/context/AppContext';

interface AuthBarrierProps {
  requiredRole?: 'admin' | 'member' | 'buyer';
}

export function AuthBarrier({ requiredRole = 'admin' }: AuthBarrierProps) {
  const { language } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const roleText =
    requiredRole === 'admin'
      ? { en: 'Super Admin / Sub Admin Control Centre', hi: 'प्रशासनिक नियंत्रण केंद्र (Admin Portal)' }
      : requiredRole === 'member'
      ? { en: 'Associate & Team Management Dashboard', hi: 'एसोसिएट एवं टीम प्रबंधन डैशबोर्ड (Member Portal)' }
      : { en: 'Buyer & Investor Client Portal', hi: 'क्रेता एवं निवेशक पोर्टल (Buyer Portal)' };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C7A35A]/20 to-[#9E7E36]/10 border border-[#C7A35A]/40 text-[#DFC382] shadow-inner">
          <Lock className="h-8 w-8 text-[#C7A35A]" />
        </div>

        <span className="mt-4 inline-block rounded-full border border-[#C7A35A]/30 bg-[#C7A35A]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#DFC382]">
          Authentication Required / प्रमाणीकरण आवश्यक
        </span>

        <h2 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-white">
          {language === 'hi' ? roleText.hi : roleText.en}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
          {language === 'hi'
            ? 'इस सुरक्षित पोर्टल को देखने के लिए कृपया अपने अधिकृत ईमेल, मोबाइल नंबर या सदस्य आईडी और पासवर्ड से लॉगिन करें।'
            : language === 'hinglish'
            ? 'Is private portal ko access karne ke liye kripya apne registered email, mobile number aur password se login karein.'
            : 'Access to this portal is restricted. Please sign in with your verified credentials to access authorized records.'}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-3 text-xs sm:text-sm font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <KeyRound className="h-4 w-4" />
            <span>{language === 'hi' ? 'लॉगिन करें' : 'Sign In Now'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            <Home className="h-4 w-4" />
            <span>{language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
          </Link>
        </div>
      </div>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function UnauthorizedBarrier({
  currentRole,
  requiredRole,
}: {
  currentRole: string;
  requiredRole: string;
}) {
  const { language } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#140810] to-[#070D1E] p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <span className="mt-4 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
          Access Restricted / अनधिकृत प्रवेश
        </span>

        <h2 className="mt-2 font-serif text-xl font-bold text-white">
          {language === 'hi' ? 'अनुमति अस्वीकृत' : 'Permission Denied'}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
          {language === 'hi'
            ? `आप वर्तमान में ${currentRole} के रूप में लॉगिन हैं। इस पृष्ठ को देखने के लिए ${requiredRole} भूमिका आवश्यक है।`
            : `You are logged in with role "${currentRole}". This dashboard requires "${requiredRole}" authorization.`}
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
