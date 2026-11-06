-- pg_net only accepts "application/json" as the Content-Type for a jsonb body,
-- so the first version of indexnow_ping() errored. Same function, fixed header.

create or replace function public.indexnow_ping(p_all boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_host constant text := 'thehalalfoodindex.co.uk';
  v_key constant text := '9fd61dfc8540fbe191bdddee1b7905c8';
  v_since timestamptz := case when p_all then '-infinity'::timestamptz else now() - interval '48 hours' end;
  v_min_listings constant integer := 5; -- MIN_LISTINGS_TO_INDEX in lib/listings.ts
  v_urls text[];
  v_req bigint;
begin
  with changed as (
    -- venues that were published, edited, closed, or had their Google facts refreshed
    select v.id, v.slug, v.area_id
    from venues v
    where v.status in ('published', 'closed')
      and (
        p_all and v.status = 'published'
        or greatest(coalesce(v.updated_at, '-infinity'), coalesce(v.published_at, '-infinity')) > v_since
        or exists (select 1 from external_place_cache c where c.venue_id = v.id and c.fetched_at > v_since)
      )
  ),
  area_pages as (
    select a.slug
    from areas a
    where a.id in (select area_id from changed)
      and (select count(*) from venues x where x.area_id = a.id and x.status = 'published') >= v_min_listings
  ),
  cuisine_pages as (
    select c.slug
    from cuisines c
    where c.id in (select vc.cuisine_id from venue_cuisines vc where vc.venue_id in (select id from changed))
      and (
        select count(*) from venue_cuisines vc join venues x on x.id = vc.venue_id
        where vc.cuisine_id = c.id and x.status = 'published'
      ) >= v_min_listings
  ),
  paths as (
    select '/' || slug as path from changed
    union select '/halal-restaurants-' || slug || '-manchester' from area_pages
    union select '/halal-' || slug || '-manchester' from cuisine_pages
    union select '/halal-restaurants-manchester' where exists (select 1 from changed)
  )
  select array_agg('https://' || v_host || path order by path) into v_urls from paths;

  if v_urls is null then
    return jsonb_build_object('ok', true, 'sent', 0);
  end if;

  select net.http_post(
    url := 'https://api.indexnow.org/indexnow',
    body := jsonb_build_object(
      'host', v_host,
      'key', v_key,
      'keyLocation', 'https://' || v_host || '/' || v_key || '.txt',
      'urlList', to_jsonb(v_urls)
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) into v_req;

  insert into indexnow_pings (url_count, urls, request_id) values (array_length(v_urls, 1), to_jsonb(v_urls), v_req);
  return jsonb_build_object('ok', true, 'sent', array_length(v_urls, 1), 'request_id', v_req);
end;
$$;

