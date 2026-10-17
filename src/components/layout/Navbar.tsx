'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Calendar,
  ChevronDown,
  Globe,
  Home,
  Info,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Menu,
  PhoneCall,
  ShieldCheck,
  Trophy,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMPANY_DETAILS } from '@/data/groundTruth';
import { UserRole } from '@/types';
import { tLang } from '@/lib/i18n';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t, currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/projects', label: t.nav.projects, icon: MapPin },
    { href: '/master-plan', label: t.nav.masterPlan, icon: Layers },
    { href: '/house-viewer-3d', label: t.nav.villa3d, icon: Box },
    { href: '/site-visit', label: t.nav.siteVisit, icon: Calendar },
    { href: '/rewards-plan', label: t.nav.rewards, icon: Trophy },
    { href: '/joining-kit', label: t.nav.joiningKit, icon: ShieldCheck },
    { href: '/about', label: t.nav.about, icon: Info },
  ];

  const roleLabels: Record<UserRole, string> = {
    super_admin: t.nav.roleLabels.super_admin,
    sub_admin: t.nav.roleLabels.sub_admin,
    senior_member: t.nav.roleLabels.senior_member,
    junior_member: t.nav.roleLabels.junior_member,
    buyer: t.nav.roleLabels.buyer,
  };

  const getDashboardPath = (role?: UserRole) => {
    if (!role) return '/member';
    if (role === 'super_admin' || role === 'sub_admin') return '/admin';
    if (role === 'senior_member' || role === 'junior_member') return '/member';
    return '/buyer';
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-full border-b border-[#C7A35A]/30 bg-[#0B1734]/95 backdrop-blur-md">
      {/* Top Luxury Banner */}
      <div className="hidden border-b border-white/5 bg-[#050A17] px-4 py-1.5 text-xs text-[#DFC382] sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded bg-[#146B4D]/30 px-2 py-0.5 font-medium text-[#1EA275] border border-[#146B4D]/50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1EA275] animate-pulse"></span>
              {tLang(language, COMPANY_DETAILS.taglineEn, COMPANY_DETAILS.taglineHi, 'Jahan Sapne Paate Hain Apna Address')}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">
              {tLang(language, 'Rampur • Lahartara • Mirza Murad (Varanasi, UP)', 'रामपुर • लहरतारा • मिर्ज़ा मुराद (वाराणसी, उ.प्र.)', 'Rampur • Lahartara • Mirza Murad (Varanasi, UP)')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="flex items-center gap-1.5 font-medium text-[#DFC382] transition hover:text-white"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#C7A35A]" />
              <span>{COMPANY_DETAILS.displayPhone}</span>
            </a>
            <span className="text-gray-600">|</span>
            {/* Multi-language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-[#DFC382] transition"
              >
                <Globe className="h-3.5 w-3.5 text-[#C7A35A]" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-[#C7A35A]/30 bg-[#0B1734] p-1.5 shadow-xl z-50">
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full rounded px-2.5 py-1 text-left text-xs ${language === 'en' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'text-gray-200 hover:bg-white/5'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                    className={`w-full rounded px-2.5 py-1 text-left text-xs ${language === 'hi' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'text-gray-200 hover:bg-white/5'}`}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => { setLanguage('hinglish'); setLangDropdownOpen(false); }}
                    className={`w-full rounded px-2.5 py-1 text-left text-xs ${language === 'hinglish' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'text-gray-200 hover:bg-white/5'}`}
                  >
                    Hinglish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1734] to-[#050A17] border border-[#C7A35A]/50 shadow-md group-hover:border-[#C7A35A] transition">
            <div className="flex flex-col items-center justify-center text-[#C7A35A] font-bold">
              <span className="text-xs leading-none tracking-widest font-serif">AKGV</span>
              <span className="text-[9px] text-[#1EA275] leading-none">INFRA</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-white">AKGV</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#C7A35A]">INFRA CITY</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-wider hidden xs:block">PRIVATE LIMITED</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#C7A35A]/15 text-[#DFC382] border border-[#C7A35A]/40'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#C7A35A]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden items-center gap-3 sm:flex">
          {currentUser ? (
            <>
              {/* Active Account Status Pill */}
              <Link
                href={getDashboardPath(currentUser.role)}
                className="flex items-center gap-2 rounded-lg border border-[#C7A35A]/40 bg-[#050A17] px-3 py-1.5 text-xs text-gray-200 shadow-sm hover:border-[#C7A35A] transition"
                title={`Signed in as ${currentUser.fullName}`}
              >
                <div className="h-2 w-2 rounded-full bg-[#1EA275]" />
                <span className="text-gray-400">{t.nav.account}:</span>
                <span className="font-semibold text-[#DFC382]">{roleLabels[currentUser.role]}</span>
              </Link>

              {/* Go To Portal Button */}
              <Link
                href={getDashboardPath(currentUser.role)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-4 py-2 text-xs font-bold text-[#0B1734] shadow-md transition hover:brightness-110 active:scale-95"
              >
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="h-4 w-4 rounded-full object-cover border border-[#0B1734]"
                  />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span>{t.nav.dashboard}</span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                title={t.nav.signOut}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/20 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/40 hover:text-white transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{t.nav.signOut}</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-4 py-2 text-xs font-bold text-[#0B1734] shadow-md transition hover:brightness-110 active:scale-95"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{t.nav.portalLogin}</span>
            </Link>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          {currentUser ? (
            <Link
              href={getDashboardPath(currentUser.role)}
              className="flex items-center gap-1 rounded-lg bg-[#C7A35A] px-2.5 py-1 text-xs font-bold text-[#0B1734]"
            >
              <User className="h-3 w-3" />
              <span>{t.nav.dashboard}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-2.5 py-1 text-xs font-bold text-[#0B1734]"
            >
              <Lock className="h-3 w-3" />
              <span>{t.nav.portalLogin}</span>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 p-1.5 text-gray-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0B1734] px-4 py-4 lg:hidden max-h-[85vh] overflow-y-auto shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-[#C7A35A]"
                >
                  <Icon className="h-4 w-4 text-[#C7A35A]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {currentUser ? (
            <div className="mt-4 rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.fullName}</p>
                  <p className="text-[10px] text-[#DFC382]">{roleLabels[currentUser.role]}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/30 px-2 py-1 text-[11px] text-red-300"
                >
                  <LogOut className="h-3 w-3" />
                  <span>{t.nav.signOut}</span>
                </button>
              </div>
              <Link
                href={getDashboardPath(currentUser.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2 text-xs font-bold text-[#0B1734]"
              >
                <User className="h-3.5 w-3.5" />
                <span>{t.nav.dashboard}</span>
              </Link>
            </div>
          ) : (
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 text-xs font-bold text-[#0B1734] shadow-md"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{t.nav.portalLogin}</span>
              </Link>
            </div>
          )}

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-2 text-xs font-medium text-gray-400">
              {tLang(language, 'Language:', 'भाषा:', 'Language:')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`rounded py-1.5 text-xs ${language === 'en' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'bg-white/5 text-gray-300'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`rounded py-1.5 text-xs ${language === 'hi' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'bg-white/5 text-gray-300'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('hinglish')}
                className={`rounded py-1.5 text-xs ${language === 'hinglish' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'bg-white/5 text-gray-300'}`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>
      )}

      </header>
    </>
  );
}
