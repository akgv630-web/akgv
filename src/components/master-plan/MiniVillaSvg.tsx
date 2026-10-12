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
  showVehicles,
  showLandscaping,
}: MiniVillaSvgProps) {
  const { x, y, width: w, height: h, status, plotNumber, areaSqft, dimensions, block } = plot;

  // Determine plot orientation
  const isHorizontal = w > h; // Block C plots (120x55)
  const isLuxury = areaSqft >= 1500;
  const isMid = areaSqft >= 1000 && areaSqft < 1500;

  // Color theme based on plot status
  const getTheme = (st: PlotStatus) => {
    switch (st) {
      case 'available_green':
        return {
          lawn: '#062B18',
          lawnHighlight: '#0D3D24',
          roofMain: '#1B6A4C',
          roofShadow: '#0E4933',
          roofHighlight: '#298A64',
          wall: '#F8FAFC',
          wallShadow: '#E2E8F0',
          accent: '#22C55E',
          stroke: isSelected ? '#DFC382' : '#22C55E',
          strokeWidth: isSelected ? 2.8 : 1.5,
          cadFill: '#0D3822',
          glowColor: '#22C55E',
          statusText: 'Available',
          statusBg: '#14532D',
          badgeText: '#86EFAC',
        };
      case 'booked_yellow':
        return {
          lawn: '#25200C',
          lawnHighlight: '#372F12',
          roofMain: '#9A6B15',
          roofShadow: '#734E0C',
          roofHighlight: '#B8821B',
          wall: '#FEF9C3',
          wallShadow: '#FEF08A',
          accent: '#EAB308',
          stroke: isSelected ? '#DFC382' : '#EAB308',
          strokeWidth: isSelected ? 2.8 : 1.5,
          cadFill: '#382A0A',
          glowColor: '#EAB308',
          statusText: 'Booked',
          statusBg: '#713F12',
          badgeText: '#FDE047',
        };
      case 'vacant_red':
      default:
        return {
          lawn: '#2D0E11',
          lawnHighlight: '#3E151A',
          roofMain: '#991B1B',
          roofShadow: '#7F1D1D',
          roofHighlight: '#B91C1C',
          wall: '#FEE2E2',
          wallShadow: '#FECACA',
          accent: '#EF4444',
          stroke: isSelected ? '#DFC382' : '#EF4444',
          strokeWidth: isSelected ? 2.8 : 1.5,
          cadFill: '#3F1214',
          glowColor: '#EF4444',
          statusText: 'Reserved',
          statusBg: '#7F1D1D',
          badgeText: '#FCA5A5',
        };
    }
  };

  const theme = getTheme(status);

  // Plot padding
  const pad = 2.5;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const plotX = x + pad;
  const plotY = y + pad;

  // Center coordinates for transform
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Transform scale & effects for Tap to Enlarge
  const scale = isSelected ? 1.36 : isHovered ? 1.03 : 1;

  // ==========================================
  // 1. CAD TECHNICAL DRAWING MODE
  // ==========================================
  if (viewMode === 'cad') {
    return (
      <g
        className="cursor-pointer transition-transform duration-200"
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
          stroke={theme.stroke}
          strokeWidth={theme.strokeWidth}
          strokeDasharray={isSelected ? 'none' : '4 2'}
          rx="3"
        />

        {/* Diagonal Corner CAD registration markers */}
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
  // 2. ULTRA-REALISTIC MINIATURE ARCHITECTURAL HOUSE (VERTICAL PLOTS: A & B)
  // =========================================================================
  if (!isHorizontal) {
    // Vertical plot: width ~75-92, height 125
    // Divide into 3 Zones:
    // Zone 1: House Roof (Top 46% of height)
    // Zone 2: House Front Wall & Porch (Middle 18% of height)
    // Zone 3: Front Yard, Walkway, Driveway & Car (Bottom 36% of height)

    const housePadX = isLuxury ? 5 : 4;
    const houseW = plotW - housePadX * 2;
    const houseX = plotX + housePadX;

    const roofY = plotY + 4;
    const roofH = plotH * 0.44; // ~52px
    const wallY = roofY + roofH;
    const wallH = plotH * 0.16; // ~19px
    const yardY = wallY + wallH;
    const yardH = plotH - (yardY - plotY); // ~46px

    const doorW = 9;
    const doorH = 13;
    const doorX = houseX + houseW / 2 - doorW / 2;
    const doorY = wallY + wallH - doorH;

    const carW = isLuxury ? 18 : 15;
    const carH = Math.min(28, yardH - 10);
    const carX = houseX + 3;
    const carY = yardY + (yardH - carH) / 2;

    const poolW = isLuxury ? 22 : 18;
    const poolH = Math.min(26, yardH - 12);
    const poolX = houseX + houseW - poolW - 2;
    const poolY = yardY + (yardH - poolH) / 2;

    return (
      <g
        className="cursor-pointer transition-all duration-300"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${centerX}px ${centerY}px`,
          filter: isSelected ? 'url(#selectedPlotElevate)' : isHovered ? 'url(#hoverPlotGlow)' : undefined,
        }}
      >
        {/* 1. Base Plot Boundary & Manicured Lawn */}
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill={theme.lawn}
          stroke={theme.stroke}
          strokeWidth={theme.strokeWidth}
          rx="4"
        />

        {/* Lawn Texture Grid / Strips */}
        {showLandscaping && (
          <g opacity="0.6">
            <line x1={plotX + 3} y1={yardY} x2={plotX + plotW - 3} y2={yardY} stroke={theme.lawnHighlight} strokeWidth="2" />
            <line x1={plotX + 3} y1={yardY + 10} x2={plotX + plotW - 3} y2={yardY + 10} stroke={theme.lawnHighlight} strokeWidth="2" />
            <line x1={plotX + 3} y1={yardY + 20} x2={plotX + plotW - 3} y2={yardY + 20} stroke={theme.lawnHighlight} strokeWidth="2" />
          </g>
        )}

        {/* 2. HOUSE ROOF (HIPPED ARCHITECTURAL PITCH WITH TILES) */}
        <g id={`roof-${plotNumber}`}>
          {/* Roof Base Shadow / Eaves */}
          <rect
            x={houseX - 1}
            y={roofY - 1}
            width={houseW + 2}
            height={roofH + 2}
            rx="3"
            fill="#090E17"
            opacity="0.4"
          />

          {/* Top Slope (Shadow side) */}
          <polygon
            points={`
              ${houseX},${roofY}
              ${houseX + houseW},${roofY}
              ${houseX + houseW - 12},${roofY + roofH * 0.45}
              ${houseX + 12},${roofY + roofH * 0.45}
            `}
            fill={theme.roofShadow}
          />

          {/* Bottom Slope (Sunlit side) */}
          <polygon
            points={`
              ${houseX},${roofY + roofH}
              ${houseX + houseW},${roofY + roofH}
              ${houseX + houseW - 12},${roofY + roofH * 0.45}
              ${houseX + 12},${roofY + roofH * 0.45}
            `}
            fill={theme.roofHighlight}
          />

          {/* Left Hip Slope */}
          <polygon
            points={`
              ${houseX},${roofY}
              ${houseX + 12},${roofY + roofH * 0.45}
              ${houseX},${roofY + roofH}
            `}
            fill={theme.roofMain}
          />

          {/* Right Hip Slope */}
          <polygon
            points={`
              ${houseX + houseW},${roofY}
              ${houseX + houseW - 12},${roofY + roofH * 0.45}
              ${houseX + houseW},${roofY + roofH}
            `}
            fill={theme.roofMain}
          />

          {/* Roof Ridge Cap Line */}
          <line
            x1={houseX + 12}
            y1={roofY + roofH * 0.45}
            x2={houseX + houseW - 12}
            y2={roofY + roofH * 0.45}
            stroke="#FFFFFF"
            strokeWidth="1.2"
            opacity="0.75"
          />

          {/* Roof Tile Grooves (Architectural texture) */}
          <line x1={houseX + 6} y1={roofY + roofH * 0.22} x2={houseX + houseW - 6} y2={roofY + roofH * 0.22} stroke="#FFFFFF" strokeWidth="0.4" opacity="0.3" strokeDasharray="3 2" />
          <line x1={houseX + 4} y1={roofY + roofH * 0.72} x2={houseX + houseW - 4} y2={roofY + roofH * 0.72} stroke="#000000" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 2" />

          {/* Modern Rooftop Skylight Glass */}
          <rect
            x={houseX + houseW / 2 - 8}
            y={roofY + roofH * 0.45 - 5}
            width="16"
            height="10"
            rx="1.5"
            fill={isSelected ? '#7DD3FC' : '#38BDF8'}
            stroke="#FFFFFF"
            strokeWidth="0.6"
            opacity="0.9"
          />
          {/* Skylight glare streak */}
          <line x1={houseX + houseW / 2 - 5} y1={roofY + roofH * 0.45 + 3} x2={houseX + houseW / 2 + 5} y2={roofY + roofH * 0.45 - 3} stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />

          {/* Rooftop Solar PV Panels (Clean Energy Township) */}
          <rect
            x={houseX + 8}
            y={roofY + 3}
            width={isLuxury ? 14 : 10}
            height={roofH * 0.3}
            rx="1"
            fill="#0F172A"
            stroke="#94A3B8"
            strokeWidth="0.4"
          />
          <line x1={houseX + 8} y1={roofY + 3 + (roofH * 0.3) / 2} x2={houseX + 8 + (isLuxury ? 14 : 10)} y2={roofY + 3 + (roofH * 0.3) / 2} stroke="#94A3B8" strokeWidth="0.4" />

          {/* Chimney / HVAC with shadow */}
          <rect x={houseX + houseW - 12} y={roofY + 4} width="5" height="5" rx="0.8" fill="#475569" stroke="#1E293B" strokeWidth="0.5" />
          <rect x={houseX + houseW - 13} y={roofY + 3} width="7" height="2" rx="0.5" fill="#64748B" />
        </g>

        {/* 3. HOUSE FRONT ELEVATION WALL & PORCH */}
        <g id={`elevation-${plotNumber}`}>
          {/* Main Front Wall Base */}
          <rect
            x={houseX}
            y={wallY}
            width={houseW}
            height={wallH}
            fill={theme.wall}
            stroke="#94A3B8"
            strokeWidth="0.6"
          />

          {/* Architectural Wall Shadow under eaves */}
          <line x1={houseX} y1={wallY} x2={houseX + houseW} y2={wallY} stroke="#334155" strokeWidth="1" opacity="0.6" />

          {/* Left Window (Glazed with reflections) */}
          <rect
            x={houseX + 4}
            y={wallY + 3}
            width={isLuxury ? 12 : 9}
            height={wallH - 6}
            rx="1"
            fill={isSelected ? '#FEF08A' : '#7DD3FC'}
            stroke="#334155"
            strokeWidth="0.6"
          />
          {/* Window cross mullion */}
          <line x1={houseX + 4 + (isLuxury ? 6 : 4.5)} y1={wallY + 3} x2={houseX + 4 + (isLuxury ? 6 : 4.5)} y2={wallY + wallH - 3} stroke="#334155" strokeWidth="0.4" />
          <line x1={houseX + 4} y1={wallY + 3 + (wallH - 6) / 2} x2={houseX + 4 + (isLuxury ? 12 : 9)} y2={wallY + 3 + (wallH - 6) / 2} stroke="#334155" strokeWidth="0.4" />

          {/* Right Window (Glazed with reflections) */}
          <rect
            x={houseX + houseW - (isLuxury ? 16 : 13)}
            y={wallY + 3}
            width={isLuxury ? 12 : 9}
            height={wallH - 6}
            rx="1"
            fill={isSelected ? '#FEF08A' : '#7DD3FC'}
            stroke="#334155"
            strokeWidth="0.6"
          />
          {/* Window cross mullion */}
          <line x1={houseX + houseW - (isLuxury ? 10 : 8.5)} y1={wallY + 3} x2={houseX + houseW - (isLuxury ? 10 : 8.5)} y2={wallY + wallH - 3} stroke="#334155" strokeWidth="0.4" />
          <line x1={houseX + houseW - (isLuxury ? 16 : 13)} y1={wallY + 3 + (wallH - 6) / 2} x2={houseX + houseW - 4} y2={wallY + 3 + (wallH - 6) / 2} stroke="#334155" strokeWidth="0.4" />

          {/* Center Teak Entrance Door with Brass Knob */}
          <rect
            x={doorX}
            y={doorY}
            width={doorW}
            height={doorH}
            rx="1"
            fill="#78350F"
            stroke="#451A03"
            strokeWidth="0.6"
          />
          {/* Door Panels */}
          <rect x={doorX + 1.5} y={doorY + 1.5} width={doorW - 3} height={doorH / 2 - 2} fill="#92400E" rx="0.5" />
          <rect x={doorX + 1.5} y={doorY + doorH / 2 + 1} width={doorW - 3} height={doorH / 2 - 2.5} fill="#92400E" rx="0.5" />
          {/* Golden Door Handle */}
          <circle cx={doorX + doorW - 2.5} cy={doorY + doorH / 2} r="0.7" fill="#FDE047" />

          {/* Front Entrance Portico Awning / Canopy Overhang */}
          <rect
            x={doorX - 2}
            y={doorY - 2.5}
            width={doorW + 4}
            height="3"
            rx="0.8"
            fill="#C7A35A"
            stroke="#9E7E36"
            strokeWidth="0.4"
          />

          {/* Porch Lamp Warm Glow (Illuminated on selected) */}
          {isSelected && (
            <circle cx={doorX + doorW / 2} cy={doorY - 1} r="4" fill="#FEF08A" opacity="0.6" />
          )}

          {/* Welcome Mat / Stone Threshold */}
          <rect
            x={doorX - 1}
            y={wallY + wallH}
            width={doorW + 2}
            height="3"
            rx="0.5"
            fill="#94A3B8"
            stroke="#64748B"
            strokeWidth="0.4"
          />
        </g>

        {/* 4. FRONT YARD: WALKWAY, LANDSCAPING, CAR & POOL */}
        <g id={`yard-${plotNumber}`}>
          {/* Stepping Stone Walkway from Door to Road */}
          {showLandscaping && (
            <g>
              <line
                x1={doorX + doorW / 2}
                y1={wallY + wallH + 3}
                x2={doorX + doorW / 2}
                y2={plotY + plotH - 2}
                stroke="#E2E8F0"
                strokeWidth="2.5"
                strokeDasharray="3 2"
              />
              {/* Garden Shrubs along Wall */}
              <circle cx={houseX + 1} cy={wallY + wallH + 4} r="2.5" fill="#15803D" />
              <circle cx={houseX + houseW - 1} cy={wallY + wallH + 4} r="2.5" fill="#15803D" />
              <circle cx={houseX + 6} cy={wallY + wallH + 5} r="2" fill="#22C55E" />
              <circle cx={houseX + houseW - 6} cy={wallY + wallH + 5} r="2" fill="#22C55E" />
            </g>
          )}

          {/* Paved Driveway & Miniature Luxury Car */}
          {showVehicles && (
            <g id={`car-${plotNumber}`}>
              {/* Paved Parking Space */}
              <rect
                x={carX - 1.5}
                y={carY - 1.5}
                width={carW + 3}
                height={carH + 3}
                rx="2"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="0.5"
              />

              {/* Miniature Car Body */}
              <rect
                x={carX}
                y={carY}
                width={carW}
                height={carH}
                rx="3.5"
                fill={status === 'booked_yellow' ? '#EAB308' : isLuxury ? '#E2E8F0' : '#38BDF8'}
                stroke="#0F172A"
                strokeWidth="0.6"
              />

              {/* Car Roof & Cabin Silhouette */}
              <rect
                x={carX + 1.5}
                y={carY + 4}
                width={carW - 3}
                height={carH - 9}
                rx="2"
                fill={status === 'booked_yellow' ? '#CA8A04' : isLuxury ? '#CBD5E1' : '#0284C7'}
              />

              {/* Front Windshield (Facing bottom / road) */}
              <rect
                x={carX + 2}
                y={carY + carH - 7}
                width={carW - 4}
                height="3"
                rx="0.8"
                fill="#0F172A"
              />

              {/* Rear Windshield (Facing top) */}
              <rect
                x={carX + 2.5}
                y={carY + 2.5}
                width={carW - 5}
                height="2.5"
                rx="0.8"
                fill="#0F172A"
              />

              {/* Headlights (Glowing on selected) */}
              <circle cx={carX + 2} cy={carY + carH - 1} r="0.9" fill={isSelected ? '#FEF08A' : '#FDE047'} />
              <circle cx={carX + carW - 2} cy={carY + carH - 1} r="0.9" fill={isSelected ? '#FEF08A' : '#FDE047'} />
            </g>
          )}

          {/* Private Turquoise Plunge Pool (For 1250+ and 1500 sqft plots) */}
          {(isLuxury || isMid) && (
            <g id={`pool-${plotNumber}`}>
              {/* Turquoise Pool Basin */}
              <rect
                x={poolX}
                y={poolY}
                width={poolW}
                height={poolH}
                rx="3"
                fill="#06B6D4"
                stroke="#67E8F9"
                strokeWidth="0.8"
              />
              {/* Pool Water Ripple / Tile Lines */}
              <line x1={poolX + 3} y1={poolY + 5} x2={poolX + poolW - 3} y2={poolY + 5} stroke="#E0F2FE" strokeWidth="0.7" opacity="0.8" />
              <line x1={poolX + 3} y1={poolY + 11} x2={poolX + poolW - 3} y2={poolY + 11} stroke="#E0F2FE" strokeWidth="0.7" opacity="0.8" />
              <line x1={poolX + 3} y1={poolY + 17} x2={poolX + poolW - 3} y2={poolY + 17} stroke="#E0F2FE" strokeWidth="0.7" opacity="0.8" />
              {/* Pool Underwater Step */}
              <rect x={poolX + poolW - 5} y={poolY + 2} width="3" height="4" rx="0.5" fill="#E0F2FE" opacity="0.85" />
              {/* Teak Sun Lounger Deck Chair */}
              <rect x={poolX - 4} y={poolY + 4} width="2.5" height="9" rx="0.5" fill="#D97706" />
            </g>
          )}
        </g>

        {/* 5. ELEGANT ARCHITECTURAL PLOT BADGE (TOP APEX PLACEMENT) */}
        {/* We place it in the top corner so it never covers the roof or front facade! */}
        <g id={`badge-${plotNumber}`}>
          <rect
            x={plotX + 3}
            y={plotY + 3}
            width={isLuxury ? 38 : 34}
            height="14"
            rx="3"
            fill="#050A17"
            fillOpacity="0.85"
            stroke={isSelected ? '#DFC382' : theme.stroke}
            strokeWidth={isSelected ? 1.2 : 0.6}
          />
          {/* Status Dot */}
          <circle cx={plotX + 7} cy={plotY + 10} r="2" fill={theme.accent} />
          {/* Plot Number */}
          <text
            x={plotX + 11}
            y={plotY + 13}
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="0.3"
          >
            {plotNumber}
          </text>
        </g>

        {/* 6. ENLARGED CALLOUT (SHOWN WHEN TAPPED / SELECTED) */}
        {isSelected && (
          <g id={`enlarged-callout-${plotNumber}`}>
            {/* Floating Top Banner Above Plot */}
            <rect
              x={plotX + plotW / 2 - 38}
              y={plotY - 14}
              width="76"
              height="14"
              rx="4"
              fill="#0B1734"
              stroke="#DFC382"
              strokeWidth="1.2"
              style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))' }}
            />
            <text
              x={plotX + plotW / 2}
              y={plotY - 4.5}
              fill="#DFC382"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.5"
            >
              ★ {plotNumber} • {areaSqft} SQFT
            </text>
            {/* Pointer arrow down */}
            <polygon
              points={`
                ${plotX + plotW / 2 - 3},${plotY}
                ${plotX + plotW / 2 + 3},${plotY}
                ${plotX + plotW / 2},${plotY + 3}
              `}
              fill="#DFC382"
            />
          </g>
        )}

        {/* 7. Optional Dimension Text at Bottom */}
        {showDimensions && (
          <text
            x={plotX + plotW / 2}
            y={plotY + plotH - 3}
            fill="#94A3B8"
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.9"
          >
            {dimensions}
          </text>
        )}
      </g>
    );
  }

  // =========================================================================
  // 3. ULTRA-REALISTIC MINIATURE ARCHITECTURAL HOUSE (HORIZONTAL: BLOCK C)
  // =========================================================================
  // Block C plots: width ~120, height ~55
  // Divide horizontally:
  // Left side: Villa House Structure (Width 64%)
  // Right side: Driveway, Car, Landscaped Garden (Width 36%)

  const housePad = 3;
  const houseW = plotW * 0.62; // ~72px
  const houseH = plotH - housePad * 2; // ~44px
  const houseX = plotX + housePad;
  const houseY = plotY + housePad;

  const sideW = plotW - houseW - housePad * 3; // ~38px
  const sideX = houseX + houseW + housePad;
  const sideY = houseY;
  const sideH = houseH;

  const carW = Math.min(26, sideW - 4);
  const carH = Math.min(16, sideH * 0.55);
  const carX = sideX + (sideW - carW) / 2;
  const carY = sideY + sideH - carH - 2;

  return (
    <g
      className="cursor-pointer transition-all duration-300"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${centerX}px ${centerY}px`,
        filter: isSelected ? 'url(#selectedPlotElevate)' : isHovered ? 'url(#hoverPlotGlow)' : undefined,
      }}
    >
      {/* 1. Base Plot Boundary & Lawn */}
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        fill={theme.lawn}
        stroke={theme.stroke}
        strokeWidth={theme.strokeWidth}
        rx="4"
      />

      {/* 2. Horizontal Villa Structure (Left side) */}
      <g id={`house-${plotNumber}`}>
        {/* Exterior Wall Base */}
        <rect
          x={houseX}
          y={houseY}
          width={houseW}
          height={houseH}
          rx="3"
          fill={theme.wall}
          stroke="#475569"
          strokeWidth="0.6"
        />

        {/* Hipped Roof (Upper portion of house) */}
        <polygon
          points={`
            ${houseX},${houseY}
            ${houseX + houseW},${houseY}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + 8},${houseY + houseH * 0.55}
          `}
          fill={theme.roofShadow}
        />
        <polygon
          points={`
            ${houseX},${houseY + houseH * 0.65}
            ${houseX + houseW},${houseY + houseH * 0.65}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + 8},${houseY + houseH * 0.55}
          `}
          fill={theme.roofHighlight}
        />
        <polygon
          points={`
            ${houseX},${houseY}
            ${houseX + 8},${houseY + houseH * 0.55}
            ${houseX},${houseY + houseH * 0.65}
          `}
          fill={theme.roofMain}
        />
        <polygon
          points={`
            ${houseX + houseW},${houseY}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + houseW},${houseY + houseH * 0.65}
          `}
          fill={theme.roofMain}
        />

        {/* Roof Ridge Line */}
        <line
          x1={houseX + 8}
          y1={houseY + houseH * 0.55}
          x2={houseX + houseW - 8}
          y2={houseY + houseH * 0.55}
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* Solar PV array on roof */}
        <rect
          x={houseX + 10}
          y={houseY + 2.5}
          width="14"
          height={houseH * 0.3}
          rx="1"
          fill="#0F172A"
          stroke="#94A3B8"
          strokeWidth="0.4"
        />

        {/* Skylight Glass */}
        <rect
          x={houseX + houseW / 2 - 6}
          y={houseY + houseH * 0.55 - 4}
          width="12"
          height="7"
          rx="1"
          fill={isSelected ? '#7DD3FC' : '#38BDF8'}
          stroke="#FFFFFF"
          strokeWidth="0.5"
        />

        {/* Front Elevation Wall Strip (Bottom 35%) */}
        <rect
          x={houseX}
          y={houseY + houseH * 0.65}
          width={houseW}
          height={houseH * 0.35}
          fill={theme.wall}
          stroke="#64748B"
          strokeWidth="0.5"
        />

        {/* Left Picture Window */}
        <rect
          x={houseX + 6}
          y={houseY + houseH * 0.68}
          width="12"
          height={houseH * 0.25}
          rx="0.8"
          fill={isSelected ? '#FEF08A' : '#7DD3FC'}
          stroke="#334155"
          strokeWidth="0.5"
        />

        {/* Main Teak Door with Porch Awning */}
        <rect
          x={houseX + houseW / 2 - 4}
          y={houseY + houseH * 0.66}
          width="8"
          height={houseH * 0.33}
          rx="0.8"
          fill="#78350F"
          stroke="#451A03"
          strokeWidth="0.5"
        />
        <circle cx={houseX + houseW / 2 + 1.5} cy={houseY + houseH * 0.82} r="0.6" fill="#FDE047" />

        {/* Right Picture Window */}
        <rect
          x={houseX + houseW - 18}
          y={houseY + houseH * 0.68}
          width="12"
          height={houseH * 0.25}
          rx="0.8"
          fill={isSelected ? '#FEF08A' : '#7DD3FC'}
          stroke="#334155"
          strokeWidth="0.5"
        />
      </g>

      {/* 3. Side Yard: Paved Driveway, Car & Garden (Right side) */}
      <g id={`yard-${plotNumber}`}>
        {/* Garden Shrubs / Lawn in Top Right */}
        {showLandscaping && (
          <g>
            <circle cx={sideX + 6} cy={sideY + 6} r="3" fill="#15803D" />
            <circle cx={sideX + 14} cy={sideY + 5} r="2.5" fill="#22C55E" />
            <circle cx={sideX + 22} cy={sideY + 7} r="3" fill="#166534" />
          </g>
        )}

        {/* Paved Driveway Area */}
        <rect
          x={sideX}
          y={carY - 1}
          width={sideW}
          height={carH + 3}
          rx="2"
          fill="#1E293B"
          stroke="#475569"
          strokeWidth="0.5"
        />

        {/* Miniature Parked Car (Horizontal orientation) */}
        {showVehicles && (
          <g id={`car-${plotNumber}`}>
            <rect
              x={carX}
              y={carY}
              width={carW}
              height={carH}
              rx="3"
              fill={status === 'booked_yellow' ? '#EAB308' : '#F1F5F9'}
              stroke="#0F172A"
              strokeWidth="0.5"
            />
            {/* Car Windshields (Side view/roof) */}
            <rect
              x={carX + 4}
              y={carY + 1.5}
              width={carW - 8}
              height={carH - 3}
              rx="1.5"
              fill="#0F172A"
            />
            {/* Front Headlights */}
            <circle cx={carX + carW - 1} cy={carY + 3} r="0.8" fill={isSelected ? '#FEF08A' : '#FDE047'} />
            <circle cx={carX + carW - 1} cy={carY + carH - 3} r="0.8" fill={isSelected ? '#FEF08A' : '#FDE047'} />
          </g>
        )}
      </g>

      {/* 4. Elegant Plot Badge (Top-left Corner) */}
      <g id={`badge-${plotNumber}`}>
        <rect
          x={plotX + 3}
          y={plotY + 3}
          width="36"
          height="13"
          rx="3"
          fill="#050A17"
          fillOpacity="0.88"
          stroke={isSelected ? '#DFC382' : theme.stroke}
          strokeWidth={isSelected ? 1.2 : 0.6}
        />
        <circle cx={plotX + 7} cy={plotY + 9.5} r="2" fill={theme.accent} />
        <text
          x={plotX + 11}
          y={plotY + 12.5}
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {plotNumber}
        </text>
      </g>

      {/* 5. ENLARGED CALLOUT (SHOWN WHEN TAPPED / SELECTED) */}
      {isSelected && (
        <g id={`enlarged-callout-${plotNumber}`}>
          <rect
            x={plotX + plotW / 2 - 42}
            y={plotY - 14}
            width="84"
            height="14"
            rx="4"
            fill="#0B1734"
            stroke="#DFC382"
            strokeWidth="1.2"
            style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))' }}
          />
          <text
            x={plotX + plotW / 2}
            y={plotY - 4.5}
            fill="#DFC382"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            ★ {plotNumber} • {areaSqft} SQFT
          </text>
          <polygon
            points={`
              ${plotX + plotW / 2 - 3},${plotY}
              ${plotX + plotW / 2 + 3},${plotY}
              ${plotX + plotW / 2},${plotY + 3}
            `}
            fill="#DFC382"
          />
        </g>
      )}

      {/* 6. Optional Dimension Tag */}
      {showDimensions && (
        <text
          x={plotX + plotW / 2}
          y={plotY + plotH - 2}
          fill="#94A3B8"
          fontSize="6"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {dimensions}
        </text>
      )}
    </g>
  );
}
