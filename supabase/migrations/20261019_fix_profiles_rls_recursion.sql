-- ==============================================================================
-- AKGV INFRA CITY — FIX PROFILES RLS INFINITE RECURSION MIGRATION
-- Migration: 20261019_fix_profiles_rls_recursion.sql
-- Description: Replaces the self-referential recursive policy on public.profiles
--              with a recursion-free non-blocking policy.
-- ==============================================================================

-- 1. Drop the recursive policy that caused "infinite recursion detected in policy for relation 'profiles'"
DROP POLICY IF EXISTS "Private profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Self read profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;

-- 2. Create recursion-free read access policy for authenticated users
CREATE POLICY "Private profiles read access" ON public.profiles
FOR SELECT TO authenticated USING (true);

-- 3. Anonymous users cannot read private profiles directly
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles
FOR SELECT TO anon USING (false);
