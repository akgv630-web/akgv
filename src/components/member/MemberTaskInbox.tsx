'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  Tag,
  User,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TaskReminder, TaskCategory, TaskPriority } from '@/types';
import { tLang } from '@/lib/i18n';

export function MemberTaskInbox() {
  const {
    tasks,
    currentUser,
    toggleTask,
    updateTask,
    addTask,
    language,
    siteVisits,
    enquiries,
    assignSiteVisit,
    assignEnquiry
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'my_tasks' | 'incoming_leads'>('my_tasks');
  const [filterCategory, setFilterCategory] = useState<'ALL' | TaskCategory>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'completed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active notes editor for a task
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');

  // Add Custom Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('client_followup');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('11:00 AM');
  const [newDescription, setNewDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (!currentUser) return null;

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
  const [adminShowAll, setAdminShowAll] = useState(false);

  // Filter tasks assigned to current member (by canonical ID, auth UID, or member code)
  const isMatchUser = (assigneeId?: string, assignedToMemberId?: string) => {
    if (!currentUser) return false;
    if (isAdmin && adminShowAll) return true;
    const uid = currentUser.id;
    const memId = currentUser.memberId;

    if (assigneeId === uid || assigneeId === memId) return true;
    if (assignedToMemberId === uid || assignedToMemberId === memId) return true;
    if (memId && assignedToMemberId && assignedToMemberId.toLowerCase() === memId.toLowerCase()) return true;
    if (memId && assigneeId && assigneeId.toLowerCase() === memId.toLowerCase()) return true;
    const isPreet =
      memId === 'AKGV-2117' ||
      memId === 'AKGV-HQ-001' ||
      currentUser.fullName?.toLowerCase().includes('preet');

    if (isPreet && (assignedToMemberId === 'AKGV-2117' || assigneeId === 'AKGV-2117' || assignedToMemberId === 'AKGV-HQ-001' || assigneeId === 'usr-admin-01')) return true;
    if (currentUser.memberId === 'AKGV-3498' && (assignedToMemberId === 'usr-sponsor-01' || assignedToMemberId === 'AKGV-3498')) return true;
    if (currentUser.memberId === 'AKGV0042' && (assignedToMemberId === 'usr-member-01' || assignedToMemberId === 'AKGV0042')) return true;
    if (currentUser.memberId === 'AKGV-SUB-101' && (assignedToMemberId === 'usr-subadmin-01' || assignedToMemberId === 'AKGV-SUB-101')) return true;
    return false;
  };

  // 1. Explicit Tasks from Database/Store
  const directTasks = tasks.filter((t) => isMatchUser(t.assigneeId, t.assignedToMemberId));

  // 2. Synthesize missing tasks from assigned site visits
  const myAssignedVisits = siteVisits.filter(
    (v) =>
      (v.assignedStaffId === currentUser.id ||
        v.assignedStaffMemberId === currentUser.memberId ||
        (currentUser.memberId === 'AKGV-2117' && v.assignedStaffMemberId === 'AKGV-2117')) &&
      !tasks.some((t) => t.relatedRecordId === v.id)
  );

  const synthesizedVisitTasks: TaskReminder[] = myAssignedVisits.map((v) => ({
    id: `synth-sv-${v.id}`,
    assigneeId: currentUser.id,
    assignedToMemberId: currentUser.memberId || currentUser.id,
    assignedToName: currentUser.fullName,
    title: `Site Visit Escort: ${v.visitorName} (${v.locationName})`,
    description: `Client: ${v.visitorName} (Phone: ${v.visitorPhone}). Slot: ${v.preferredTimeSlot || 'Standard'}, Pickup: ${v.pickupRequired ? 'Required' : 'Self-arrival'}. Notes: ${v.notes || 'Township inspection'}`,
    category: 'site_visit',
    relatedRecordType: 'site_visit',
    relatedRecordId: v.id,
    targetRoute: `/member?tab=site_visits&id=${v.id}`,
    dueDate: v.preferredDate || new Date().toISOString().split('T')[0],
    dueTime: v.preferredTimeSlot ? v.preferredTimeSlot.split('-')[0].trim() : '11:00 AM',
    priority: 'high',
    status: v.status === 'completed' ? 'completed' : 'pending',
    isCompleted: v.status === 'completed',
    createdBy: 'system',
    createdByName: 'Admin Desk',
    createdAt: v.createdAt || new Date().toISOString()
  }));

  // 3. Synthesize missing tasks from assigned enquiries
  const myAssignedEnquiries = enquiries.filter(
    (e) =>
      (e.assignedProfileId === currentUser.id ||
        e.assignedMemberId === currentUser.memberId ||
        (currentUser.memberId === 'AKGV-2117' && e.assignedMemberId === 'AKGV-2117')) &&
      !tasks.some((t) => t.relatedRecordId === e.id)
  );

  const synthesizedEnquiryTasks: TaskReminder[] = myAssignedEnquiries.map((e) => ({
    id: `synth-enq-${e.id}`,
    assigneeId: currentUser.id,
    assignedToMemberId: currentUser.memberId || currentUser.id,
    assignedToName: currentUser.fullName,
    title: `Client Lead Follow-up: ${e.clientName}`,
    description: `Phone: ${e.clientPhone}. Budget: ₹${e.budgetInr ? (e.budgetInr / 100000).toFixed(1) + ' Lakh' : 'Flexible'}. Notes: ${e.notes || 'Inquired about township plots'}`,
    category: 'client_followup',
    relatedRecordType: 'enquiry',
    relatedRecordId: e.id,
    targetRoute: `/member?tab=enquiries&id=${e.id}`,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '12:00 PM',
    priority: 'urgent',
    status: (e.status === 'booked' || e.status === 'lost') ? 'completed' : 'pending',
    isCompleted: e.status === 'booked' || e.status === 'lost',
    createdBy: 'system',
    createdByName: 'Admin Desk',
    createdAt: e.createdAt || new Date().toISOString()
  }));

  // Consolidated work items
  const allConsolidatedTasks = [...directTasks, ...synthesizedVisitTasks, ...synthesizedEnquiryTasks];

  const filteredTasks = allConsolidatedTasks.filter((t) => {
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

  const pendingCount = allConsolidatedTasks.filter((t) => !t.isCompleted).length;
  const completedCount = allConsolidatedTasks.filter((t) => t.isCompleted).length;

  // Unassigned Website Requests / Leads from Public Home & Contact Pages
  const unassignedVisits = siteVisits.filter(
    (v) => (!v.assignedStaffId || v.assignedStaffMemberId === '') && v.status === 'requested'
  );
  const unassignedEnquiries = enquiries.filter(
    (e) => (!e.assignedProfileId || e.assignedMemberName === 'Unassigned' || !e.assignedMemberId) && e.status === 'new'
  );
  const incomingWebsiteLeadsCount = unassignedVisits.length + unassignedEnquiries.length;

  // Extract phone number from task metadata or record
  const getTaskClientPhone = (task: TaskReminder): string | null => {
    if (task.relatedRecordType === 'site_visit' && task.relatedRecordId) {
      const v = siteVisits.find((item) => item.id === task.relatedRecordId);
      if (v?.visitorPhone) return v.visitorPhone;
    }
    if (task.relatedRecordType === 'enquiry' && task.relatedRecordId) {
      const e = enquiries.find((item) => item.id === task.relatedRecordId);
      if (e?.clientPhone) return e.clientPhone;
    }
    // Check phone number in description (10 digit regex)
    const match = task.description?.match(/(\d{10})/);
    return match ? match[1] : null;
  };

  const handleToggle = async (task: TaskReminder) => {
    setIsSubmitting(true);
    try {
      const res = await toggleTask(task.id, task.completionNotes);
      if (res.success) {
        showNotification(
          task.isCompleted
            ? tLang(language, `Task marked pending: ${task.title}`, `कार्य लंबित चिह्नित किया गया: ${task.title}`, `Task pending mark ho gaya: ${task.title}`)
            : tLang(language, `Great work! Task marked completed: ${task.title}`, `शानदार! कार्य पूरा हुआ: ${task.title}`, `Badhiya! Task complete mark ho gaya: ${task.title}`)
        );
      } else {
        showNotification(res.error || tLang(language, 'Failed to update task status', 'कार्य स्थिति अद्यतन विफल', 'Task status update fail ho gaya'), 'error');
      }
    } catch {
      showNotification(tLang(language, 'Error updating task status', 'स्थिति अपडेट करने में त्रुटि', 'Task update karne me error aaya'), 'error');
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
        showNotification(tLang(language, 'Task action notes recorded successfully.', 'कार्य नोट्स सफलतापूर्वक सहेजे गए।', 'Task action notes save ho gaye.'));
        setEditingNotesTaskId(null);
        setNotesInput('');
      } else {
        showNotification(res.error || tLang(language, 'Failed to save notes', 'नोट्स सहेजने में त्रुटि', 'Notes save nahi ho paye'), 'error');
      }
    } catch {
      showNotification(tLang(language, 'Error saving notes', 'नोट्स सहेजने में त्रुटि', 'Notes save karne me error aaya'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotification(tLang(language, 'Please enter a task title.', 'कृपया कार्य का शीर्षक दर्ज करें।', 'Kripya task title enter karein.'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addTask({
        assigneeId: currentUser.id,
        assignedToMemberId: currentUser.memberId || currentUser.id,
        assignedToName: currentUser.fullName,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        category: newCategory,
        dueDate: newDueDate,
        dueTime: newDueTime || undefined,
        priority: newPriority,
        status: 'pending',
        targetRoute: `/member?tab=tasks`,
        createdBy: currentUser.id,
        createdByName: currentUser.fullName,
      });

      showNotification(
        tLang(
          language,
          `Personal task "${created.title}" created successfully.`,
          `व्यक्तिगत कार्य "${created.title}" सफलतापूर्वक बनाया गया।`,
          `Personal task "${created.title}" ban gaya hai.`
        )
      );
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err: any) {
      showNotification(err.message || tLang(language, 'Failed to create task.', 'कार्य बनाने में त्रुटि।', 'Task create nahi ho paya.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimVisit = async (visitId: string) => {
    setIsSubmitting(true);
    try {
      const res = await assignSiteVisit(visitId, currentUser.id, currentUser.fullName, currentUser.memberId);
      if (res.success) {
        showNotification(
          tLang(
            language,
            'Site visit claimed and added directly to your active tasks!',
            'साइट विजिट आपके सक्रिय कार्यों में जोड़ दी गई है!',
            'Site visit claim hokar aapke active tasks me add ho gayi hai!'
          )
        );
        setActiveSubView('my_tasks');
      } else {
        showNotification(res.error || 'Failed to claim site visit', 'error');
      }
    } catch {
      showNotification('Error claiming site visit', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimEnquiry = async (enquiryId: string) => {
    setIsSubmitting(true);
    try {
      const res = await assignEnquiry(enquiryId, currentUser.id, currentUser.fullName, currentUser.memberId);
      if (res.success) {
        showNotification(
          tLang(
            language,
            'Customer lead claimed and added directly to your active tasks!',
            'ग्राहक लीड आपके सक्रिय कार्यों में जोड़ दी गई है!',
            'Customer lead claim hokar aapke active tasks me add ho gayi hai!'
          )
        );
        setActiveSubView('my_tasks');
      } else {
        showNotification(res.error || 'Failed to claim lead', 'error');
      }
    } catch {
      showNotification('Error claiming customer lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs sm:text-sm font-semibold shadow-lg ${
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

      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#C7A35A]/30 bg-gradient-to-r from-[#0B1734] via-[#050A17] to-[#0B1734] p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7A35A]/40 bg-[#C7A35A]/10 px-3 py-0.5 text-xs font-bold text-[#DFC382]">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{tLang(language, 'Action Task Desk', 'दैनिक कार्य डेस्क', 'Daily Task Desk')}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            {tLang(language, 'My Daily Tasks & Follow-ups', 'आज के कार्य एवं फॉलो-अप', 'Aaj Ke Kaam Aur Follow-ups')}
          </h2>
          <p className="text-xs text-gray-300">
            {tLang(
              language,
              'Escort site visits, call website customer leads, and mark verified work items completed.',
              'साइट विजिट का मार्गदर्शन करें, वेबसाइट से आई पूछताछ पर कॉल करें और कार्य पूरा चिह्नित करें।',
              'Site visit escort karein, website leads ko call karein aur kaam complete mark karein.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => setAdminShowAll((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                adminShowAll
                  ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                  : 'border-white/10 bg-[#050A17] text-gray-400 hover:text-white'
              }`}
            >
              <span>{adminShowAll ? 'Showing: All Company Tasks' : 'Showing: My Tasks'}</span>
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C7A35A] to-[#DFC382] px-4 py-2.5 text-xs font-bold text-[#0B1734] shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{tLang(language, '+ Add Personal Task', '+ नया कार्य जोड़ें', '+ Naya Task Add Karein')}</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-4">
          <span className="text-xs text-gray-400 block font-medium">
            {tLang(language, 'Total Work Items', 'कुल कार्य', 'Total Work Items')}
          </span>
          <span className="font-serif text-2xl font-bold text-white">{allConsolidatedTasks.length}</span>
          <span className="text-[11px] text-[#DFC382] block mt-1">
            {tLang(language, 'Assigned to your ID', 'आपकी आईडी पर आवंटित', 'Aapki ID par assigned')}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-[#0B1734] p-4">
          <span className="text-xs text-amber-300 block font-medium">
            {tLang(language, 'Pending Action', 'लंबित कार्य', 'Pending Kaam')}
          </span>
          <span className="font-serif text-2xl font-bold text-amber-400">{pendingCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">
            {tLang(language, 'Requires follow-up today', 'आज पूरा करना आवश्यक', 'Aaj follow-up zaroori')}
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-[#0B1734] p-4">
          <span className="text-xs text-emerald-300 block font-medium">
            {tLang(language, 'Completed Work', 'पूरा किया गया', 'Completed Work')}
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-400">{completedCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">
            {tLang(language, 'Recorded and verified', 'सत्यापित एवं दर्ज', 'Verified aur recorded')}
          </span>
        </div>

        <div className="rounded-2xl border border-sky-500/30 bg-[#0B1734] p-4">
          <span className="text-xs text-sky-300 block font-medium">
            {tLang(language, 'Website Leads', 'वेबसाइट लीड्स', 'Website Leads')}
          </span>
          <span className="font-serif text-2xl font-bold text-sky-400">{incomingWebsiteLeadsCount}</span>
          <span className="text-[11px] text-gray-400 block mt-1">
            {tLang(language, 'From Home/Contact page', 'होम व संपर्क पेज से', 'Home aur contact page se')}
          </span>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveSubView('my_tasks')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeSubView === 'my_tasks'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>{tLang(language, 'My Assigned Tasks', 'मेरे आवंटित कार्य', 'Mere Assigned Tasks')}</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveSubView('incoming_leads')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition ${
            activeSubView === 'incoming_leads'
              ? 'border-[#C7A35A] text-[#DFC382]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 text-sky-400" />
          <span>{tLang(language, 'Incoming Home Page Leads', 'वेबसाइट से नई लीड्स', 'Website Nayi Leads')}</span>
          {incomingWebsiteLeadsCount > 0 && (
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
              {incomingWebsiteLeadsCount}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: MY ASSIGNED TASKS */}
      {activeSubView === 'my_tasks' && (
        <div className="space-y-4">
          {/* Filters Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B1734] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={tLang(language, 'Search tasks, client name...', 'कार्य खोजें...', 'Task search karein...')}
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
                <option value="ALL">{tLang(language, `All Statuses (${allConsolidatedTasks.length})`, `सभी स्थितियां (${allConsolidatedTasks.length})`, `Sabhi Status (${allConsolidatedTasks.length})`)}</option>
                <option value="pending">{tLang(language, `Pending (${pendingCount})`, `लंबित (${pendingCount})`, `Pending (${pendingCount})`)}</option>
                <option value="completed">{tLang(language, `Completed (${completedCount})`, `पूरा हुआ (${completedCount})`, `Completed (${completedCount})`)}</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-[#050A17] px-3 py-2 text-xs text-gray-300 focus:border-[#C7A35A] focus:outline-none"
              >
                <option value="ALL">{tLang(language, 'All Categories', 'सभी श्रेणियां', 'Sabhi Categories')}</option>
                <option value="site_visit">{tLang(language, 'Site Visit Escort', 'साइट विजिट', 'Site Visit')}</option>
                <option value="client_followup">{tLang(language, 'Client Follow-up', 'ग्राहक संपर्क', 'Client Follow-up')}</option>
                <option value="field_inspection">{tLang(language, 'Field GPS Inspection', 'फील्ड जीपीएस निरीक्षण', 'Field Inspection')}</option>
                <option value="payment_verification">{tLang(language, 'Payment Verification', 'भुगतान सत्यापन', 'Payment Verification')}</option>
                <option value="general">{tLang(language, 'General Directive', 'सामान्य निर्देश', 'General Directive')}</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              {tLang(language, 'Showing', 'दिखा रहे हैं', 'Dikh raha hai')} <strong className="text-white">{filteredTasks.length}</strong> {tLang(language, 'tasks', 'कार्य', 'tasks')}
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#0B1734] p-10 text-center text-gray-400 space-y-3">
                <CheckSquare className="mx-auto h-12 w-12 text-[#C7A35A]/50" />
                <h3 className="font-serif text-lg font-bold text-white">
                  {tLang(language, 'No tasks matching your selection', 'कोई कार्य नहीं मिला', 'Koi task nahi mila')}
                </h3>
                <p className="text-xs max-w-md mx-auto text-gray-300">
                  {tLang(
                    language,
                    'You have zero pending tasks in this category. You can claim incoming website leads or create a personal reminder.',
                    'आपके पास इस श्रेणी में कोई लंबित कार्य नहीं है। आप वेबसाइट से नई लीड्स ले सकते हैं या नया कार्य जोड़ सकते हैं।',
                    'Aapke paas is category me koi pending task nahi hai. Aap website leads claim kar sakte hain ya personal task add karein.'
                  )}
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setActiveSubView('incoming_leads')}
                    className="rounded-xl border border-sky-500/40 bg-sky-950/40 px-4 py-2 text-xs font-bold text-sky-300 hover:bg-sky-900/50 transition"
                  >
                    {tLang(language, 'View Website Leads', 'वेबसाइट लीड्स देखें', 'Website Leads Dekhein')} ({incomingWebsiteLeadsCount})
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-xl bg-[#C7A35A] px-4 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 transition"
                  >
                    {tLang(language, '+ Add New Task', '+ नया कार्य जोड़ें', '+ Naya Task Add Karein')}
                  </button>
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const phone = getTaskClientPhone(task);

                return (
                  <div
                    key={task.id}
                    id={task.id}
                    data-record-id={task.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition space-y-3 ${
                      task.isCompleted
                        ? 'border-emerald-500/30 bg-[#0B1734]/60 opacity-80'
                        : 'border-white/10 bg-[#0B1734] hover:border-[#C7A35A]/50 shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Checkbox & Details */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(task)}
                          disabled={isSubmitting}
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                            task.isCompleted
                              ? 'border-emerald-400 bg-emerald-500 text-black'
                              : 'border-white/30 bg-[#050A17] hover:border-[#C7A35A] text-transparent hover:text-white/40'
                          }`}
                          title={task.isCompleted ? tLang(language, 'Mark Pending', 'लंबित चिह्नित करें', 'Pending Mark Karein') : tLang(language, 'Mark Completed', 'पूरा चिह्नित करें', 'Complete Mark Karein')}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${task.isCompleted ? 'stroke-[3]' : ''}`} />
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

                            {/* Priority Badge */}
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

                            {/* Category Badge */}
                            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                              {task.category.replace('_', ' ')}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-300 leading-relaxed">{task.description}</p>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-amber-400" />
                              <span>{tLang(language, 'Due:', 'तारीख:', 'Due:')} {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}</span>
                            </span>
                            <span>{tLang(language, 'Assigned by:', 'सौंपा गया:', 'Assigned by:')} <strong className="text-white">{task.createdByName || task.createdBy}</strong></span>
                            {task.completedAt && (
                              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {tLang(language, 'Completed on', 'पूरा हुआ:', 'Completed on')} {new Date(task.completedAt).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                        {/* Direct Call Button */}
                        {phone && (
                          <a
                            href={`tel:${phone}`}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition"
                            title={tLang(language, `Call ${phone}`, `कॉल करें ${phone}`, `Call karein ${phone}`)}
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>{tLang(language, 'Call', 'कॉल', 'Call')}</span>
                          </a>
                        )}

                        {/* Direct WhatsApp Button */}
                        {phone && (
                          <a
                            href={`https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent('Namaste, I am reaching out from AKGV Infra City Varanasi regarding your inquiry.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-[#25D366]/20 transition"
                            title={tLang(language, 'Chat on WhatsApp', 'व्हाट्सएप चैट', 'WhatsApp Chat')}
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Mark Complete Button (Direct Text Action) */}
                        <button
                          onClick={() => handleToggle(task)}
                          disabled={isSubmitting}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                            task.isCompleted
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>
                            {task.isCompleted
                              ? tLang(language, 'Mark Pending', 'लंबित करें', 'Pending Karein')
                              : tLang(language, 'Mark Complete', 'कार्य पूरा करें', 'Complete Karein')}
                          </span>
                        </button>

                        {/* Open Record Deep Link */}
                        {task.targetRoute && (
                          <Link
                            href={task.targetRoute}
                            className="flex items-center gap-1.5 rounded-xl border border-[#C7A35A]/50 bg-[#C7A35A]/10 px-3 py-1.5 text-xs font-semibold text-[#DFC382] hover:bg-[#C7A35A]/20 transition"
                          >
                            <span>{tLang(language, 'Open Record', 'विवरण खोलें', 'Record Kholein')}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}

                        {/* Add Notes Button */}
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
                          {task.completionNotes
                            ? tLang(language, 'Edit Notes', 'नोट्स बदलें', 'Notes Edit Karein')
                            : tLang(language, 'Add Notes', 'नोट्स लिखें', 'Notes Add Karein')}
                        </button>
                      </div>
                    </div>

                    {/* Completion Notes display */}
                    {task.completionNotes && editingNotesTaskId !== task.id && (
                      <div className="rounded-xl bg-[#050A17] p-2.5 text-xs text-gray-300 border border-white/5">
                        <strong className="text-gray-400">{tLang(language, 'Action Notes:', 'कार्य विवरण:', 'Action Notes:')}</strong> {task.completionNotes}
                      </div>
                    )}

                    {/* Inline Completion Notes Editor */}
                    {editingNotesTaskId === task.id && (
                      <div className="rounded-xl bg-[#050A17] p-3 border border-[#C7A35A]/40 space-y-2">
                        <label className="text-xs font-semibold text-[#DFC382] block">
                          {tLang(language, 'Record Action Notes / Meeting Update:', 'कार्य नोट्स एवं बैठक विवरण दर्ज करें:', 'Action Notes Aur Meeting Update Likhein:')}
                        </label>
                        <textarea
                          rows={2}
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder={tLang(
                            language,
                            'e.g. Completed site visit with client, showed Plot B-14, scheduled follow-up on Sunday...',
                            'उदा. ग्राहक को प्लॉट B-14 दिखाया, रविवार को फॉलो-अप तय किया...',
                            'e.g. Client ko Plot B-14 dikhaya, Sunday ko next meeting decide hui...'
                          )}
                          className="w-full rounded-xl border border-white/10 bg-[#0B1734] p-2 text-xs text-white focus:outline-none focus:border-[#C7A35A]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNotesTaskId(null)}
                            className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                          >
                            {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(task.id)}
                            disabled={isSubmitting}
                            className="rounded-lg bg-[#C7A35A] px-3.5 py-1 text-xs font-bold text-[#0B1734] disabled:opacity-50"
                          >
                            {tLang(language, 'Save Notes', 'नोट्स सहेजें', 'Save Karein')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INCOMING WEBSITE REQUESTS & HOME PAGE LEADS */}
      {activeSubView === 'incoming_leads' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="rounded-2xl border border-sky-500/40 bg-sky-950/30 p-4 text-xs text-sky-200">
            {tLang(
              language,
              'These are customer site visit bookings and plot inquiries submitted directly from the home page. Any authorized associate can claim them to assist the client.',
              'ये वे साइट विजिट बुकिंग और प्लॉट पूछताछ हैं जो सीधे होम पेज से ग्राहकों ने भेजी हैं। कोई भी सदस्य इन्हें संभालकर ग्राहक से संपर्क कर सकता है।',
              'Yeh website ke home page se aayi hui direct customer inquiries hain. Aap inhe claim karke customer se turant connect kar sakte hain.'
            )}
          </div>

          {/* Unassigned Site Visits */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C7A35A]" />
              <span>{tLang(language, 'Unassigned Site Visits from Website', 'वेबसाइट से नई साइट विजिट्स', 'Website Nayi Site Visits')}</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-bold border border-indigo-500/30">
                {unassignedVisits.length}
              </span>
            </h3>

            {unassignedVisits.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-6 text-center text-xs text-gray-400">
                {tLang(language, 'No unassigned site visits currently waiting.', 'फिलहाल कोई अनअसाइंड साइट विजिट नहीं है।', 'Abhi koi unassigned site visit pending nahi hai.')}
              </div>
            ) : (
              unassignedVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-2xl border border-white/10 bg-[#0B1734] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C7A35A]/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-bold text-white">{visit.visitorName}</span>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                        {visit.preferredDate} ({visit.preferredTimeSlot || 'Standard'})
                      </span>
                      {visit.pickupRequired && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          {tLang(language, 'Car Pickup Requested', 'कार पिक-अप आवश्यक', 'Pickup Required')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300">
                      <strong>{tLang(language, 'Location:', 'स्थान:', 'Location:')}</strong> {visit.locationName} • <strong>{tLang(language, 'Phone:', 'फोन:', 'Phone:')}</strong> {visit.visitorPhone}
                    </p>
                    {visit.notes && <p className="text-xs text-gray-400 italic">"{visit.notes}"</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${visit.visitorPhone}`}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-300"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{tLang(language, 'Call', 'कॉल', 'Call')}</span>
                    </a>

                    <a
                      href={`https://wa.me/91${visit.visitorPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Namaste, I am reaching out from AKGV Infra City Varanasi regarding your site visit request.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-emerald-300"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleClaimVisit(visit.id)}
                      disabled={isSubmitting}
                      className="rounded-xl bg-[#C7A35A] px-4 py-1.5 text-xs font-bold text-[#0B1734] hover:brightness-110 active:scale-95 transition"
                    >
                      {tLang(language, 'Claim & Add to My Tasks', 'यह टास्क मैं संभालूंगा', 'Claim This Task')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Unassigned Inquiries */}
          <div className="space-y-3 pt-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-400" />
              <span>{tLang(language, 'Unassigned Inquiries / Leads from Website', 'वेबसाइट से नई ग्राहक पूछताछ', 'Website Nayi Customer Inquiries')}</span>
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300 font-bold border border-sky-500/30">
                {unassignedEnquiries.length}
              </span>
            </h3>

            {unassignedEnquiries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0B1734] p-6 text-center text-xs text-gray-400">
                {tLang(language, 'No unassigned customer inquiries currently.', 'फिलहाल कोई अनअसाइंड पूछताछ नहीं है।', 'Abhi koi unassigned enquiry pending nahi hai.')}
              </div>
            ) : (
              unassignedEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="rounded-2xl border border-white/10 bg-[#0B1734] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sky-500/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-bold text-white">{enq.clientName}</span>
                      {enq.budgetInr && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          ₹{(enq.budgetInr / 100000).toFixed(1)} Lakh Budget
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300">
                      <strong>{tLang(language, 'Phone:', 'फोन:', 'Phone:')}</strong> {enq.clientPhone} • {enq.clientEmail || 'No email provided'}
                    </p>
                    {enq.notes && <p className="text-xs text-gray-400 italic">"{enq.notes}"</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${enq.clientPhone}`}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-300"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{tLang(language, 'Call', 'कॉल', 'Call')}</span>
                    </a>

                    <a
                      href={`https://wa.me/91${enq.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Namaste, I am reaching out from AKGV Infra City Varanasi regarding your inquiry.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-emerald-300"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleClaimEnquiry(enq.id)}
                      disabled={isSubmitting}
                      className="rounded-xl bg-sky-500 hover:bg-sky-400 text-black px-4 py-1.5 text-xs font-bold transition"
                    >
                      {tLang(language, 'Claim & Add to My Tasks', 'यह टास्क मैं संभालूंगा', 'Claim This Lead')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD PERSONAL TASK / REMINDER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#C7A35A]/50 bg-gradient-to-b from-[#0B1734] to-[#050A17] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#C7A35A]" />
                <span>{tLang(language, 'Create Personal Task / Reminder', 'नया व्यक्तिगत कार्य जोड़ें', 'Naya Task / Reminder Add Karein')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePersonalTask} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Task Title *', 'कार्य का शीर्षक *', 'Task Title *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={tLang(
                    language,
                    'e.g. Call Shri Gupta ji for Corner Plot A-12',
                    'उदा. गुप्ता जी को प्लॉट A-12 के संबंध में कॉल करें',
                    'e.g. Gupta ji ko Corner Plot A-12 ke liye call karein'
                  )}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Category', 'श्रेणी', 'Category')}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="client_followup">{tLang(language, 'Client Follow-up', 'ग्राहक फॉलो-अप', 'Client Follow-up')}</option>
                    <option value="site_visit">{tLang(language, 'Site Visit Escort', 'साइट विजिट', 'Site Visit Escort')}</option>
                    <option value="field_inspection">{tLang(language, 'Field Inspection', 'फील्ड निरीक्षण', 'Field Inspection')}</option>
                    <option value="general">{tLang(language, 'General Reminder', 'सामान्य रिमाइंडर', 'General Reminder')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Priority', 'प्राथमिकता', 'Priority')}
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                  >
                    <option value="medium">{tLang(language, 'Normal', 'सामान्य', 'Normal')}</option>
                    <option value="high">{tLang(language, 'High', 'उच्च', 'High')}</option>
                    <option value="urgent">{tLang(language, 'Urgent Today', 'अति आवश्यक', 'Urgent Aaj Hi')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Due Date', 'तारीख', 'Due Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {tLang(language, 'Time Slot', 'समय', 'Time Slot')}
                  </label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {tLang(language, 'Details / Client Phone', 'विवरण / ग्राहक फोन नंबर', 'Details / Client Phone')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tLang(
                    language,
                    'Include customer phone number (e.g. 9839012345) and meeting notes...',
                    'ग्राहक का फोन नंबर एवं विवरण शामिल करें...',
                    'Customer phone number aur notes include karein...'
                  )}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050A17] p-3 text-white focus:border-[#C7A35A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  {tLang(language, 'Cancel', 'रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#C7A35A] px-5 py-2 text-xs font-bold text-[#0B1734] hover:brightness-110 disabled:opacity-50"
                >
                  {tLang(language, 'Save Task', 'कार्य सहेजें', 'Task Save Karein')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
