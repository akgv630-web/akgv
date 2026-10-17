'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Filter,
  Megaphone,
  Radio,
  Send,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { InAppMessage, UserRole } from '@/types';

export function AdminBroadcastTab() {
  const {
    messages,
    sendMessage,
    deleteMessage,
    allProfiles,
    currentUser
  } = useApp();

  const [recipientType, setRecipientType] = useState<'all' | 'role' | 'branch' | 'individual'>('all');
  const [recipientRole, setRecipientRole] = useState<UserRole>('junior_member');
  const [recipientBranch, setRecipientBranch] = useState('Varanasi HQ');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [targetRoute, setTargetRoute] = useState('/member?tab=tasks');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const eligibleMembers = allProfiles.filter((p) => p.isActive);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageBody.trim()) {
      showNotification('Title and message body are required', 'error');
      return;
    }

    let recipientId: string | undefined;
    let recipientProfileId: string | undefined;

    if (recipientType === 'role') {
      recipientId = recipientRole;
    } else if (recipientType === 'branch') {
      recipientId = recipientBranch;
    } else if (recipientType === 'individual') {
      const targetUser = allProfiles.find((p) => p.id === selectedProfileId);
      if (!targetUser) {
        showNotification('Please select a valid team member', 'error');
        return;
      }
      recipientProfileId = targetUser.id;
      recipientId = targetUser.memberId || targetUser.fullName;
    }

    setIsSubmitting(true);
    try {
      await sendMessage({
        recipientType,
        recipientId,
        recipientProfileId,
        targetRoute: targetRoute.trim() || undefined,
        title: title.trim(),
        message: messageBody.trim(),
        senderName: currentUser?.fullName || 'AKGV Administration',
        priority,
      });

      showNotification('Broadcast message published successfully to recipient channels');
      // Reset form
      setTitle('');
      setMessageBody('');
      setPriority('normal');
    } catch {
      showNotification('Failed to send broadcast message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (msgId: string) => {
    if (!window.confirm('Delete this broadcast notification?')) return;
    const ok = await deleteMessage(msgId);
    if (ok) {
      showNotification('Broadcast message removed');
    } else {
      showNotification('Failed to delete broadcast message', 'error');
    }
  };

  const counts = {
    total: messages.length,
    urgent: messages.filter((m) => m.priority === 'urgent').length,
    important: messages.filter((m) => m.priority === 'important').length,
    allUsers: messages.filter((m) => m.recipientType === 'all').length,
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Dispatches</span>
          <span className="font-serif text-2xl font-bold text-white">{counts.total}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">In-app notifications sent</span>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-red-300 block">Urgent Directives</span>
          <span className="font-serif text-2xl font-bold text-red-400">{counts.urgent}</span>
          <span className="text-[11px] text-gray-400 block mt-1">High priority announcements</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block">Important Notices</span>
          <span className="font-serif text-2xl font-bold text-amber-400">{counts.important}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Policy & bonus updates</span>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block">Global Broadcasts</span>
          <span className="font-serif text-2xl font-bold text-sky-400">{counts.allUsers}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Platform-wide reach</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Composer */}
        <div className="lg:col-span-6 rounded-3xl border border-[#C7A35A]/30 bg-[#0B1734] p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Megaphone className="h-5 w-5 text-[#C7A35A]" />
            <h3 className="font-serif text-lg font-bold text-white">Create Targeted Announcement</h3>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Recipient Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Recipient Audience Scope *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRecipientType('all')}
                  className={`rounded-xl p-2.5 font-semibold border text-center transition ${
                    recipientType === 'all'
                      ? 'border-[#C7A35A] bg-[#C7A35A]/20 text-[#DFC382]'
                      : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
                  }`}
                >
                  All Users
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('role')}
                  className={`rounded-xl p-2.5 font-semibold border text-center transition ${
                    recipientType === 'role'
                      ? 'border-[#C7A35A] bg-[#C7A35A]/20 text-[#DFC382]'
                      : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
                  }`}
                >
                  By Role
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('branch')}
                  className={`rounded-xl p-2.5 font-semibold border text-center transition ${
                    recipientType === 'branch'
                      ? 'border-[#C7A35A] bg-[#C7A35A]/20 text-[#DFC382]'
                      : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
                  }`}
                >
                  By Branch
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('individual')}
                  className={`rounded-xl p-2.5 font-semibold border text-center transition ${
                    recipientType === 'individual'
                      ? 'border-[#C7A35A] bg-[#C7A35A]/20 text-[#DFC382]'
                      : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
                  }`}
                >
                  Individual
                </button>
              </div>
            </div>

            {/* Sub-selector depending on Recipient Type */}
            {recipientType === 'role' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Target Role *</label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="junior_member">Junior Members (Field Associates)</option>
                  <option value="member">Active Members</option>
                  <option value="senior_associate">Senior Associates</option>
                  <option value="team_leader">Team Leaders</option>
                  <option value="branch_manager">Branch Managers</option>
                  <option value="buyer">Buyers / Plot Owners</option>
                </select>
              </div>
            )}

            {recipientType === 'branch' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Target Branch *</label>
                <select
                  value={recipientBranch}
                  onChange={(e) => setRecipientBranch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="Varanasi HQ">Varanasi Central HQ</option>
                  <option value="Rampur Corridor Office">Rampur Corridor Office</option>
                  <option value="Lahartara Branch">Lahartara Branch</option>
                  <option value="Mirza Murad Desk">Mirza Murad Desk</option>
                </select>
              </div>
            )}

            {recipientType === 'individual' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Select Individual Recipient *</label>
                <select
                  required
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="">-- Choose recipient user --</option>
                  {eligibleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberId || m.role}) — {m.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority & Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="normal">Normal (Information)</option>
                  <option value="important">Important (Action Needed)</option>
                  <option value="urgent">Urgent (Mandatory Attention)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Deep-Link Target Route</label>
                <select
                  value={targetRoute}
                  onChange={(e) => setTargetRoute(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="/member?tab=tasks">Member Task Inbox (/member?tab=tasks)</option>
                  <option value="/member?tab=visits">Member Site Visits (/member?tab=visits)</option>
                  <option value="/member?tab=enquiries">Member CRM Leads (/member?tab=enquiries)</option>
                  <option value="/member?tab=commission">Member Commission Ledger (/member?tab=commission)</option>
                  <option value="/plots">Plot Inventory (/plots)</option>
                  <option value="/buyer">Buyer Portal (/buyer)</option>
                  <option value="/">Homepage (/)</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Announcement Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Navratri Special Plot Booking Incentive Announced"
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            {/* Body */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Message Body *</label>
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type the full announcement message here..."
                className="w-full rounded-xl border border-white/10 bg-[#050A17] p-2.5 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] p-3 text-xs font-bold text-[#0B1734] shadow hover:brightness-110 active:scale-95 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Publishing Broadcast...' : 'Publish In-App Broadcast'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Broadcast History Log */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#C7A35A]" />
              Broadcast History ({messages.length})
            </h4>
            <span className="text-xs text-gray-400">Live Dispatched Notifications</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-10 text-center text-gray-400">
                <Bell className="mx-auto h-10 w-10 text-[#C7A35A]/50 mb-2" />
                <p className="font-semibold text-white">No broadcast messages dispatched yet</p>
                <p className="text-xs mt-1">Send an announcement to your team or buyers using the composer.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-white/10 bg-[#0B1734] p-4 space-y-2.5 transition hover:border-[#C7A35A]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-sm font-bold text-white">{msg.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            msg.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : msg.priority === 'important'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {msg.priority}
                        </span>
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                          To: {msg.recipientType === 'all' ? 'All Users' : `${msg.recipientType} (${msg.recipientId || ''})`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{msg.message}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteBroadcast(msg.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition shrink-0"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-400">
                    <span>Sender: {msg.senderName}</span>
                    <div className="flex items-center gap-3">
                      {msg.targetRoute && (
                        <span className="font-mono text-[#DFC382] text-[10px]">
                          Target: {msg.targetRoute}
                        </span>
                      )}
                      <span>{new Date(msg.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
