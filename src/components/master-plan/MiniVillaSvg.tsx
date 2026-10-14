'use client';

import React from 'react';
import { Plot, PlotStatus } from '@/types';

interface MiniVillaSvgProps {
  plot: Plot;
  isSelected: boolean;
  isHovered: boolean;
  viewMode: 'plots' | 'villas' | 'cad' | 'landscape';
  showDimensions: boolean;
  showVehicles: boolean;
  showLandscaping: boolean;
}

export function MiniVillaSvg({
  plot,
  isSelected,
  isHovered,
  viewMode = 'plots',
  showDimensions = true,
}: MiniVillaSvgProps) {
  const { x, y, width: w, height: h, status, plotNumber, areaSqft, dimensions, roadFacing, isCornerPlot } = plot;

  const isHorizontal = w > h; // Block C plots (120x55)
  const isLuxury = areaSqft >= 1500;
  const areaGaj = (areaSqft / 9).toFixed(0);

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
          lawnBase: '#082618',
          lawnBorder: '#166534',
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
          lawnBase: '#26200A',
          lawnBorder: '#854D0E',
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
          lawnBase: '#2A0C0E',
          lawnBorder: '#991B1B',
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

  // Tap-to-Enlarge scale (48% - 52% magnification when tapped/selected)
  const scale = isSelected ? 1.48 : isHovered ? 1.05 : 1;

  // ==========================================
  // 1. CAD TECHNICAL BLUEPRINT MODE
  // ==========================================
  if (viewMode === 'cad') {
    return (
      <g
        className="cursor-pointer transition-transform duration-250 select-none"
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
          {areaSqft} SQFT ({areaGaj} GAJ)
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
  // 2. DEMARCATED RESIDENTIAL PLOTTED LAYOUT (PLOTS VIEW - LAND SALE FOCUS)
  // =========================================================================
  if (viewMode === 'plots' || viewMode === 'landscape') {
    return (
      <g
        className="cursor-pointer transition-all duration-300 select-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${centerX}px ${centerY}px`,
          filter: isSelected ? 'url(#selectedPlotElevate)' : isHovered ? 'url(#hoverPlotGlow)' : undefined,
        }}
      >
        {/* 1. Manicured Natural Lawn Turf Base */}
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          rx="4"
          fill={theme.lawnBase}
          stroke={theme.borderStroke}
          strokeWidth={theme.strokeWidth}
          className="transition-all duration-300"
        />

        {/* 2. Boundary Stone Markers on 4 Corners (Concrete Survey Pillars) */}
        {/* Top-Left */}
        <rect x={plotX + 1} y={plotY + 1} width="5" height="5" rx="1" fill="#FFFFFF" stroke="#C7A35A" strokeWidth="0.8" />
        {/* Top-Right */}
        <rect x={plotX + plotW - 6} y={plotY + 1} width="5" height="5" rx="1" fill="#FFFFFF" stroke="#C7A35A" strokeWidth="0.8" />
        {/* Bottom-Left */}
        <rect x={plotX + 1} y={plotY + plotH - 6} width="5" height="5" rx="1" fill="#FFFFFF" stroke="#C7A35A" strokeWidth="0.8" />
        {/* Bottom-Right */}
        <rect x={plotX + plotW - 6} y={plotY + plotH - 6} width="5" height="5" rx="1" fill="#FFFFFF" stroke="#C7A35A" strokeWidth="0.8" />

        {/* 3. Subtle Plot Inner Perimeter Guideline */}
        <rect
          x={plotX + 4}
          y={plotY + 4}
          width={plotW - 8}
          height={plotH - 8}
          rx="2"
          fill="none"
          stroke={theme.lawnBorder}
          strokeWidth="0.75"
          strokeDasharray="3 3"
        />

        {/* 4. Luxury Corner Star for Premium Corner Plots */}
        {isCornerPlot && (
          <g>
            <circle cx={plotX + plotW - 9} cy={plotY + 9} r="5" fill="#C7A35A" opacity="0.9" />
            <text x={plotX + plotW - 9} y={plotY + 11.5} fontSize="7" fill="#0B1734" fontWeight="bold" textAnchor="middle">
              ★
            </text>
          </g>
        )}

        {/* 5. Center Demarcated Plot Identification Badge */}
        <g id={`plot-center-badge-${plotNumber}`}>
          {/* Badge Background Pill */}
          <rect
            x={plotX + plotW / 2 - (isHorizontal ? 40 : 34)}
            y={plotY + plotH / 2 - 20}
            width={isHorizontal ? 80 : 68}
            height={plotH > 75 ? 40 : 32}
            rx="5"
            fill="#050A17"
            fillOpacity="0.9"
            stroke={isSelected ? '#DFC382' : '#334155'}
            strokeWidth={isSelected ? 1.6 : 0.9}
          />

          {/* Plot Number with Status Dot */}
          <g>
            <circle
              cx={plotX + plotW / 2 - (isHorizontal ? 22 : 18)}
              cy={plotY + plotH / 2 - 9}
              r="2.8"
              fill={theme.beaconColor}
            />
            <text
              x={plotX + plotW / 2 + 2}
              y={plotY + plotH / 2 - 5}
              fill="#FFFFFF"
              fontSize={isHorizontal ? '12.5' : '11.5'}
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {plotNumber}
            </text>
          </g>

          {/* Area in Sqft & Gaj */}
          <text
            x={plotX + plotW / 2}
            y={plotY + plotH / 2 + 6}
            fill="#DFC382"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {areaSqft} SQFT
          </text>

          {/* Gaj + Dimensions (if plot height allows) */}
          {plotH > 75 && (
            <text
              x={plotX + plotW / 2}
              y={plotY + plotH / 2 + 15}
              fill="#CBD5E1"
              fontSize="6.8"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {areaGaj} GAJ • {dimensions}
            </text>
          )}
        </g>

        {/* 6. Vastu Facing Compass Needle */}
        {roadFacing && (
          <g opacity="0.85">
            <text
              x={plotX + 8}
              y={plotY + plotH - 5}
              fill="#94A3B8"
              fontSize="6.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              🧭 {roadFacing[0]}
            </text>
          </g>
        )}

        {/* 7. Champagne Gold Corner Brackets when Selected */}
        {isSelected && (
          <g stroke="#DFC382" strokeWidth="2.2" fill="none">
            <path d={`M ${plotX + 1} ${plotY + 9} L ${plotX + 1} ${plotY + 1} L ${plotX + 9} ${plotY + 1}`} />
            <path d={`M ${plotX + plotW - 9} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 9}`} />
            <path d={`M ${plotX + 1} ${plotY + plotH - 9} L ${plotX + 1} ${plotY + plotH - 1} L ${plotX + 9} ${plotY + plotH - 1}`} />
            <path d={`M ${plotX + plotW - 9} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 9}`} />
          </g>
        )}

        {/* 8. FLOATING MAGNIFIED CALLOUT WHEN TAPPED / ENLARGED */}
        {isSelected && (
          <g id={`enlarged-plot-callout-${plotNumber}`}>
            <rect
              x={plotX + plotW / 2 - 50}
              y={plotY - 18}
              width="100"
              height="16"
              rx="4"
              fill="#0B1734"
              stroke="#DFC382"
              strokeWidth="1.4"
              style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))' }}
            />
            <text
              x={plotX + plotW / 2}
              y={plotY - 7}
              fill="#DFC382"
              fontSize="7.8"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.4"
            >
              ★ PLOT {plotNumber} • {areaSqft} SQFT
            </text>
            <polygon
              points={`
                ${plotX + plotW / 2 - 4},${plotY - 2}
                ${plotX + plotW / 2 + 4},${plotY - 2}
                ${plotX + plotW / 2},${plotY + 3}
              `}
              fill="#DFC382"
            />
          </g>
        )}

        {/* 9. Road Frontage Indicator Bar */}
        {showDimensions && (
          <g>
            <line
              x1={plotX + 6}
              y1={plotY + plotH - 2}
              x2={plotX + plotW - 6}
              y2={plotY + plotH - 2}
              stroke="#EAB308"
              strokeWidth="1.5"
            />
          </g>
        )}
      </g>
    );
  }

  // =========================================================================
  // 3. PHOTOREALISTIC ARCHITECTURAL 3D VILLA SIMULATION (SAMPLE REFERENCE)
  // =========================================================================
  const clipId = `villa-clip-${plot.id}`;

  return (
    <g
      className="cursor-pointer transition-all duration-300 select-none"
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
          width={isLuxury ? 44 : 40}
          height="15"
          rx="3.5"
          fill="#050A17"
          fillOpacity="0.9"
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
            x={plotX + plotW / 2 - 50}
            y={plotY - 17}
            width="100"
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
