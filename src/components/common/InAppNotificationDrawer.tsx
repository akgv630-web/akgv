'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Megaphone,
  Radio,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { InAppMessage } from '@/types';

export function InAppNotificationDrawer() {
  const { messages, currentUser, markMessageRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  // Filter messages relevant to this user
  const relevantMessages = messages.filter((m) => {
    if (m.recipientType === 'all') return true;
    if (m.recipientType === 'role' && m.recipientId === currentUser.role) return true;
    if (m.recipientType === 'branch' && currentUser.branchLocation?.includes(m.recipientId || '')) return true;
    if (
      m.recipientType === 'individual' &&
      (m.recipientProfileId === currentUser.id ||
        m.recipientId === currentUser.memberId ||
        m.recipientId === currentUser.id)
    ) {
      return true;
    }
    return false;
  });

  const unreadCount = relevantMessages.filter((m) => !m.isRead).length;

  const handleMarkRead = async (msgId: string) => {
    await markMessageRead(msgId);
  };

  return (
    <>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#050A17] text-gray-300 hover:text-white hover:border-[#C7A35A]/50 transition"
        title="Broadcasts & Notifications"
      >
        <Bell className="h-5 w-5 text-[#DFC382]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md border-l border-[#C7A35A]/30 bg-[#0B1734] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#050A17]">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#C7A35A]" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      Notifications & Directives
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {relevantMessages.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#050A17] p-10 text-center text-gray-400">
                    <Radio className="mx-auto h-10 w-10 text-[#C7A35A]/50 mb-2" />
                    <p className="font-semibold text-white">No notifications yet</p>
                    <p className="text-xs mt-1">Directives and broadcast announcements from administration will appear here.</p>
                  </div>
                ) : (
                  relevantMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-2xl border p-4 space-y-2.5 transition ${
                        msg.isRead
                          ? 'border-white/5 bg-[#050A17]/60 opacity-80'
                          : 'border-[#C7A35A]/40 bg-[#050A17] shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
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
                        </div>

                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="rounded-lg p-1 text-gray-400 hover:text-emerald-400 hover:bg-white/5 text-[11px] flex items-center gap-1 shrink-0"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed">{msg.message}</p>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-400">
                        <span>From: {msg.senderName}</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>

                      {msg.targetRoute && (
                        <div className="pt-1">
                          <Link
                            href={msg.targetRoute}
                            onClick={() => {
                              handleMarkRead(msg.id);
                              setIsOpen(false);
                            }}
                            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#C7A35A]/10 border border-[#C7A35A]/30 p-2 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                          >
                            <span>Open Related Record</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
