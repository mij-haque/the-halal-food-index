-- Chain pages: a chain-specific sentence for the halal caveat box, taken from the
-- chain's own statement (KFC: limited-time offers; Nando's: chicken only).
alter table public.chains add column caveat text;

update public.chains
set caveat = 'Some menu items and limited-time offers aren''t sold at halal branches.'
where slug = 'kfc';
