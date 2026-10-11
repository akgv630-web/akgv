'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  Globe,
  Home,
  Layers,
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

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t, currentUser, switchUserRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/projects', label: t.nav.projects, icon: MapPin },
    { href: '/master-plan', label: t.nav.masterPlan, icon: Layers },
    { href: '/house-viewer-3d', label: t.nav.houseViewer3d, icon: Building2 },
    { href: '/rewards-plan', label: t.nav.rewards, icon: Trophy },
    { href: '/joining-kit', label: t.nav.joiningKit, icon: ShieldCheck },
  ];

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    sub_admin: 'Sub-Admin',
    senior_member: 'Senior Member',
    junior_member: 'Junior Member',
    buyer: 'Buyer / Customer',
  };

  const getDashboardPath = (role: UserRole) => {
    if (role === 'super_admin' || role === 'sub_admin') return '/admin';
    if (role === 'senior_member' || role === 'junior_member') return '/member';
    return '/buyer';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#C7A35A]/30 bg-[#0B1734]/95 backdrop-blur-md">
      {/* Top Luxury Banner */}
      <div className="hidden border-b border-white/5 bg-[#050A17] px-4 py-1.5 text-xs text-[#DFC382] sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded bg-[#146B4D]/30 px-2 py-0.5 font-medium text-[#1EA275] border border-[#146B4D]/50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1EA275] animate-pulse"></span>
              {COMPANY_DETAILS.taglineEn}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Rampur • Lahartara • Mirza Murad (Varanasi, UP)</span>
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
                    हिंदी (Hindi)
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
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-wider text-white">AKGV</span>
              <span className="text-sm font-semibold tracking-wider text-[#C7A35A]">INFRA CITY</span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider">PRIVATE LIMITED</p>
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
          {/* Active Role Simulator Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#C7A35A]/40 bg-[#050A17] px-3 py-1.5 text-xs text-gray-200 shadow-sm hover:border-[#C7A35A] transition"
              title="Test multi-role permissions"
            >
              <div className="h-2 w-2 rounded-full bg-[#1EA275]"></div>
              <span className="text-gray-400">Role:</span>
              <span className="font-semibold text-[#DFC382]">{roleLabels[currentUser.role]}</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[#C7A35A]/30 bg-[#0B1734] p-2 shadow-2xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </div>
                {(['super_admin', 'senior_member', 'junior_member', 'buyer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchUserRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      currentUser.role === r
                        ? 'bg-[#C7A35A] text-[#0B1734] font-bold'
                        : 'text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{roleLabels[r]}</span>
                    {currentUser.role === r && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Go To Portal Button */}
          <Link
            href={getDashboardPath(currentUser.role)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-4 py-2 text-xs font-bold text-[#0B1734] shadow-md transition hover:brightness-110 active:scale-95"
          >
            <User className="h-3.5 w-3.5" />
            <span>Open Dashboard</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={getDashboardPath(currentUser.role)}
            className="rounded-lg bg-[#C7A35A] px-2.5 py-1.5 text-xs font-bold text-[#0B1734]"
          >
            Dashboard
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 p-2 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0B1734] px-4 py-4 lg:hidden">
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

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-2 text-xs font-medium text-gray-400">Language:</div>
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
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('hinglish')}
                className={`rounded py-1.5 text-xs ${language === 'hinglish' ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'bg-white/5 text-gray-300'}`}
              >
                Hinglish
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="text-xs font-medium text-gray-400">Active Role (Demo):</div>
            <div className="grid grid-cols-2 gap-2">
              {(['super_admin', 'senior_member', 'junior_member', 'buyer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchUserRole(r)}
                  className={`rounded p-1.5 text-left text-xs ${currentUser.role === r ? 'bg-[#C7A35A] text-[#0B1734] font-bold' : 'bg-white/5 text-gray-300'}`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
