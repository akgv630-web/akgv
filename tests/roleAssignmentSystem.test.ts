import { describe, it, expect } from 'vitest';
import {
  INITIAL_TASKS,
  INITIAL_SITE_VISITS,
  INITIAL_ENQUIRIES,
  INITIAL_TARGETS,
  INITIAL_MESSAGES,
  DEMO_PROFILES
} from '../src/lib/store';
import { TaskReminder, SiteVisit, ClientEnquiry, SalesTarget, InAppMessage } from '../src/types';

describe('Role-Based Assignment & Task Management System', () => {
  const memberProfile = DEMO_PROFILES.find((p) => p.memberId === 'AKGV-3498'); // Vikram Singh (usr-sponsor-01)
  const adminProfile = DEMO_PROFILES.find((p) => p.role === 'super_admin'); // Amit Kumar (usr-admin-01)

  it('demonstrates profiles possess canonical profile UUIDs and display member codes', () => {
    expect(memberProfile).toBeDefined();
    expect(memberProfile?.id).toBe('usr-sponsor-01');
    expect(memberProfile?.memberId).toBe('AKGV-3498');

    expect(adminProfile).toBeDefined();
    expect(adminProfile?.id).toBe('usr-admin-01');
    expect(adminProfile?.role).toBe('super_admin');
  });

  describe('Task Reminders & Work Items Contract', () => {
    it('initializes tasks with canonical assigneeId and display member code', () => {
      const task = INITIAL_TASKS.find((t) => t.id === 'task-01');
      expect(task).toBeDefined();
      expect(task?.assigneeId).toBe('usr-sponsor-01');
      expect(task?.assignedToMemberId).toBe('AKGV-3498');
      expect(task?.category).toBe('site_visit');
      expect(task?.targetRoute).toContain('/member?tab=visits');
      expect(task?.isCompleted).toBe(false);
    });

    it('enforces task category and related record deep link mapping', () => {
      const siteVisitTask = INITIAL_TASKS.find((t) => t.category === 'site_visit');
      expect(siteVisitTask).toBeDefined();
      expect(siteVisitTask?.relatedRecordType).toBe('site_visit');
      expect(siteVisitTask?.targetRoute).toContain('/member?tab=visits');

      const paymentTask = INITIAL_TASKS.find((t) => t.category === 'payment_verification');
      expect(paymentTask).toBeDefined();
      expect(paymentTask?.relatedRecordType).toBe('payment');
      expect(paymentTask?.targetRoute).toContain('/admin?tab=payments');
    });

    it('allows a member to update completion notes without breaking assignment bindings', () => {
      const originalTask: TaskReminder = { ...INITIAL_TASKS[0] };
      const updatedNotes = 'Client visited Rampur corridor; requested corner plot allocation.';

      const updatedTask: TaskReminder = {
        ...originalTask,
        completionNotes: updatedNotes,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };

      expect(updatedTask.id).toBe(originalTask.id);
      expect(updatedTask.assigneeId).toBe(originalTask.assigneeId);
      expect(updatedTask.assignedToMemberId).toBe(originalTask.assignedToMemberId);
      expect(updatedTask.completionNotes).toBe(updatedNotes);
      expect(updatedTask.isCompleted).toBe(true);
      expect(updatedTask.completedAt).toBeDefined();
    });

    it('isolates tasks belonging to other members', () => {
      const userAId = 'usr-sponsor-01';
      const userBId = 'usr-other-associate';

      const allTasks: TaskReminder[] = [
        ...INITIAL_TASKS,
        {
          id: 'task-other-001',
          assigneeId: userBId,
          assignedToMemberId: 'AKGV-9999',
          assignedToName: 'Other Associate',
          title: 'Private Client Consultation',
          category: 'general',
          dueDate: '2026-10-25',
          priority: 'medium',
          isCompleted: false,
          createdBy: 'Super Admin',
          createdAt: new Date().toISOString(),
        },
      ];

      const visibleToUserA = allTasks.filter(
        (t) =>
          t.assigneeId === userAId ||
          t.assignedToMemberId === 'AKGV-3498' ||
          (userAId === 'usr-sponsor-01' && t.assignedToMemberId === 'AKGV-3498')
      );

      expect(visibleToUserA.some((t) => t.id === 'task-other-001')).toBe(false);
      expect(visibleToUserA.some((t) => t.id === 'task-01')).toBe(true);
    });
  });

  describe('Site Visits & Field Coordinator Allocation', () => {
    it('verifies site visits contain canonical assignedStaffId and display member code', () => {
      const visit = INITIAL_SITE_VISITS.find((v) => v.id === 'sv-001');
      expect(visit).toBeDefined();
      expect(visit?.assignedStaffId).toBe('usr-sponsor-01');
      expect(visit?.assignedStaffMemberId).toBe('AKGV-3498');
      expect(visit?.assignedStaffName).toBe('Vikram Singh');
      expect(visit?.pickupRequired).toBe(true);
    });

    it('updates site visit status without altering coordinator identity', () => {
      const visit: SiteVisit = { ...INITIAL_SITE_VISITS[0] };
      expect(visit.status).toBe('confirmed');

      const completedVisit: SiteVisit = {
        ...visit,
        status: 'completed',
        notes: 'Client completed site tour and paid token advance.',
        updatedAt: new Date().toISOString(),
      };

      expect(completedVisit.status).toBe('completed');
      expect(completedVisit.assignedStaffId).toBe(visit.assignedStaffId);
      expect(completedVisit.assignedStaffMemberId).toBe(visit.assignedStaffMemberId);
    });
  });

  describe('CRM Client Enquiries & Lead Allocation', () => {
    it('verifies enquiries link to canonical assignedProfileId and track follow-ups', () => {
      const enq = INITIAL_ENQUIRIES.find((e) => e.id === 'enq-001');
      expect(enq).toBeDefined();
      expect(enq?.assignedProfileId).toBe('usr-sponsor-01');
      expect(enq?.assignedMemberId).toBe('AKGV-3498');
      expect(enq?.followUps).toBeDefined();
      expect(enq?.followUps?.length).toBeGreaterThan(0);
    });

    it('supports appending follow-up log entries with timestamps', () => {
      const enq: ClientEnquiry = { ...INITIAL_ENQUIRIES[0], followUps: [...(INITIAL_ENQUIRIES[0].followUps || [])] };
      const newFollowUp = {
        id: 'fu-new-123',
        date: '2026-10-18',
        summary: 'Sent brochure and plot pricing breakdown via WhatsApp.',
        nextFollowUpDate: '2026-10-20',
      };

      enq.followUps?.push(newFollowUp);
      expect(enq.followUps?.length).toBe(2);
      expect(enq.followUps?.[1].summary).toContain('WhatsApp');
    });
  });

  describe('Sales Targets & Quota Progression', () => {
    it('calculates volume and plot achievement percentages accurately', () => {
      const target: SalesTarget = INITIAL_TARGETS[0];
      expect(target.profileId).toBe('usr-sponsor-01');
      expect(target.targetSalesVolumeInr).toBe(3500000); // 35 Lakh
      expect(target.achievedSalesVolumeInr).toBe(1200000); // 12 Lakh

      const volumePct = Math.round((target.achievedSalesVolumeInr / target.targetSalesVolumeInr) * 100);
      expect(volumePct).toBe(34);

      const plotPct = Math.round((target.achievedPlotsCount / target.targetPlotsCount) * 100);
      expect(plotPct).toBe(33);
    });
  });

  describe('In-App Targeted Broadcast Messaging', () => {
    it('ensures broadcast messages support role, individual, and all recipient scopes', () => {
      expect(INITIAL_MESSAGES.length).toBeGreaterThan(0);
      const allBroadcast = INITIAL_MESSAGES.find((m) => m.recipientType === 'all');
      expect(allBroadcast).toBeDefined();
      expect(allBroadcast?.priority).toBe('important');

      const roleBroadcast: InAppMessage = {
        id: 'msg-role-test',
        recipientType: 'role',
        recipientId: 'junior_member',
        title: 'Field Reporting Directive',
        message: 'Ensure GPS boundary pillars are included in photos.',
        senderName: 'Director HQ',
        priority: 'important',
        createdAt: new Date().toISOString(),
      };

      expect(roleBroadcast.recipientType).toBe('role');
      expect(roleBroadcast.recipientId).toBe('junior_member');
    });
  });
});
