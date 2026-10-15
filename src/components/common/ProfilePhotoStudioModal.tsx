'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Sparkles,
  Check,
  X,
  RefreshCw,
  User,
  Move
} from 'lucide-react';

interface ProfilePhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  memberName: string;
  onSave: (newAvatarUrl: string | undefined) => void;
}

type FilterPreset = 'normal' | 'pro' | 'warm' | 'cool' | 'bw' | 'vibrant';

interface FilterSetting {
  brightness: number; // 70 to 140, default 100
  contrast: number;   // 70 to 140, default 100
  saturation: number; // 0 to 200, default 100
  sepia: number;      // 0 to 100, default 0
  grayscale: number;  // 0 to 100, default 0
  hueRotate: number;  // -180 to 180, default 0
}

const PRESET_FILTERS: Record<FilterPreset, { nameHi: string; nameEn: string; settings: FilterSetting }> = {
  normal: {
    nameHi: 'सामान्य (Normal)',
    nameEn: 'Normal',
    settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 }
  },
  pro: {
    nameHi: 'कॉर्पोरेट प्रो (Pro)',
    nameEn: 'Corporate Pro',
    settings: { brightness: 106, contrast: 118, saturation: 108, sepia: 0, grayscale: 0, hueRotate: 0 }
  },
  warm: {
    nameHi: 'स्टूडियो वॉर्म (Warm)',
    nameEn: 'Studio Warm',
    settings: { brightness: 105, contrast: 112, saturation: 105, sepia: 22, grayscale: 0, hueRotate: -5 }
  },
  cool: {
    nameHi: 'एग्जीक्यूटिव कूल (Cool)',
    nameEn: 'Executive Cool',
    settings: { brightness: 103, contrast: 112, saturation: 102, sepia: 0, grayscale: 0, hueRotate: 15 }
  },
  bw: {
    nameHi: 'क्लासिक ब्लैक & व्हाइट (B&W)',
    nameEn: 'Classic B&W',
    settings: { brightness: 108, contrast: 125, saturation: 0, sepia: 0, grayscale: 100, hueRotate: 0 }
  },
  vibrant: {
    nameHi: 'गोल्डन वाइब्रेंट (Gold)',
    nameEn: 'Golden Vibrant',
    settings: { brightness: 108, contrast: 112, saturation: 140, sepia: 8, grayscale: 0, hueRotate: 0 }
  }
};

// Preset SVG / Avatar options if worker does not want to upload raw personal photo
const PRESET_AVATARS = [
  { id: 'pres-1', label: 'Executive Gold', color: '#C7A35A', bg: '#0B1734' },
  { id: 'pres-2', label: 'Field Leader', color: '#16A34A', bg: '#052E16' },
  { id: 'pres-3', label: 'Star Manager', color: '#3B82F6', bg: '#082F49' },
  { id: 'pres-4', label: 'Director Crest', color: '#E11D48', bg: '#4C0519' },
];

function ProfilePhotoStudioModalContent({
  onClose,
  currentAvatarUrl,
  memberName,
  onSave
}: ProfilePhotoStudioModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(() => currentAvatarUrl || null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [activePreset, setActivePreset] = useState<FilterPreset>('normal');
  const [customFilter, setCustomFilter] = useState<FilterSetting>(PRESET_FILTERS.normal.settings);
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Preset Change
  const handleSelectPreset = (preset: FilterPreset) => {
    setActivePreset(preset);
    setCustomFilter(PRESET_FILTERS[preset].settings);
  };

  // Build CSS filter string
  const getFilterCss = useCallback((f: FilterSetting) => {
    return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) sepia(${f.sepia}%) grayscale(${f.grayscale}%) hue-rotate(${f.hueRotate}deg)`;
  }, []);

  // Handle File Upload from device / camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल अपलोड करें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setActivePreset('normal');
      setCustomFilter(PRESET_FILTERS.normal.settings);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Dragging handlers for repositioning image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageSrc) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length === 0) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageSrc || e.touches.length === 0) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Generate Preset Avatar as SVG Data URL
  const handleSelectPresetAvatar = (avatar: typeof PRESET_AVATARS[0]) => {
    const initials = memberName.slice(0, 2).toUpperCase() || 'AK';
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="${avatar.bg}"/>
        <circle cx="200" cy="200" r="180" fill="none" stroke="${avatar.color}" stroke-width="8" stroke-dasharray="16 8"/>
        <circle cx="200" cy="200" r="160" fill="${avatar.bg}"/>
        <text x="200" y="225" font-family="serif" font-size="120" font-weight="bold" fill="${avatar.color}" text-anchor="middle">${initials}</text>
        <text x="200" y="320" font-family="sans-serif" font-size="22" font-weight="bold" fill="#DFC382" text-anchor="middle" letter-spacing="4">AKGV INFRA CITY</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setImageSrc(dataUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setActivePreset('normal');
    setCustomFilter(PRESET_FILTERS.normal.settings);
  };

  // Save Final Processed Image via Canvas
  const handleSaveCroppedImage = () => {
    if (!imageSrc) {
      onSave(undefined);
      onClose();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const outputSize = 400; // High resolution square canvas for crisp display
      canvas.width = outputSize;
      canvas.height = outputSize;

      ctx.clearRect(0, 0, outputSize, outputSize);

      // Apply Filter string to canvas context
      const filterStr = getFilterCss(customFilter);
      ctx.filter = filterStr;

      // Save canvas state before transforms
      ctx.save();

      // Move origin to center of canvas
      ctx.translate(outputSize / 2, outputSize / 2);

      // Apply user rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Scale based on zoom
      ctx.scale(zoom, zoom);

      // Apply user drag offset (normalized to preview scale)
      // Preview circle is 224px (w-56)
      const previewRatio = outputSize / 224;
      ctx.translate(position.x * previewRatio, position.y * previewRatio);

      // Draw image centered
      // Maintain aspect ratio cover
      const aspect = img.width / img.height;
      let drawW = outputSize;
      let drawH = outputSize;
      if (aspect > 1) {
        drawW = outputSize * aspect;
      } else {
        drawH = outputSize / aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      // Export as high quality JPEG Data URL
      try {
        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onSave(finalDataUrl);
        onClose();
      } catch (err) {
        console.error('Canvas export error:', err);
        // Fallback to imageSrc
        onSave(imageSrc);
        onClose();
      }
    };
    img.src = imageSrc;
  };

  // Remove Photo handler
  const handleRemovePhoto = () => {
    if (confirm('क्या आप अपनी प्रोफाइल फोटो हटाना चाहते हैं? इसके बाद आपकी आईडी पर इनिशियल्स (AK) दिखाई देंगे।')) {
      setImageSrc(null);
      onSave(undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-[#C7A35A] bg-[#070D1E] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1734] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A] text-[#DFC382]">
              <Camera className="h-5 w-5 text-[#C7A35A]" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
                Profile Photo Studio (फोटो एडिटर एवं फिल्टर)
              </h3>
              <p className="text-[11px] text-gray-400">
                Crop, resize, position and apply professional studio filters to your associate badge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs">
          {/* Main Visual Editor Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Interactive Circular Viewport */}
            <div className="md:col-span-6 flex flex-col items-center justify-center space-y-3">
              <div
                className="relative h-56 w-56 sm:h-64 sm:s-64 rounded-full border-4 border-[#C7A35A] bg-[#050A17] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt={memberName}
                    draggable={false}
                    className="max-w-none transition-transform duration-75 pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                      filter: getFilterCss(customFilter),
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                    <User className="h-16 w-16 text-gray-600" />
                    <span className="text-gray-400 font-semibold text-[11px]">
                      No photo selected
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Upload from phone or select a preset below
                    </span>
                  </div>
                )}

                {/* Circular Framing & Drag Overlay Indicator */}
                {imageSrc && (
                  <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none flex items-center justify-center">
                    <div className="h-full w-full rounded-full border border-dashed border-[#C7A35A]/40" />
                  </div>
                )}
              </div>

              {/* Reposition instruction */}
              {imageSrc && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Move className="h-3 w-3 text-[#C7A35A]" />
                  <span>फोटो को एडजस्ट करने के लिए माउस/उंगली से ड्रैग करें</span>
                </div>
              )}
            </div>

            {/* Right: Controls & Adjustments */}
            <div className="md:col-span-6 space-y-4">
              {/* Upload & Remove Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-2.5 px-3 font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition text-xs"
                >
                  <Upload className="h-4 w-4" />
                  <span>{imageSrc ? 'बदलें (Change Photo)' : 'फोटो अपलोड करें (Upload)'}</span>
                </button>

                {imageSrc && (
                  <button
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">हटाएं</span>
                  </button>
                )}
              </div>

              {/* Zoom & Rotation Controls */}
              {imageSrc && (
                <div className="rounded-2xl border border-white/10 bg-[#050A17] p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <ZoomIn className="h-3.5 w-3.5 text-[#C7A35A]" />
                      आकार / ज़ूम (Resize & Zoom)
                    </span>
                    <span className="font-mono text-[#DFC382] font-bold">{zoom.toFixed(2)}x</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
                      className="rounded-lg bg-white/5 hover:bg-white/10 p-1.5 text-gray-300"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.8"
                      max="3.0"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#C7A35A] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <button
                      onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                      className="rounded-lg bg-white/5 hover:bg-white/10 p-1.5 text-gray-300"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white"
                    >
                      <RotateCw className="h-3.5 w-3.5 text-[#C7A35A]" />
                      <span>Rotate (90°)</span>
                    </button>

                    <button
                      onClick={() => {
                        setPosition({ x: 0, y: 0 });
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#DFC382]"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset Position</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ready-made Corporate Avatar Options if user doesn't have an image */}
              {!imageSrc && (
                <div className="rounded-2xl border border-white/10 bg-[#050A17] p-3.5 space-y-2">
                  <span className="font-semibold text-gray-300 block text-[11px]">
                    या आधिकारिक कॉर्पोरेट अवतार चुनें:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        onClick={() => handleSelectPresetAvatar(av)}
                        className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0B1734] p-2 hover:border-[#C7A35A] text-left transition"
                      >
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center font-serif text-[10px] font-bold"
                          style={{ backgroundColor: av.bg, color: av.color, border: `1px solid ${av.color}` }}
                        >
                          {memberName.slice(0, 2).toUpperCase() || 'AK'}
                        </div>
                        <span className="text-[11px] text-gray-200 font-medium truncate">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Presets Strip */}
          {imageSrc && (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 text-[#C7A35A]" />
                  प्रोफेशनल फोटो फिल्टर्स (Studio Tone Filters)
                </span>
                <button
                  onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
                  className="flex items-center gap-1 text-[11px] text-[#DFC382] hover:underline"
                >
                  <Sliders className="h-3 w-3" />
                  <span>{showAdvancedSliders ? 'फिल्टर्स छुपाएं' : 'एडवांस्ड एडजस्टमेंट'}</span>
                </button>
              </div>

              {/* Filter Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(Object.keys(PRESET_FILTERS) as FilterPreset[]).map((key) => {
                  const preset = PRESET_FILTERS[key];
                  const isSelected = activePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition ${
                        isSelected
                          ? 'border-[#C7A35A] bg-[#C7A35A]/15 text-[#DFC382] font-bold shadow'
                          : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] block">{preset.nameEn}</span>
                      <span className="text-[9px] text-gray-500 block truncate">{preset.nameHi}</span>
                    </button>
                  );
                })}
              </div>

              {/* Advanced Sliders Collapsible */}
              {showAdvancedSliders && (
                <div className="rounded-2xl border border-white/10 bg-[#050A17] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">ब्राइटनेस (Brightness)</span>
                      <span className="font-mono text-[#DFC382]">{customFilter.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={customFilter.brightness}
                      onChange={(e) =>
                        setCustomFilter((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))
                      }
                      className="w-full accent-[#C7A35A] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">कंट्रास्ट (Contrast)</span>
                      <span className="font-mono text-[#DFC382]">{customFilter.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      value={customFilter.contrast}
                      onChange={(e) =>
                        setCustomFilter((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))
                      }
                      className="w-full accent-[#C7A35A] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">सैचुरेशन (Saturation)</span>
                      <span className="font-mono text-[#DFC382]">{customFilter.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={customFilter.saturation}
                      onChange={(e) =>
                        setCustomFilter((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))
                      }
                      className="w-full accent-[#C7A35A] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas for High-Resolution Export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Footer CTAs */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-gray-400 hover:text-white transition text-xs"
            >
              Cancel (रद्द करें)
            </button>

            <button
              onClick={handleSaveCroppedImage}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-2.5 font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
            >
              <Check className="h-4 w-4" />
              <span>सेव करें (Apply & Save to Profile)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePhotoStudioModal(props: ProfilePhotoStudioModalProps) {
  if (!props.isOpen) return null;
  return <ProfilePhotoStudioModalContent key={props.currentAvatarUrl || 'new'} {...props} />;
}
