'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  MessageSquare,
  Navigation,
  Search,
  Sparkles,
  Tag,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskReminder, TaskCategory } from '@/types';

export function MemberTaskInbox() {
  const { tasks, currentUser, toggleTask, updateTask } = useApp();

  const [filterCategory, setFilterCategory] = useState<'ALL' | TaskCategory>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'completed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active notes editor for a task
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (!currentUser) return null;

  // Filter tasks assigned to current member (by canonical ID or member code)
  const myTasks = tasks.filter((t) => {
    const isMine =
      t.assigneeId === currentUser.id ||
      t.assignedToMemberId === currentUser.memberId ||
      t.assignedToMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (t.assignedToMemberId === 'usr-sponsor-01' || t.assignedToMemberId === 'AKGV-3498'));

    if (!isMine) return false;

    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'completed' && t.isCompleted) ||
      (filterStatus === 'pending' && !t.isCompleted);
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalMyTasks = tasks.filter(
    (t) =>
      t.assigneeId === currentUser.id ||
      t.assignedToMemberId === currentUser.memberId ||
      t.assignedToMemberId === currentUser.id ||
      (currentUser.memberId === 'AKGV-3498' && (t.assignedToMemberId === 'usr-sponsor-01' || t.assignedToMemberId === 'AKGV-3498'))
  );

  const pendingCount = totalMyTasks.filter((t) => !t.isCompleted).length;
  const completedCount = totalMyTasks.filter((t) => t.isCompleted).length;

  const handleToggle = async (task: TaskReminder) => {
    setIsSubmitting(true);
    try {
      const res = await toggleTask(task.id, task.completionNotes);
      if (res.success) {
        showNotification(
          task.isCompleted
            ? `Task marked pending: ${task.title}`
            : `Great job! Task completed: ${task.title}`
        );
      } else {
        showNotification(res.error || 'Failed to update task status', 'error');
      }
    } catch {
      showNotification('Error updating task status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      const res = await updateTask(taskId, {
        completionNotes: notesInput.trim(),
      });
      if (res.success) {
        showNotification('Task completion notes recorded successfully');
        setEditingNotesTaskId(null);
        setNotesInput('');
      } else {
        showNotification(res.error || 'Failed to save notes', 'error');
      }
    } catch {
      showNotification('Error saving completion notes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
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

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Total Work Items</span>
          <span className="font-serif text-2xl font-bold text-white">{totalMyTasks.length}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">Assigned directly to you</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block">Pending Action</span>
          <span className="font-serif text-2xl font-bold text-amber-400">{pendingCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Requires your follow-up today</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block">Completed Work</span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{completedCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Recorded and verified</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block">Completion Rate</span>
          <span className="font-serif text-2xl font-bold text-sky-400">
            {totalMyTasks.length > 0 ? Math.round((completedCount / totalMyTasks.length) * 100) : 0}%
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Daily productivity score</span>
        </div>
      </div>

      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Statuses ({totalMyTasks.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="client_followup">Client Follow-up</option>
            <option value="site_visit">Site Visit Coordination</option>
            <option value="field_inspection">Field GPS Inspection</option>
            <option value="payment_verification">Payment Verification</option>
            <option value="plot">Plot Verification</option>
            <option value="general">General Directive</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <strong className="text-white">{myTasks.length}</strong> tasks
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-12 text-center text-gray-400">
            <CheckSquare className="mx-auto h-12 w-12 text-[#C7A35A]/50 mb-3" />
            <p className="font-semibold text-white">No tasks found matching your filters</p>
            <p className="text-xs mt-1">All clear! Check back later for new assignments from administration.</p>
          </div>
        ) : (
          myTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl border p-4 sm:p-5 transition space-y-3 ${
                task.isCompleted
                  ? 'border-emerald-500/30 bg-[#0B1734]/60 opacity-80'
                  : 'border-white/10 bg-[#0B1734] hover:border-[#C7A35A]/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Checkbox and Task Details */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={isSubmitting}
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                      task.isCompleted
                        ? 'border-emerald-400 bg-emerald-500 text-black'
                        : 'border-white/30 bg-[#050A17] hover:border-[#C7A35A]'
                    }`}
                    title={task.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {task.isCompleted && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-serif text-base font-bold ${
                          task.isCompleted ? 'line-through text-gray-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Category */}
                      <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                        {task.category.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-300 leading-relaxed">{task.description}</p>
                    )}

                    {/* Metadata: Due Date & Assigner */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        <span>Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}</span>
                      </span>
                      <span>Assigned by: <strong className="text-white">{task.createdByName || task.createdBy}</strong></span>
                      {task.completedAt && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed on {new Date(task.completedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Deep-link action button */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                  {task.targetRoute && (
                    <Link
                      href={task.targetRoute}
                      className="flex items-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                    >
                      <span>Open Record (रिकॉर्ड खोलें)</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      if (editingNotesTaskId === task.id) {
                        setEditingNotesTaskId(null);
                      } else {
                        setEditingNotesTaskId(task.id);
                        setNotesInput(task.completionNotes || '');
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
                  >
                    {task.completionNotes ? 'Edit Notes' : 'Add Work Notes'}
                  </button>
                </div>
              </div>

              {/* Completion Notes display */}
              {task.completionNotes && editingNotesTaskId !== task.id && (
                <div className="rounded-xl bg-[#050A17] p-2.5 text-xs text-gray-300 border border-white/5">
                  <strong className="text-gray-400">Your Action Notes:</strong> {task.completionNotes}
                </div>
              )}

              {/* Inline Completion Notes Editor */}
              {editingNotesTaskId === task.id && (
                <div className="rounded-xl bg-[#050A17] p-3 border border-[#C7A35A]/40 space-y-2">
                  <label className="text-xs font-semibold text-[#DFC382] block">
                    Record Completion Notes / Updates for Admin
                  </label>
                  <textarea
                    rows={2}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g. Visited Rampur site with client; client liked plot B-14 and requested hold until Monday..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none focus:border-[#C7A35A]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNotesTaskId(null)}
                      className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(task.id)}
                      disabled={isSubmitting}
                      className="rounded-lg bg-[#C7A35A] px-3.5 py-1 text-xs font-bold text-[#0B1734] disabled:opacity-50"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
