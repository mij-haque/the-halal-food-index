-- ============================================================
-- The Halal Food Index — core schema v1 (migration)
-- Supabase / Postgres 17 · Manchester-first, built to extend nationally
-- ============================================================
--
-- Based on halal-food-index-schema.sql (project doc), plus:
--   • venue_type (decisions-update-listing-page: schema gap)
--   • venues.tags (collections.rule_tags needs something to match)
--   • venues.google_place_id (dedupe for the venue pipeline)
--   • venue_photos (photo pipeline + venue page filmstrip)
--   • RLS on EVERY public table (v0 draft only covered six)
--   • verification history readable only for published venues
--   • views run as the caller (security_invoker) so RLS applies
--   • review_queue / inbound / external cache hidden from the public API
--   • indexes on every foreign key
--   • updated_at triggers with a fixed search_path
--
-- Nothing is deleted: the two legacy tables (restaurants, venues v0)
-- move into a private `legacy` schema (not exposed by the API), and the
-- v0 venue rows are copied into the new venues table as drafts (§17).
-- ============================================================


-- ------------------------------------------------------------
-- 0. Move legacy tables out of the public API (data kept intact)
-- ------------------------------------------------------------

create schema if not exists legacy;
revoke all on schema legacy from public, anon, authenticated;

do $$
begin
  if to_regclass('public.venues') is not null then
    alter table public.venues rename to venues_v0;
    alter table public.venues_v0 set schema legacy;
  end if;
  if to_regclass('public.restaurants') is not null then
    alter table public.restaurants set schema legacy;
  end if;
  if to_regprocedure('public.update_updated_at()') is not null then
    alter function public.update_updated_at() set search_path = '';
  end if;
end $$;


-- ------------------------------------------------------------
-- 1. Extensions (kept out of the public schema)
-- ------------------------------------------------------------

create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;


-- ------------------------------------------------------------
-- 2. Helpers
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ------------------------------------------------------------
-- 3. Reference tables
-- ------------------------------------------------------------

create table public.cuisines (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,            -- 'indian', 'turkish'
  name          text not null,
  colour_hex    text not null,                   -- design-system legend colour
  pattern_key   text,                            -- 'arcs' | 'grid' | 'waves'
  sort_order    int default 100,
  created_at    timestamptz default now()
);

create table public.areas (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,            -- 'rusholme'
  name          text not null,
  city          text not null default 'Manchester',
  region        text not null default 'Greater Manchester',
  parent_id     uuid references public.areas(id),
  centroid      extensions.geography(point, 4326),
  created_at    timestamptz default now()
);

create table public.certification_bodies (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,            -- 'hmc', 'hfa'
  name          text not null,
  full_name     text,
  website       text,
  stunning      text not null default 'unknown'
                check (stunning in ('non_stunned','stunned','mixed','unknown')),
  created_at    timestamptz default now()
);


-- ------------------------------------------------------------
-- 4. Chains — the "Is X Halal?" pillar
-- ------------------------------------------------------------

create table public.chains (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,        -- 'nandos'
  name              text not null,
  logo_url          text,                        -- self-hosted, not hotlinked
  website           text,
  uk_status         text not null default 'unknown'
                    check (uk_status in ('halal','partial','not_halal','unknown')),
  status_summary    text,
  serves_alcohol    boolean,
  last_reviewed_at  timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.chain_items (
  id            uuid primary key default gen_random_uuid(),
  chain_id      uuid not null references public.chains(id) on delete cascade,
  item_label    text not null,                   -- 'Chicken (halal branches)'
  status        text not null
                check (status in ('halal','partial','not_halal','unknown')),
  note          text,
  sort_order    int default 100
);


-- ------------------------------------------------------------
-- 5. Venues — core entity
-- ------------------------------------------------------------

create table public.venues (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  venue_type        text not null default 'restaurant'
                    check (venue_type in ('restaurant','cafe','takeaway','bakery')),

  -- location
  address_line      text,
  postcode          text,
  area_id           uuid references public.areas(id),
  location          extensions.geography(point, 4326),

  -- contact / matching
  phone             text,
  website           text,
  google_place_id   text unique,                 -- dedupe key for imports

  -- chain linkage (null for independents)
  chain_id          uuid references public.chains(id),

  -- halal: the only fields that decide what the card shows
  halal_status      text not null default 'unknown'
                    check (halal_status in ('halal','partial','not_halal','unknown')),
  halal_scope       text,                        -- 'Entire menu' | 'Chicken only'
  serves_alcohol    boolean,
  shared_kitchen    boolean,

  -- certification: stored, secondary in the UI
  certification_id  uuid references public.certification_bodies(id),
  cert_reference    text,
  cert_expires_on   date,
  stunning          text check (stunning in ('non_stunned','stunned','mixed','unknown')),

  -- derived verification state (kept in sync from verification_events)
  last_verified_at  timestamptz,
  verification_tier text not null default 'unverified'
                    check (verification_tier in
                      ('unverified','owner_stated','third_party','certified','visited')),

  -- meals + features for collections and filters: 'brunch', 'buffet', 'prayer_space'
  tags              text[] not null default '{}',

  -- editorial
  score             numeric(3,1) check (score is null or (score >= 0 and score <= 10)),
  price_band        text check (price_band in ('£','££','£££','££££')),
  summary           text,

  -- lifecycle
  status            text not null default 'draft'
                    check (status in ('draft','review','published','closed','delisted')),
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.venue_cuisines (
  venue_id    uuid references public.venues(id) on delete cascade,
  cuisine_id  uuid references public.cuisines(id) on delete cascade,
  is_primary  boolean default false,
  primary key (venue_id, cuisine_id)
);


-- ------------------------------------------------------------
-- 6. Verification log — the actual product (append-only)
-- ------------------------------------------------------------

create table public.verification_events (
  id            uuid primary key default gen_random_uuid(),
  venue_id      uuid not null references public.venues(id) on delete cascade,
  checked_at    timestamptz not null default now(),
  method        text not null
                check (method in
                  ('phone_call','site_visit','certificate_seen',
                   'website_stated','body_register','owner_submitted','third_party')),
  verdict       text not null
                check (verdict in ('halal','partial','not_halal','unknown')),
  scope_note    text,
  evidence_url  text,
  evidence_note text,
  checked_by    text,
  confidence    text not null default 'medium'
                check (confidence in ('low','medium','high')),
  created_at    timestamptz default now()
);

-- Edits are forbidden: a changed status is a NEW event, the old one stays.
create or replace function public.forbid_verification_edits()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'verification_events is append-only — insert a new event instead';
end;
$$;

create trigger verification_events_no_update
  before update on public.verification_events
  for each row execute function public.forbid_verification_edits();

-- Keep venues.last_verified_at current without anyone remembering to.
create or replace function public.sync_venue_last_verified()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.venues
     set last_verified_at = greatest(coalesce(last_verified_at, new.checked_at), new.checked_at)
   where id = new.venue_id;
  return new;
end;
$$;

create trigger verification_events_sync_venue
  after insert on public.verification_events
  for each row execute function public.sync_venue_last_verified();


-- ------------------------------------------------------------
-- 7. Chain branch status
-- ------------------------------------------------------------

create table public.chain_branch_status (
  id                uuid primary key default gen_random_uuid(),
  chain_id          uuid not null references public.chains(id) on delete cascade,
  venue_id          uuid references public.venues(id) on delete cascade,
  branch_name       text not null,
  status            text not null
                    check (status in ('halal','partial','not_halal','unknown')),
  last_verified_at  timestamptz,
  source_note       text,
  unique (chain_id, branch_name)
);


-- ------------------------------------------------------------
-- 8. Collections — SEO category pages
-- ------------------------------------------------------------

create table public.collections (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,        -- 'halal-brunch-manchester'
  title             text not null,
  h1                text,
  intro             text,
  meta_title        text,
  meta_desc         text,
  rule_area_id      uuid references public.areas(id),
  rule_cuisine_id   uuid references public.cuisines(id),
  rule_tags         text[],                      -- matched against venues.tags
  min_venues        int not null default 8,      -- publication gate
  status            text not null default 'draft'
                    check (status in ('draft','review','published')),
  created_at        timestamptz default now()
);

create table public.collection_venues (
  collection_id uuid references public.collections(id) on delete cascade,
  venue_id      uuid references public.venues(id) on delete cascade,
  pinned_rank   int,
  primary key (collection_id, venue_id)
);


-- ------------------------------------------------------------
-- 9. Inbound — submissions + corrections (moderated, never public)
-- ------------------------------------------------------------

create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  venue_name      text not null check (char_length(venue_name) between 1 and 200),
  address         text check (char_length(address) <= 500),
  postcode        text check (char_length(postcode) <= 12),
  cuisine_hint    text check (char_length(cuisine_hint) <= 100),
  halal_claim     text check (char_length(halal_claim) <= 1000),
  submitter_name  text check (char_length(submitter_name) <= 200),
  submitter_email text check (char_length(submitter_email) <= 320),
  is_owner        boolean default false,
  notes           text check (char_length(notes) <= 2000),
  status          text not null default 'new'
                  check (status in ('new','reviewing','accepted','rejected','duplicate')),
  venue_id        uuid references public.venues(id),
  created_at      timestamptz default now()
);

create table public.corrections (
  id              uuid primary key default gen_random_uuid(),
  venue_id        uuid references public.venues(id) on delete cascade,
  chain_id        uuid references public.chains(id) on delete cascade,
  issue_type      text not null
                  check (issue_type in
                    ('halal_status','closed','wrong_details','certification','other')),
  detail          text not null check (char_length(detail) between 1 and 2000),
  reporter_email  text check (char_length(reporter_email) <= 320),
  status          text not null default 'new'
                  check (status in ('new','investigating','resolved','dismissed')),
  resolution      text,
  created_at      timestamptz default now(),
  resolved_at     timestamptz
);


-- ------------------------------------------------------------
-- 10. External data cache (Google Places etc.) — never public
-- ------------------------------------------------------------

create table public.external_place_cache (
  id            uuid primary key default gen_random_uuid(),
  venue_id      uuid not null references public.venues(id) on delete cascade,
  provider      text not null default 'google',
  external_id   text not null,
  payload       jsonb not null,
  fetched_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  unique (provider, external_id)
);


-- ------------------------------------------------------------
-- 11. Venue photos — own photos + permissioned restaurant photos
-- ------------------------------------------------------------

create table public.venue_photos (
  id               uuid primary key default gen_random_uuid(),
  venue_id         uuid not null references public.venues(id) on delete cascade,
  storage_path     text not null,               -- the image shown on the site
  original_path    text,                        -- untouched original
  kind             text not null
                   check (kind in ('as_served','styled','interior','exterior')),
  look_key         text,                        -- 'travertine-sun' etc. (styled only)
  source           text not null default 'own'
                   check (source in ('own','restaurant_permission')),
  permission_note  text,                        -- who gave permission, when
  alt_text         text,
  sort_order       int not null default 100,
  status           text not null default 'pending'
                   check (status in ('pending','approved','rejected')),
  taken_at         date,
  created_at       timestamptz default now(),
  check (kind <> 'styled' or look_key is not null),
  check (source <> 'restaurant_permission' or permission_note is not null)
);


-- ------------------------------------------------------------
-- 12. Indexes
-- ------------------------------------------------------------

create index venues_area_idx          on public.venues(area_id);
create index venues_chain_idx         on public.venues(chain_id);
create index venues_cert_idx          on public.venues(certification_id);
create index venues_published_idx     on public.venues(status) where status = 'published';
create index venues_halal_idx         on public.venues(halal_status);
create index venues_type_idx          on public.venues(venue_type);
create index venues_tags_idx          on public.venues using gin(tags);
create index venues_location_idx      on public.venues using gist(location);
create index venues_name_trgm_idx     on public.venues using gin(name extensions.gin_trgm_ops);

create index areas_parent_idx         on public.areas(parent_id);
create index venue_cuisines_cuis_idx  on public.venue_cuisines(cuisine_id);
create index ve_venue_idx             on public.verification_events(venue_id, checked_at desc);
create index chain_items_chain_idx    on public.chain_items(chain_id);
create index cbs_venue_idx            on public.chain_branch_status(venue_id);
create index collections_area_idx     on public.collections(rule_area_id);
create index collections_cuisine_idx  on public.collections(rule_cuisine_id);
create index cv_venue_idx             on public.collection_venues(venue_id);
create index submissions_venue_idx    on public.submissions(venue_id);
create index corrections_venue_idx    on public.corrections(venue_id);
create index corrections_chain_idx    on public.corrections(chain_id);
create index corrections_open_idx     on public.corrections(status) where status in ('new','investigating');
create index epc_venue_idx            on public.external_place_cache(venue_id);
create index epc_expiry_idx           on public.external_place_cache(expires_at);
create index venue_photos_venue_idx   on public.venue_photos(venue_id, sort_order);


-- ------------------------------------------------------------
-- 13. updated_at triggers
-- ------------------------------------------------------------

create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

create trigger chains_set_updated_at
  before update on public.chains
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 14. Views (run as the caller, so RLS applies)
-- ------------------------------------------------------------

create view public.venue_current_verification
with (security_invoker = true) as
select distinct on (venue_id)
  venue_id,
  checked_at    as last_verified_at,
  method,
  verdict,
  confidence,
  (now() - checked_at) > interval '6 months' as is_stale
from public.verification_events
order by venue_id, checked_at desc;

-- Admin-only: what needs attention this week
create view public.review_queue
with (security_invoker = true) as
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
from public.venues v
left join public.venue_current_verification cv on cv.venue_id = v.id
where v.status = 'published'
order by cv.last_verified_at asc nulls first;


-- ------------------------------------------------------------
-- 15. Row level security — on for every table
-- ------------------------------------------------------------
-- Public (anon) reads published content only. Admin work goes through
-- the service role, which bypasses RLS. No public update/delete anywhere.

alter table public.cuisines              enable row level security;
alter table public.areas                 enable row level security;
alter table public.certification_bodies  enable row level security;
alter table public.chains                enable row level security;
alter table public.chain_items           enable row level security;
alter table public.venues                enable row level security;
alter table public.venue_cuisines        enable row level security;
alter table public.verification_events   enable row level security;
alter table public.chain_branch_status   enable row level security;
alter table public.collections           enable row level security;
alter table public.collection_venues     enable row level security;
alter table public.submissions           enable row level security;
alter table public.corrections           enable row level security;
alter table public.external_place_cache  enable row level security;
alter table public.venue_photos          enable row level security;

-- reference data
create policy "public reads cuisines"   on public.cuisines             for select to anon, authenticated using (true);
create policy "public reads areas"      on public.areas                for select to anon, authenticated using (true);
create policy "public reads cert bodies" on public.certification_bodies for select to anon, authenticated using (true);

-- chains
create policy "public reads chains"          on public.chains              for select to anon, authenticated using (true);
create policy "public reads chain items"     on public.chain_items         for select to anon, authenticated using (true);
create policy "public reads branch status"   on public.chain_branch_status for select to anon, authenticated using (true);

-- venues + children: published only
create policy "public reads published venues"
  on public.venues for select to anon, authenticated
  using (status = 'published');

create policy "public reads cuisines of published venues"
  on public.venue_cuisines for select to anon, authenticated
  using (exists (select 1 from public.venues v
                 where v.id = venue_id and v.status = 'published'));

create policy "public reads verification of published venues"
  on public.verification_events for select to anon, authenticated
  using (exists (select 1 from public.venues v
                 where v.id = venue_id and v.status = 'published'));

create policy "public reads approved photos of published venues"
  on public.venue_photos for select to anon, authenticated
  using (status = 'approved'
         and exists (select 1 from public.venues v
                     where v.id = venue_id and v.status = 'published'));

-- collections: published only
create policy "public reads published collections"
  on public.collections for select to anon, authenticated
  using (status = 'published');

create policy "public reads pins of published collections"
  on public.collection_venues for select to anon, authenticated
  using (exists (select 1 from public.collections c
                 where c.id = collection_id and c.status = 'published'));

-- inbound: anyone can submit, nobody can read or pre-set the outcome
create policy "anyone can submit a venue"
  on public.submissions for insert to anon, authenticated
  with check (status = 'new' and venue_id is null);

create policy "anyone can report a problem"
  on public.corrections for insert to anon, authenticated
  with check (status = 'new' and resolution is null and resolved_at is null);

-- external_place_cache: no policies → service role only.

-- Keep private objects out of the public API (and GraphQL) entirely.
revoke select, update, delete on public.submissions          from anon, authenticated;
revoke select, update, delete on public.corrections          from anon, authenticated;
revoke all                    on public.external_place_cache from anon, authenticated;
revoke all                    on public.review_queue         from anon, authenticated;


-- ------------------------------------------------------------
-- 16. Seed reference data (no halal claims — those need evidence)
-- ------------------------------------------------------------

insert into public.cuisines (slug, name, colour_hex, pattern_key, sort_order) values
  ('indian',     'Indian',     '#6D4AC7', 'arcs',    10),
  ('pakistani',  'Pakistani',  '#8B3FB8', 'arcs',    20),
  ('turkish',    'Turkish',    '#C2410C', 'chevron', 30),
  ('lebanese',   'Lebanese',   '#0D9458', 'dots',    40),
  ('chinese',    'Chinese',    '#DC2626', 'grid',    50),
  ('japanese',   'Japanese',   '#0891B2', 'waves',   60),
  ('korean',     'Korean',     '#0369A1', 'waves',   70),
  ('burgers',    'Burgers',    '#D97706', 'stack',   80),
  ('pizza',      'Pizza',      '#B45309', 'radial',  90),
  ('brunch',     'Brunch',     '#2563EB', 'sun',    100),
  ('desserts',   'Desserts',   '#DB2777', 'swirl',  110);

-- Stunning policy deliberately 'unknown' until checked against each body's own published policy.
insert into public.certification_bodies (slug, name, full_name, website) values
  ('hmc', 'HMC', 'Halal Monitoring Committee', 'https://halalhmc.org'),
  ('hfa', 'HFA', 'Halal Food Authority',       'https://halalfoodauthority.com');

-- Greater Manchester: ten boroughs, then Manchester neighbourhoods underneath.
insert into public.areas (slug, name, city) values
  ('manchester', 'Manchester', 'Manchester'),
  ('salford',    'Salford',    'Salford'),
  ('trafford',   'Trafford',   'Trafford'),
  ('stockport',  'Stockport',  'Stockport'),
  ('oldham',     'Oldham',     'Oldham'),
  ('rochdale',   'Rochdale',   'Rochdale'),
  ('bolton',     'Bolton',     'Bolton'),
  ('bury',       'Bury',       'Bury'),
  ('tameside',   'Tameside',   'Tameside'),
  ('wigan',      'Wigan',      'Wigan');

insert into public.areas (slug, name, city, parent_id)
select x.slug, x.name, 'Manchester', (select id from public.areas where slug = 'manchester')
from (values
  ('city-centre',  'City Centre'),
  ('rusholme',     'Rusholme'),
  ('longsight',    'Longsight'),
  ('levenshulme',  'Levenshulme'),
  ('cheetham-hill','Cheetham Hill'),
  ('fallowfield',  'Fallowfield'),
  ('withington',   'Withington'),
  ('chorlton',     'Chorlton'),
  ('didsbury',     'Didsbury'),
  ('moss-side',    'Moss Side')
) as x(slug, name);

insert into public.areas (slug, name, city, parent_id)
values ('trafford-centre', 'Trafford Centre', 'Trafford',
        (select id from public.areas where slug = 'trafford'));

-- Chain shells for the "Is X Halal?" pages. Status stays 'unknown' until evidenced.
insert into public.chains (slug, name) values
  ('kfc',        'KFC'),
  ('nandos',     'Nando''s'),
  ('subway',     'Subway'),
  ('mcdonalds',  'McDonald''s'),
  ('five-guys',  'Five Guys'),
  ('greggs',     'Greggs'),
  ('wagamama',   'Wagamama');


-- ------------------------------------------------------------
-- 17. Carry the v0 draft venues into the new table (as drafts)
-- ------------------------------------------------------------
-- No halal claims are carried over: every row lands as status 'draft',
-- halal_status 'unknown'. The "( حلال )" suffix Google shows on one
-- listing is stripped from the display name (the original stays in
-- legacy.venues_v0); halal status comes from evidence, not names.
-- Tracking query strings (utm_*, fbclid) are stripped from websites.

do $$
begin
  if to_regclass('legacy.venues_v0') is null then
    return;
  end if;

  with src as (
    select
      v.*,
      btrim(regexp_replace(v.venue_name, '\s*\(\s*حلال\s*\)\s*', ' ', 'g')) as clean_name
    from legacy.venues_v0 v
  )
  insert into public.venues
    (slug, name, address_line, postcode, phone, website, google_place_id,
     price_band, area_id, status, halal_status, created_at)
  select
    btrim(regexp_replace(lower(s.clean_name), '[^a-z0-9]+', '-', 'g'), '-'),
    s.clean_name,
    nullif(s.address, ''),
    nullif(s.postcode, ''),
    nullif(s.phone, ''),
    nullif(regexp_replace(s.website, '\?.*$', ''), ''),
    nullif(s.google_place_id, ''),
    case when s.price_band in ('£','££','£££','££££') then s.price_band end,
    (select a.id from public.areas a where lower(a.name) = lower(btrim(s.area)) limit 1),
    'draft',
    'unknown',
    s.created_at
  from src s
  on conflict (google_place_id) do nothing;

  insert into public.venue_cuisines (venue_id, cuisine_id, is_primary)
  select nv.id, c.id, true
  from legacy.venues_v0 v
  join public.venues   nv on nv.google_place_id = v.google_place_id
  join public.cuisines c  on lower(c.name) = lower(btrim(v.cuisine))
  on conflict do nothing;
end $$;


