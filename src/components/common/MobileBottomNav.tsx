'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  MapPin,
  Calculator,
  User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser, t } = useApp();
  const c = t.mobileNav;

  const getDashboardPath = (role: UserRole) => {
    if (role === 'super_admin' || role === 'sub_admin') return '/admin';
    if (role === 'senior_member' || role === 'junior_member') return '/member';
    return '/buyer';
  };

  const navItems = [
    { href: '/', label: c.home, icon: Home },
    { href: '/master-plan', label: c.plots, icon: Layers },
    { href: '/projects', label: c.projects, icon: MapPin },
    { href: '/#loan-calculator', label: c.emiCalc, icon: Calculator },
    { href: getDashboardPath(currentUser.role), label: c.portal, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#C7A35A]/30 bg-[#070D1E]/95 px-2 pt-1.5 pb-safe backdrop-blur-xl shadow-2xl sm:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
              isActive
                ? 'text-[#DFC382]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={`relative p-1 rounded-full ${isActive ? 'bg-[#C7A35A]/20' : ''}`}>
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#DFC382]' : 'text-gray-400'}`} />
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#C7A35A]" />
              )}
            </div>
            <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
