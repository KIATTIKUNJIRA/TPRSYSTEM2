-- Migration: setup profiles, roles, user_roles and RLS; seed admin profile
-- Created: 2025-09-17 12:30:00
BEGIN;

-- ROLES
create table if not exists public.roles (
  id bigserial primary key,
  name text unique not null
);
insert into public.roles(name) values
 ('admin'),('ceo'),('pm'),('hr'),('accounting'),('team_lead'),('employee')
on conflict(name) do nothing;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  position text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- USER_ROLES
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete restrict,
  primary key (user_id, role_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- POLICIES: user_roles
-- user can read own roles; admin can read all
create policy "user_roles_select_own"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = 'admin'
  ));

-- admin can insert/delete user_roles
create policy "user_roles_admin_write"
  on public.user_roles for all to authenticated
  using (exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = 'admin'
  ));

-- POLICIES: profiles
-- user sees own profile or admins/hr
create policy "profiles_select_self"
  on public.profiles for select to authenticated
  using (auth.uid() = id or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name in ('admin','hr')
  ));

create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- seed admin profile (if missing)
insert into public.profiles (id, first_name, last_name, position, department)
select u.id, split_part(u.email,'@',1), '', 'Administrator', 'Management'
from auth.users u
where u.email = 'kiattikun@tripeera.com'
on conflict (id) do nothing;

-- map admin role
insert into public.user_roles (user_id, role_id)
select p.id, r.id
from public.profiles p
join public.roles r on r.name = 'admin'
where p.id = (select id from auth.users where email='kiattikun@tripeera.com' limit 1)
on conflict do nothing;

COMMIT;
