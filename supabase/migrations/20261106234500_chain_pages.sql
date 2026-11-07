-- Chain pages ("Is KFC halal?"): what the page needs beyond the v1 tables.
--
-- chains.published: a chain page only goes live (production) once the owner
-- signs it off. Preview deployments show it regardless, so it can be reviewed.
-- statement_url / certifier: the chain's own published halal statement, and the
-- certifier only when that statement names one (no-certification decision).
--
-- chain_branch_status gains the branch's address and map point (for the branch
-- finder and directions) and the page we read its status from.

alter table public.chains
  add column if not exists published boolean not null default false,
  add column if not exists statement_url text,
  add column if not exists certifier text;

alter table public.chain_branch_status
  add column if not exists town text,
  add column if not exists address_line text,
  add column if not exists postcode text,
  add column if not exists location extensions.geography(Point, 4326),
  add column if not exists source_url text;

create unique index if not exists chain_branch_status_chain_source_key
  on public.chain_branch_status (chain_id, source_url);
