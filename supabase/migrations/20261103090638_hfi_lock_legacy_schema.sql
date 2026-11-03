-- Archive tables keep their data but lose all public access.
revoke all on all tables in schema legacy from anon, authenticated;
alter table legacy.restaurants enable row level security;
drop policy if exists "Anyone can read all venues for now" on legacy.venues_v0;
drop policy if exists "Anyone can read published venues"   on legacy.venues_v0;
drop policy if exists "Anyone can add a draft venue"       on legacy.venues_v0;
