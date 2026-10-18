'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckSquare,
  ChevronRight,
  Layers,
  Lock,
  Shield,
  Sparkles,
  User,
  Users
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { tLang } from '@/lib/i18n';

export default function DashboardDispatcherPage() {
  const router = useRouter();
  const { currentUser, tasks, language } = useApp();

  useEffect(() => {
    if (!currentUser) {
      const timer = setTimeout(() => {
        router.push('/login?redirect=/dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (currentUser.role === 'super_admin' || currentUser.role === 'sub_admin') {
        router.push('/admin');
      } else if (currentUser.role === 'senior_member' || currentUser.role === 'junior_member') {
        router.push('/member');
      } else if (currentUser.role === 'buyer') {
        router.push('/buyer');
      } else {
        router.push('/');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentUser, router]);

  const pendingTasksCount = currentUser
    ? tasks.filter((t) => !t.isCompleted).length
    : 0;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-b from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-10 text-center shadow-2xl space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C7A35A]/15 border border-[#C7A35A]/40 text-[#DFC382] shadow-lg animate-pulse">
          <Sparkles className="h-8 w-8 text-[#C7A35A]" />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-[#C7A35A]/20 px-3.5 py-1 text-xs font-bold text-[#DFC382] border border-[#C7A35A]/40">
            {tLang(language, 'AKGV Secure Dashboard Dispatcher', 'एकेजीवी सुरक्षित डैशबोर्ड डिस्पैचर', 'AKGV Secure Dashboard Dispatcher')}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {currentUser
              ? tLang(
                  language,
                  `Welcome, ${currentUser.fullName}`,
                  `स्वागत है, ${currentUser.fullName}`,
                  `Swagat hai, ${currentUser.fullName}`
                )
              : tLang(
                  language,
                  'Authenticating Your Session...',
                  'सत्र प्रमाणित हो रहा है...',
                  'Session authenticate ho raha hai...'
                )}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
            {currentUser
              ? tLang(
                  language,
                  'Connecting to your personalized dashboard and active tasks panel...',
                  'आपके व्यक्तिगत डैशबोर्ड और सक्रिय कार्य पैनल से जोड़ा जा रहा है...',
                  'Aapke personalized dashboard aur active tasks panel se connect kiya ja raha hai...'
                )
              : tLang(
                  language,
                  'Please sign in to access your confidential plots, tasks, and sales portal.',
                  'कृपया अपने गोपनीय प्लॉट, कार्य और बिक्री पोर्टल तक पहुंचने के लिए लॉगिन करें।',
                  'Kripya confidential plots, tasks aur sales portal ke liye sign in karein.'
                )}
          </p>
        </div>

        {currentUser ? (
          <div className="pt-2 space-y-3 text-left">
            <Link
              href={
                currentUser.role === 'super_admin' || currentUser.role === 'sub_admin'
                  ? '/admin?tab=tasks'
                  : '/member?tab=tasks'
              }
              className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 hover:bg-amber-500/20 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-200 transition">
                    {tLang(language, 'Daily Tasks Panel (आज के काम)', 'दैनिक कार्य डेस्क', 'Daily Tasks Panel')}
                  </h4>
                  <p className="text-xs text-gray-300">
                    {tLang(
                      language,
                      `${pendingTasksCount} tasks requiring action today`,
                      `आज ${pendingTasksCount} कार्य पूरे करने हैं`,
                      `Aaj ${pendingTasksCount} tasks complete karne hain`
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href={
                currentUser.role === 'super_admin' || currentUser.role === 'sub_admin'
                  ? '/admin'
                  : currentUser.role === 'buyer'
                  ? '/buyer'
                  : '/member'
              }
              className="flex items-center justify-between rounded-2xl border border-[#C7A35A]/40 bg-[#0B1734] p-4 hover:border-[#C7A35A] hover:bg-[#0B1734]/80 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#050A17] text-[#DFC382] border border-[#C7A35A]/40">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#DFC382] transition">
                    {currentUser.role === 'super_admin' || currentUser.role === 'sub_admin'
                      ? tLang(language, 'Open Admin Dashboard', 'एडमिन डैशबोर्ड खोलें', 'Admin Dashboard Kholein')
                      : tLang(language, 'Open Member Portal', 'सदस्य पोर्टल खोलें', 'Member Portal Kholein')}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {tLang(language, 'Manage bookings, plots, downline & commissions', 'बुकिंग, प्लॉट, डाउनलाइन व कमीशन प्रबंधित करें', 'Bookings, plots, downline aur commissions manage karein')}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#DFC382] group-hover:translate-x-1 transition" />
            </Link>
          </div>
        ) : (
          <div className="pt-2">
            <Link
              href="/login?redirect=/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-6 py-3 text-xs sm:text-sm font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Lock className="h-4 w-4" />
              <span>{tLang(language, 'Proceed to Login', 'लॉगिन करें', 'Login Karein')}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
