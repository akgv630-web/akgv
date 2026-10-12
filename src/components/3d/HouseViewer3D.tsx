'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Camera,
  Compass,
  Expand,
  Eye,
  Layers,
  Maximize2,
  Moon,
  Palette,
  RotateCw,
  Ruler,
  ShieldAlert,
  Sun,
  Sunset,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { HouseModel, Plot } from '@/types';
import { HOUSE_MODELS, INITIAL_PLOTS } from '@/data/groundTruth';
import { PlotHoldCertificateModal } from '@/components/common/PlotHoldCertificateModal';
import { useApp } from '@/context/AppContext';

// Procedural 3D Architectural Villa Component with high detail
function ProceduralVilla({
  theme,
  lightingMode,
  showDimensions,
  showRoof = true,
}: {
  theme: HouseModel['exteriorThemes'][0];
  lightingMode: 'day' | 'golden' | 'night';
  showDimensions: boolean;
  showRoof: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Soft idle animation
  useFrame((state) => {
    if (groupRef.current) {
      // gentle subtle breathe
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });

  const wallColor = theme.primaryColor;
  const accentColor = theme.accentColor;
  const roofColor = theme.roofColor;

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Dimension Line & Measurement Labels */}
      {showDimensions && (
        <group position={[0, 0, 3.8]}>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [new THREE.Vector3(-2.5, 0.1, 0), new THREE.Vector3(2.5, 0.1, 0)];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial attach="material" color="#C7A35A" linewidth={2} />
          </line>
          <Html position={[0, 0.3, 0]} center>
            <div className="rounded bg-[#0B1734]/90 px-2 py-0.5 text-[10px] font-bold text-[#DFC382] border border-[#C7A35A]/50 shadow">
              Plot Width: 25&apos;-0&quot;
            </div>
          </Html>
        </group>
      )}

      {/* 1. Base / Plot Platform (Lawn & Paving) */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.2, 7.5]} />
        <meshStandardMaterial color="#0A2218" roughness={0.9} />
      </mesh>

      {/* Entry Walkway & Driveway */}
      <mesh position={[0, 0.01, 1.8]} receiveShadow>
        <boxGeometry args={[2.2, 0.05, 3.8]} />
        <meshStandardMaterial color="#64748B" roughness={0.7} />
      </mesh>

      {/* 2. Ground Floor Living Envelope */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.0, 4.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Ground Floor Architectural Accent Cladding (Teak / Stone) */}
      <mesh position={[-1.2, 1.0, 2.32]} castShadow>
        <boxGeometry args={[1.5, 2.0, 0.1]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {/* Ground Floor Entrance Door */}
      <mesh position={[0, 0.7, 2.33]} castShadow>
        <boxGeometry args={[0.9, 1.4, 0.08]} />
        <meshStandardMaterial color="#3E2723" roughness={0.4} />
      </mesh>

      {/* Ground Floor Large Glazed Windows */}
      <mesh position={[1.1, 1.1, 2.33]}>
        <boxGeometry args={[1.6, 1.2, 0.05]} />
        <meshPhysicalMaterial
          color="#38BDF8"
          roughness={0.1}
          transmission={0.7}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Window Mullions (Black Architectural Metal) */}
      <mesh position={[1.1, 1.1, 2.34]}>
        <boxGeometry args={[1.64, 0.04, 0.06]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[1.1, 1.1, 2.34]}>
        <boxGeometry args={[0.04, 1.24, 0.06]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Floor Divider Slab / Mid-beam Cantilever */}
      <mesh position={[0, 2.05, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.15, 4.9]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* 3. First Floor Duplex / Master Suite */}
      <mesh position={[0.2, 3.0, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.8, 3.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* First Floor Balcony Floor */}
      <mesh position={[-0.8, 2.15, 1.4]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 1.8]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} />
      </mesh>

      {/* Balcony Glass Railing */}
      <mesh position={[-0.8, 2.55, 2.28]}>
        <boxGeometry args={[2.2, 0.7, 0.04]} />
        <meshPhysicalMaterial
          color="#93C5FD"
          transmission={0.8}
          roughness={0.1}
          thickness={0.3}
        />
      </mesh>
      <mesh position={[-0.8, 2.9, 2.28]}>
        <boxGeometry args={[2.24, 0.04, 0.06]} />
        <meshStandardMaterial color="#C7A35A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* First Floor Bedroom Window */}
      <mesh position={[0.8, 3.0, 1.72]}>
        <boxGeometry args={[1.8, 1.1, 0.05]} />
        <meshPhysicalMaterial
          color="#38BDF8"
          roughness={0.1}
          transmission={0.7}
          thickness={0.5}
        />
      </mesh>

      {/* 4. Roof & Cantilever Pergola */}
      {showRoof && (
        <group position={[0, 4.0, 0]}>
          {/* Main Roof Slab */}
          <mesh position={[0.2, 0, -0.2]} castShadow>
            <boxGeometry args={[4.2, 0.18, 4.2]} />
            <meshStandardMaterial color={roofColor} roughness={0.6} />
          </mesh>

          {/* Luxury Pergola Wooden Beams */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((offset, i) => (
            <mesh key={i} position={[offset, 0.3, 1.0]} castShadow>
              <boxGeometry args={[0.08, 0.08, 2.2]} />
              <meshStandardMaterial color="#78350F" roughness={0.5} />
            </mesh>
          ))}
          {/* Pergola Support Posts */}
          <mesh position={[-0.8, -0.5, 2.0]} castShadow>
            <boxGeometry args={[0.08, 1.8, 0.08]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0.8, -0.5, 2.0]} castShadow>
            <boxGeometry args={[0.08, 1.8, 0.08]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>
      )}

      {/* Car Porch Structure */}
      <group position={[-2.2, 0, 0.8]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 3.2]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} />
        </mesh>
        <mesh position={[-0.7, 0.9, 1.4]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
          <meshStandardMaterial color="#C7A35A" metalness={0.8} />
        </mesh>
      </group>

      {/* Night Interior Glow Light */}
      {lightingMode === 'night' && (
        <pointLight position={[0, 1.2, 1.0]} intensity={2.5} color="#FBBF24" distance={5} />
      )}
    </group>
  );
}

export function HouseViewer3D({
  initialPlot,
  initialHouseModel,
}: {
  initialPlot?: Plot;
  initialHouseModel?: HouseModel;
}) {
  const { t, language } = useApp();
  const c = t.houseViewer;

  const [selectedHouse, setSelectedHouse] = useState<HouseModel>(initialHouseModel || HOUSE_MODELS[0]);
  const [selectedPlot, setSelectedPlot] = useState<Plot>(initialPlot || INITIAL_PLOTS[3]); // A-04 default
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [lightingMode, setLightingMode] = useState<'day' | 'golden' | 'night'>('day');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showRoof, setShowRoof] = useState(true);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const controlsRef = useRef<any>(null);

  const activeTheme = selectedHouse.exteriorThemes[selectedThemeIndex] || selectedHouse.exteriorThemes[0];

  // Preset Camera Angles
  const setCameraAngle = (view: 'front' | 'rear' | 'left' | 'right' | 'top' | 'iso') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    switch (view) {
      case 'front':
        controls.object.position.set(0, 2, 9);
        break;
      case 'rear':
        controls.object.position.set(0, 2, -9);
        break;
      case 'left':
        controls.object.position.set(-9, 2, 0);
        break;
      case 'right':
        controls.object.position.set(9, 2, 0);
        break;
      case 'top':
        controls.object.position.set(0, 11, 0.1);
        break;
      case 'iso':
      default:
        controls.object.position.set(6, 5, 8);
        break;
    }
    controls.target.set(0, 1.5, 0);
    controls.update();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    controlsRef.current.object.position.multiplyScalar(factor);
    controlsRef.current.update();
  };

  // Plot-fit Verification
  const isPlotCompatible = selectedPlot.areaSqft >= selectedHouse.minPlotAreaSqft;

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/80 p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C7A35A] animate-pulse" />
            <h2 className="font-serif text-lg font-bold text-white tracking-wide">
              {c.title}
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            {c.subtitle}: <strong className="text-white">{selectedHouse.name}</strong> • Plot{' '}
            <strong className="text-[#DFC382]">{selectedPlot.plotNumber}</strong> ({selectedPlot.dimensions} • {selectedPlot.areaSqft} sqft)
          </p>
        </div>

        {/* Plot-Fit Verification Badge */}
        <div className="flex items-center gap-2">
          {isPlotCompatible ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{c.fitApproved} ({selectedPlot.areaSqft} sqft ≥ {selectedHouse.minPlotAreaSqft} sqft)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{c.fitFailed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Business Clarification Notice */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-4 py-3 text-xs text-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
        <div className="flex items-start gap-2.5">
          <span className="rounded bg-[#C7A35A]/20 px-2 py-0.5 text-[10px] font-bold text-[#DFC382] uppercase tracking-wider shrink-0 mt-0.5">
            {c.noticeBadge}
          </span>
          <span className="text-gray-300 leading-relaxed text-[11px]">
            {c.noticeText}
          </span>
        </div>
        <span className="text-[11px] text-[#DFC382] font-semibold shrink-0">
          {c.noticeTag}
        </span>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="relative h-[550px] w-full overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-gradient-to-b from-[#0B1734] to-[#040711] shadow-2xl lg:col-span-8">
          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [6, 5, 8], fov: 45 }}
            className="h-full w-full cursor-grab active:cursor-grabbing"
          >
            {/* Ambient & Directional Lighting */}
            {lightingMode === 'day' && (
              <>
                <ambientLight intensity={0.7} />
                <directionalLight
                  position={[10, 15, 10]}
                  intensity={1.2}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-bias={-0.0001}
                />
              </>
            )}
            {lightingMode === 'golden' && (
              <>
                <ambientLight intensity={0.5} color="#FED7AA" />
                <directionalLight
                  position={[12, 6, 8]}
                  intensity={1.8}
                  color="#F97316"
                  castShadow
                />
              </>
            )}
            {lightingMode === 'night' && (
              <>
                <ambientLight intensity={0.15} color="#1E293B" />
                <directionalLight position={[-5, 10, -5]} intensity={0.3} color="#60A5FA" />
              </>
            )}

            <Suspense
              fallback={
                <Html center>
                  <div className="flex items-center gap-2 rounded-xl bg-[#0B1734]/90 p-3 text-xs text-[#DFC382] border border-[#C7A35A]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C7A35A] border-t-transparent" />
                    <span>Loading 3D House Geometry...</span>
                  </div>
                </Html>
              }
            >
              <ProceduralVilla
                theme={activeTheme}
                lightingMode={lightingMode}
                showDimensions={showDimensions}
                showRoof={showRoof}
              />
              <ContactShadows
                position={[0, -0.6, 0]}
                opacity={0.65}
                scale={12}
                blur={2}
                far={4}
              />
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.05}
              minDistance={3.5}
              maxDistance={18}
              maxPolarAngle={Math.PI / 2.1} // Prevent sinking below ground
            />
          </Canvas>

          {/* Quick HUD Camera Preset Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0B1734]/85 p-1.5 shadow-lg backdrop-blur">
            <button
              onClick={() => setCameraAngle('iso')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
              title="Isometric 360 View"
            >
              360° Iso
            </button>
            <button
              onClick={() => setCameraAngle('front')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              Front
            </button>
            <button
              onClick={() => setCameraAngle('rear')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              Rear
            </button>
            <button
              onClick={() => setCameraAngle('left')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              Left
            </button>
            <button
              onClick={() => setCameraAngle('right')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              Right
            </button>
            <button
              onClick={() => setCameraAngle('top')}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-200 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
            >
              Floor Plan
            </button>
          </div>

          {/* Lighting Mode Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex gap-1 rounded-xl border border-white/10 bg-[#0B1734]/85 p-1 shadow-lg backdrop-blur">
            <button
              onClick={() => setLightingMode('day')}
              className={`rounded-lg p-1.5 transition ${lightingMode === 'day' ? 'bg-[#C7A35A] text-[#0B1734]' : 'text-gray-300 hover:text-white'}`}
              title="Daylight"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLightingMode('golden')}
              className={`rounded-lg p-1.5 transition ${lightingMode === 'golden' ? 'bg-[#C7A35A] text-[#0B1734]' : 'text-gray-300 hover:text-white'}`}
              title="Golden Hour"
            >
              <Sunset className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`rounded-lg p-1.5 transition ${lightingMode === 'night' ? 'bg-[#C7A35A] text-[#0B1734]' : 'text-gray-300 hover:text-white'}`}
              title="Architectural Night Lighting"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Zoom & Measurement Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 rounded-xl border border-white/10 bg-[#0B1734]/85 p-1.5 shadow-lg backdrop-blur">
            <button
              onClick={() => handleZoom('in')}
              className="rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`rounded-lg p-2 transition ${showDimensions ? 'bg-[#C7A35A] text-[#0B1734]' : 'bg-white/5 text-gray-300'}`}
              title="Toggle Dimensions"
            >
              <Ruler className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowRoof(!showRoof)}
              className={`rounded-lg p-2 transition ${!showRoof ? 'bg-[#C7A35A] text-[#0B1734]' : 'bg-white/5 text-gray-300'}`}
              title="Inspect Upper Floor / Roof Off"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>

          {/* Direct Floating Book Button inside 3D Canvas */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHoldModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-3.5 py-2 text-xs font-bold text-[#0B1734] shadow-xl hover:brightness-110 active:scale-95 transition"
            >
              <span>⚡ {c.canvasHoldBtn} #{selectedPlot.plotNumber} (₹{((selectedPlot.basePriceInr || 1200000) / 100000).toFixed(2)}L)</span>
            </button>
            <div className="hidden sm:block rounded-lg border border-white/10 bg-[#050A17]/80 px-2.5 py-1 text-[10px] text-gray-400 backdrop-blur">
              {c.canvasGuide}
            </div>
          </div>
        </div>

        {/* Right Configuration Drawer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Select Model Dropdown */}
          <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-5 shadow-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block mb-1.5">
                {c.chooseModel}
              </label>
              <div className="space-y-2">
                {HOUSE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedHouse(model);
                      setSelectedThemeIndex(0);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                      selectedHouse.id === model.id
                        ? 'border-2 border-[#C7A35A] bg-[#050A17]'
                        : 'border border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">{model.name}</span>
                      <span className="text-[11px] text-gray-400">{model.bhk} • {model.carpetAreaSqft} sqft</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">
                      ₹{(model.estimatedCostInr / 100000).toFixed(1)}L
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Plot to Verify Fitment */}
            <div>
              <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block mb-1.5">
                {c.simulateOnPlot}
              </label>
              <select
                value={selectedPlot.id}
                onChange={(e) => {
                  const p = INITIAL_PLOTS.find((item) => item.id === e.target.value);
                  if (p) setSelectedPlot(p);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              >
                {INITIAL_PLOTS.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    Plot {plot.plotNumber} — {plot.areaSqft} sqft ({plot.dimensions})
                  </option>
                ))}
              </select>
            </div>

            {/* Exterior Material & Finish Selector */}
            <div>
              <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-[#C7A35A]" />
                {c.finishesLabel}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {selectedHouse.exteriorThemes.map((theme, index) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedThemeIndex(index)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs transition ${
                      selectedThemeIndex === index
                        ? 'border border-[#C7A35A] bg-[#C7A35A]/15 text-white'
                        : 'border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{theme.name}</span>
                    <div className="flex gap-1">
                      <span
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.roofColor }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="border-t border-white/10 pt-3">
              <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                {c.highlightsTitle}
              </span>
              <ul className="space-y-1.5 text-[11px] text-gray-300">
                {selectedHouse.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#C7A35A] shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Booking & Consultation Actions */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <button
                onClick={() => setHoldModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-3 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                <span>⚡ {c.drawerHoldBtn} #{selectedPlot.plotNumber}</span>
              </button>

              <a
                href={`https://wa.me/916306917991?text=${encodeURIComponent(
                  language === 'hi'
                    ? `नमस्ते एकेजीवी इन्फ्रा सिटी! मैं वाराणसी में प्लॉट #${selectedPlot.plotNumber} (${selectedPlot.areaSqft} वर्गफुट, ब्लॉक ${selectedPlot.block}) खरीदने में रुचि रखता हूँ। कृपया मुझे प्लॉट रजिस्ट्री और बुकिंग की पूरी जानकारी दें।`
                    : language === 'hinglish'
                    ? `Namaste AKGV Infra City! Main Varanasi me Plot #${selectedPlot.plotNumber} (${selectedPlot.areaSqft} sqft, Block ${selectedPlot.block}) kharidne me interested hoon. Please mujhe plot registry aur booking ki details share karein.`
                    : `Namaste AKGV Infra City! I am interested in purchasing Plot #${selectedPlot.plotNumber} (${selectedPlot.areaSqft} sqft, Block ${selectedPlot.block}) in Varanasi. Please share plot registry and booking details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-600 transition"
              >
                <span>💬 {c.drawerWhatsAppBtn} #{selectedPlot.plotNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Official 72-Hour Plot Hold Certificate Modal */}
      <PlotHoldCertificateModal
        plot={selectedPlot}
        isOpen={holdModalOpen}
        onClose={() => setHoldModalOpen(false)}
        preferredHouseModelId={selectedHouse.id}
      />
    </div>
  );
}
