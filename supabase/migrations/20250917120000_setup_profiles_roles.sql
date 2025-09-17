-- Migration: setup profiles, roles, user_roles and RLS; seed admin role
-- Created: 2025-09-17

BEGIN;

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- Create mapping table between users and roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id bigint NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Create profiles table that mirrors auth.users.id
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security on these tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Helper function to determine admin membership
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
$$;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- RLS policies for user_roles
CREATE POLICY "user_roles_select_owner_or_admin" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_insert_owner_or_admin" ON public.user_roles
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_modify_admin_only" ON public.user_roles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_delete_admin_only" ON public.user_roles
  FOR DELETE
  USING (public.is_admin());

-- RLS policies for roles
CREATE POLICY "roles_select_authenticated" ON public.roles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "roles_manage_admin_only" ON public.roles
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "roles_update_admin_only" ON public.roles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "roles_delete_admin_only" ON public.roles
  FOR DELETE
  USING (public.is_admin());

-- Seed the admin role and assign to the specified email (idempotent)
INSERT INTO public.roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u
JOIN public.roles r ON r.name = 'admin'
WHERE lower(u.email) = lower('kiattikun@tripeera.com')
ON CONFLICT DO NOTHING;

COMMIT;
