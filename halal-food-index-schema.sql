-- ============================================================
-- The Halal Food Index — core schema (Supabase / Postgres)
-- v1 · Manchester-first, built to extend nationally without migration
-- ============================================================
--
-- Design principle: verification is an append-only event log, not a
-- column. Current status is derived. You can never lose the history of
-- how you know something — that history IS the product.
--
-- Run in Supabase SQL editor. Order matters.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;      -- fuzzy search
create extension if not exists postgis;      -- distance / "near me"


-- ------------------------------------------------------------
-- 1. REFERENCE TABLES
-- ------------------------------------------------------------

create table cuisines (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- 'indian', 'turkish'
  name          text not null,
  -- the visual legend: each cuisine owns a colour + pattern token
  colour_hex    text not null,                 -- '#6D4AC7'
  pattern_key   text,                          -- 'arcs' | 'grid' | 'waves'
  sort_order    int default 100,
  created_at    timestamptz default now()
);

create table areas (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- 'rusholme'
  name          text not null,
  city          text not null default 'Manchester',
  region        text not null default 'Greater Manchester',
  -- nesting: 'rusholme' sits inside 'manchester'
  parent_id     uuid references areas(id),
  centroid      geography(point, 4326),
  created_at    timestamptz default now()
);

create table certification_bodies (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- 'hmc', 'hfa'
  name          text not null,
  full_name     text,
  website       text,
  -- the thing that actually divides the audience
  stunning      text check (stunning in ('non_stunned','stunned','mixed','unknown')),
  created_at    timestamptz default now()
);


-- ------------------------------------------------------------
-- 2. CHAINS  (the "Is X Halal?" pillar)
-- ------------------------------------------------------------

create table chains (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,      -- 'nandos'
  name              text not null,
  logo_url          text,                      -- self-hosted, not hotlinked
  website           text,
  -- national verdict shown on the /is-x-halal page
  uk_status         text not null default 'unknown'
                    check (uk_status in ('halal','partial','not_halal','unknown')),
  status_summary    text,                      -- one-paragraph plain-English answer
  serves_alcohol    boolean,
  last_reviewed_at  timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- per-item breakdown for the chain page table
create table chain_items (
  id            uuid primary key default uuid_generate_v4(),
  chain_id      uuid not null references chains(id) on delete cascade,
  item_label    text not null,                 -- 'Chicken (halal branches)'
  status        text not null
                check (status in ('halal','partial','not_halal','unknown')),
  note          text,
  sort_order    int default 100
);


-- ------------------------------------------------------------
-- 3. VENUES  (core entity)
-- ------------------------------------------------------------

create table venues (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  name              text not null,

  -- location
  address_line      text,
  postcode          text,
  area_id           uuid references areas(id),
  location          geography(point, 4326),

  -- contact
  phone             text,
  website           text,

  -- chain linkage (null for independents)
  chain_id          uuid references chains(id),

  -- ==== HALAL: the only fields that decide what the card shows ====
  halal_status      text not null default 'unknown'
                    check (halal_status in ('halal','partial','not_halal','unknown')),
  halal_scope       text,                      -- 'Entire menu' | 'Chicken only'
  serves_alcohol    boolean,
  shared_kitchen    boolean,

  -- ==== CERTIFICATION: stored, but secondary in the UI ====
  -- Most people only want halal / not halal. This detail lives on the
  -- venue page and as a filter, not on the card. Store it anyway —
  -- re-collecting it later costs far more than capturing it now.
  certification_id  uuid references certification_bodies(id),
  cert_reference    text,
  cert_expires_on   date,
  stunning          text check (stunning in ('non_stunned','stunned','mixed','unknown')),

  -- ==== derived verification state (see section 4) ====
  last_verified_at  timestamptz,
  verification_tier text default 'unverified'
                    check (verification_tier in
                      ('unverified','owner_stated','third_party','certified','visited')),

  -- editorial
  score             numeric(2,1),              -- 0.0–10.0
  price_band        text check (price_band in ('£','££','£££','££££')),
  summary           text,

  -- lifecycle
  status            text not null default 'draft'
                    check (status in ('draft','review','published','closed','delisted')),
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index venues_area_idx        on venues(area_id);
create index venues_chain_idx       on venues(chain_id);
create index venues_status_idx      on venues(status) where status = 'published';
create index venues_halal_idx       on venues(halal_status);
create index venues_location_idx    on venues using gist(location);
create index venues_name_trgm_idx   on venues using gin(name gin_trgm_ops);

create table venue_cuisines (
  venue_id    uuid references venues(id) on delete cascade,
  cuisine_id  uuid references cuisines(id) on delete cascade,
  is_primary  boolean default false,
  primary key (venue_id, cuisine_id)
);


-- ------------------------------------------------------------
-- 4. VERIFICATION LOG  ← this is the actual product
-- ------------------------------------------------------------
-- Append-only. Never update, never delete. Every claim the site makes
-- traces back to a row here. If a venue's status changes, you insert a
-- new event; the old one stays as the audit trail.

create table verification_events (
  id            uuid primary key default uuid_generate_v4(),
  venue_id      uuid not null references venues(id) on delete cascade,

  checked_at    timestamptz not null default now(),
  method        text not null
                check (method in
                  ('phone_call','site_visit','certificate_seen',
                   'website_stated','body_register','owner_submitted','third_party')),

  verdict       text not null
                check (verdict in ('halal','partial','not_halal','unknown')),
  scope_note    text,
  evidence_url  text,                          -- photo of cert, register entry
  evidence_note text,

  checked_by    text,                          -- 'mij' — you, for now
  confidence    text default 'medium'
                check (confidence in ('low','medium','high')),

  created_at    timestamptz default now()
);

create index ve_venue_idx   on verification_events(venue_id, checked_at desc);

-- current verification state, derived from the log
create or replace view venue_current_verification as
select distinct on (venue_id)
  venue_id,
  checked_at    as last_verified_at,
  method,
  verdict,
  confidence,
  -- staleness drives your review queue
  (now() - checked_at) > interval '6 months' as is_stale
from verification_events
order by venue_id, checked_at desc;

-- what needs your attention this week
create or replace view review_queue as
select
  v.id, v.name, v.slug,
  cv.last_verified_at,
  cv.method,
  case
    when cv.last_verified_at is null then 'never_verified'
    when cv.last_verified_at < now() - interval '12 months' then 'critical'
    when cv.last_verified_at < now() - interval '6 months'  then 'due'
    else 'ok'
  end as urgency
from venues v
left join venue_current_verification cv on cv.venue_id = v.id
where v.status = 'published'
order by cv.last_verified_at asc nulls first;


-- ------------------------------------------------------------
-- 5. CHAIN BRANCH STATUS  (branch finder on chain pages)
-- ------------------------------------------------------------

create table chain_branch_status (
  id                uuid primary key default uuid_generate_v4(),
  chain_id          uuid not null references chains(id) on delete cascade,
  venue_id          uuid references venues(id) on delete cascade,
  branch_name       text not null,             -- "Nando's — Printworks"
  status            text not null
                    check (status in ('halal','partial','not_halal','unknown')),
  last_verified_at  timestamptz,
  source_note       text,
  unique (chain_id, branch_name)
);


-- ------------------------------------------------------------
-- 6. COLLECTIONS  (your SEO category pages)
-- ------------------------------------------------------------
-- One row per rankable page. Never publish one with thin inventory —
-- min_venues is the gate.

create table collections (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- 'halal-brunch-manchester'
  title         text not null,
  h1            text,
  intro         text,
  meta_title    text,
  meta_desc     text,

  -- how the page fills itself
  rule_area_id      uuid references areas(id),
  rule_cuisine_id   uuid references cuisines(id),
  rule_tags         text[],                    -- ['brunch','breakfast']

  min_venues    int default 8,                 -- publication gate
  status        text not null default 'draft'
                check (status in ('draft','review','published')),
  created_at    timestamptz default now()
);

-- manual pins on top of the rule
create table collection_venues (
  collection_id uuid references collections(id) on delete cascade,
  venue_id      uuid references venues(id) on delete cascade,
  pinned_rank   int,
  primary key (collection_id, venue_id)
);


-- ------------------------------------------------------------
-- 7. INBOUND  (submissions + corrections)
-- ------------------------------------------------------------
-- Both feed a moderation queue. Nothing here is ever shown publicly
-- until you approve it.

create table submissions (
  id            uuid primary key default uuid_generate_v4(),
  venue_name    text not null,
  address       text,
  postcode      text,
  cuisine_hint  text,
  halal_claim   text,
  submitter_name  text,
  submitter_email text,
  is_owner      boolean default false,
  notes         text,
  status        text not null default 'new'
                check (status in ('new','reviewing','accepted','rejected','duplicate')),
  venue_id      uuid references venues(id),    -- set once accepted
  created_at    timestamptz default now()
);

-- "this is wrong" — the single most important trust mechanism you have
create table corrections (
  id            uuid primary key default uuid_generate_v4(),
  venue_id      uuid references venues(id) on delete cascade,
  chain_id      uuid references chains(id) on delete cascade,
  issue_type    text not null
                check (issue_type in
                  ('halal_status','closed','wrong_details','certification','other')),
  detail        text not null,
  reporter_email text,
  status        text not null default 'new'
                check (status in ('new','investigating','resolved','dismissed')),
  resolution    text,
  created_at    timestamptz default now(),
  resolved_at   timestamptz
);

create index corrections_open_idx on corrections(status) where status in ('new','investigating');


-- ------------------------------------------------------------
-- 8. EXTERNAL DATA CACHE  (Google Places etc.)
-- ------------------------------------------------------------
-- Kept deliberately separate from `venues`. External data has licence
-- terms and expiry; your own verified data does not. Never let the two
-- mix in one table — if you ever have to purge cached content you want
-- it to be one DELETE, not a schema unpick.

create table external_place_cache (
  id            uuid primary key default uuid_generate_v4(),
  venue_id      uuid not null references venues(id) on delete cascade,
  provider      text not null default 'google',
  external_id   text not null,                 -- place_id
  payload       jsonb not null,                -- hours, rating, review count
  fetched_at    timestamptz not null default now(),
  expires_at    timestamptz not null,          -- enforce provider cache limits
  unique (provider, external_id)
);

create index epc_expiry_idx on external_place_cache(expires_at);


-- ------------------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- ------------------------------------------------------------
-- Public reads published rows only. Everything else goes through the
-- service role from your admin panel.

alter table venues              enable row level security;
alter table chains              enable row level security;
alter table collections         enable row level security;
alter table verification_events enable row level security;
alter table submissions         enable row level security;
alter table corrections         enable row level security;

create policy "public reads published venues"
  on venues for select using (status = 'published');

create policy "public reads chains"
  on chains for select using (true);

create policy "public reads published collections"
  on collections for select using (status = 'published');

create policy "public reads verification history"
  on verification_events for select using (true);

-- anyone can submit; nobody can read the queue
create policy "anyone can submit a venue"
  on submissions for insert with check (true);

create policy "anyone can report a problem"
  on corrections for insert with check (true);


-- ------------------------------------------------------------
-- 10. SEED — cuisine legend tokens
-- ------------------------------------------------------------

insert into cuisines (slug, name, colour_hex, pattern_key, sort_order) values
  ('indian',     'Indian',     '#6D4AC7', 'arcs',   10),
  ('pakistani',  'Pakistani',  '#8B3FB8', 'arcs',   20),
  ('turkish',    'Turkish',    '#C2410C', 'chevron',30),
  ('lebanese',   'Lebanese',   '#0D9458', 'dots',   40),
  ('chinese',    'Chinese',    '#DC2626', 'grid',   50),
  ('japanese',   'Japanese',   '#0891B2', 'waves',  60),
  ('korean',     'Korean',     '#0369A1', 'waves',  70),
  ('burgers',    'Burgers',    '#D97706', 'stack',  80),
  ('pizza',      'Pizza',      '#B45309', 'radial', 90),
  ('brunch',     'Brunch',     '#2563EB', 'sun',   100),
  ('desserts',   'Desserts',   '#DB2777', 'swirl', 110);
