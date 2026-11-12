-- 1. Internal job tables: RLS already blocks rows; this also hides them from the public API.
revoke all on table public.halal_sweep_items, public.halal_sweep_runs, public.indexnow_pings,
  public.maps_refresh_runs, public.external_place_cache from anon, authenticated;

-- 2. "Report a change" flood guard. At most 30 reports an hour site-wide, and the
--    same text can't be sent twice in a day. Errors carry "hfi_rate_limited",
--    which the server action turns into a friendly message.
create or replace function public.corrections_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.corrections where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'hfi_rate_limited: too many reports this hour';
  end if;
  if exists (select 1 from public.corrections
             where created_at > now() - interval '1 day' and lower(detail) = lower(new.detail)) then
    raise exception 'hfi_rate_limited: duplicate report';
  end if;
  return new;
end $$;
revoke execute on function public.corrections_rate_limit() from public, anon, authenticated;
drop trigger if exists corrections_rate_limit on public.corrections;
create trigger corrections_rate_limit before insert on public.corrections
  for each row execute function public.corrections_rate_limit();
