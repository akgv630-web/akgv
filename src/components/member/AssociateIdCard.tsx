'use client';

import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Mail,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  User
} from 'lucide-react';
import { COMPANY_DETAILS } from '@/data/groundTruth';

interface AssociateIdCardProps {
  name?: string;
  memberId?: string;
  rank?: string;
  phone?: string;
  email?: string;
  joinedDate?: string;
  kitStatus?: 'VERIFIED' | 'PENDING';
}

export function AssociateIdCard({
  name = 'Rajesh Kumar Patel',
  memberId = 'AKGV0001',
  rank = 'Diamond Star (Level 4)',
  phone = '6306917991',
  email = 'associate@akgv.in',
  joinedDate = '15 Jan 2026',
  kitStatus = 'VERIFIED'
}: AssociateIdCardProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Printable ID Card Container */}
      <div
        id="associate-id-card"
        className="relative overflow-hidden rounded-3xl border-2 border-[#C7A35A] bg-gradient-to-b from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 shadow-2xl text-xs space-y-5"
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="font-serif text-9xl font-black text-[#C7A35A]">AKGV</span>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#C7A35A]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A] text-[#C7A35A] font-serif font-black text-xs">
              AKGV
            </div>
            <div>
              <div className="font-serif text-sm font-bold text-white tracking-wider">
                AKGV INFRA CITY
              </div>
              <div className="text-[9px] text-[#DFC382] tracking-widest uppercase">
                Private Limited • Varanasi
              </div>
            </div>
          </div>

          <div className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400">
            OFFICIAL ASSOCIATE
          </div>
        </div>

        {/* Associate Profile Body */}
        <div className="flex items-center gap-4">
          {/* Avatar / Photo Box */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#C7A35A] bg-[#070E20] flex items-center justify-center shadow-lg">
            <User className="h-10 w-10 text-gray-400" />
            <div className="absolute bottom-0 inset-x-0 bg-[#C7A35A] text-[#0B1734] text-[8px] font-bold text-center py-0.5">
              VERIFIED
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Authorized Member</span>
            <h4 className="font-serif text-base font-bold text-white">{name}</h4>
            <div className="inline-flex items-center gap-1 rounded bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382]">
              <Award className="h-3 w-3" />
              <span>{rank}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 pt-0.5">
              ID: {memberId}
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-white/10 pt-3">
          <div className="rounded-xl bg-[#050A17] p-2.5 border border-white/5 space-y-0.5">
            <span className="text-gray-400 block">Contact Phone:</span>
            <span className="font-semibold text-white truncate block">+91 {phone}</span>
          </div>

          <div className="rounded-xl bg-[#050A17] p-2.5 border border-white/5 space-y-0.5">
            <span className="text-gray-400 block">Registration Date:</span>
            <span className="font-semibold text-white truncate block">{joinedDate}</span>
          </div>

          <div className="rounded-xl bg-[#050A17] p-2.5 border border-white/5 space-y-0.5">
            <span className="text-gray-400 block">₹999 Joining Kit:</span>
            <span className="font-bold text-emerald-400 truncate block">
              {kitStatus === 'VERIFIED' ? '✓ Verified (Delivered)' : 'Pending Kit'}
            </span>
          </div>

          <div className="rounded-xl bg-[#050A17] p-2.5 border border-white/5 space-y-0.5">
            <span className="text-gray-400 block">HQ Helpline:</span>
            <span className="font-semibold text-[#DFC382] truncate block">+91 6306917991</span>
          </div>
        </div>

        {/* Bottom Verification Seal & QR */}
        <div className="flex items-center justify-between border-t border-[#C7A35A]/30 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg border border-[#C7A35A]/50 bg-[#050A17] flex items-center justify-center text-[#DFC382]">
              <QrCode className="h-7 w-7" />
            </div>
            <div className="text-[9px] text-gray-400">
              <span className="font-bold text-white block">Official Security QR</span>
              <span>Scan to authenticate rank</span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-serif font-bold text-xs text-[#DFC382] italic">AKGV Infra City</div>
            <span className="text-[8px] text-gray-500 block">Governing Board Seal</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-5 py-2.5 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save ID Card PDF</span>
        </button>
      </div>
    </div>
  );
}
