'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Bike,
  Building,
  Car,
  CircleDollarSign,
  Coins,
  Compass,
  Crown,
  Eye,
  FileText,
  Gem,
  Gift,
  HelpCircle,
  Home,
  Info,
  Plane,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Trophy,
  X
} from 'lucide-react';
import { COMMISSION_LEVELS_GROUND_TRUTH, COMPANY_DETAILS } from '@/data/groundTruth';
import { useApp } from '@/context/AppContext';

export function CommissionRewardsView() {
  const { language } = useApp();
  const [testVolumeInr, setTestVolumeInr] = useState<number>(8500000); // 85 Lakh (Gold Star)
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  // Determine matching tier
  const activeLevel = [...COMMISSION_LEVELS_GROUND_TRUTH]
    .reverse()
    .find((lvl) => testVolumeInr >= lvl.minBusinessInr) || COMMISSION_LEVELS_GROUND_TRUTH[0];

  const calculatedCommission = (testVolumeInr * activeLevel.commissionPercent) / 100;

  // Next level progress
  const nextLevel = COMMISSION_LEVELS_GROUND_TRUTH.find(
    (lvl) => lvl.levelNumber === activeLevel.levelNumber + 1
  );
  const remainingForNext = nextLevel ? Math.max(0, nextLevel.minBusinessInr - testVolumeInr) : 0;
  const progressPercent = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((testVolumeInr - activeLevel.minBusinessInr) /
            (nextLevel.minBusinessInr - activeLevel.minBusinessInr)) *
            100
        )
      )
    : 100;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C7A35A', '#146B4D', '#F6F1E7'],
    });
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="h-6 w-6 text-[#C7A35A]" />;
      case 'Plane':
        return <Plane className="h-6 w-6 text-[#C7A35A]" />;
      case 'Bike':
        return <Bike className="h-6 w-6 text-[#C7A35A]" />;
      case 'Compass':
        return <Compass className="h-6 w-6 text-[#C7A35A]" />;
      case 'Car':
        return <Car className="h-6 w-6 text-[#C7A35A]" />;
      case 'Home':
        return <Home className="h-6 w-6 text-[#C7A35A]" />;
      case 'Gem':
        return <Gem className="h-6 w-6 text-[#C7A35A]" />;
      case 'Sparkles':
        return <Sparkles className="h-6 w-6 text-[#C7A35A]" />;
      case 'Coins':
        return <Coins className="h-6 w-6 text-[#C7A35A]" />;
      case 'CircleDollarSign':
        return <CircleDollarSign className="h-6 w-6 text-[#C7A35A]" />;
      case 'Crown':
        return <Crown className="h-6 w-6 text-[#C7A35A]" />;
      default:
        return <Trophy className="h-6 w-6 text-[#C7A35A]" />;
    }
  };

  const formatLakhCrore = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 2)} करोड़`;
    }
    return `₹${(val / 100000).toFixed(0)} लाख`;
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C7A35A]/30 bg-[#050A17]/90 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#C7A35A]" />
            <h2 className="font-serif text-xl font-bold text-white tracking-wide">
              लेवल — कमीशन एवं रिवार्ड प्लान (Level, Commission & Reward Plan)
            </h2>
          </div>
          <p className="text-xs text-gray-300 mt-1 italic">
            &ldquo;मेहनत कीजिए, लेवल बढ़ाइए और अपने सपनों का रिवार्ड पाइए!&rdquo;
          </p>
        </div>

        <button
          onClick={() => setShowBrochureModal(true)}
          className="flex items-center gap-2 rounded-xl border border-[#C7A35A] bg-[#0B1734] px-4 py-2 text-xs font-bold text-[#DFC382] shadow hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
        >
          <Eye className="h-4 w-4" />
          <span>View Original Brochure Chart</span>
        </button>
      </div>

      {/* Interactive Volume Simulator Card */}
      <div className="rounded-2xl border border-[#C7A35A]/40 bg-gradient-to-br from-[#0B1734] to-[#040815] p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#DFC382]">
              Interactive Performance Simulator
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              Simulate Your Eligible Commission & Unlocked Reward
            </h3>
          </div>
          <button
            onClick={triggerCelebration}
            className="flex items-center gap-1.5 rounded-lg bg-[#C7A35A]/20 px-3 py-1.5 text-xs font-semibold text-[#DFC382] border border-[#C7A35A]/40 hover:bg-[#C7A35A] hover:text-[#0B1734] transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Celebrate Level</span>
          </button>
        </div>

        {/* Slider & Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="text-gray-300">
              Total Verified Business Volume:{' '}
              <strong className="text-lg text-emerald-400 font-serif">
                ₹{(testVolumeInr / 100000).toFixed(1)} Lakh (₹{testVolumeInr.toLocaleString('en-IN')})
              </strong>
            </label>
            <span className="text-[#DFC382] font-semibold">
              Current Tier: Level {activeLevel.levelNumber} ({activeLevel.rankTitleHi} / {activeLevel.rankTitleEn})
            </span>
          </div>

          <input
            type="range"
            min={100000}
            max={500000000} // Up to 50 Cr
            step={500000}
            value={testVolumeInr}
            onChange={(e) => setTestVolumeInr(Number(e.target.value))}
            className="w-full accent-[#C7A35A] cursor-pointer h-2 rounded-lg bg-gray-700"
          />

          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="text-gray-400 text-[11px] self-center">Quick Presets:</span>
            {[
              { label: '₹15L (Sales Asst)', val: 1500000 },
              { label: '₹50L (Star)', val: 5000000 },
              { label: '₹1.2 Cr (Gold Star)', val: 12000000 },
              { label: '₹3 Cr (Asst Mgr)', val: 30000000 },
              { label: '₹6 Cr (Manager)', val: 60000000 },
              { label: '₹10 Cr (Sr Mgr)', val: 100000000 },
              { label: '₹15 Cr (Diamond)', val: 150000000 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTestVolumeInr(preset.val)}
                className={`rounded px-2.5 py-1 text-[11px] border transition ${
                  testVolumeInr === preset.val
                    ? 'bg-[#C7A35A] text-[#0B1734] font-bold border-[#C7A35A]'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#C7A35A]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Commission Rate */}
          <div className="rounded-xl border border-white/10 bg-[#050A17] p-4 text-center">
            <span className="text-xs text-gray-400 block">Commission Rate</span>
            <span className="font-serif text-3xl font-bold text-[#DFC382]">
              {activeLevel.commissionPercent}%
            </span>
            <span className="text-[11px] text-gray-400 block mt-1">
              Brochure level {activeLevel.levelNumber}
            </span>
          </div>

          {/* Total Earnings */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
            <span className="text-xs text-emerald-300 block">Calculated Commission</span>
            <span className="font-serif text-3xl font-bold text-emerald-400">
              ₹{calculatedCommission.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-300/80 block mt-1">
              On ₹{testVolumeInr.toLocaleString('en-IN')} business
            </span>
          </div>

          {/* Unlocked Reward */}
          <div className="rounded-xl border border-[#C7A35A]/50 bg-[#0B1734] p-4 text-center">
            <span className="text-xs text-[#DFC382] block">Brochure Reward</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              {getRewardIcon(activeLevel.badgeIcon)}
              <span className="font-serif text-lg font-bold text-white">
                {activeLevel.rewardNameHi}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 block mt-1">
              ({activeLevel.rewardNameEn})
            </span>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextLevel && (
          <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">
                Next Milestone: Level {nextLevel.levelNumber} ({nextLevel.rankTitleHi} — {nextLevel.rewardNameHi})
              </span>
              <span className="text-[#DFC382] font-semibold">
                Needs {formatLakhCrore(remainingForNext)} more
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C7A35A] to-[#1EA275] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Complete Levels 1 to 11 Brochure Master Table */}
      <div className="overflow-hidden rounded-2xl border border-[#C7A35A]/30 bg-[#050A17] shadow-xl">
        <div className="bg-[#0B1734] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-white">
              Official 11-Tier Commission & Rewards Chart
            </h3>
            <p className="text-xs text-gray-400">
              Transcribed with complete fidelity from the official AKGV Infra City brochure
            </p>
          </div>
          <span className="rounded bg-[#C7A35A]/20 px-3 py-1 text-xs font-bold text-[#DFC382]">
            11 Approved Ranks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#0B1734]/80 text-[#DFC382] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center">लेवल (Level)</th>
                <th className="px-4 py-3">पद / रैंक (Rank / Post)</th>
                <th className="px-4 py-3">बिजनेस टारगेट (Business Target)</th>
                <th className="px-4 py-3 text-center">कमीशन (Commission)</th>
                <th className="px-4 py-3">रिवार्ड (Reward)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {COMMISSION_LEVELS_GROUND_TRUTH.map((level) => {
                const isCurrentActive = activeLevel.levelNumber === level.levelNumber;
                return (
                  <tr
                    key={level.levelNumber}
                    className={`transition hover:bg-white/5 ${
                      isCurrentActive ? 'bg-[#C7A35A]/15 font-semibold text-white' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center font-bold font-serif text-sm">
                      {level.levelNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getRewardIcon(level.badgeIcon)}
                        <div>
                          <span className="font-bold text-white block">{level.rankTitleHi}</span>
                          <span className="text-[11px] text-gray-400">{level.rankTitleEn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-300">
                      {formatLakhCrore(level.minBusinessInr)} — {formatLakhCrore(level.maxBusinessInr)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-base text-emerald-400">
                      {level.commissionPercent}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#DFC382] font-semibold">
                        <Gift className="h-4 w-4 text-[#C7A35A] shrink-0" />
                        <span>{level.rewardNameHi}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({level.rewardNameEn})
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance & Offline Kit Ledger Notice */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 text-xs text-gray-300 space-y-3">
        <div className="flex items-center gap-2 text-[#DFC382] font-semibold">
          <ShieldAlert className="h-4 w-4" />
          <span>Statutory Compliance & Business Policy Clarification</span>
        </div>
        <p className="leading-relaxed text-gray-400">
          Commission is payable exclusively on verified, legally executed, and administrative-approved property transactions. Enrollment of new members or joining-kit distribution does NOT qualify for commission. All rewards are subject to applicable taxation (TDS), terms of service, and company fulfilment timelines.
        </p>
      </div>

      {/* Brochure Image Lightbox Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-h-[95vh] max-w-3xl w-full overflow-hidden rounded-2xl border border-[#C7A35A] bg-[#050A17] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0B1734]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#C7A35A]" />
                <span className="font-serif text-sm font-bold text-white">
                  Original Brochure — लेवल - कमीशन एवं रिवार्ड प्लान
                </span>
              </div>
              <button
                onClick={() => setShowBrochureModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center">
              <Image
                src="/assets/rewards_plan_brochure.jpg"
                alt="Original Rewards and Commission Brochure"
                width={700}
                height={1000}
                className="rounded-lg object-contain max-h-[80vh] w-auto border border-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
