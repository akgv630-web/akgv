'use client';

import React from 'react';
import { HouseViewer3D } from '@/components/3d/HouseViewer3D';

export default function HouseViewerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C7A35A] uppercase tracking-wider">
          Real-Time 3D WebGL Engine
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          3D House Architectural Viewer
        </h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Rotate 360°, inspect dimensions in feet, toggle lighting modes (Day, Golden Hour, Night), switch exterior finishes, and verify plot compatibility.
        </p>
      </div>

      <HouseViewer3D />
    </div>
  );
}
