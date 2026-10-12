'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { Plot } from '@/types';
import { COMPANY_DETAILS, HOUSE_MODELS } from '@/data/groundTruth';
import { useApp } from '@/context/AppContext';

interface PlotHoldCertificateModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
  preferredHouseModelId?: string;
  onConfirmBooking?: (buyerName: string, buyerPhone: string, houseModelId: string) => void;
}

export function PlotHoldCertificateModal({
  plot,
  isOpen,
  onClose,
  preferredHouseModelId = 'model-royal-villa',
  onConfirmBooking
}: PlotHoldCertificateModalProps) {
  const { t, language } = useApp();
  const c = t.certificate;

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedHouseId, setSelectedHouseId] = useState(preferredHouseModelId);
  const [isGenerated, setIsGenerated] = useState(false);
  const [certificateRef, setCertificateRef] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 59, seconds: 59 });

  // Update selected house model when preferred changes
  useEffect(() => {
    if (preferredHouseModelId) {
      setSelectedHouseId(preferredHouseModelId);
    }
  }, [preferredHouseModelId]);

  // Live 72-Hour Timer Simulation
  useEffect(() => {
    if (!isGenerated) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGenerated]);

  const selectedHouse = useMemo(
    () => HOUSE_MODELS.find((h) => h.id === selectedHouseId) || HOUSE_MODELS[0],
    [selectedHouseId]
  );
  const plotPriceLakh = plot ? ((plot.basePriceInr || 1200000) / 100000).toFixed(2) : '0';
  const tokenAmount = 21000; // Standard 72h Token Hold amount

  const whatsappMessage = useMemo(() => {
    if (!plot) return '';
    if (language === 'hi') {
      return `*एकेजीवी इन्फ्रा सिटी — 72 घंटे का आवासीय प्लॉट होल्ड अनुरोध*
━━━━━━━━━━━━━━━━━━━━
*बुकिंग संदर्भ क्रमांक:* ${certificateRef}
*आवंटित संपत्ति:* आवासीय प्लॉट #${plot.plotNumber} (ब्लॉक ${plot.block})
*प्लॉट क्षेत्रफल:* ${plot.areaSqft} वर्गफुट (${(plot.areaSqft / 9).toFixed(1)} गज)
*आयाम:* ${plot.dimensions}
*सड़क की चौड़ाई:* ${plot.roadWidth}
*दिशा (वास्तु):* ${plot.roadFacing} (100% वास्तु अनुकूल)
*प्लॉट मूल्य:* ₹${plotPriceLakh} लाख
*सैंपल एलिवेशन मॉडल:* ${selectedHouse.name} (केवल संदर्भ हेतु)
━━━━━━━━━━━━━━━━━━━━
*खरीदार का नाम:* ${buyerName}
*मोबाइल नंबर:* ${buyerPhone}
*होल्ड अवधि:* 72 घंटे की निश्चित गारंटी
*टोकन राशि:* ₹${tokenAmount.toLocaleString()}

_कृपया प्लॉट टोकन होल्ड सत्यापन हेतु कंपनी का बैंक खाता विवरण एवं यूपीआई क्यूआर कोड साझा करें।_`;
    }
    if (language === 'hinglish') {
      return `*AKGV INFRA CITY — 72-HOUR RESIDENTIAL PLOT HOLD REQUEST*
━━━━━━━━━━━━━━━━━━━━
*Booking Reference:* ${certificateRef}
*Allocated Plot:* Residential Plot #${plot.plotNumber} (Block ${plot.block})
*Plot Area:* ${plot.areaSqft} sqft (${(plot.areaSqft / 9).toFixed(1)} Gaj)
*Dimensions:* ${plot.dimensions}
*Road Width:* ${plot.roadWidth}
*Facing:* ${plot.roadFacing} Facing (100% Vastu Approved)
*Plot Valuation:* ₹${plotPriceLakh} Lakh
*Sample Elevation Reference:* ${selectedHouse.name} (Sirf Reference Ke Liye)
━━━━━━━━━━━━━━━━━━━━
*Buyer Name:* ${buyerName}
*Buyer Mobile:* ${buyerPhone}
*Hold Duration:* 72 Hours Guaranteed
*Token Payable:* ₹${tokenAmount.toLocaleString()}

_Please official bank account details aur UPI QR code send karein plot token hold confirmation ke liye._`;
    }
    return `*AKGV INFRA CITY — 72-HOUR RESIDENTIAL PLOT HOLD REQUEST*
━━━━━━━━━━━━━━━━━━━━
*Booking Reference:* ${certificateRef}
*Allocated Asset:* Residential Plot #${plot.plotNumber} (Block ${plot.block})
*Plot Area:* ${plot.areaSqft} sqft (${(plot.areaSqft / 9).toFixed(1)} Sq. Yards)
*Dimensions:* ${plot.dimensions}
*Road Width:* ${plot.roadWidth}
*Facing:* ${plot.roadFacing} Facing (100% Vastu Approved)
*Plot Valuation:* ₹${plotPriceLakh} Lakh
*Sample Elevation Reference:* ${selectedHouse.name} (For Reference Only)
━━━━━━━━━━━━━━━━━━━━
*Buyer Name:* ${buyerName}
*Buyer Mobile:* ${buyerPhone}
*Hold Duration:* 72 Hours Guaranteed
*Token Payable:* ₹${tokenAmount.toLocaleString()}

_Please share official bank account details & UPI QR for plot token hold verification._`;
  }, [language, certificateRef, plot, plotPriceLakh, selectedHouse, buyerName, buyerPhone, tokenAmount]);

  if (!isOpen || !plot) return null;

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert(language === 'hi' ? 'कृपया अपना पूरा नाम और मान्य मोबाइल नंबर दर्ज करें' : language === 'hinglish' ? 'Kripya apna poora naam aur valid mobile number enter karein' : 'Please enter your full name and valid mobile number');
      return;
    }

    // Generate unique corporate hold reference: AKGV-HOLD-YYYY-PLOT-RANDOM
    const rand = Math.floor(1000 + Math.random() * 9000);
    const refCode = `AKGV-HOLD-2026-${plot.plotNumber.replace(/[^a-zA-Z0-9]/g, '')}-${rand}`;
    setCertificateRef(refCode);
    setIsGenerated(true);

    if (onConfirmBooking) {
      onConfirmBooking(buyerName, buyerPhone, selectedHouseId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-xl rounded-2xl border border-[#C7A35A] bg-[#070D1E] shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0B1734] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              {isGenerated ? c.modalTitleGenerated : `${c.modalTitleGenerating} — Plot #${plot.plotNumber}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isGenerated ? (
          /* STEP 1: Interactive Buyer Form */
          <form onSubmit={handleGenerateCertificate} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Plot Snapshot Header */}
            <div className="rounded-xl border border-[#C7A35A]/30 bg-[#050A17] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{c.selectedAsset}</span>
                  <div className="font-serif text-xl font-bold text-white">
                    Plot {plot.plotNumber} <span className="text-[#DFC382] text-sm font-sans">(Block {plot.block})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{c.basePrice}</span>
                  <div className="font-bold text-[#DFC382] text-base">₹{plotPriceLakh} Lakh</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-[11px] text-gray-300">
                <div>
                  <span className="text-gray-500 block">{c.area}</span>
                  <span className="font-semibold text-white">
                    {plot.areaSqft} sqft ({(plot.areaSqft / 9).toFixed(1)} {language === 'hi' ? 'गज' : language === 'hinglish' ? 'Gaj' : 'Sq. Yd'})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">{c.dimensions}</span>
                  <span className="font-semibold text-white">{plot.dimensions}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{c.facing}</span>
                  <span className="font-semibold text-emerald-400">{plot.roadFacing}</span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                {c.buyerName} <span className="text-[#C7A35A]">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={c.buyerNamePlaceholder}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                {c.mobileNumber} <span className="text-[#C7A35A]">*</span>
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder={c.mobilePlaceholder}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                {c.sampleElevationIdea}
              </label>
              <select
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none text-xs"
              >
                {HOUSE_MODELS.map((hm) => (
                  <option key={hm.id} value={hm.id}>
                    {hm.name} ({hm.bhk} • {hm.carpetAreaSqft} sqft • Est. ₹{(hm.estimatedCostInr / 100000).toFixed(1)}L)
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {c.sampleElevationDisclaimer}
              </span>
            </div>

            {/* Hold Guarantee Note */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{c.guaranteeTitle}</span>
              </div>
              <p className="text-gray-300">
                {c.guaranteeDesc.replace('{plotNumber}', plot.plotNumber)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-gray-400 hover:text-white text-xs"
              >
                {c.cancelBtn}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#9E7E36] px-6 py-2.5 font-bold text-[#0B1734] shadow-lg hover:brightness-110 active:scale-95 transition text-xs"
              >
                {c.generateBtn}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Official Generated Certificate */
          <div className="p-5 sm:p-6 space-y-5 text-xs">
            {/* Countdown Banner */}
            <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-xs">{c.countdownLabel}</span>
              </div>
              <div className="font-mono font-bold text-sm text-amber-200">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>

            {/* Certificate Canvas / Card (Printable) */}
            <div
              id="plot-hold-certificate"
              className="relative overflow-hidden rounded-2xl border-2 border-[#C7A35A] bg-[#050A17] p-5 shadow-2xl space-y-4"
            >
              {/* Luxury Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="font-serif text-8xl font-black text-[#C7A35A]">{c.watermarkCrest}</span>
              </div>

              {/* Certificate Header */}
              <div className="text-center border-b border-[#C7A35A]/30 pb-3 space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C7A35A]/20 px-3 py-0.5 text-[9px] font-bold text-[#DFC382] uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>{c.certBadge}</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                  {c.companyHeader}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {c.companySub}
                </p>
                <div className="text-[10px] font-mono font-bold text-[#DFC382] pt-1">
                  {c.refNo} {certificateRef}
                </div>
              </div>

              {/* Holding Details Matrix */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="rounded-lg bg-[#0B1734] p-2.5 space-y-0.5 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">{c.allocatedPlot}</span>
                  <span className="font-bold text-white text-sm">Plot #{plot.plotNumber}</span>
                  <span className="text-[10px] text-[#DFC382] block">Block {plot.block} • {plot.dimensions}</span>
                </div>

                <div className="rounded-lg bg-[#0B1734] p-2.5 space-y-0.5 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">{c.plotAreaLabel}</span>
                  <span className="font-bold text-white text-sm">{plot.areaSqft} SQFT</span>
                  <span className="text-[10px] text-[#DFC382] block">
                    {(plot.areaSqft / 9).toFixed(1)} {language === 'hi' ? 'गज' : language === 'hinglish' ? 'Gaj' : 'Sq. Yd'}
                  </span>
                </div>

                <div className="rounded-lg bg-[#0B1734] p-2.5 space-y-0.5 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">{c.beneficiary}</span>
                  <span className="font-bold text-white">{buyerName}</span>
                  <span className="text-[10px] text-gray-400 block">+91 {buyerPhone}</span>
                </div>

                <div className="rounded-lg bg-[#0B1734] p-2.5 space-y-0.5 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">{c.plotValuationLabel}</span>
                  <span className="font-bold text-[#DFC382] text-sm">₹{plotPriceLakh} Lakh</span>
                  <span className="text-[10px] text-emerald-400 block">{c.tokenPayableLabel} ₹{tokenAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Road & Layout Verification */}
              <div className="rounded-lg border border-white/10 bg-[#0B1734]/50 p-2.5 text-[10px] text-gray-300 space-y-1">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>{c.frontageRoad} {plot.roadWidth}</span>
                  <span className="text-emerald-400">{plot.roadFacing} {c.approvedFacing}</span>
                </div>
                <p className="text-gray-400">
                  {c.plannerNote}
                </p>
              </div>

              {/* Seal & Authentication Footer */}
              <div className="flex items-center justify-between border-t border-[#C7A35A]/30 pt-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded border border-[#C7A35A] bg-[#0B1734] flex items-center justify-center text-[#C7A35A]">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{c.digitalRegistered}</span>
                    <span className="text-gray-400">{c.validityNotice}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif font-bold text-[#DFC382] italic">Er. Rajesh Patel</div>
                  <span className="text-gray-400 text-[9px] block">{c.authorizedEngineer}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              {/* WhatsApp 1-Click Dispatch */}
              <a
                href={`https://wa.me/916306917991?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-600 transition"
              >
                <span>💬 {c.sendWhatsAppCta}</span>
              </a>

              {/* Print / Save & Buyer Portal Links */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition"
                >
                  <Printer className="h-3.5 w-3.5 text-[#C7A35A]" />
                  <span>{c.printCertBtn}</span>
                </button>

                <Link
                  href="/buyer"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#C7A35A] bg-[#0B1734] py-2.5 text-xs font-bold text-[#DFC382] hover:bg-[#C7A35A] hover:text-[#0B1734] transition text-center"
                >
                  <span>{c.openBuyerPortalBtn}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
