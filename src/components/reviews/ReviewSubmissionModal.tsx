'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ReviewRecord } from '@/types';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewSubmissionModal({ isOpen, onClose }: ReviewSubmissionModalProps) {
  const { currentUser, addReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState(currentUser.fullName || '');
  const [authorPhone, setAuthorPhone] = useState(currentUser.phone || '');
  const [authorRole, setAuthorRole] = useState<ReviewRecord['authorRole']>(
    currentUser.role === 'buyer' ? 'buyer' : currentUser.role.includes('member') ? 'associate' : 'visitor'
  );
  const [category, setCategory] = useState<ReviewRecord['category']>('plot_purchase');
  const [branchLocation, setBranchLocation] = useState('Rampur Head Office');
  const [plotNumber, setPlotNumber] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [certifiedGenuine, setCertifiedGenuine] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  if (!isOpen) return null;

  const starLabels: Record<number, string> = {
    1: '1 Star — Disappointing',
    2: '2 Stars — Below Average',
    3: '3 Stars — Good & Satisfactory',
    4: '4 Stars — Very Good & Transparent',
    5: '5 Stars — Excellent & 100% Recommended'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!authorName.trim()) {
      setErrorMsg('Please enter your full name (कृपया अपना पूरा नाम दर्ज करें).');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please write a short title for your review (रिव्यू का शीर्षक लिखें).');
      return;
    }
    if (comment.trim().length < 15) {
      setErrorMsg('Please provide at least 15 characters of detailed feedback (कृपया कम से कम 15 अक्षरों में अपना अनुभव लिखें).');
      return;
    }
    if (!certifiedGenuine) {
      setErrorMsg('Please confirm that your review is based on genuine direct experience.');
      return;
    }

    addReview({
      authorName: authorName.trim(),
      authorPhone: authorPhone.trim() || undefined,
      authorRole,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      plotNumber: plotNumber.trim() ? plotNumber.toUpperCase().trim() : undefined,
      branchLocation,
      category,
      isVerified: authorRole === 'buyer' || authorRole === 'associate' || currentUser.kycStatus === 'verified',
    });

    setSuccessSubmitted(true);
    setTimeout(() => {
      setSuccessSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-b from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 sm:p-8 shadow-2xl my-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {successSubmitted ? (
          <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              धन्यवाद! आपका रिव्यू दर्ज कर लिया गया है
            </h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              Your genuine review has been successfully recorded and published to our real-time feedback registry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#DFC382] uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-[#C7A35A]" />
                <span>Verified Client Feedback Portal</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Share Your Direct Experience with AKGV Infra City
              </h2>
              <p className="text-xs text-gray-400">
                रजिस्ट्री, साइट विजिट, प्लॉट सीमांकन और शाखा सेवा पर अपना प्रामाणिक अनुभव साझा करें।
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Star Rating */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-center">
              <label className="text-xs font-semibold text-gray-300 block">
                Overall Rating / आपकी रेटिंग:
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 sm:h-8 sm:w-8 transition ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-[#DFC382] block">
                {starLabels[hoverRating || rating]}
              </span>
            </div>

            {/* Author Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Full Name / आपका नाम <span className="text-[#C7A35A]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full rounded-xl border border-white/15 bg-[#050A17] pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Mobile Number / मोबाइल नंबर
                </label>
                <input
                  type="tel"
                  value={authorPhone}
                  onChange={(e) => setAuthorPhone(e.target.value)}
                  placeholder="e.g. 9838012345"
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Strictly confidential, never displayed publicly.
                </span>
              </div>
            </div>

            {/* Role & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Your Association / आपका परिचय
                </label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as ReviewRecord['authorRole'])}
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="buyer">Verified Plot Buyer (प्लॉट क्रेता)</option>
                  <option value="visitor">Site Inspection Visitor (साइट दर्शक)</option>
                  <option value="associate">Field Associate / Advisor (एसोसिएट)</option>
                  <option value="public">General Public / Enquirer (सामान्य नागरिक)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Topic / विषय
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReviewRecord['category'])}
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="plot_purchase">Plot Booking & Title (प्लॉट रजिस्ट्री)</option>
                  <option value="site_visit">Accompanied Site Visit (साइट निरीक्षण)</option>
                  <option value="legal_registry">Legal & Dakhil-Kharij (दाखिल-खारिज)</option>
                  <option value="staff_support">Branch Staff Support (शाखा सहयोग)</option>
                  <option value="corporate_trust">Developer Transparency (पारदर्शिता)</option>
                </select>
              </div>
            </div>

            {/* Branch & Plot Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Branch Office Visited / शाखा कार्यालय
                </label>
                <select
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="Rampur Head Office">Rampur Head Office (Ring Road Phase-2)</option>
                  <option value="Lahartara Branch">Lahartara Branch (GT Road near Cantt)</option>
                  <option value="Mirza Murad Branch">Mirza Murad Branch (NH-19 Highway)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Plot Number (If Booked / यदि बुक किया है)
                </label>
                <input
                  type="text"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="e.g. A-04 or B-06 (Optional)"
                  className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>
            </div>

            {/* Title & Comment */}
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Headline / मुख्य शीर्षक <span className="text-[#C7A35A]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Transparent documentation & clear 30ft entrance road"
                className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Detailed Feedback / आपका विस्तृत अनुभव <span className="text-[#C7A35A]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please describe your experience regarding layout demarcation, registry transparency, branch staff behavior, or connectivity..."
                className="w-full rounded-xl border border-white/15 bg-[#050A17] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none resize-none"
              />
            </div>

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={certifiedGenuine}
                onChange={(e) => setCertifiedGenuine(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-[#050A17] text-[#C7A35A] focus:ring-0"
              />
              <span>
                I certify that this feedback is based on my genuine personal interaction with AKGV Infra City Private Limited. (मैं प्रमाणित करता/करती हूँ कि यह समीक्षा मेरे प्रत्यक्ष अनुभव पर आधारित है।)
              </span>
            </label>

            {/* Submit Buttons */}
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
                className="rounded-xl bg-gradient-to-r from-[#C7A35A] via-[#DFC382] to-[#9E7E36] px-6 py-2.5 text-xs font-bold text-[#0B1734] shadow-lg hover:brightness-110 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Submit Real Review / रिव्यू सबमिट करें</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
