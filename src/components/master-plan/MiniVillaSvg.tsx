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

  // Status Colors & Themes
  const getTheme = (status: PlotStatus) => {
    switch (status) {
      case 'available_green':
        return {
          lawn: '#143823',
          roofMain: '#1B6A4C',
          roofShadow: '#0E4933',
          roofHighlight: '#298A64',
          wall: '#E2E8F0',
          accent: '#22C55E',
          stroke: isSelected ? '#FFFFFF' : '#22C55E',
          strokeWidth: isSelected ? 3 : 1.5,
          badgeBg: '#14532D',
          badgeText: '#86EFAC',
          cadFill: '#0D3822',
        };
      case 'booked_yellow':
        return {
          lawn: '#2E2812',
          roofMain: '#9A6B15',
          roofShadow: '#734E0C',
          roofHighlight: '#B8821B',
          wall: '#FDE68A',
          accent: '#EAB308',
          stroke: isSelected ? '#FFFFFF' : '#EAB308',
          strokeWidth: isSelected ? 3 : 1.5,
          badgeBg: '#713F12',
          badgeText: '#FDE047',
          cadFill: '#382A0A',
        };
      case 'vacant_red':
      default:
        return {
          lawn: '#361517',
          roofMain: '#991B1B',
          roofShadow: '#7F1D1D',
          roofHighlight: '#B91C1C',
          wall: '#FECACA',
          accent: '#EF4444',
          stroke: isSelected ? '#FFFFFF' : '#EF4444',
          strokeWidth: isSelected ? 3 : 1.5,
          badgeBg: '#7F1D1D',
          badgeText: '#FCA5A5',
          cadFill: '#3F1214',
        };
    }
  };

  const theme = getTheme(status);
  const isLuxury = areaSqft >= 1500;
  const isMid = areaSqft >= 1000 && areaSqft < 1500;

  // Plot inset margins
  const pad = 3;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const plotX = x + pad;
  const plotY = y + pad;

  // If CAD Mode
  if (viewMode === 'cad') {
    return (
      <g className="cursor-pointer transition duration-150">
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill={theme.cadFill}
          stroke={theme.stroke}
          strokeWidth={theme.strokeWidth}
          strokeDasharray={isSelected ? 'none' : '4 2'}
          rx="2"
        />

        {/* Diagonal Corner Registration CAD marks */}
        <line x1={plotX} y1={plotY + 8} x2={plotX + 8} y2={plotY} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX + plotW - 8} y1={plotY} x2={plotX + plotW} y2={plotY + 8} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX} y1={plotY + plotH - 8} x2={plotX + 8} y2={plotY + plotH} stroke="#94A3B8" strokeWidth="0.8" />
        <line x1={plotX + plotW - 8} y1={plotY + plotH} x2={plotX + plotW} y2={plotY + plotH - 8} stroke="#94A3B8" strokeWidth="0.8" />

        {/* Plot Number */}
        <text
          x={plotX + plotW / 2}
          y={plotY + plotH / 2 - 4}
          fill="#FFFFFF"
          fontSize={plotW < 80 ? '10' : '12'}
          fontWeight="800"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {plotNumber}
        </text>

        {/* CAD Dimension & Area */}
        <text
          x={plotX + plotW / 2}
          y={plotY + plotH / 2 + 8}
          fill="#94A3B8"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {areaSqft} SQFT
        </text>

        {showDimensions && (
          <text
            x={plotX + plotW / 2}
            y={plotY + plotH / 2 + 18}
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

  // ==========================================
  // VILLA & LANDSCAPE ARCHITECTURAL RENDERING
  // ==========================================

  // Villa building footprint within the plot
  const housePadX = isLuxury ? 6 : 5;
  const housePadY = isLuxury ? 6 : 5;
  const houseW = plotW - housePadX * 2;
  const houseH = plotH * 0.65;
  const houseX = plotX + housePadX;
  const houseY = plotY + housePadY;

  // Front yard / driveway area
  const yardY = houseY + houseH;
  const yardH = plotH - houseH - housePadY;

  return (
    <g
      className={`cursor-pointer transition-transform duration-200 ${
        isHovered ? 'scale-[1.015]' : ''
      }`}
      style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
    >
      {/* 1. Plot Base / Lawn boundary */}
      <rect
        x={plotX}
        y={plotY}
        width={plotW}
        height={plotH}
        fill={theme.lawn}
        stroke={theme.stroke}
        strokeWidth={theme.strokeWidth}
        rx="4"
        style={isSelected ? { filter: 'url(#plotGlow)' } : undefined}
      />

      {/* 2. Landscaped Garden / Front Pathway */}
      {showLandscaping && (
        <g opacity="0.85">
          {/* Garden grass texture dots/patches */}
          <rect x={plotX + 2} y={yardY + 2} width={plotW - 4} height={yardH - 4} fill="#0F2B1C" rx="2" />
          {/* Stone Walkway Pavers to Entrance */}
          <line
            x1={plotX + plotW / 2}
            y1={yardY}
            x2={plotX + plotW / 2}
            y2={plotY + plotH - 2}
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeDasharray="3 2"
          />
        </g>
      )}

      {/* 3. Luxury Plot Swimming Pool & Deck (1500 sqft plots only) */}
      {isLuxury && (
        <g opacity="0.95">
          {/* Turquoise Plunge Pool */}
          <rect
            x={plotX + plotW - 28}
            y={yardY + 4}
            width={24}
            height={Math.max(16, yardH - 8)}
            rx="3"
            fill="#06B6D4"
            stroke="#67E8F9"
            strokeWidth="0.8"
          />
          {/* Water highlight shimmer */}
          <line
            x1={plotX + plotW - 24}
            y1={yardY + 8}
            x2={plotX + plotW - 8}
            y2={yardY + 8}
            stroke="#E0F2FE"
            strokeWidth="1"
            opacity="0.8"
          />
          {/* Pool deck lounger indicator */}
          <rect
            x={plotX + plotW - 34}
            y={yardY + 5}
            width={4}
            height={10}
            rx="1"
            fill="#F8FAFC"
            opacity="0.9"
          />
        </g>
      )}

      {/* 4. Driveway & Parked Vehicle (Car) */}
      {showVehicles && (
        <g opacity="0.9">
          {/* Paved parking spot */}
          <rect
            x={plotX + 4}
            y={yardY + 3}
            width={isLuxury ? 24 : 18}
            height={Math.max(16, yardH - 6)}
            rx="2"
            fill="#1E293B"
            stroke="#475569"
            strokeWidth="0.5"
          />
          {/* Miniature Car Roof / Windshield Silhouette */}
          <rect
            x={plotX + 6}
            y={yardY + 5}
            width={isLuxury ? 20 : 14}
            height={Math.max(12, yardH - 10)}
            rx="3"
            fill={status === 'booked_yellow' ? '#EAB308' : '#F1F5F9'}
          />
          {/* Front & Rear Windshields */}
          <rect
            x={plotX + 8}
            y={yardY + 6}
            width={isLuxury ? 16 : 10}
            height={3}
            rx="1"
            fill="#0F172A"
          />
          <rect
            x={plotX + 8}
            y={yardY + Math.max(12, yardH - 10)}
            width={isLuxury ? 16 : 10}
            height={2.5}
            rx="1"
            fill="#0F172A"
          />
        </g>
      )}

      {/* 5. Miniature Architectural House Structure */}
      <g>
        {/* Exterior Building Wall Base */}
        <rect
          x={houseX}
          y={houseY}
          width={houseW}
          height={houseH}
          rx="3"
          fill={theme.wall}
          stroke="#475569"
          strokeWidth="0.8"
        />

        {/* Main Hipped/Pitched Villa Roof Slopes */}
        {/* Top/Back Roof Slope */}
        <polygon
          points={`
            ${houseX},${houseY} 
            ${houseX + houseW},${houseY} 
            ${houseX + houseW - 10},${houseY + houseH * 0.4} 
            ${houseX + 10},${houseY + houseH * 0.4}
          `}
          fill={theme.roofShadow}
        />
        {/* Bottom/Front Roof Slope */}
        <polygon
          points={`
            ${houseX},${houseY + houseH} 
            ${houseX + houseW},${houseY + houseH} 
            ${houseX + houseW - 10},${houseY + houseH * 0.4} 
            ${houseX + 10},${houseY + houseH * 0.4}
          `}
          fill={theme.roofHighlight}
        />
        {/* Left Gable/Hip Slope */}
        <polygon
          points={`
            ${houseX},${houseY} 
            ${houseX + 10},${houseY + houseH * 0.4} 
            ${houseX},${houseY + houseH}
          `}
          fill={theme.roofMain}
        />
        {/* Right Gable/Hip Slope */}
        <polygon
          points={`
            ${houseX + houseW},${houseY} 
            ${houseX + houseW - 10},${houseY + houseH * 0.4} 
            ${houseX + houseW},${houseY + houseH}
          `}
          fill={theme.roofMain}
        />

        {/* Roof Central Ridge Line */}
        <line
          x1={houseX + 10}
          y1={houseY + houseH * 0.4}
          x2={houseX + houseW - 10}
          y2={houseY + houseH * 0.4}
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* 6. Modern Rooftop Features: Solar Panels & Skylight */}
        {/* Glass Skylight */}
        <rect
          x={houseX + houseW / 2 - (isLuxury ? 10 : 7)}
          y={houseY + houseH * 0.4 - 4}
          width={isLuxury ? 20 : 14}
          height={8}
          rx="1.5"
          fill="#38BDF8"
          stroke="#E0F2FE"
          strokeWidth="0.6"
          opacity="0.85"
        />

        {/* Solar Panel Array on Roof (Clean Energy Feature) */}
        <g opacity="0.85">
          <rect
            x={houseX + 14}
            y={houseY + 3}
            width={isLuxury ? 18 : 12}
            height={houseH * 0.28}
            rx="1"
            fill="#0F172A"
            stroke="#94A3B8"
            strokeWidth="0.4"
          />
          <line
            x1={houseX + 14}
            y1={houseY + 3 + (houseH * 0.28) / 2}
            x2={houseX + 14 + (isLuxury ? 18 : 12)}
            y2={houseY + 3 + (houseH * 0.28) / 2}
            stroke="#94A3B8"
            strokeWidth="0.4"
          />
        </g>

        {/* Balcony / Open Pergola Slats on Right Corner */}
        {isMid && (
          <g opacity="0.85">
            <line x1={houseX + houseW - 14} y1={houseY + 3} x2={houseX + houseW - 4} y2={houseY + 3} stroke="#B45309" strokeWidth="1" />
            <line x1={houseX + houseW - 14} y1={houseY + 6} x2={houseX + houseW - 4} y2={houseY + 6} stroke="#B45309" strokeWidth="1" />
            <line x1={houseX + houseW - 14} y1={houseY + 9} x2={houseX + houseW - 4} y2={houseY + 9} stroke="#B45309" strokeWidth="1" />
          </g>
        )}
      </g>

      {/* 7. Floating Architectural Plot Label Badge */}
      <g>
        {/* Glassmorphic Pill Container */}
        <rect
          x={plotX + plotW / 2 - 32}
          y={houseY + houseH * 0.4 - 9}
          width={64}
          height={18}
          rx="4"
          fill="#050B1B"
          fillOpacity="0.88"
          stroke={isSelected ? '#FFFFFF' : theme.stroke}
          strokeWidth={isSelected ? 1.5 : 0.8}
        />

        {/* Status Dot */}
        <circle
          cx={plotX + plotW / 2 - 24}
          y={houseY + houseH * 0.4}
          r="2.5"
          fill={theme.accent}
        />

        {/* Plot Number */}
        <text
          x={plotX + plotW / 2 - 17}
          y={houseY + houseH * 0.4 + 3.5}
          fill="#FFFFFF"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          {plotNumber}
        </text>

        {/* Sqft Tag */}
        <text
          x={plotX + plotW / 2 + 15}
          y={houseY + houseH * 0.4 + 3}
          fill="#DFC382"
          fontSize="7"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {areaSqft}
        </text>
      </g>

      {/* 8. Optional Dimension Callout at Bottom */}
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
