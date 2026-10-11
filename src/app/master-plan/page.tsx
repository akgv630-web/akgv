'use client';

import React from 'react';
import { MasterPlanViewer } from '@/components/master-plan/MasterPlanViewer';

export default function MasterPlanPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#1EA275] uppercase tracking-wider">
          Digital Architectural Blueprint
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Interactive Master Layout Plan
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Transcribed directly from the approved blueprint of A.K.G.V. Infraa City Varanasi. Select green plots to view verified dimensions, road frontage, and compatible 3D house models.
        </p>
      </div>

      <MasterPlanViewer />
    </div>
  );
}
