-- Admin access for /admin. Signing in (Supabase Auth, email link) proves who you are;
-- the database decides what you can do. Only emails in admin_users get anything extra.
-- The admin email itself is inserted outside this file (not committed).

create table if not exists public.admin_users (
  email text primary key,
  added_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and coalesce((auth.jwt() ->> 'email_verified')::boolean, true)
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- The sign-in form only sends a link to allowed emails.
create or replace function public.admin_email_allowed(p_email text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where lower(email) = lower(trim(p_email)));
$$;
revoke execute on function public.admin_email_allowed(text) from public;
grant execute on function public.admin_email_allowed(text) to anon, authenticated;

-- Venues: admins see every status and can update (approve, skip, alcohol).
drop policy if exists "admins read all venues" on public.venues;
create policy "admins read all venues" on public.venues for select to authenticated using (public.is_admin());
drop policy if exists "admins update venues" on public.venues;
create policy "admins update venues" on public.venues for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read all venue cuisines" on public.venue_cuisines;
create policy "admins read all venue cuisines" on public.venue_cuisines for select to authenticated using (public.is_admin());
drop policy if exists "admins add venue cuisines" on public.venue_cuisines;
create policy "admins add venue cuisines" on public.venue_cuisines for insert to authenticated with check (public.is_admin());
drop policy if exists "admins remove venue cuisines" on public.venue_cuisines;
create policy "admins remove venue cuisines" on public.venue_cuisines for delete to authenticated using (public.is_admin());

-- Google facts and evidence: admins read and update (alcohol answers live in the payload).
grant select, update on table public.external_place_cache to authenticated;
drop policy if exists "admins read place cache" on public.external_place_cache;
create policy "admins read place cache" on public.external_place_cache for select to authenticated using (public.is_admin());
drop policy if exists "admins update place cache" on public.external_place_cache;
create policy "admins update place cache" on public.external_place_cache for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Job logs for the status lights: read only.
grant select on table public.maps_refresh_runs, public.indexnow_pings, public.halal_sweep_runs to authenticated;
drop policy if exists "admins read maps runs" on public.maps_refresh_runs;
create policy "admins read maps runs" on public.maps_refresh_runs for select to authenticated using (public.is_admin());
drop policy if exists "admins read indexnow pings" on public.indexnow_pings;
create policy "admins read indexnow pings" on public.indexnow_pings for select to authenticated using (public.is_admin());
drop policy if exists "admins read sweep runs" on public.halal_sweep_runs;
create policy "admins read sweep runs" on public.halal_sweep_runs for select to authenticated using (public.is_admin());
