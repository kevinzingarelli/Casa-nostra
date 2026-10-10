-- Archivio isolato: non modifica tabelle o dati di Casa Points.
begin;
create table if not exists public.casa_nostra_projects (
  id uuid primary key default gen_random_uuid(), owner uuid not null references auth.users(id),
  name text not null, house_type text not null default 'villa', data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.casa_nostra_members (
  project_id uuid not null references public.casa_nostra_projects(id), user_id uuid not null references auth.users(id),
  primary key(project_id,user_id)
);
create table if not exists public.casa_nostra_invites (
  token_hash text primary key, project_id uuid not null references public.casa_nostra_projects(id),
  expires_at timestamptz not null default now()+interval '7 days'
);
alter table public.casa_nostra_projects enable row level security;
alter table public.casa_nostra_members enable row level security;
alter table public.casa_nostra_invites enable row level security;
create or replace function public.casa_nostra_stamp() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=greatest(clock_timestamp(),old.updated_at+interval '1 microsecond'); return new; end;$$;
create trigger casa_nostra_revision before update on public.casa_nostra_projects for each row execute function public.casa_nostra_stamp();
revoke all on public.casa_nostra_projects,public.casa_nostra_members,public.casa_nostra_invites from anon, authenticated;
grant select,insert on public.casa_nostra_projects to authenticated;
grant update(name,house_type,data,updated_at) on public.casa_nostra_projects to authenticated;
grant select on public.casa_nostra_members to authenticated;
create policy casa_nostra_member_self on public.casa_nostra_members for select to authenticated using (user_id=(select auth.uid()));
create policy casa_nostra_read on public.casa_nostra_projects for select to authenticated using (owner=(select auth.uid()) or id in (select project_id from public.casa_nostra_members where user_id=(select auth.uid())));
create policy casa_nostra_insert on public.casa_nostra_projects for insert to authenticated with check (owner=(select auth.uid()));
create policy casa_nostra_edit on public.casa_nostra_projects for update to authenticated using (owner=(select auth.uid()) or id in (select project_id from public.casa_nostra_members where user_id=(select auth.uid()))) with check (owner=(select auth.uid()) or id in (select project_id from public.casa_nostra_members where user_id=(select auth.uid())));
create or replace function public.casa_nostra_create_invite(project uuid) returns text language plpgsql security definer set search_path=public,extensions as $$
declare token text;
begin
  if auth.uid() is null or not exists(select 1 from public.casa_nostra_projects where id=project and owner=auth.uid()) then raise exception 'Proprietario richiesto'; end if;
  token=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.casa_nostra_invites(token_hash,project_id) values(encode(extensions.digest(token,'sha256'),'hex'),project);
  return token;
end;$$;
create or replace function public.casa_nostra_accept_invite(invite_token text) returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare found_project uuid;
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  select project_id into found_project from public.casa_nostra_invites where token_hash=encode(extensions.digest(invite_token,'sha256'),'hex') and expires_at>now();
  if found_project is null then raise exception 'Invito non valido o scaduto'; end if;
  insert into public.casa_nostra_members(project_id,user_id) values(found_project,auth.uid()) on conflict do nothing;
  return found_project;
end;$$;
revoke all on function public.casa_nostra_create_invite(uuid),public.casa_nostra_accept_invite(text) from public,anon;
grant execute on function public.casa_nostra_create_invite(uuid),public.casa_nostra_accept_invite(text) to authenticated;
commit;
