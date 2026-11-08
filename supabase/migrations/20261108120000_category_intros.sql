-- Category page intros (docs/writing-style.md): a short, sourced paragraph per
-- area and cuisine page, written in batches and approved by the owner. When it
-- is null the page falls back to its generic one-line lede.
alter table public.areas add column intro text;
alter table public.cuisines add column intro text;

comment on column public.areas.intro is 'Owner-approved intro for /halal-restaurants-{slug}-manchester. Null: generic lede.';
comment on column public.cuisines.intro is 'Owner-approved intro for /halal-{slug}-manchester. Null: generic lede.';
