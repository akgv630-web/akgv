'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  ListTodo,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskCategory, TaskPriority, TaskReminder, TaskRelatedRecordType } from '@/types';

export function AdminTaskCenter() {
  const {
    tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    allProfiles,
    siteVisits,
    enquiries,
    payments,
    bookings,
    gpsEvidences,
    plots,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TaskCategory>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'completed'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'low' | 'medium' | 'high' | 'urgent'>('ALL');

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('11:00 AM');
  const [assigneeId, setAssigneeId] = useState('');
  const [relatedRecordType, setRelatedRecordType] = useState<TaskRelatedRecordType>('general');
  const [relatedRecordId, setRelatedRecordId] = useState('');

  // Active member assignees (associates, managers, admins)
  const eligibleAssignees = allProfiles.filter(
    (p) => p.isActive && p.role !== 'buyer'
  );

  // Derive targetRoute automatically from related record
  const computeTargetRoute = (recType: TaskRelatedRecordType, recId: string): string => {
    if (!recId || recId === 'none') return '';
    switch (recType) {
      case 'site_visit':
        return `/member?tab=visits&id=${recId}`;
      case 'enquiry':
        return `/member?tab=enquiries&id=${recId}`;
      case 'payment':
        return `/admin?tab=payments&id=${recId}`;
      case 'booking':
        return `/admin?tab=bookings&id=${recId}`;
      case 'field_inspection':
        return `/member?tab=field_gps&id=${recId}`;
      case 'plot':
        return `/master-plan?plot=${recId}`;
      default:
        return `/member?tab=tasks&id=${recId}`;
    }
  };

  const calculatedRoute = computeTargetRoute(relatedRecordType, relatedRecordId);

  // Selected assignee object
  const selectedAssignee = eligibleAssignees.find((p) => p.id === assigneeId);

  // Handle task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setActionNotice({ text: 'कृपया कार्य का शीर्षक (Title) दर्ज करें।', isError: true });
      return;
    }
    if (!assigneeId) {
      setActionNotice({ text: 'कृपया कार्य सौंपने के लिए सदस्य का चयन करें।', isError: true });
      return;
    }

    const assignee = eligibleAssignees.find((p) => p.id === assigneeId);
    if (!assignee) {
      setActionNotice({ text: 'चयनित सदस्य अमान्य है।', isError: true });
      return;
    }

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      const newTask = await addTask({
        assigneeId: assignee.id,
        assignedToMemberId: assignee.memberId || assignee.id,
        assignedToName: assignee.fullName,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        relatedRecordType: relatedRecordType !== 'general' ? relatedRecordType : undefined,
        relatedRecordId: relatedRecordId && relatedRecordId !== 'none' ? relatedRecordId : undefined,
        targetRoute: calculatedRoute || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        status: 'pending',
        createdBy: currentUser?.id || 'usr-admin-01',
        createdByName: currentUser?.fullName || 'Super Admin',
      });

      setActionNotice({ text: `कार्य "${newTask.title}" सफलतापूर्वक ${assignee.fullName} को सौंपा गया।` });
      setIsCreateModalOpen(false);
      // Reset Form
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      setAssigneeId('');
      setRelatedRecordType('general');
      setRelatedRecordId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionNotice({ text: `त्रुटि: ${msg}`, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (statusFilter === 'pending' && t.isCompleted) return false;
    if (statusFilter === 'completed' && !t.isCompleted) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchName = t.assignedToName.toLowerCase().includes(q);
      const matchCode = (t.assignedToMemberId || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchName && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const urgentCount = tasks.filter((t) => !t.isCompleted && (t.priority === 'urgent' || t.priority === 'high')).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734]/80 p-4 shadow-lg backdrop-blur-md">
          <span className="text-xs text-gray-400 block font-medium">कुल कार्य (Total Tasks)</span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-lg backdrop-blur-md">
          <span className="text-xs text-amber-300 block font-medium">लंबित कार्य (Pending)</span>
          <span className="text-2xl font-serif font-bold text-amber-400 mt-1 block">{pendingCount}</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-lg backdrop-blur-md">
          <span className="text-xs text-emerald-300 block font-medium">पूर्ण कार्य (Completed)</span>
          <span className="text-2xl font-serif font-bold text-emerald-400 mt-1 block">{completedCount}</span>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 shadow-lg backdrop-blur-md">
          <span className="text-xs text-red-300 block font-medium">उच्च प्राथमिकता (Urgent/High)</span>
          <span className="text-2xl font-serif font-bold text-red-400 mt-1 block">{urgentCount}</span>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl p-4 text-sm font-semibold border ${
            actionNotice.isError
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-current hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, and New Task Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1734] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="कार्य, सदस्य या निर्देश खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050A17] pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'pending' | 'completed')}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">सभी स्थितियां (All Status)</option>
            <option value="pending">लंबित (Pending)</option>
            <option value="completed">पूर्ण (Completed)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | TaskCategory)}
            className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-white focus:border-[#C7A35A] focus:outline-none"
          >
            <option value="ALL">सभी श्रेणियां (All Categories)</option>
            <option value="site_visit">साइट विजिट (Site Visit)</option>
            <option value="client_followup">क्लाइंट फॉलो-अप (Client Follow-up)</option>
            <option value="payment_verification">भुगतान सत्यापन (Payment Verification)</option>
            <option value="field_inspection">फील्ड निरीक्षण (Field Inspection)</option>
            <option value="plot">प्लॉट जानकारी (Plot Enquiry)</option>
            <option value="general">सामान्य (General)</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>नया कार्य बनाएं (Assign Task)</span>
        </button>
      </div>

      {/* Tasks Table / Card List */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1734] overflow-hidden shadow-xl">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ListTodo className="h-12 w-12 mx-auto text-gray-500 mb-3 opacity-60" />
            <p className="text-sm font-semibold">कोई कार्य नहीं मिला (No Tasks Found)</p>
            <p className="text-xs text-gray-500 mt-1">
              {tasks.length === 0 ? 'अभी तक कोई कार्य नहीं सौंपा गया है।' : 'वर्तमान फ़िल्टर में कोई कार्य उपलब्ध नहीं है।'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] ${
                  task.isCompleted ? 'opacity-70 bg-black/20' : ''
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                        task.isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-[#0B1734]'
                          : 'border-white/20 hover:border-[#C7A35A]'
                      }`}
                      title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {task.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </button>

                    <h3 className={`text-sm font-bold text-white ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </h3>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        task.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : task.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>

                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-300 border border-white/10">
                      {task.category.replace('_', ' ').toUpperCase()}
                    </span>

                    {task.status && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : task.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-300 pl-7 leading-relaxed">{task.description}</p>
                  )}

                  {task.completionNotes && (
                    <div className="ml-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-300">
                      <strong>कार्य पूर्ण विवरण:</strong> {task.completionNotes}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pl-7 pt-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-[#DFC382]" />
                      <span>सौंपा गया: <strong className="text-white">{task.assignedToName}</strong> ({task.assignedToMemberId})</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>अंतिम तिथि: {task.dueDate} {task.dueTime ? `• ${task.dueTime}` : ''}</span>
                    </span>

                    {task.targetRoute && (
                      <Link
                        href={task.targetRoute}
                        className="inline-flex items-center gap-1 text-[#DFC382] hover:underline font-semibold"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>संबंधित रिकॉर्ड खोलें (Open Deep Link)</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center pl-7 md:pl-0">
                  <button
                    onClick={async () => {
                      if (confirm(`क्या आप कार्य "${task.title}" को हटाना चाहते हैं?`)) {
                        await deleteTask(task.id);
                        setActionNotice({ text: 'कार्य सफलतापूर्वक हटा दिया गया।' });
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                    title="कार्य हटाएं"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#C7A35A]/50 bg-[#0B1734] p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#050A17] border border-[#C7A35A] text-[#DFC382]">
                  <ListTodo className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-white">नया कार्य सौंपें (Assign Daily Task)</h2>
                  <p className="text-xs text-gray-400">सदस्य को कार्य सौंपें और संबंधित रिकॉर्ड को लिंक करें।</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  कार्य का शीर्षक (Task Title) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कैंट स्टेशन से ग्राहक को पिकअप कर रामपुर साइट पर ले जाएं"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">विस्तृत निर्देश (Instructions & Notes)</label>
                <textarea
                  rows={3}
                  placeholder="ग्राहक का नाम, प्लॉट की प्राथमिकता, वाहन नंबर और विशेष विवरण यहाँ दर्ज करें..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    कार्य श्रेणी (Task Category) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="site_visit">साइट विजिट (Site Visit Escort)</option>
                    <option value="client_followup">क्लाइंट फॉलो-अप (Client Follow-up)</option>
                    <option value="payment_verification">भुगतान सत्यापन (Payment Verification)</option>
                    <option value="field_inspection">फील्ड जीपीएस सीमांकन (Field GPS Inspection)</option>
                    <option value="plot">प्लॉट पूछताछ (Plot Enquiry)</option>
                    <option value="booking">बुकिंग फॉलो-अप (Booking Follow-up)</option>
                    <option value="general">सामान्य कार्य (General Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    प्राथमिकता (Priority Level) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="low">कम (Low)</option>
                    <option value="medium">मध्यम (Medium)</option>
                    <option value="high">उच्च (High)</option>
                    <option value="urgent">अति आवश्यक (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* Assignee Picker */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  किसे सौंपना है? (Assign To Member) <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-xl border border-[#C7A35A]/50 bg-[#050A17] px-3.5 py-2.5 text-[#DFC382] font-semibold focus:border-[#C7A35A] focus:outline-none"
                >
                  <option value="">-- सक्रिय सदस्य चुनें (Select Active Member) --</option>
                  {eligibleAssignees.map((mem) => (
                    <option key={mem.id} value={mem.id}>
                      {mem.fullName} ({mem.memberId || mem.id}) • {mem.role.toUpperCase()} • {mem.branchLocation || 'Head Office'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Record Attachment & Deep Link Generator */}
              <div className="rounded-2xl border border-white/10 bg-[#050A17] p-4 space-y-3">
                <label className="block text-gray-300 font-semibold">
                  संबंधित रिकॉर्ड लिंक करें (Attach Related Database Record)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1">रिकॉर्ड प्रकार (Record Type)</span>
                    <select
                      value={relatedRecordType}
                      onChange={(e) => {
                        const newType = e.target.value as TaskRelatedRecordType;
                        setRelatedRecordType(newType);
                        setRelatedRecordId('');
                      }}
                      className="w-full rounded-xl border border-white/10 bg-[#0B1734] px-3 py-2 text-white focus:border-[#C7A35A] focus:outline-none"
                    >
                      <option value="general">कोई रिकॉर्ड नहीं (General Task)</option>
                      <option value="site_visit">साइट विजिट (Site Visit)</option>
                      <option value="enquiry">क्लाइंट लीड (Client Enquiry)</option>
                      <option value="payment">भुगतान रिकॉर्ड (Payment Record)</option>
                      <option value="booking">बुकिंग रिकॉर्ड (Plot Booking)</option>
                      <option value="field_inspection">फील्ड जीपीएस रिकॉर्ड (Field GPS)</option>
                      <option value="plot">प्लॉट मास्टर प्लान (Plot Master Plan)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1">विशिष्ट रिकॉर्ड चुनें (Select Record)</span>
                    <select
                      value={relatedRecordId}
                      onChange={(e) => setRelatedRecordId(e.target.value)}
                      disabled={relatedRecordType === 'general'}
                      className="w-full rounded-xl border border-white/10 bg-[#0B1734] px-3 py-2 text-white focus:border-[#C7A35A] focus:outline-none disabled:opacity-50"
                    >
                      <option value="none">-- कोई विशिष्ट रिकॉर्ड नहीं --</option>
                      {relatedRecordType === 'site_visit' &&
                        siteVisits.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.visitorName} ({v.preferredDate} • {v.locationName})
                          </option>
                        ))}
                      {relatedRecordType === 'enquiry' &&
                        enquiries.map((enq) => (
                          <option key={enq.id} value={enq.id}>
                            {enq.clientName} (Phone: {enq.clientPhone} • {enq.status})
                          </option>
                        ))}
                      {relatedRecordType === 'payment' &&
                        payments.map((p) => (
                          <option key={p.id} value={p.id}>
                            Plot {p.plotNumber} • ₹{p.amountInr.toLocaleString('en-IN')} ({p.payerName})
                          </option>
                        ))}
                      {relatedRecordType === 'booking' &&
                        bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bookingNumber} • Plot {b.plotNumber} ({b.buyerName})
                          </option>
                        ))}
                      {relatedRecordType === 'field_inspection' &&
                        gpsEvidences.map((g) => (
                          <option key={g.id} value={g.id}>
                            Plot {g.plotNumber} (Accuracy: {g.accuracyMeters}m • {g.capturedByName})
                          </option>
                        ))}
                      {relatedRecordType === 'plot' &&
                        plots.map((p) => (
                          <option key={p.id} value={p.plotNumber}>
                            Plot {p.plotNumber} (Block {p.block} • {p.status})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {calculatedRoute && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-2 text-[11px] text-gray-300">
                    <ExternalLink className="h-3.5 w-3.5 text-[#DFC382]" />
                    <span>डीप-लिंक रूट: <code className="text-[#DFC382] font-mono">{calculatedRoute}</code></span>
                  </div>
                )}
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    समाप्ति तिथि (Due Date) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">समाप्ति समय (Due Time)</label>
                  <input
                    type="text"
                    placeholder="उदा. 11:00 AM या 04:00 PM"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Assignment Preview Card */}
              {selectedAssignee && (
                <div className="rounded-2xl border border-[#C7A35A]/40 bg-[#050A17] p-3 text-xs space-y-1">
                  <span className="text-[10px] text-[#DFC382] uppercase font-bold tracking-wider">
                    असाइनमेंट पूर्वावलोकन (Preview)
                  </span>
                  <p className="text-white">
                    यह कार्य <strong className="text-[#DFC382]">{selectedAssignee.fullName}</strong> ({selectedAssignee.memberId || selectedAssignee.id}) को सौंपा जाएगा।
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    वे अपने सदस्य पोर्टल के &quot;Aaj Ke Kaam&quot; टैब में इस कार्य को देखकर पूरा कर सकेंगे।
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-6 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'सहेज रहे हैं...' : 'कार्य असाइन करें (Confirm & Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
