'use client';

import React from 'react';
import { CommissionRewardsView } from '@/components/rewards/CommissionRewardsView';
import { useApp } from '@/context/AppContext';

export default function RewardsPlanPage() {
  const { t, language } = useApp();
  const c = t.rewards;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider">
          {language === 'hi' ? 'प्रदर्शन प्रोत्साहन एवं पुरस्कार' : language === 'hinglish' ? 'Performance Rewards' : 'Performance Recognition'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          {c.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          {c.subtitle}
        </p>
      </div>

      <CommissionRewardsView />
    </div>
  );
}
