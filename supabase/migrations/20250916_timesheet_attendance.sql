-- === helpers ===
create or replace function public.has_role(role_name text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  );
$$;

-- === attendance ===
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_date date not null default (current_date),
  clock_in timestamptz,
  clock_out timestamptz,
  break_minutes integer not null default 0,
  total_hours numeric(6,2) generated always as (
    case when clock_in is not null and clock_out is not null
      then round( ((extract(epoch from (clock_out - clock_in))/3600.0) - (break_minutes/60.0))::numeric, 2 )
      else null end
  ) stored,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attendance enable row level security;

-- employees see their own, hr/admin see all
create policy att_select_self on public.attendance
for select to authenticated
using (auth.uid() = user_id or has_role('hr') or has_role('admin'));

create policy att_insert_self on public.attendance
for insert to authenticated
with check (auth.uid() = user_id or has_role('hr') or has_role('admin'));

create policy att_update_self_today on public.attendance
for update to authenticated
using (auth.uid() = user_id or has_role('hr') or has_role('admin'))
with check (auth.uid() = user_id or has_role('hr') or has_role('admin'));

create policy att_delete_admin_hr on public.attendance
for delete to authenticated
using (has_role('admin') or has_role('hr'));

-- === time_entries ===
create type public.entry_status as enum ('draft','submitted','approved','rejected');

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  task text,
  entry_date date not null default (current_date),
  hours numeric(6,2) not null check (hours >= 0),
  billable boolean not null default true,
  status public.entry_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.time_entries enable row level security;

-- employees: CRUD own rows (แต่แก้ได้เมื่อ draft/rejected; ส่งได้เป็น submitted)
create policy te_select_self on public.time_entries
for select to authenticated
using (auth.uid() = user_id or has_role('pm') or has_role('hr') or has_role('accounting') or has_role('admin'));

create policy te_insert_self on public.time_entries
for insert to authenticated
with check (auth.uid() = user_id);

create policy te_update_self_lifecycle on public.time_entries
for update to authenticated
using (auth.uid() = user_id and status in ('draft','rejected'))
with check (auth.uid() = user_id and status in ('draft','submitted'));

-- PM: approve/reject entries เฉพาะโปรเจกต์ที่ตัวเองดูแล
create policy te_pm_approve on public.time_entries
for update to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and p.pm_id = auth.uid()))
with check (status in ('approved','rejected'));

-- HR/Accounting/Admin: read all, update status (เช่น approved) ได้
create policy te_hr_acc_admin_update on public.time_entries
for update to authenticated
using (has_role('hr') or has_role('accounting') or has_role('admin'))
with check (true);

-- Delete: ให้เฉพาะ admin/hr
create policy te_delete_admin_hr on public.time_entries
for delete to authenticated
using (has_role('admin') or has_role('hr'));

-- tighten grants
revoke all on public.projects from anon;
revoke all on public.projects from authenticated;
grant select on public.projects to authenticated; -- read via RLS from project_members/pm policy (already existed)

grant select,insert,update,delete on public.attendance to authenticated;
grant select,insert,update,delete on public.time_entries to authenticated;

-- === seed: ensure profile + admin role for your email ===
-- create role rows if missing
insert into public.roles(name) values
 ('admin'),('ceo'),('pm'),('hr'),('accounting'),('team_lead'),('employee')
on conflict (name) do nothing;

-- ensure profile exists for current admin user (replace email)
-- ใช้ใน SQL Editor ของ Supabase
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
where p.id in (select id from public.profiles where id = (select id from auth.users where email='kiattikun@tripeera.com' limit 1))
on conflict (user_id, role_id) do nothing;
