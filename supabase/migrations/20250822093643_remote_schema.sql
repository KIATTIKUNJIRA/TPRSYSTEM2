create sequence "public"."projects_id_seq";

create sequence "public"."roles_id_seq";

create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "position" text,
    "department" text,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."profiles" enable row level security;

create table "public"."project_members" (
    "project_id" bigint not null,
    "user_id" uuid not null,
    "role_in_project" text,
    "assigned_at" timestamp with time zone default now()
);


alter table "public"."project_members" enable row level security;

create table "public"."projects" (
    "id" bigint not null default nextval('projects_id_seq'::regclass),
    "project_code" text not null,
    "name" text not null,
    "client_name" text,
    "pm_id" uuid,
    "status" text default 'Active'::text,
    "contract_type" text,
    "contract_amount" numeric,
    "start_date" date,
    "due_date" date,
    "parent_project_id" bigint,
    "created_at" timestamp with time zone default now()
);


alter table "public"."projects" enable row level security;

create table "public"."roles" (
    "id" bigint not null default nextval('roles_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."roles" enable row level security;

create table "public"."user_roles" (
    "user_id" uuid not null,
    "role_id" bigint not null
);


alter table "public"."user_roles" enable row level security;

alter sequence "public"."projects_id_seq" owned by "public"."projects"."id";

alter sequence "public"."roles_id_seq" owned by "public"."roles"."id";

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX project_members_pkey ON public.project_members USING btree (project_id, user_id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX projects_project_code_key ON public.projects USING btree (project_code);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (user_id, role_id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."project_members" add constraint "project_members_pkey" PRIMARY KEY using index "project_members_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."project_members" add constraint "project_members_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_members" validate constraint "project_members_project_id_fkey";

alter table "public"."project_members" add constraint "project_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_members" validate constraint "project_members_user_id_fkey";

alter table "public"."projects" add constraint "projects_parent_project_id_fkey" FOREIGN KEY (parent_project_id) REFERENCES projects(id) not valid;

alter table "public"."projects" validate constraint "projects_parent_project_id_fkey";

alter table "public"."projects" add constraint "projects_pm_id_fkey" FOREIGN KEY (pm_id) REFERENCES profiles(id) not valid;

alter table "public"."projects" validate constraint "projects_pm_id_fkey";

alter table "public"."projects" add constraint "projects_project_code_key" UNIQUE using index "projects_project_code_key";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."user_roles" add constraint "user_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_claim(claim text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::jsonb ->> claim,
    (SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid()) ->> claim
  )::jsonb;
$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."project_members" to "anon";

grant insert on table "public"."project_members" to "anon";

grant references on table "public"."project_members" to "anon";

grant select on table "public"."project_members" to "anon";

grant trigger on table "public"."project_members" to "anon";

grant truncate on table "public"."project_members" to "anon";

grant update on table "public"."project_members" to "anon";

grant delete on table "public"."project_members" to "authenticated";

grant insert on table "public"."project_members" to "authenticated";

grant references on table "public"."project_members" to "authenticated";

grant select on table "public"."project_members" to "authenticated";

grant trigger on table "public"."project_members" to "authenticated";

grant truncate on table "public"."project_members" to "authenticated";

grant update on table "public"."project_members" to "authenticated";

grant delete on table "public"."project_members" to "service_role";

grant insert on table "public"."project_members" to "service_role";

grant references on table "public"."project_members" to "service_role";

grant select on table "public"."project_members" to "service_role";

grant trigger on table "public"."project_members" to "service_role";

grant truncate on table "public"."project_members" to "service_role";

grant update on table "public"."project_members" to "service_role";

-- Remove overly-broad anonymous grants on projects for security. Projects should be
-- visible via RLS policies; writes must go through authenticated roles or service_role.

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

create policy "Admins can view all profiles"
on "public"."profiles"
as permissive
for select
to public
using ((get_my_claim('role'::text) = '"admin"'::jsonb));


create policy "Allow users to update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Allow users to view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Members can see their project team"
on "public"."project_members"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM project_members mem
  WHERE ((mem.project_id = project_members.project_id) AND (mem.user_id = auth.uid())))));


create policy "Admins can view all projects"
on "public"."projects"
as permissive
for select
to public
using ((get_my_claim('role'::text) = '"admin"'::jsonb));


create policy "Team members can view their own projects"
on "public"."projects"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM project_members
  WHERE ((project_members.project_id = projects.id) AND (project_members.user_id = auth.uid())))));


create policy "PM can update their projects"
on "public"."projects"
as permissive
for update
to public
using ((pm_id = auth.uid()))
with check ((pm_id = auth.uid()));


create policy "Allow all users to read roles"
on "public"."roles"
as permissive
for select
to public
using (true);


create policy "Users can see their own roles"
on "public"."user_roles"
as permissive
for select
to public
using ((auth.uid() = user_id));



