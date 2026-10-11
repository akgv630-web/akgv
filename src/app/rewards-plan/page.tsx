'use client';

import React from 'react';
import { CommissionRewardsView } from '@/components/rewards/CommissionRewardsView';

export default function RewardsPlanPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider">
          Performance Recognition
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          लेवल — कमीशन एवं रिवार्ड प्लान
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Official 11-level performance tiers, commission rates from 4% to 14%, and brochure-grounded rewards for verified company members.
        </p>
      </div>

      <CommissionRewardsView />
    </div>
  );
}
