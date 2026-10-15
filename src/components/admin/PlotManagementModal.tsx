'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Compass,
  DollarSign,
  Layers,
  MapPin,
  Maximize2,
  Ruler,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Plot, PlotStatus } from '@/types';
import { HOUSE_MODELS, PROJECT_LOCATIONS } from '@/data/groundTruth';

interface PlotManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotToEdit?: Plot | null;
  onSuccessNotice?: (msg: string) => void;
}

export function PlotManagementModal({
  isOpen,
  onClose,
  plotToEdit,
  onSuccessNotice
}: PlotManagementModalProps) {
  const { plots, addPlot, updatePlot } = useApp();
  const isEditing = !!plotToEdit;

  // Form Fields
  const [block, setBlock] = useState<'A' | 'B' | 'C' | string>('A');
  const [plotNumber, setPlotNumber] = useState('');
  const [locationId, setLocationId] = useState('loc-rampur');
  const [widthFt, setWidthFt] = useState<number>(20);
  const [lengthFt, setLengthFt] = useState<number>(50);
  const [areaSqft, setAreaSqft] = useState<number>(1000);
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [dimensions, setDimensions] = useState("20' x 50'");
  const [roadWidth, setRoadWidth] = useState("30'-0\" WIDE");
  const [roadFacing, setRoadFacing] = useState('North');
  const [isCornerPlot, setIsCornerPlot] = useState(false);
  const [ratePerSqft, setRatePerSqft] = useState<number>(1200);
  const [basePriceInr, setBasePriceInr] = useState<number>(1200000);
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [status, setStatus] = useState<PlotStatus>('available_green');
  const [selectedHouseModels, setSelectedHouseModels] = useState<string[]>([
    'model-royal-villa',
    'model-emerald-duplex'
  ]);
  const [notes, setNotes] = useState('');

  // Blueprint SVG Coordinates (Auto or Fine-Tuned)
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [coordX, setCoordX] = useState<number>(100);
  const [coordY, setCoordY] = useState<number>(730);
  const [coordWidth, setCoordWidth] = useState<number>(75);
  const [coordHeight, setCoordHeight] = useState<number>(125);

  const [errorMsg, setErrorMsg] = useState('');

  // When opening or changing plotToEdit
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');

    if (plotToEdit) {
      setBlock(plotToEdit.block);
      setPlotNumber(plotToEdit.plotNumber);
      setLocationId(plotToEdit.locationId || 'loc-rampur');
      setAreaSqft(plotToEdit.areaSqft);
      setDimensions(plotToEdit.dimensions);
      setRoadWidth(plotToEdit.roadWidth);
      setRoadFacing(plotToEdit.roadFacing);
      setIsCornerPlot(!!plotToEdit.isCornerPlot);
      const price = plotToEdit.basePriceInr || 1200000;
      setBasePriceInr(price);
      setRatePerSqft(Math.round(price / (plotToEdit.areaSqft || 1000)));
      setStatus(plotToEdit.status);
      setSelectedHouseModels(plotToEdit.suitableHouseModelIds || []);
      setNotes(plotToEdit.notes || '');
      setCoordX(plotToEdit.x || 100);
      setCoordY(plotToEdit.y || 730);
      setCoordWidth(plotToEdit.width || 75);
      setCoordHeight(plotToEdit.height || 125);
    } else {
      // Create Mode: Suggest smart next plot number for Block A
      suggestNextPlotNumber('A');
      setBlock('A');
      setLocationId('loc-rampur');
      setWidthFt(20);
      setLengthFt(50);
      setAreaSqft(1000);
      setDimensions("20' x 50'");
      setRoadWidth("30'-0\" WIDE");
      setRoadFacing('North');
      setIsCornerPlot(false);
      setRatePerSqft(1200);
      setBasePriceInr(1200000);
      setStatus('available_green');
      setSelectedHouseModels(['model-royal-villa', 'model-emerald-duplex']);
      setNotes('');
      // Auto-assign smart canvas position
      calculateSmartCoords('A');
    }
  }, [isOpen, plotToEdit]);

  const suggestNextPlotNumber = (selectedBlk: string) => {
    const existingInBlock = plots.filter((p) => p.block.toUpperCase() === selectedBlk.toUpperCase());
    let maxNum = 0;
    for (const p of existingInBlock) {
      const match = p.plotNumber.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextNum = maxNum + 1;
    const formatted = `${selectedBlk.toUpperCase()}-${nextNum < 10 ? `0${nextNum}` : nextNum}`;
    setPlotNumber(formatted);
  };

  const calculateSmartCoords = (selectedBlk: string) => {
    const existingInBlock = plots.filter((p) => p.block.toUpperCase() === selectedBlk.toUpperCase());
    if (existingInBlock.length > 0) {
      const lastPlot = existingInBlock[existingInBlock.length - 1];
      if (selectedBlk === 'A') {
        setCoordX(Math.min((lastPlot.x || 100) + 80, 950));
        setCoordY(lastPlot.y || 730);
        setCoordWidth(lastPlot.width || 75);
        setCoordHeight(lastPlot.height || 125);
      } else if (selectedBlk === 'B') {
        setCoordX(Math.min((lastPlot.x || 100) + 80, 950));
        setCoordY(lastPlot.y || 400);
        setCoordWidth(lastPlot.width || 75);
        setCoordHeight(lastPlot.height || 125);
      } else {
        setCoordX((lastPlot.x || 300) + 60);
        setCoordY(lastPlot.y || 200);
        setCoordWidth(lastPlot.width || 60);
        setCoordHeight(lastPlot.height || 100);
      }
    } else {
      setCoordX(100);
      setCoordY(730);
      setCoordWidth(75);
      setCoordHeight(125);
    }
  };

  // Recalculate dimensions & area when width or length changes
  const handleDimensionChange = (newWidth: number, newLength: number) => {
    setWidthFt(newWidth);
    setLengthFt(newLength);
    if (!isCustomArea) {
      const computedArea = newWidth * newLength;
      setAreaSqft(computedArea);
      setDimensions(`${newWidth}' x ${newLength}'`);
      if (!isCustomPrice) {
        setBasePriceInr(computedArea * ratePerSqft);
      }
    }
  };

  // Recalculate price when rate per sqft changes
  const handleRateChange = (rate: number) => {
    setRatePerSqft(rate);
    if (!isCustomPrice) {
      setBasePriceInr(areaSqft * rate);
    }
  };

  // Check duplicate plot number
  const isDuplicatePlotNumber = (inputNumber: string): boolean => {
    const clean = inputNumber.trim().toUpperCase();
    return plots.some(
      (p) => p.plotNumber.toUpperCase() === clean && (!plotToEdit || p.id !== plotToEdit.id)
    );
  };

  const handleBlockChange = (newBlk: string) => {
    setBlock(newBlk);
    if (!isEditing) {
      suggestNextPlotNumber(newBlk);
      calculateSmartCoords(newBlk);
    }
  };

  const toggleHouseModel = (modelId: string) => {
    setSelectedHouseModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPlotNumber = plotNumber.trim().toUpperCase();
    if (!cleanPlotNumber) {
      setErrorMsg('Plot Number is required (e.g. A-11, B-12).');
      return;
    }

    if (isDuplicatePlotNumber(cleanPlotNumber)) {
      setErrorMsg(`Plot Number "${cleanPlotNumber}" already exists in the master plan registry! Choose a unique number.`);
      return;
    }

    if (areaSqft <= 0) {
      setErrorMsg('Area must be greater than 0 sqft.');
      return;
    }

    if (basePriceInr <= 0) {
      setErrorMsg('Base price must be greater than ₹0.');
      return;
    }

    const plotPayload: Omit<Plot, 'id'> = {
      plotNumber: cleanPlotNumber,
      block: block as 'A' | 'B' | 'C',
      locationId,
      areaSqft,
      dimensions: dimensions.trim() || `${widthFt}' x ${lengthFt}'`,
      roadWidth,
      roadFacing,
      status,
      basePriceInr,
      suitableHouseModelIds: selectedHouseModels,
      isCornerPlot,
      notes: notes.trim() || undefined,
      x: coordX,
      y: coordY,
      width: coordWidth,
      height: coordHeight,
    };

    if (isEditing && plotToEdit) {
      updatePlot(plotToEdit.id, plotPayload);
      if (onSuccessNotice) {
        onSuccessNotice(`Plot ${cleanPlotNumber} details successfully updated in Master Plan!`);
      }
    } else {
      addPlot(plotPayload);
      if (onSuccessNotice) {
        onSuccessNotice(`New Plot ${cleanPlotNumber} successfully registered into Master Plan!`);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  const duplicateDetected = isDuplicatePlotNumber(plotNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-b from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-8 shadow-2xl my-8 text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DFC382] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-[#C7A35A]" />
              <span>Master Plan Plot Governance Engine</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {isEditing ? `Edit Demarcated Plot #${plotToEdit.plotNumber}` : 'Register New Demarcated Plot (नया प्लॉट जोड़ें)'}
            </h2>
            <p className="text-xs text-gray-400">
              {isEditing
                ? 'Update dimensions, road width, base pricing, and status on this plot.'
                : 'Add a new plot to the 1:500 scale master plan with instant blueprint calculation and inventory activation.'}
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Block & Plot Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Select Block / ब्लॉक <span className="text-[#C7A35A]">*</span>
              </label>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBlockChange(b)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                      block === b
                        ? 'bg-[#C7A35A] text-[#0B1734] border-[#C7A35A]'
                        : 'bg-[#050A17] text-gray-300 border-white/15 hover:border-white/30'
                    }`}
                  >
                    Block {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Plot Number / प्लॉट नंबर <span className="text-[#C7A35A]">*</span>
              </label>
              <input
                type="text"
                required
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value.toUpperCase())}
                placeholder="e.g. A-11 or B-12"
                className={`w-full rounded-xl border bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 font-mono font-bold focus:outline-none ${
                  duplicateDetected
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-white/15 focus:border-[#C7A35A]'
                }`}
              />
              {duplicateDetected && (
                <span className="text-[10px] text-red-400 block mt-1">
                  ⚠️ This plot number already exists in inventory!
                </span>
              )}
            </div>
          </div>

          {/* Project Location Selection */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">
              Project Location / साइट स्थान
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            >
              {PROJECT_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.headline}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions & Area Auto-Calculator */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-[#C7A35A]" />
                <span>Dimensions & Area Calculation</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomArea(!isCustomArea)}
                className="text-[11px] text-[#DFC382] hover:underline"
              >
                {isCustomArea ? 'Switch to Standard (W x L)' : 'Custom Irregular Area?'}
              </button>
            </div>

            {!isCustomArea ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Width (ft)</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={widthFt}
                    onChange={(e) => handleDimensionChange(Number(e.target.value), lengthFt)}
                    className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Depth / Length (ft)</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={lengthFt}
                    onChange={(e) => handleDimensionChange(widthFt, Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Total Area (sqft)</label>
                  <div className="w-full rounded-xl border border-emerald-500/30 bg-[#050A17] px-3 py-2 text-xs font-mono font-bold text-emerald-400">
                    {areaSqft} sqft
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Custom Area (sqft)</label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={areaSqft}
                    onChange={(e) => {
                      const newArea = Number(e.target.value);
                      setAreaSqft(newArea);
                      if (!isCustomPrice) setBasePriceInr(newArea * ratePerSqft);
                    }}
                    className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Dimensions Text</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 42' x 30' Irregular"
                    className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Engine */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#DFC382] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#C7A35A]" />
                <span>Base Pricing & Valuation</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomPrice(!isCustomPrice)}
                className="text-[11px] text-[#DFC382] hover:underline"
              >
                {isCustomPrice ? 'Auto-calculate from rate' : 'Direct custom price override?'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Rate per sqft (₹/sqft)</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  value={ratePerSqft}
                  onChange={(e) => handleRateChange(Number(e.target.value))}
                  disabled={isCustomPrice}
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Total Base Price (₹)</label>
                <input
                  type="number"
                  min="100000"
                  max="100000000"
                  step="10000"
                  value={basePriceInr}
                  onChange={(e) => setBasePriceInr(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white font-mono font-bold text-[#DFC382]"
                />
                <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                  Valuation: ₹{(basePriceInr / 100000).toFixed(2)} Lakh
                </span>
              </div>
            </div>
          </div>

          {/* Road Width, Facing & Corner status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Road Corridor Width
              </label>
              <select
                value={roadWidth}
                onChange={(e) => setRoadWidth(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              >
                <option value="30'-0&quot; WIDE">30&apos;-0&quot; WIDE (Entrance Avenue)</option>
                <option value="25'-0&quot; WIDE">25&apos;-0&quot; WIDE (Sector Road)</option>
                <option value="20'-0&quot; WIDE">20&apos;-0&quot; WIDE (Internal Road)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Road Facing / दिशा
              </label>
              <select
                value={roadFacing}
                onChange={(e) => setRoadFacing(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              >
                <option value="North">North (उत्तरमुखी)</option>
                <option value="East">East (पूर्वमुखी - Vastu)</option>
                <option value="West">West (पश्चिममुखी)</option>
                <option value="South">South (दक्षिणमुखी)</option>
                <option value="Corner (North-East)">Corner (North-East)</option>
                <option value="Corner (North-West)">Corner (North-West)</option>
                <option value="Corner (South-East)">Corner (South-East)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Plot Status / वर्तमान स्थिति
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlotStatus)}
                className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              >
                <option value="available_green">Available (Green) — बिक्री हेतु उपलब्ध</option>
                <option value="booked_yellow">Booked (Yellow) — टोकन प्राप्त</option>
                <option value="vacant_red">Vacant / Reserved (Red) — आरक्षित</option>
              </select>
            </div>
          </div>

          {/* Corner Plot Toggle */}
          <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isCornerPlot}
              onChange={(e) => setIsCornerPlot(e.target.checked)}
              className="rounded border-white/20 bg-[#050A17] text-[#C7A35A] focus:ring-0"
            />
            <span>Corner Plot (कॉर्नर प्लॉट — दो तरफ खुली सड़क)</span>
          </label>

          {/* Suitable Villa Models */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300 block">
              Architectural Elevation Suitability (वास्तु मॉडल)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {HOUSE_MODELS.map((model) => {
                const selected = selectedHouseModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleHouseModel(model.id)}
                    className={`rounded-xl p-3 text-left border transition ${
                      selected
                        ? 'border-[#C7A35A] bg-[#C7A35A]/10 text-white'
                        : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#DFC382]">{model.name}</div>
                    <div className="text-[10px] text-gray-400">{model.bhk}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Blueprint Canvas Coordinates */}
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
              className="text-xs text-[#DFC382] hover:underline flex items-center gap-1 font-semibold"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>{showAdvancedCoords ? 'Hide Blueprint Canvas Coordinates' : 'Advanced: Adjust Blueprint SVG Placement (x, y, width, height)'}</span>
            </button>

            {showAdvancedCoords && (
              <div className="grid grid-cols-4 gap-2 mt-3 p-3 rounded-xl bg-[#050A17] border border-white/10">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Canvas X</label>
                  <input
                    type="number"
                    value={coordX}
                    onChange={(e) => setCoordX(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Canvas Y</label>
                  <input
                    type="number"
                    value={coordY}
                    onChange={(e) => setCoordY(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={coordWidth}
                    onChange={(e) => setCoordWidth(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={coordHeight}
                    onChange={(e) => setCoordHeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">
              Administrative Remarks / विशेष विवरण
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Front row plot next to entrance boulevard, immediate registry ready"
              className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
            >
              Cancel / रद्द करें
            </button>
            <button
              type="submit"
              disabled={duplicateDetected}
              className="rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] px-6 py-2.5 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isEditing ? 'Save Changes / अपडेट करें' : 'Register Plot / प्लॉट जोड़ें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
