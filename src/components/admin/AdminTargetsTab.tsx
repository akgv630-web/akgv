'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  DollarSign,
  Edit,
  Layers,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SalesTarget } from '@/types';

export function AdminTargetsTab() {
  const {
    targets,
    allProfiles,
    assignTarget,
    updateTarget,
    deleteTarget,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'monthly' | 'quarterly'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'in_progress' | 'achieved' | 'missed'>('ALL');

  // Assign Target Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [targetPeriod, setTargetPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [periodLabel, setPeriodLabel] = useState('October 2026');
  const [targetPlotsCount, setTargetPlotsCount] = useState(4);
  const [targetSalesVolumeInr, setTargetSalesVolumeInr] = useState(5000000); // 50 Lakh
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit / Update Target Modal
  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);
  const [editAchievedPlots, setEditAchievedPlots] = useState(0);
  const [editAchievedVolume, setEditAchievedVolume] = useState(0);
  const [editStatus, setEditStatus] = useState<'in_progress' | 'achieved' | 'missed'>('in_progress');

  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Eligible Active Associates / Members
  const eligibleMembers = allProfiles.filter(
    (p) => p.isActive && (p.role === 'junior_member' || p.role === 'senior_member')
  );

  // Filter Targets
  const filteredTargets = targets.filter((t) => {
    const matchesSearch =
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.periodLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPeriod = periodFilter === 'ALL' || t.period === periodFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesPeriod && matchesStatus;
  });

  // Aggregated KPIs
  const totalTargetVolume = targets.reduce((acc, t) => acc + (t.targetSalesVolumeInr || 0), 0);
  const totalAchievedVolume = targets.reduce((acc, t) => acc + (t.achievedSalesVolumeInr || 0), 0);
  const totalTargetPlots = targets.reduce((acc, t) => acc + (t.targetPlotsCount || 0), 0);
  const totalAchievedPlots = targets.reduce((acc, t) => acc + (t.achievedPlotsCount || 0), 0);
  const overallPercentage = totalTargetVolume > 0 ? Math.min(100, Math.round((totalAchievedVolume / totalTargetVolume) * 100)) : 0;

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = allProfiles.find((p) => p.id === selectedProfileId);
    if (!profile) {
      showNotification('Please select an active member to assign quota', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await assignTarget({
        profileId: profile.id,
        memberId: profile.memberId || 'AKGV-MEMBER',
        memberName: profile.fullName,
        period: targetPeriod,
        periodLabel,
        targetPlotsCount: Number(targetPlotsCount),
        targetSalesVolumeInr: Number(targetSalesVolumeInr),
        achievedPlotsCount: 0,
        achievedSalesVolumeInr: 0,
        status: 'in_progress',
        assignedBy: currentUser?.fullName || 'Super Admin',
      });

      showNotification(`Sales quota successfully assigned to ${profile.fullName}`);
      setIsAssignModalOpen(false);
      setSelectedProfileId('');
    } catch {
      showNotification('Failed to assign sales quota', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (target: SalesTarget) => {
    setEditingTarget(target);
    setEditAchievedPlots(target.achievedPlotsCount || 0);
    setEditAchievedVolume(target.achievedSalesVolumeInr || 0);
    setEditStatus(target.status || 'in_progress');
  };

  const handleSaveEdit = async () => {
    if (!editingTarget) return;
    setIsSubmitting(true);
    const res = await updateTarget(editingTarget.id, {
      achievedPlotsCount: Number(editAchievedPlots),
      achievedSalesVolumeInr: Number(editAchievedVolume),
      status: editStatus,
    });
    setIsSubmitting(false);

    if (res.success) {
      showNotification(`Updated target progress for ${editingTarget.memberName}`);
      setEditingTarget(null);
    } else {
      showNotification(res.error || 'Failed to update target', 'error');
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to delete this sales target?')) return;
    const ok = await deleteTarget(targetId);
    if (ok) {
      showNotification('Sales target removed');
    } else {
      showNotification('Failed to delete target', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-semibold shadow-lg ${
            actionNotice.type === 'success'
              ? 'border border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
              : 'border border-red-500/40 bg-red-950/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Aggregate KPI Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Target Volume</span>
          <span className="font-serif text-2xl font-bold text-white">
            ₹{(totalTargetVolume / 100000).toFixed(1)} Lakh
          </span>
          <span className="text-[11px] text-[#DFC382] block mt-1">{totalTargetPlots} Plots Total Goal</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Total Achieved Volume</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">
            ₹{(totalAchievedVolume / 100000).toFixed(1)} Lakh
          </span>
          <span className="text-[11px] text-gray-300 block mt-1">{totalAchievedPlots} Plots Closed</span>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Overall Target Fulfillment</span>
          <span className="font-serif text-2xl font-bold text-sky-400">{overallPercentage}%</span>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Active Quotas Assigned</span>
          <span className="font-serif text-2xl font-bold text-[#DFC382]">{targets.length}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Across all network tiers</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search associate, code, period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Periods</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="achieved">Achieved</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Assign Quota (नया टारगेट तय करें)</span>
        </button>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTargets.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <Target className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No sales targets found</p>
            <p className="text-xs mt-1">Assign quotas to your active associates to motivate township sales.</p>
          </div>
        ) : (
          filteredTargets.map((target) => {
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
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-white">{target.memberName}</span>
                      <span className="font-mono text-xs text-[#DFC382] rounded bg-[#050A17] px-2 py-0.5 border border-white/5">
                        {target.memberId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Period: <strong className="text-white">{target.periodLabel}</strong> ({target.period})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <button
                      onClick={() => handleOpenEdit(target)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition"
                      title="Update target progress"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTarget(target.id)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition"
                      title="Delete target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress 1: Sales Volume */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sales Volume:</span>
                    <span className="font-semibold text-white">
                      ₹{(target.achievedSalesVolumeInr / 100000).toFixed(1)}L / ₹{(target.targetSalesVolumeInr / 100000).toFixed(1)}L{' '}
                      <span className="text-emerald-400">({volPct}%)</span>
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
                    <span className="text-gray-400">Plots Sold:</span>
                    <span className="font-semibold text-white">
                      {target.achievedPlotsCount} / {target.targetPlotsCount} plots{' '}
                      <span className="text-sky-400">({plotPct}%)</span>
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
                  <span>Updated: {new Date(target.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Assign New Sales Quota */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#C7A35A]" />
                <h3 className="font-serif text-lg font-bold text-white">Assign Associate Sales Target</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTarget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Select Active Associate / Manager *</label>
                <select
                  required
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="">-- Choose active member --</option>
                  {eligibleMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName} ({member.memberId || 'AKGV'}) — {member.role.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Period Cadence *</label>
                  <select
                    value={targetPeriod}
                    onChange={(e) => {
                      const p = e.target.value as 'monthly' | 'quarterly';
                      setTargetPeriod(p);
                      if (p === 'quarterly') setPeriodLabel('Q4 2026 (Oct-Dec)');
                      else setPeriodLabel('October 2026');
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="monthly">Monthly Target</option>
                    <option value="quarterly">Quarterly Target</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Period Label *</label>
                  <input
                    type="text"
                    required
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Target Plots Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetPlotsCount}
                    onChange={(e) => setTargetPlotsCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Target Sales Volume (₹ INR) *</label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={targetSalesVolumeInr}
                    onChange={(e) => setTargetSalesVolumeInr(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick volume presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => { setTargetSalesVolumeInr(2500000); setTargetPlotsCount(2); }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-gray-300 border border-white/10"
                >
                  ₹25L (2 plots)
                </button>
                <button
                  type="button"
                  onClick={() => { setTargetSalesVolumeInr(5000000); setTargetPlotsCount(4); }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-gray-300 border border-white/10"
                >
                  ₹50L (4 plots)
                </button>
                <button
                  type="button"
                  onClick={() => { setTargetSalesVolumeInr(10000000); setTargetPlotsCount(8); }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-[#DFC382] border border-[#C7A35A]/30"
                >
                  ₹1 Cr (8 plots)
                </button>
                <button
                  type="button"
                  onClick={() => { setTargetSalesVolumeInr(20000000); setTargetPlotsCount(15); }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-emerald-400 border border-emerald-500/30"
                >
                  ₹2 Cr (15 plots)
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Assign Quota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Target Progress */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#C7A35A]/40 bg-[#0B1734] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#C7A35A]" />
                <h3 className="font-serif text-lg font-bold text-white">Update Target Progress</h3>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="rounded-xl p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#050A17] p-3 text-xs space-y-1 border border-white/10">
              <div className="text-gray-400">Associate: <strong className="text-white">{editingTarget.memberName}</strong></div>
              <div className="text-gray-400">Target Goal: <strong className="text-white">{editingTarget.targetPlotsCount} plots (₹{(editingTarget.targetSalesVolumeInr / 100000).toFixed(1)} Lakh)</strong></div>
              <div className="text-gray-400">Period: <strong className="text-[#DFC382]">{editingTarget.periodLabel}</strong></div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Achieved Plots Count</label>
                <input
                  type="number"
                  min="0"
                  value={editAchievedPlots}
                  onChange={(e) => setEditAchievedPlots(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Achieved Sales Volume (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={editAchievedVolume}
                  onChange={(e) => setEditAchievedVolume(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Target Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved / Complete</option>
                  <option value="missed">Missed / Expired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
