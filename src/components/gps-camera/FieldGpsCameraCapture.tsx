'use client';

import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Crosshair,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Upload,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { INITIAL_PLOTS } from '@/data/groundTruth';

export function FieldGpsCameraCapture() {
  const { currentUser, submitGpsEvidence, gpsEvidences } = useApp();
  const [selectedPlotNumber, setSelectedPlotNumber] = useState('A-04');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [captureMethod, setCaptureMethod] = useState<'live_camera' | 'file_upload' | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [notes, setNotes] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request GPS Location with permission
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy * 10) / 10,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'GPS permission denied. Please allow location access in your device settings.'
            : 'Unable to acquire satellite fix. Please ensure device GPS is turned on.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Launch live device camera stream
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
      alert('Camera access denied or unavailable. You can use the gallery file upload option below.');
    }
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(dataUrl);
      setCaptureMethod('live_camera');
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
        setCaptureMethod('file_upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview) {
      alert('Please capture or select a photo.');
      return;
    }
    if (!coords) {
      alert('Live GPS coordinates must be acquired before submitting.');
      return;
    }

    submitGpsEvidence({
      plotNumber: selectedPlotNumber,
      locationId: 'loc-rampur',
      latitude: coords.lat,
      longitude: coords.lng,
      accuracyMeters: coords.accuracy,
      captureTimestamp: new Date().toISOString(),
      photoUrl: photoPreview,
      capturedByMemberId: currentUser?.memberId || 'GUEST',
      capturedByName: currentUser?.fullName || 'Field Inspector',
      adminNotes: notes,
      isLiveCamera: captureMethod === 'live_camera',
      captureSource: captureMethod || 'live_camera',
    });

    setSubmittedNotice(`Field GPS evidence for Plot ${selectedPlotNumber} submitted for administrative verification!`);
    setTimeout(() => {
      setSubmittedNotice(null);
      setPhotoPreview(null);
      setCaptureMethod(null);
      setNotes('');
    }, 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/90 p-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-[#C7A35A]" />
          <h2 className="font-serif text-xl font-bold text-white tracking-wide">
            Plot Field Evidence & Live GPS Capture
          </h2>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Authorized boundary inspection tool for field agents and buyers. Captures on-site photograph with high-accuracy satellite telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Capture Tool Form (7 Cols) */}
        <div className="rounded-2xl border border-[#C7A35A]/30 bg-[#0B1734] p-5 shadow-xl lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
            {/* Step 1: Select Plot */}
            <div>
              <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block mb-1">
                1. Select Plot Number
              </label>
              <select
                value={selectedPlotNumber}
                onChange={(e) => setSelectedPlotNumber(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
              >
                {INITIAL_PLOTS.map((p) => (
                  <option key={p.id} value={p.plotNumber}>
                    Plot {p.plotNumber} (Block {p.block} - {p.areaSqft} sqft - {p.dimensions})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Acquire High Precision GPS */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider">
                  2. Acquire Satellite GPS Coordinates
                </label>
                <button
                  type="button"
                  onClick={handleRequestGps}
                  disabled={gpsLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-[#C7A35A]/20 px-2.5 py-1 text-[11px] font-semibold text-[#DFC382] border border-[#C7A35A]/40 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
                >
                  <Crosshair className={`h-3.5 w-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{coords ? 'Refresh GPS Fix' : 'Acquire Live Location'}</span>
                </button>
              </div>

              {coords ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-300 font-semibold block uppercase">
                      GPS Fix Verified
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Lat: {coords.lat.toFixed(6)}° N, Lng: {coords.lng.toFixed(6)}° E
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    Accuracy: ±{coords.accuracy}m
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 bg-[#050A17] p-3 text-center text-gray-400">
                  {gpsLoading ? (
                    <span className="text-sky-400">Waiting for satellite telemetry...</span>
                  ) : gpsError ? (
                    <span className="text-red-400">{gpsError}</span>
                  ) : (
                    <span>Click &quot;Acquire Live Location&quot; to request on-site GPS coordinates</span>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Capture On-site Photo */}
            <div>
              <label className="text-xs font-bold text-[#DFC382] uppercase tracking-wider block mb-1.5">
                3. On-Site Physical Photo
              </label>

              {cameraActive ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#C7A35A] bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhotoFromStream}
                      className="rounded-full bg-white p-3 shadow-lg hover:scale-105 active:scale-95 transition"
                    >
                      <Camera className="h-6 w-6 text-[#0B1734]" />
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-full bg-red-600 p-3 text-white shadow-lg"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#050A17] p-2">
                  <img
                    src={photoPreview}
                    alt="Captured Plot"
                    className="w-full h-52 object-cover rounded-xl"
                  />
                  <div
                    className={`absolute top-4 left-4 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 border ${
                      captureMethod === 'live_camera'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {captureMethod === 'live_camera' ? (
                      <>
                        <Camera className="h-3 w-3" />
                        <span>Live Sensor Stream</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3" />
                        <span>Gallery File Upload</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setCaptureMethod(null);
                    }}
                    className="absolute top-4 right-4 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050A17] p-5 text-gray-300 hover:border-[#C7A35A] hover:text-white transition"
                  >
                    <Camera className="h-6 w-6 text-[#C7A35A]" />
                    <span className="font-semibold text-xs">Launch Camera</span>
                    <span className="text-[10px] text-gray-500">Live Device Capture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050A17] p-5 text-gray-300 hover:border-[#C7A35A] hover:text-white transition"
                  >
                    <Upload className="h-6 w-6 text-[#1EA275]" />
                    <span className="font-semibold text-xs">Upload from Gallery</span>
                    <span className="text-[10px] text-gray-500">Max 10MB JPG/PNG</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-300 mb-1 font-medium">Field Observations / Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Boundary markers inspected, road level verified, clear road frontage."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            {/* Statutory Disclaimer */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#DFC382]">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Legal & Technical Disclaimer</span>
              </div>
              <p>
                GPS coordinates and physical photographs serve as field reference documentation and do not constitute legal title deeds, revenue partition certification, or exact registry boundaries.
              </p>
            </div>

            {submittedNotice ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-400 font-bold text-center">
                {submittedNotice}
              </div>
            ) : (
              <button
                type="submit"
                disabled={!photoPreview || !coords}
                className="w-full rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] py-3 text-center text-xs font-bold text-[#0B1734] shadow hover:brightness-110 disabled:opacity-50 transition"
              >
                Submit Evidence for Admin Review
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Historical Evidence Feed (5 Cols) */}
        <div className="rounded-2xl border border-white/10 bg-[#050A17] p-5 shadow-xl lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-serif text-sm font-bold text-white">
              Recent Verified Field Evidence
            </h3>
            <span className="text-[10px] text-[#DFC382] font-semibold">
              {gpsEvidences.length} Records
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {gpsEvidences.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-white/5 bg-[#0B1734] p-3 text-xs space-y-2 hover:border-[#C7A35A]/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">Plot {ev.plotNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                        ev.isLiveCamera
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {ev.isLiveCamera ? 'Live Camera' : 'Gallery Upload'}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                    {ev.status === 'approved' ? 'Verified on Site' : 'Pending Review'}
                  </span>
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/40">
                  <img
                    src={ev.photoUrl}
                    alt={`Plot ${ev.plotNumber}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="text-[11px] text-gray-400 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#C7A35A]" />
                    <span className="font-mono">
                      {ev.latitude.toFixed(5)}° N, {ev.longitude.toFixed(5)}° E (±{ev.accuracyMeters}m)
                    </span>
                  </div>
                  <div>Captured by: <strong className="text-gray-300">{ev.capturedByName}</strong> ({ev.capturedByMemberId})</div>
                  {ev.adminNotes && (
                    <div className="italic text-gray-400 mt-1">&ldquo;{ev.adminNotes}&rdquo;</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
