'use client';

import React from 'react';
import { JoiningKitLedger } from '@/components/joining-kit/JoiningKitLedger';

export default function JoiningKitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Physical Onboarding Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Joining Kit — Offline Cash Ledger
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Official welcome kit with Bag, Pen, Diary and File Folder. Fixed at ₹999 collected offline in cash, strictly recorded with printable receipts.
        </p>
      </div>

      <JoiningKitLedger />
    </div>
  );
}
