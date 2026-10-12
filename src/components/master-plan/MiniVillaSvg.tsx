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
  const { x, y, width: w, height: h, status, plotNumber, areaSqft, dimensions } = plot;

  const isHorizontal = w > h; // Block C plots (120x55)
  const isLuxury = areaSqft >= 1500;
  const isMid = areaSqft >= 1000 && areaSqft < 1500;

  // Status-specific themes & gradient IDs
  const getTheme = (st: PlotStatus) => {
    switch (st) {
      case 'available_green':
        return {
          roofSun: 'url(#roofGreenSlopeSun)',
          roofShadow: 'url(#roofGreenSlopeShadow)',
          roofAccent: '#16A34A',
          lawnFill: 'url(#lawnDepthGreen)',
          borderStroke: isSelected ? '#DFC382' : '#22C55E',
          strokeWidth: isSelected ? 3.2 : 1.5,
          cadFill: '#0D3822',
          beaconColor: '#22C55E',
          statusText: 'Available',
          badgeText: '#86EFAC',
          carFill: 'url(#carMetallicSilver)',
        };
      case 'booked_yellow':
        return {
          roofSun: 'url(#roofYellowSlopeSun)',
          roofShadow: 'url(#roofYellowSlopeShadow)',
          roofAccent: '#CA8A04',
          lawnFill: 'url(#lawnDepthAmber)',
          borderStroke: isSelected ? '#DFC382' : '#EAB308',
          strokeWidth: isSelected ? 3.2 : 1.5,
          cadFill: '#382A0A',
          beaconColor: '#EAB308',
          statusText: 'Booked',
          badgeText: '#FDE047',
          carFill: 'url(#carMetallicGold)',
        };
      case 'vacant_red':
      default:
        return {
          roofSun: 'url(#roofRedSlopeSun)',
          roofShadow: 'url(#roofRedSlopeShadow)',
          roofAccent: '#DC2626',
          lawnFill: 'url(#lawnDepthRed)',
          borderStroke: isSelected ? '#DFC382' : '#EF4444',
          strokeWidth: isSelected ? 3.2 : 1.5,
          cadFill: '#3F1214',
          beaconColor: '#EF4444',
          statusText: 'Reserved',
          badgeText: '#FCA5A5',
          carFill: 'url(#carMetallicSilver)',
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

  // Center coordinates for transform
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Tap-to-Enlarge scale (48% enlargement on tap!)
  const scale = isSelected ? 1.48 : isHovered ? 1.05 : 1;

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
  // 2. PHOTOREALISTIC MINIATURE VILLA (VERTICAL PLOTS: BLOCK A & B)
  // =========================================================================
  if (!isHorizontal) {
    // Vertical plot: width ~75-92, height 125
    const housePadX = isLuxury ? 5 : 4;
    const houseW = plotW - housePadX * 2;
    const houseX = plotX + housePadX;

    const roofY = plotY + 4;
    const roofH = plotH * 0.44; // ~52px
    const wallY = roofY + roofH;
    const wallH = plotH * 0.16; // ~20px
    const yardY = wallY + wallH;
    const yardH = plotH - (yardY - plotY); // ~46px

    const doorW = 10;
    const doorH = 14;
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
        {/* 1. Base Plot Boundary & Manicured Lawn with Radial Depth */}
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill={theme.lawnFill}
          stroke={theme.borderStroke}
          strokeWidth={theme.strokeWidth}
          rx="5"
        />

        {/* Selected Plot Architectural Gold Corner Brackets */}
        {isSelected && (
          <g stroke="#DFC382" strokeWidth="1.8" fill="none">
            <path d={`M ${plotX + 1} ${plotY + 8} L ${plotX + 1} ${plotY + 1} L ${plotX + 8} ${plotY + 1}`} />
            <path d={`M ${plotX + plotW - 8} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 8}`} />
            <path d={`M ${plotX + 1} ${plotY + plotH - 8} L ${plotX + 1} ${plotY + plotH - 1} L ${plotX + 8} ${plotY + plotH - 1}`} />
            <path d={`M ${plotX + plotW - 8} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 8}`} />
          </g>
        )}

        {/* Lawn Texture Strips (Mown Grass Stripes) */}
        {showLandscaping && (
          <g opacity="0.45" stroke="#042F1A" strokeWidth="2.5">
            <line x1={plotX + 3} y1={yardY + 4} x2={plotX + plotW - 3} y2={yardY + 4} />
            <line x1={plotX + 3} y1={yardY + 12} x2={plotX + plotW - 3} y2={yardY + 12} />
            <line x1={plotX + 3} y1={yardY + 20} x2={plotX + plotW - 3} y2={yardY + 20} />
            <line x1={plotX + 3} y1={yardY + 28} x2={plotX + plotW - 3} y2={yardY + 28} />
          </g>
        )}

        {/* 2. REALISTIC 3D ARCHITECTURAL HOUSE (WITH DIRECTIONAL SUN CAST SHADOW) */}
        <g id={`house-group-${plotNumber}`}>
          {/* Directional Sun Cast Shadow (45-degree angle beneath building) */}
          <rect
            x={houseX + 3}
            y={roofY + 4}
            width={houseW}
            height={roofH + wallH}
            rx="4"
            fill="#01140A"
            opacity="0.7"
            filter="url(#houseCastShadow)"
          />

          {/* Exterior Wall Base Elevation */}
          <rect
            x={houseX}
            y={wallY}
            width={houseW}
            height={wallH}
            fill="url(#wallIvoryStucco)"
            stroke="#64748B"
            strokeWidth="0.8"
          />

          {/* Wall Eaves Shadow directly beneath roof */}
          <rect x={houseX} y={wallY} width={houseW} height="2.5" fill="#1E293B" opacity="0.5" />

          {/* Left Window (Glazed with multi-tone reflection) */}
          <rect
            x={houseX + 4}
            y={wallY + 3.5}
            width={isLuxury ? 12 : 9}
            height={wallH - 7}
            rx="1.2"
            fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
            stroke="#1E293B"
            strokeWidth="0.7"
          />
          {/* Window Glass Glare Slashes */}
          <line x1={houseX + 6} y1={wallY + wallH - 5} x2={houseX + 9} y2={wallY + 5} stroke="#FFFFFF" strokeWidth="0.7" opacity="0.7" />

          {/* Right Window (Glazed with multi-tone reflection) */}
          <rect
            x={houseX + houseW - (isLuxury ? 16 : 13)}
            y={wallY + 3.5}
            width={isLuxury ? 12 : 9}
            height={wallH - 7}
            rx="1.2"
            fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
            stroke="#1E293B"
            strokeWidth="0.7"
          />
          <line x1={houseX + houseW - 14} y1={wallY + wallH - 5} x2={houseX + houseW - 11} y2={wallY + 5} stroke="#FFFFFF" strokeWidth="0.7" opacity="0.7" />

          {/* Natural Teak Wood Double Entrance Door */}
          <rect
            x={doorX}
            y={doorY}
            width={doorW}
            height={doorH}
            rx="1"
            fill="#78350F"
            stroke="#3B1705"
            strokeWidth="0.8"
          />
          {/* Teak Wood Recessed Panels */}
          <rect x={doorX + 1.5} y={doorY + 1.5} width={doorW - 3} height={doorH / 2 - 2} fill="#92400E" rx="0.5" />
          <rect x={doorX + 1.5} y={doorY + doorH / 2 + 1} width={doorW - 3} height={doorH / 2 - 2.5} fill="#92400E" rx="0.5" />
          {/* Polished Brass Golden Knob */}
          <circle cx={doorX + doorW - 2.5} cy={doorY + doorH / 2} r="0.8" fill="#FDE047" />

          {/* Entrance Portico Canopy Awning with Cast Shadow */}
          <rect
            x={doorX - 2.5}
            y={doorY - 3}
            width={doorW + 5}
            height="3.5"
            rx="1"
            fill="#C7A35A"
            stroke="#9E7E36"
            strokeWidth="0.5"
          />

          {/* Porch Warm Glow Lantern (Illuminated when selected) */}
          {isSelected ? (
            <circle cx={doorX + doorW / 2} cy={doorY - 1} r="6" fill="#FEF08A" opacity="0.75" />
          ) : (
            <circle cx={doorX + doorW / 2} cy={doorY - 1} r="1.5" fill="#FDE047" />
          )}

          {/* Welcome Threshold Stone Paver */}
          <rect
            x={doorX - 1}
            y={wallY + wallH}
            width={doorW + 2}
            height="3.5"
            rx="0.5"
            fill="#94A3B8"
            stroke="#475569"
            strokeWidth="0.5"
          />

          {/* 3. 3D HIPPED ARCHITECTURAL ROOF WITH TILES & DIRECTIONAL LIGHTING */}
          <g id={`roof-${plotNumber}`}>
            {/* Top / Left Slope (Sunlit plane) */}
            <polygon
              points={`
                ${houseX},${roofY}
                ${houseX + houseW},${roofY}
                ${houseX + houseW - 12},${roofY + roofH * 0.45}
                ${houseX + 12},${roofY + roofH * 0.45}
              `}
              fill={theme.roofSun}
            />

            {/* Bottom / Front Slope (Shadow plane) */}
            <polygon
              points={`
                ${houseX},${roofY + roofH}
                ${houseX + houseW},${roofY + roofH}
                ${houseX + houseW - 12},${roofY + roofH * 0.45}
                ${houseX + 12},${roofY + roofH * 0.45}
              `}
              fill={theme.roofShadow}
            />

            {/* Left Hip Slope */}
            <polygon
              points={`
                ${houseX},${roofY}
                ${houseX + 12},${roofY + roofH * 0.45}
                ${houseX},${roofY + roofH}
              `}
              fill={theme.roofSun}
            />

            {/* Right Hip Slope */}
            <polygon
              points={`
                ${houseX + houseW},${roofY}
                ${houseX + houseW - 12},${roofY + roofH * 0.45}
                ${houseX + houseW},${roofY + roofH}
              `}
              fill={theme.roofShadow}
            />

            {/* Sharp Architectural Ridge Cap with White Sunlight Highlight */}
            <line
              x1={houseX + 12}
              y1={roofY + roofH * 0.45}
              x2={houseX + houseW - 12}
              y2={roofY + roofH * 0.45}
              stroke="#FFFFFF"
              strokeWidth="1.4"
              opacity="0.85"
            />

            {/* Roof Tile Grooves (Realistic Clay Shingle Lines) */}
            <line x1={houseX + 6} y1={roofY + roofH * 0.22} x2={houseX + houseW - 6} y2={roofY + roofH * 0.22} stroke="#FFFFFF" strokeWidth="0.5" opacity="0.35" strokeDasharray="3 2" />
            <line x1={houseX + 4} y1={roofY + roofH * 0.72} x2={houseX + houseW - 4} y2={roofY + roofH * 0.72} stroke="#000000" strokeWidth="0.6" opacity="0.45" strokeDasharray="3 2" />

            {/* Glass Skylight with Realistic Cyan-White Glare */}
            <rect
              x={houseX + houseW / 2 - 8}
              y={roofY + roofH * 0.45 - 5}
              width="16"
              height="10"
              rx="1.5"
              fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
            <line x1={houseX + houseW / 2 - 5} y1={roofY + roofH * 0.45 + 3} x2={houseX + houseW / 2 + 5} y2={roofY + roofH * 0.45 - 3} stroke="#FFFFFF" strokeWidth="0.9" opacity="0.9" />

            {/* Rooftop Solar PV Clean Energy Array with Silicon Grid */}
            <rect
              x={houseX + 8}
              y={roofY + 3}
              width={isLuxury ? 14 : 10}
              height={roofH * 0.3}
              rx="1"
              fill="#0F172A"
              stroke="#94A3B8"
              strokeWidth="0.5"
            />
            <line x1={houseX + 8} y1={roofY + 3 + (roofH * 0.3) / 2} x2={houseX + 8 + (isLuxury ? 14 : 10)} y2={roofY + 3 + (roofH * 0.3) / 2} stroke="#38BDF8" strokeWidth="0.5" />

            {/* Chimney Stack with 3D Bevel and Cast Shadow */}
            <rect x={houseX + houseW - 12} y={roofY + 4} width="5" height="5" rx="0.8" fill="#475569" stroke="#1E293B" strokeWidth="0.5" />
            <rect x={houseX + houseW - 13} y={roofY + 3} width="7" height="2" rx="0.5" fill="#94A3B8" />
          </g>
        </g>

        {/* 4. FRONT YARD: WALKWAY, LANDSCAPING, METALLIC CAR & POOL */}
        <g id={`yard-${plotNumber}`}>
          {/* Stepping Stone Pavers from Entrance to Road */}
          {showLandscaping && (
            <g>
              <line
                x1={doorX + doorW / 2}
                y1={wallY + wallH + 3.5}
                x2={doorX + doorW / 2}
                y2={plotY + plotH - 2}
                stroke="#E2E8F0"
                strokeWidth="2.5"
                strokeDasharray="3.5 2"
              />
              {/* 3D Spherical Garden Trees / Shrubs with Sun Canopy */}
              <circle cx={houseX + 1} cy={wallY + wallH + 4} r="3.2" fill="url(#treeCanopy3D)" filter="url(#treeCastShadow)" />
              <circle cx={houseX + houseW - 1} cy={wallY + wallH + 4} r="3.2" fill="url(#treeCanopy3D)" filter="url(#treeCastShadow)" />
              <circle cx={houseX + 5} cy={wallY + wallH + 7} r="2.2" fill="url(#treeCanopy3D)" />
              <circle cx={houseX + houseW - 5} cy={wallY + wallH + 7} r="2.2" fill="url(#treeCanopy3D)" />
            </g>
          )}

          {/* Paved Driveway & Miniature Luxury Car */}
          {showVehicles && (
            <g id={`car-group-${plotNumber}`}>
              {/* Cobblestone Paved Parking Pad */}
              <rect
                x={carX - 1.5}
                y={carY - 1.5}
                width={carW + 3}
                height={carH + 3}
                rx="2"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="0.6"
              />

              {/* Car Ground Shadow */}
              <rect x={carX + 1} y={carY + 2} width={carW} height={carH} rx="3" fill="#020814" opacity="0.6" />

              {/* Miniature Metallic Car Body */}
              <rect
                x={carX}
                y={carY}
                width={carW}
                height={carH}
                rx="3.5"
                fill={theme.carFill}
                stroke="#0F172A"
                strokeWidth="0.7"
              />

              {/* Tinted Cabin Roof & Windshields */}
              <rect
                x={carX + 1.5}
                y={carY + 4}
                width={carW - 3}
                height={carH - 9}
                rx="2"
                fill="#0F172A"
              />
              {/* Front Windshield Glass Reflection */}
              <rect
                x={carX + 2}
                y={carY + carH - 7}
                width={carW - 4}
                height="3"
                rx="0.8"
                fill="#38BDF8"
                opacity="0.8"
              />
              {/* Rear Windshield Glass Reflection */}
              <rect
                x={carX + 2.5}
                y={carY + 2.5}
                width={carW - 5}
                height="2.5"
                rx="0.8"
                fill="#38BDF8"
                opacity="0.8"
              />

              {/* Headlights (Glowing on selected) */}
              <circle cx={carX + 2} cy={carY + carH - 1} r="1.1" fill={isSelected ? '#FEF08A' : '#FDE047'} />
              <circle cx={carX + carW - 2} cy={carY + carH - 1} r="1.1" fill={isSelected ? '#FEF08A' : '#FDE047'} />
              {/* Projected Headlight Beams on Selected */}
              {isSelected && (
                <polygon
                  points={`
                    ${carX},${carY + carH}
                    ${carX - 2},${plotY + plotH - 2}
                    ${carX + carW + 2},${plotY + plotH - 2}
                    ${carX + carW},${carY + carH}
                  `}
                  fill="#FEF08A"
                  opacity="0.25"
                />
              )}
            </g>
          )}

          {/* Private Turquoise Plunge Pool (For 1250+ and 1500 sqft plots) */}
          {(isLuxury || isMid) && (
            <g id={`pool-${plotNumber}`}>
              {/* Turquoise Pool Basin with Depth Gradient */}
              <rect
                x={poolX}
                y={poolY}
                width={poolW}
                height={poolH}
                rx="3.5"
                fill="url(#poolTurquoise)"
                stroke="#67E8F9"
                strokeWidth="0.9"
              />
              {/* Water Caustics Shimmer Lines */}
              <line x1={poolX + 3} y1={poolY + 5} x2={poolX + poolW - 3} y2={poolY + 5} stroke="#E0F2FE" strokeWidth="0.8" opacity="0.85" />
              <line x1={poolX + 3} y1={poolY + 11} x2={poolX + poolW - 3} y2={poolY + 11} stroke="#E0F2FE" strokeWidth="0.8" opacity="0.85" />
              <line x1={poolX + 3} y1={poolY + 17} x2={poolX + poolW - 3} y2={poolY + 17} stroke="#E0F2FE" strokeWidth="0.8" opacity="0.85" />
              {/* Submerged Pool Steps */}
              <rect x={poolX + poolW - 5} y={poolY + 2} width="3" height="4" rx="0.5" fill="#E0F2FE" opacity="0.9" />
              {/* Teak Wood Sun Lounger Deck Chair */}
              <rect x={poolX - 4} y={poolY + 4} width="2.8" height="10" rx="0.6" fill="#D97706" stroke="#92400E" strokeWidth="0.4" />
            </g>
          )}
        </g>

        {/* 5. LUXURY BRASS & GLASS PLOT BADGE (TOP APEX PLACEMENT) */}
        <g id={`badge-${plotNumber}`}>
          <rect
            x={plotX + 3}
            y={plotY + 3}
            width={isLuxury ? 40 : 36}
            height="14"
            rx="3"
            fill="#050A17"
            fillOpacity="0.88"
            stroke={isSelected ? '#DFC382' : theme.borderStroke}
            strokeWidth={isSelected ? 1.4 : 0.7}
          />
          {/* Status Dot Beacon */}
          <circle cx={plotX + 7} cy={plotY + 10} r="2.2" fill={theme.beaconColor} />
          {/* Plot Number */}
          <text
            x={plotX + 11}
            y={plotY + 13}
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="0.4"
          >
            {plotNumber}
          </text>
        </g>

        {/* 6. FLOATING CALLOUT WHEN TAPPED / ENLARGED */}
        {isSelected && (
          <g id={`enlarged-callout-${plotNumber}`}>
            <rect
              x={plotX + plotW / 2 - 42}
              y={plotY - 16}
              width="84"
              height="15"
              rx="4"
              fill="#0B1734"
              stroke="#DFC382"
              strokeWidth="1.4"
              style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))' }}
            />
            <text
              x={plotX + plotW / 2}
              y={plotY - 5.5}
              fill="#DFC382"
              fontSize="7.8"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.5"
            >
              ★ {plotNumber} • {areaSqft} SQFT
            </text>
            <polygon
              points={`
                ${plotX + plotW / 2 - 3.5},${plotY - 1}
                ${plotX + plotW / 2 + 3.5},${plotY - 1}
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
  // 3. PHOTOREALISTIC MINIATURE VILLA (HORIZONTAL: BLOCK C: 120x55)
  // =========================================================================
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
        fill={theme.lawnFill}
        stroke={theme.borderStroke}
        strokeWidth={theme.strokeWidth}
        rx="5"
      />

      {/* Selected Corner Gold Brackets */}
      {isSelected && (
        <g stroke="#DFC382" strokeWidth="1.8" fill="none">
          <path d={`M ${plotX + 1} ${plotY + 8} L ${plotX + 1} ${plotY + 1} L ${plotX + 8} ${plotY + 1}`} />
          <path d={`M ${plotX + plotW - 8} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 1} L ${plotX + plotW - 1} ${plotY + 8}`} />
          <path d={`M ${plotX + 1} ${plotY + plotH - 8} L ${plotX + 1} ${plotY + plotH - 1} L ${plotX + 8} ${plotY + plotH - 1}`} />
          <path d={`M ${plotX + plotW - 8} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 1} L ${plotX + plotW - 1} ${plotY + plotH - 8}`} />
        </g>
      )}

      {/* 2. Horizontal Villa Structure (Left side) */}
      <g id={`house-${plotNumber}`}>
        {/* Directional Sun Cast Shadow */}
        <rect
          x={houseX + 3}
          y={houseY + 3}
          width={houseW}
          height={houseH}
          rx="3"
          fill="#01140A"
          opacity="0.65"
          filter="url(#houseCastShadow)"
        />

        {/* Front Elevation Wall Strip (Bottom 35%) */}
        <rect
          x={houseX}
          y={houseY + houseH * 0.65}
          width={houseW}
          height={houseH * 0.35}
          fill="url(#wallIvoryStucco)"
          stroke="#64748B"
          strokeWidth="0.6"
        />

        {/* Hipped Roof with Multi-tone Directional Sunlight */}
        <polygon
          points={`
            ${houseX},${houseY}
            ${houseX + houseW},${houseY}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + 8},${houseY + houseH * 0.55}
          `}
          fill={theme.roofSun}
        />
        <polygon
          points={`
            ${houseX},${houseY + houseH * 0.65}
            ${houseX + houseW},${houseY + houseH * 0.65}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + 8},${houseY + houseH * 0.55}
          `}
          fill={theme.roofShadow}
        />
        <polygon
          points={`
            ${houseX},${houseY}
            ${houseX + 8},${houseY + houseH * 0.55}
            ${houseX},${houseY + houseH * 0.65}
          `}
          fill={theme.roofSun}
        />
        <polygon
          points={`
            ${houseX + houseW},${houseY}
            ${houseX + houseW - 8},${houseY + houseH * 0.55}
            ${houseX + houseW},${houseY + houseH * 0.65}
          `}
          fill={theme.roofShadow}
        />

        {/* Roof Ridge Line */}
        <line
          x1={houseX + 8}
          y1={houseY + houseH * 0.55}
          x2={houseX + houseW - 8}
          y2={houseY + houseH * 0.55}
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.85"
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
          strokeWidth="0.5"
        />

        {/* Skylight Glass */}
        <rect
          x={houseX + houseW / 2 - 6}
          y={houseY + houseH * 0.55 - 4}
          width="12"
          height="7"
          rx="1"
          fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
          stroke="#FFFFFF"
          strokeWidth="0.6"
        />

        {/* Left Picture Window */}
        <rect
          x={houseX + 6}
          y={houseY + houseH * 0.68}
          width="12"
          height={houseH * 0.25}
          rx="0.8"
          fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
          stroke="#334155"
          strokeWidth="0.6"
        />

        {/* Main Teak Door with Porch Awning */}
        <rect
          x={houseX + houseW / 2 - 4}
          y={houseY + houseH * 0.66}
          width="8"
          height={houseH * 0.33}
          rx="0.8"
          fill="#78350F"
          stroke="#3B1705"
          strokeWidth="0.6"
        />
        <circle cx={houseX + houseW / 2 + 1.5} cy={houseY + houseH * 0.82} r="0.7" fill="#FDE047" />

        {/* Right Picture Window */}
        <rect
          x={houseX + houseW - 18}
          y={houseY + houseH * 0.68}
          width="12"
          height={houseH * 0.25}
          rx="0.8"
          fill={isSelected ? 'url(#glassWarmIlluminated)' : 'url(#glassSkyGlaze)'}
          stroke="#334155"
          strokeWidth="0.6"
        />
      </g>

      {/* 3. Side Yard: Paved Driveway, Car & Garden (Right side) */}
      <g id={`yard-${plotNumber}`}>
        {/* 3D Garden Shrubs in Top Right */}
        {showLandscaping && (
          <g>
            <circle cx={sideX + 6} cy={sideY + 6} r="3.5" fill="url(#treeCanopy3D)" filter="url(#treeCastShadow)" />
            <circle cx={sideX + 15} cy={sideY + 5} r="2.8" fill="url(#treeCanopy3D)" />
            <circle cx={sideX + 23} cy={sideY + 7} r="3.2" fill="url(#treeCanopy3D)" />
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
          strokeWidth="0.6"
        />

        {/* Miniature Parked Car */}
        {showVehicles && (
          <g id={`car-${plotNumber}`}>
            <rect
              x={carX}
              y={carY}
              width={carW}
              height={carH}
              rx="3"
              fill={theme.carFill}
              stroke="#0F172A"
              strokeWidth="0.6"
            />
            {/* Car Windshields */}
            <rect
              x={carX + 4}
              y={carY + 1.5}
              width={carW - 8}
              height={carH - 3}
              rx="1.5"
              fill="#0F172A"
            />
            {/* Front Headlights */}
            <circle cx={carX + carW - 1} cy={carY + 3} r="0.9" fill={isSelected ? '#FEF08A' : '#FDE047'} />
            <circle cx={carX + carW - 1} cy={carY + carH - 3} r="0.9" fill={isSelected ? '#FEF08A' : '#FDE047'} />
          </g>
        )}
      </g>

      {/* 4. Elegant Plot Badge (Top-left Corner) */}
      <g id={`badge-${plotNumber}`}>
        <rect
          x={plotX + 3}
          y={plotY + 3}
          width="38"
          height="14"
          rx="3"
          fill="#050A17"
          fillOpacity="0.88"
          stroke={isSelected ? '#DFC382' : theme.borderStroke}
          strokeWidth={isSelected ? 1.4 : 0.7}
        />
        <circle cx={plotX + 7} cy={plotY + 10} r="2.2" fill={theme.beaconColor} />
        <text
          x={plotX + 11}
          y={plotY + 13}
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {plotNumber}
        </text>
      </g>

      {/* 5. FLOATING CALLOUT WHEN TAPPED / ENLARGED */}
      {isSelected && (
        <g id={`enlarged-callout-${plotNumber}`}>
          <rect
            x={plotX + plotW / 2 - 45}
            y={plotY - 16}
            width="90"
            height="15"
            rx="4"
            fill="#0B1734"
            stroke="#DFC382"
            strokeWidth="1.4"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))' }}
          />
          <text
            x={plotX + plotW / 2}
            y={plotY - 5.5}
            fill="#DFC382"
            fontSize="7.8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            ★ {plotNumber} • {areaSqft} SQFT
          </text>
          <polygon
            points={`
              ${plotX + plotW / 2 - 3.5},${plotY - 1}
              ${plotX + plotW / 2 + 3.5},${plotY - 1}
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
