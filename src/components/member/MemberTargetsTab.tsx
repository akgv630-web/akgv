'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { COMMISSION_LEVELS_GROUND_TRUTH } from '@/data/groundTruth';

export function MemberTargetsTab() {
  const { targets, currentUser } = useApp();

  if (!currentUser) return null;

  // Filter targets assigned to current member
  const myTargets = targets.filter(
    (t) =>
      t.profileId === currentUser.id ||
      t.memberId === currentUser.memberId ||
      t.memberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (t.memberId === 'usr-sponsor-01' || t.memberId === 'AKGV-3498'))
  );

  const totalTargetVolume = myTargets.reduce((acc, t) => acc + (t.targetSalesVolumeInr || 0), 0);
  const totalAchievedVolume = myTargets.reduce((acc, t) => acc + (t.achievedSalesVolumeInr || 0), 0);
  const totalTargetPlots = myTargets.reduce((acc, t) => acc + (t.targetPlotsCount || 0), 0);
  const totalAchievedPlots = myTargets.reduce((acc, t) => acc + (t.achievedPlotsCount || 0), 0);
  const overallPct =
    totalTargetVolume > 0
      ? Math.min(100, Math.round((totalAchievedVolume / totalTargetVolume) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#C7A35A]/40 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-[#C7A35A]" />
              <h2 className="font-serif text-xl font-bold text-white">
                My Sales Quotas & Incentive Milestones
              </h2>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Track your monthly and quarterly township plot sales achievements set by corporate administration.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#050A17]/80 px-4 py-2.5 text-right text-xs">
            <span className="text-gray-400 block text-[11px]">Cumulative Quota Progress</span>
            <span className="font-serif text-lg font-bold text-emerald-400">
              {overallPct}% Achieved
            </span>
            <span className="text-[10px] text-[#DFC382] block">
              ₹{(totalAchievedVolume / 100000).toFixed(1)}L / ₹{(totalTargetVolume / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Volume Goal</span>
          <span className="font-serif text-2xl font-bold text-white">
            ₹{(totalTargetVolume / 100000).toFixed(1)} Lakh
          </span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Assigned targets</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Achieved Volume</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">
            ₹{(totalAchievedVolume / 100000).toFixed(1)} Lakh
          </span>
          <span className="text-[11px] text-gray-300 block mt-1">Booked & verified</span>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Plots Sold</span>
          <span className="font-serif text-2xl font-bold text-sky-400">
            {totalAchievedPlots} / {totalTargetPlots}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Township plots</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Active Target Quotas</span>
          <span className="font-serif text-2xl font-bold text-[#DFC382]">{myTargets.length}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Active periods</span>
        </div>
      </div>

      {/* Target Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myTargets.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <Trophy className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No sales quotas currently assigned</p>
            <p className="text-xs mt-1">Your corporate manager or Director will configure monthly targets here.</p>
          </div>
        ) : (
          myTargets.map((target) => {
            const volPct =
              target.targetSalesVolumeInr > 0
                ? Math.min(100, Math.round((target.achievedSalesVolumeInr / target.targetSalesVolumeInr) * 100))
                : 0;
            const plotPct =
              target.targetPlotsCount > 0
                ? Math.min(100, Math.round((target.achievedPlotsCount / target.targetPlotsCount) * 100))
                : 0;

            return (
              <div
                key={target.id}
                className="rounded-2xl border border-white/10 bg-[#0B1734] p-5 space-y-4 transition hover:border-[#C7A35A]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-serif text-base font-bold text-white block">
                      {target.periodLabel}
                    </span>
                    <span className="text-xs text-gray-400">
                      Cadence: <strong className="text-white capitalize">{target.period}</strong>
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      target.status === 'achieved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : target.status === 'missed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {target.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress 1: Sales Volume */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sales Volume:</span>
                    <span className="font-semibold text-white">
                      ₹{(target.achievedSalesVolumeInr / 100000).toFixed(1)}L / ₹{(target.targetSalesVolumeInr / 100000).toFixed(1)}L{' '}
                      <span className="text-emerald-400 font-bold">({volPct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#050A17] border border-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        volPct >= 100
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-[#C7A35A] to-[#DFC382]'
                      }`}
                      style={{ width: `${volPct}%` }}
                    />
                  </div>
                </div>

                {/* Progress 2: Plot Count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Plots Target:</span>
                    <span className="font-semibold text-white">
                      {target.achievedPlotsCount} / {target.targetPlotsCount} plots{' '}
                      <span className="text-sky-400 font-bold">({plotPct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#050A17] border border-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-500"
                      style={{ width: `${plotPct}%` }}
                    />
                  </div>
                </div>

                {/* Footer notes */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-gray-400">
                  <span>Assigned by: {target.assignedBy}</span>
                  <span>Last synced: {new Date(target.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rewards Ladder Reference */}
      <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-6 space-y-3">
        <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C7A35A]" />
          Commission & Rewards Milestone Ladder
        </h3>
        <p className="text-xs text-gray-400">
          Reaching your business volume targets qualifies you for higher commission tiers and physical luxury rewards:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {COMMISSION_LEVELS_GROUND_TRUTH.slice(0, 6).map((lvl) => (
            <div
              key={lvl.levelNumber}
              className="rounded-2xl border border-white/5 bg-[#050A17] p-3 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#DFC382]">
                  L{lvl.levelNumber}: {lvl.rankTitleHi}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {lvl.commissionPercent}%
                </span>
              </div>
              <div className="text-gray-400 text-[11px]">
                Target: ₹{(lvl.minBusinessInr / 100000).toFixed(0)} Lakh - ₹{(lvl.maxBusinessInr / 100000).toFixed(0)} Lakh
              </div>
              <div className="text-sky-300 font-semibold text-[11px]">
                Reward: {lvl.rewardNameHi} ({lvl.rewardNameEn})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
