-- Google Maps facts (opening hours, rating, review count) for live and waiting
-- venues, refreshed by the maps-refresh Edge Function via Apify. Facts stay in
-- external_place_cache (separate, expiring), as the schema intends.
-- The Edge Function source lives in supabase/functions/maps-refresh/.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- One row per Apify run, so each refresh is traceable and nothing runs twice.
create table public.maps_refresh_runs (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('place_ids', 'search')),
  apify_run_id  text not null unique,
  dataset_id    text,
  requested     jsonb not null,            -- [{venue_id, place_id, search}]
  status        text not null default 'running'
                check (status in ('running', 'ingested', 'failed')),
  result        jsonb,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);
alter table public.maps_refresh_runs enable row level security;
revoke all on public.maps_refresh_runs from anon, authenticated;

-- Live and waiting venues whose Maps facts are missing or about to expire.
-- A venue requested in the last 7 days is skipped, so a miss retries weekly.
create or replace function public.maps_due_venues(p_limit int default 60)
returns table (venue_id uuid, place_id text, search_text text)
language sql stable security definer set search_path = public
as $$
  select v.id, v.google_place_id, concat_ws(', ', v.name, v.address_line, v.postcode)
  from venues v
  left join external_place_cache e on e.venue_id = v.id and e.provider = 'google'
  where v.status in ('published', 'review')
    and (e.id is null
         or not (e.payload ? 'hours_checked_at')
         or e.expires_at < now() + interval '5 days')
    and not exists (
      select 1
      from maps_refresh_runs r, jsonb_array_elements(r.requested) x
      where r.started_at > now() - interval '7 days'
        and x->>'venue_id' = v.id::text)
  order by (v.status = 'published') desc, (v.google_place_id is null), v.name
  limit p_limit
$$;
revoke all on function public.maps_due_venues(int) from public, anon, authenticated;
grant execute on function public.maps_due_venues(int) to service_role;

-- Shared key so only the scheduled job (or the owner) can trigger a refresh.
-- The key is random, lives only in Vault, and is never printed.
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'maps_refresh_key',
                           'Header key for the maps-refresh Edge Function')
where not exists (select 1 from vault.secrets where name = 'maps_refresh_key');

create or replace function public.maps_refresh_key_ok(p_key text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'maps_refresh_key' and decrypted_secret = p_key)
$$;
revoke all on function public.maps_refresh_key_ok(text) from public, anon, authenticated;
grant execute on function public.maps_refresh_key_ok(text) to service_role;

-- What the public site may read: rating, review count and hours for
-- published venues, and only while the cached facts are fresh.
create or replace function public.venue_place_facts()
returns table (slug text, rating numeric, review_count integer, hours jsonb, checked_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select v.slug,
         nullif(e.payload->>'rating', '')::numeric,
         round(nullif(e.payload->>'review_count', '')::numeric)::int,
         e.payload->'hours',
         e.fetched_at
  from venues v
  join external_place_cache e on e.venue_id = v.id and e.provider = 'google'
  where v.status = 'published' and e.expires_at > now()
$$;
revoke all on function public.venue_place_facts() from public;
grant execute on function public.venue_place_facts() to anon, authenticated, service_role;

-- Daily at 03:17 UTC: ingest the last finished run, start the next if due.
select cron.schedule(
  'maps-refresh-daily',
  '17 3 * * *',
  $cron$
  select net.http_post(
    url := 'https://wsrcyxbtoaizhzxrmfaa.supabase.co/functions/v1/maps-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-refresh-key', (select decrypted_secret from vault.decrypted_secrets where name = 'maps_refresh_key')),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000)
  $cron$
);
