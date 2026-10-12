'use client';

import React from 'react';
import { Plot, PlotStatus } from '@/types';

interface MiniVillaSvgProps {
  plot: Plot;
  isSelected: boolean;
  isHovered: boolean;
  viewMode: 'villas' | 'cad' | 'landscape';
  showDimensions: boolean;
  showVehicles: boolean;
  showLandscaping: boolean;
}

export function MiniVillaSvg({
  plot,
  isSelected,
  isHovered,
  viewMode,
  showDimensions,
}: MiniVillaSvgProps) {
  const { x, y, width: w, height: h, status, plotNumber, areaSqft, dimensions } = plot;

  const isHorizontal = w > h; // Block C plots (120x55)
  const isLuxury = areaSqft >= 1500;

  // Select the authentic, photorealistic 3D architectural villa render image
  const getVillaImageUrl = () => {
    if (isHorizontal) {
      return '/assets/villa_horizontal_block_c.jpg';
    }
    if (isLuxury) {
      return '/assets/villa_vertical_luxury.jpg';
    }
    return '/assets/villa_vertical_standard.jpg';
  };

  const villaImageUrl = getVillaImageUrl();

  // Status colors & themes
  const getTheme = (st: PlotStatus) => {
    switch (st) {
      case 'available_green':
        return {
          borderStroke: isSelected ? '#DFC382' : '#22C55E',
          strokeWidth: isSelected ? 3.5 : 1.8,
          cadFill: '#0D3822',
          beaconColor: '#22C55E',
          statusOverlay: '#16A34A',
          statusText: 'Available',
          badgeText: '#86EFAC',
        };
      case 'booked_yellow':
        return {
          borderStroke: isSelected ? '#DFC382' : '#EAB308',
          strokeWidth: isSelected ? 3.5 : 1.8,
          cadFill: '#382A0A',
          beaconColor: '#EAB308',
          statusOverlay: '#CA8A04',
          statusText: 'Booked',
          badgeText: '#FDE047',
        };
      case 'vacant_red':
      default:
        return {
          borderStroke: isSelected ? '#DFC382' : '#EF4444',
          strokeWidth: isSelected ? 3.5 : 1.8,
          cadFill: '#3F1214',
          beaconColor: '#EF4444',
          statusOverlay: '#DC2626',
          statusText: 'Reserved',
          badgeText: '#FCA5A5',
        };
    }
  };

  const theme = getTheme(status);

  // Plot padding
  const pad = 2;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const plotX = x + pad;
  const plotY = y + pad;

  // Center coordinates for zoom & elevation
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Tap-to-Enlarge scale (52% magnification when tapped/selected!)
  const scale = isSelected ? 1.52 : isHovered ? 1.05 : 1;

  // ==========================================
  // 1. CAD TECHNICAL BLUEPRINT MODE
  // ==========================================
  if (viewMode === 'cad') {
    return (
      <g
        className="cursor-pointer transition-transform duration-250"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${centerX}px ${centerY}px`,
          filter: isSelected ? 'url(#selectedPlotElevate)' : undefined,
        }}
      >
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill={theme.cadFill}
          stroke={theme.borderStroke}
          strokeWidth={theme.strokeWidth}
          strokeDasharray={isSelected ? 'none' : '4 2'}
          rx="3"
        />

        {/* Diagonal Corner Registration CAD markers */}
        <line x1={plotX} y1={plotY + 8} x2={plotX + 8} y2={plotY} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX + plotW - 8} y1={plotY} x2={plotX + plotW} y2={plotY + 8} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX} y1={plotY + plotH - 8} x2={plotX + 8} y2={plotY + plotH} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX + plotW - 8} y1={plotY + plotH - 8} x2={plotX + plotW} y2={plotY + plotH} stroke="#94A3B8" strokeWidth="0.8" />

        {/* Plot Number */}
        <text
          x={plotX + plotW / 2}
          y={plotY + plotH / 2 - 4}
          fill="#FFFFFF"
          fontSize={plotW < 80 ? '11' : '13'}
          fontWeight="800"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {plotNumber}
        </text>

        {/* CAD Dimension & Area */}
        <text
          x={plotX + plotW / 2}
          y={plotY + plotH / 2 + 9}
          fill="#DFC382"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {areaSqft} SQFT
        </text>

        {showDimensions && (
          <text
            x={plotX + plotW / 2}
            y={plotY + plotH / 2 + 20}
            fill="#CBD5E1"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {dimensions}
          </text>
        )}
      </g>
    );
  }

  // =========================================================================
  // 2. PHOTOREALISTIC ARCHITECTURAL VILLA RENDERING (REAL HOME ON PLOT)
  // =========================================================================
  const clipId = `villa-clip-${plot.id}`;

  return (
    <g
      className="cursor-pointer transition-all duration-300"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${centerX}px ${centerY}px`,
        filter: isSelected ? 'url(#selectedPlotElevate)' : isHovered ? 'url(#hoverPlotGlow)' : undefined,
      }}
    >
      <defs>
        {/* Precise boundary clipping path with rounded corners */}
        <clipPath id={clipId}>
          <rect x={plotX} y={plotY} width={plotW} height={plotH} rx="5" ry="5" />
        </clipPath>
      </defs>

      {/* 1. Underlying Base Lawn Foundation */}
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        rx="5"
        fill="#0A2218"
      />

      {/* 2. REAL PHOTOREALISTIC ARCHITECTURAL 3D VILLA IMAGE */}
      <image
        href={villaImageUrl}
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
        className="transition-all duration-300"
        style={{
          filter: isSelected ? 'contrast(1.08) brightness(1.06)' : 'contrast(1.02)',
        }}
      />

      {/* 3. Subtle Status Lighting Gradient Rim / Overlay */}
      {/* Lets the user instantly recognize whether the villa plot is Green (Available), Yellow (Booked), or Red (Reserved) */}
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        rx="5"
        fill={theme.statusOverlay}
        opacity={status === 'available_green' ? '0.08' : status === 'booked_yellow' ? '0.2' : '0.22'}
        style={{ mixBlendMode: 'color' }}
      />

      {/* 4. Luxury Architectural Perimeter Border */}
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        rx="5"
        fill="none"
        stroke={theme.borderStroke}
        strokeWidth={theme.strokeWidth}
        className="transition-all duration-300"
      />

      {/* 5. Champagne Gold Corner Brackets when Selected */}
      {isSelected && (
        <g stroke="#DFC382" strokeWidth="2" fill="none">
          <path d={`M ${plotX + 1} ${plotY + 9} L ${plotX + 1} ${plotY + 1} L ${plotX + 9} ${plotY + 1}`} />
          <path d={`M ${plotX + plotW - 9} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 9}`} />
          <path d={`M ${plotX + 1} ${plotY + plotH - 9} L ${plotX + 1} ${plotY + plotH - 1} L ${plotX + 9} ${plotY + plotH - 1}`} />
          <path d={`M ${plotX + plotW - 9} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 9}`} />
        </g>
      )}

      {/* 6. Luxury Glassmorphic Brass Plot Badge in Top Corner */}
      <g id={`badge-${plotNumber}`}>
        <rect
          x={plotX + 3}
          y={plotY + 3}
          width={isLuxury ? 42 : 38}
          height="15"
          rx="3.5"
          fill="#050A17"
          fillOpacity="0.88"
          stroke={isSelected ? '#DFC382' : theme.borderStroke}
          strokeWidth={isSelected ? 1.4 : 0.8}
        />
        {/* Status Dot Beacon */}
        <circle cx={plotX + 7.5} cy={plotY + 10.5} r="2.5" fill={theme.beaconColor} />
        {/* Plot Number */}
        <text
          x={plotX + 13}
          y={plotY + 14}
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          letterSpacing="0.4"
        >
          {plotNumber}
        </text>
      </g>

      {/* 7. FLOATING MAGNIFIED CALLOUT WHEN TAPPED / ENLARGED */}
      {isSelected && (
        <g id={`enlarged-callout-${plotNumber}`}>
          <rect
            x={plotX + plotW / 2 - 46}
            y={plotY - 17}
            width="92"
            height="16"
            rx="4"
            fill="#0B1734"
            stroke="#DFC382"
            strokeWidth="1.4"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))' }}
          />
          <text
            x={plotX + plotW / 2}
            y={plotY - 6}
            fill="#DFC382"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            ★ {plotNumber} • {areaSqft} SQFT
          </text>
          {/* Golden pointer arrow */}
          <polygon
            points={`
              ${plotX + plotW / 2 - 4},${plotY - 1}
              ${plotX + plotW / 2 + 4},${plotY - 1}
              ${plotX + plotW / 2},${plotY + 3}
            `}
            fill="#DFC382"
          />
        </g>
      )}

      {/* 8. Optional Dimension Tag at Bottom */}
      {showDimensions && (
        <g>
          <rect
            x={plotX + plotW / 2 - 24}
            y={plotY + plotH - 12}
            width="48"
            height="10"
            rx="2"
            fill="#050A17"
            fillOpacity="0.75"
          />
          <text
            x={plotX + plotW / 2}
            y={plotY + plotH - 4.5}
            fill="#E2E8F0"
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {dimensions}
          </text>
        </g>
      )}
    </g>
  );
}
