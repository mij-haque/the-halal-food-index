-- Halal sweep: Google Maps search results for "halal food in <area>" across
-- Greater Manchester, staged for the owner to review. Filled by the
-- halal-sweep Edge Function. Not exposed to the API (RLS on, no policies).

create table if not exists public.halal_sweep_runs (
  id uuid primary key default gen_random_uuid(),
  apify_run_id text not null unique,
  dataset_id text,
  searches text[] not null,
  status text not null default 'running' check (status in ('running', 'ingested', 'failed')),
  result jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.halal_sweep_items (
  place_id text primary key,
  run_id uuid references public.halal_sweep_runs(id),
  name text not null,
  categories text[] not null default '{}',
  address text,
  postcode text,
  phone text,
  website text,
  lat double precision,
  lng double precision,
  rating numeric,
  review_count integer,
  permanently_closed boolean not null default false,
  search_string text,
  -- strong: Google labels it halal (category) or "halal" in the name
  -- weak: only turned up in a halal search
  signal text not null check (signal in ('strong', 'weak')),
  -- matched an existing venue (any status), so nothing to add
  venue_id uuid references public.venues(id),
  -- new: not on the site; drafted: added to venues as a draft
  outcome text not null default 'new' check (outcome in ('new', 'matched', 'drafted', 'skipped')),
  raw jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.halal_sweep_runs enable row level security;
alter table public.halal_sweep_items enable row level security;
