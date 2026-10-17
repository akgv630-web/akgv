-- ==============================================================================
-- AKGV INFRA CITY PRIVATE LIMITED
-- MIGRATION: 20261017_role_based_assignment_system.sql
-- PURPOSE: Canonical Profile-Based Assignment, Deep Linking, Staff Workflows & RLS Hardening
-- ==============================================================================

-- 1. TASK REMINDERS SCHEMA EXTENSIONS
ALTER TABLE IF EXISTS public.task_reminders
    ADD COLUMN IF NOT EXISTS assignee_id TEXT,
    ADD COLUMN IF NOT EXISTS related_record_type TEXT,
    ADD COLUMN IF NOT EXISTS related_record_id TEXT,
    ADD COLUMN IF NOT EXISTS target_route TEXT,
    ADD COLUMN IF NOT EXISTS completion_notes TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_task_reminders_assignee_id ON public.task_reminders (assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_assigned_to_member ON public.task_reminders (assigned_to_member_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_related_record ON public.task_reminders (related_record_type, related_record_id);

-- Backfill assignee_id if null where assigned_to_member_id contains a profile id
UPDATE public.task_reminders
SET assignee_id = assigned_to_member_id
WHERE assignee_id IS NULL AND (assigned_to_member_id LIKE 'usr-%' OR assigned_to_member_id ~ '^[0-9a-fA-F-]{36}$');

-- 2. SITE VISITS SCHEMA EXTENSIONS
ALTER TABLE IF EXISTS public.site_visits
    ADD COLUMN IF NOT EXISTS assigned_staff_id TEXT,
    ADD COLUMN IF NOT EXISTS assigned_staff_member_id TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

CREATE INDEX IF NOT EXISTS idx_site_visits_assigned_staff_id ON public.site_visits (assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_buyer_id ON public.site_visits (buyer_id);

-- 3. CLIENT ENQUIRIES SCHEMA EXTENSIONS
ALTER TABLE IF EXISTS public.client_enquiries
    ADD COLUMN IF NOT EXISTS assigned_profile_id TEXT;

CREATE INDEX IF NOT EXISTS idx_client_enquiries_assigned_profile_id ON public.client_enquiries (assigned_profile_id);
CREATE INDEX IF NOT EXISTS idx_client_enquiries_assigned_member ON public.client_enquiries (assigned_member_id);

-- 4. SALES TARGETS SCHEMA EXTENSIONS
ALTER TABLE IF EXISTS public.sales_targets
    ADD COLUMN IF NOT EXISTS profile_id TEXT;

CREATE INDEX IF NOT EXISTS idx_sales_targets_profile_id ON public.sales_targets (profile_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_member_id ON public.sales_targets (member_id);

-- 5. IN-APP MESSAGES SCHEMA EXTENSIONS
ALTER TABLE IF EXISTS public.in_app_messages
    ADD COLUMN IF NOT EXISTS recipient_profile_id TEXT,
    ADD COLUMN IF NOT EXISTS target_route TEXT,
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_in_app_messages_recipient_type ON public.in_app_messages (recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_in_app_messages_recipient_profile ON public.in_app_messages (recipient_profile_id);

-- 6. TASK INTEGRITY TRIGGER (Enforces Separation of Duties & Non-Admin Field Immutability)
CREATE OR REPLACE FUNCTION public.enforce_task_update_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        -- Non-admin assignees cannot reassign tasks to another user
        IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot reassign tasks';
        END IF;

        IF NEW.assigned_to_member_id IS DISTINCT FROM OLD.assigned_to_member_id THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter assigned_to_member_id';
        END IF;

        IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter task creator';
        END IF;

        IF NEW.category IS DISTINCT FROM OLD.category THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter task category';
        END IF;

        IF NEW.related_record_type IS DISTINCT FROM OLD.related_record_type OR NEW.related_record_id IS DISTINCT FROM OLD.related_record_id THEN
            RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter task record linkages';
        END IF;
    END IF;

    -- Automatically set completed_at when is_completed changes to true
    IF NEW.is_completed = TRUE AND (OLD.is_completed IS DISTINCT FROM TRUE) THEN
        NEW.completed_at := COALESCE(NEW.completed_at, timezone('utc', now()));
        NEW.status := 'completed';
    ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
        NEW.completed_at := NULL;
        IF NEW.status = 'completed' THEN
            NEW.status := 'in_progress';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_task_update_integrity ON public.task_reminders;
CREATE TRIGGER trg_enforce_task_update_integrity
BEFORE UPDATE ON public.task_reminders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_task_update_integrity();

REVOKE ALL ON FUNCTION public.enforce_task_update_integrity() FROM PUBLIC;

-- 7. REFRESH AND HARDEN RLS POLICIES

-- Drop prior versions of task policies
DROP POLICY IF EXISTS "Assigned or admin read tasks" ON public.task_reminders;
DROP POLICY IF EXISTS "Assigned or admin update tasks" ON public.task_reminders;
DROP POLICY IF EXISTS "Admin delete tasks" ON public.task_reminders;
DROP POLICY IF EXISTS "Admin create tasks" ON public.task_reminders;

CREATE POLICY "Assigned or admin read tasks" ON public.task_reminders
FOR SELECT TO authenticated
USING (
    public.is_admin()
    OR assignee_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_to_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_to_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
);

CREATE POLICY "Assigned or admin update tasks" ON public.task_reminders
FOR UPDATE TO authenticated
USING (
    public.is_admin()
    OR assignee_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_to_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_to_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
)
WITH CHECK (
    public.is_admin()
    OR assignee_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_to_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_to_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
);

CREATE POLICY "Admin delete tasks" ON public.task_reminders
FOR DELETE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin create tasks" ON public.task_reminders
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- Drop prior versions of site visits policies
DROP POLICY IF EXISTS "Buyer or admin read site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Admin update site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Staff or admin update site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Public insert site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Admin delete site visits" ON public.site_visits;

CREATE POLICY "Public insert site visits" ON public.site_visits
FOR INSERT TO anon, authenticated
WITH CHECK (status = 'requested' AND (assigned_staff_name IS NULL OR assigned_staff_name = ''));

CREATE POLICY "Buyer or staff or admin read site visits" ON public.site_visits
FOR SELECT TO authenticated
USING (
    public.is_admin()
    OR buyer_id = auth.uid()::text
    OR buyer_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_staff_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR (assigned_staff_member_id IS NOT NULL AND assigned_staff_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL))
);

CREATE POLICY "Staff or admin update site visits" ON public.site_visits
FOR UPDATE TO authenticated
USING (
    public.is_admin()
    OR assigned_staff_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR (assigned_staff_member_id IS NOT NULL AND assigned_staff_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL))
)
WITH CHECK (
    public.is_admin()
    OR assigned_staff_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR (assigned_staff_member_id IS NOT NULL AND assigned_staff_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL))
);

CREATE POLICY "Admin delete site visits" ON public.site_visits
FOR DELETE TO authenticated
USING (public.is_admin());

-- Drop prior versions of enquiries policies
DROP POLICY IF EXISTS "Public insert enquiries" ON public.client_enquiries;
DROP POLICY IF EXISTS "Admin or assigned read enquiries" ON public.client_enquiries;
DROP POLICY IF EXISTS "Admin update enquiries" ON public.client_enquiries;
DROP POLICY IF EXISTS "Assigned or admin update enquiries" ON public.client_enquiries;
DROP POLICY IF EXISTS "Admin delete enquiries" ON public.client_enquiries;

CREATE POLICY "Public insert enquiries" ON public.client_enquiries
FOR INSERT TO anon, authenticated
WITH CHECK (status = 'new' AND (assigned_member_id IS NULL OR assigned_member_id = ''));

CREATE POLICY "Admin or assigned read enquiries" ON public.client_enquiries
FOR SELECT TO authenticated
USING (
    public.is_admin()
    OR assigned_profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
);

CREATE POLICY "Assigned or admin update enquiries" ON public.client_enquiries
FOR UPDATE TO authenticated
USING (
    public.is_admin()
    OR assigned_profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
)
WITH CHECK (
    public.is_admin()
    OR assigned_profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR assigned_member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR assigned_member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
);

CREATE POLICY "Admin delete enquiries" ON public.client_enquiries
FOR DELETE TO authenticated
USING (public.is_admin());

-- Drop prior versions of sales targets policies
DROP POLICY IF EXISTS "Member or admin read targets" ON public.sales_targets;
DROP POLICY IF EXISTS "Admin write targets" ON public.sales_targets;

CREATE POLICY "Member or admin read targets" ON public.sales_targets
FOR SELECT TO authenticated
USING (
    public.is_admin()
    OR profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    OR member_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
    OR member_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
);

CREATE POLICY "Admin write targets" ON public.sales_targets
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Drop prior versions of in-app messages policies
DROP POLICY IF EXISTS "Recipient or admin read messages" ON public.in_app_messages;
DROP POLICY IF EXISTS "Admin write messages" ON public.in_app_messages;
DROP POLICY IF EXISTS "Recipient or admin update messages" ON public.in_app_messages;

CREATE POLICY "Recipient or admin read messages" ON public.in_app_messages
FOR SELECT TO authenticated
USING (
    recipient_type = 'all'
    OR public.is_admin()
    OR (recipient_type = 'individual' AND (
        recipient_id = auth.uid()::text
        OR recipient_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
        OR recipient_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
        OR recipient_profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    ))
    OR (recipient_type = 'role' AND recipient_id IN (
        SELECT p.role FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text
    ))
    OR (recipient_type = 'branch' AND recipient_id IN (
        SELECT p.branch_location FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text
    ))
);

CREATE POLICY "Recipient or admin update messages" ON public.in_app_messages
FOR UPDATE TO authenticated
USING (
    public.is_admin()
    OR recipient_type = 'all'
    OR (recipient_type = 'individual' AND (
        recipient_id = auth.uid()::text
        OR recipient_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
        OR recipient_id IN (SELECT p.member_id FROM public.profiles p WHERE (p.auth_user_id = auth.uid() OR p.id = auth.uid()::text) AND p.member_id IS NOT NULL)
        OR recipient_profile_id IN (SELECT p.id FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text)
    ))
    OR (recipient_type = 'role' AND recipient_id IN (
        SELECT p.role FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text
    ))
    OR (recipient_type = 'branch' AND recipient_id IN (
        SELECT p.branch_location FROM public.profiles p WHERE p.auth_user_id = auth.uid() OR p.id = auth.uid()::text
    ))
)
WITH CHECK (
    -- Recipients can only mark messages read
    public.is_admin()
    OR is_read IS TRUE
);

CREATE POLICY "Admin write messages" ON public.in_app_messages
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete messages" ON public.in_app_messages
FOR DELETE TO authenticated
USING (public.is_admin());
