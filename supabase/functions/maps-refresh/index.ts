// maps-refresh
//
// Keeps Google Maps facts (opening hours, star rating, review count) fresh for
// live and waiting venues, using Google's Places API (New). Facts go into
// external_place_cache (separate from our own data, 30-day expiry, which is
// within Google's caching terms), and empty venue fields (phone, website,
// address, pin, place ID) are filled, never overwritten. Venue status is never
// changed here.
//
// Called once a day by pg_cron (job "maps-refresh-daily"). Each call refreshes
// up to BATCH due venues straight away (no background run to wait for).
// Venues with a Google place ID get a Place Details lookup; the rest get a
// Text Search for "name, address, postcode" and are only accepted when the
// names match. Safe to call again: nothing is fetched twice within 7 days.
//
// Cost: Google gives a free monthly allowance per SKU. One lookup per venue
// per month stays inside it at our size. A Google Cloud budget alert is set.
//
// Moved from Apify to the Places API on 12 Nov 2026 (Apify's free credit is
// kept for the Instagram scan).
//
// Auth: header x-refresh-key must match the Vault secret "maps_refresh_key".
// Secrets: GOOGLE_PLACES_KEY (set by the owner in the Supabase dashboard).

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const PLACES = "https://places.googleapis.com/v1";
const BATCH = 60; // venues per call
const PARALLEL = 6;
const CACHE_DAYS = 30;
const FIELDS = [
  "id", "displayName", "formattedAddress", "addressComponents", "location",
  "nationalPhoneNumber", "websiteUri", "regularOpeningHours", "rating",
  "userRatingCount", "businessStatus", "googleMapsUri", "types",
];

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type Due = { venue_id: string; place_id: string | null; search: string };
// deno-lint-ignore no-explicit-any
type Place = Record<string, any>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function google(path: string, init: RequestInit, mask: string): Promise<Place | null> {
  const res = await fetch(`${PLACES}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": Deno.env.get("GOOGLE_PLACES_KEY")!,
      "X-Goog-FieldMask": mask,
    },
  });
  const text = await res.text();
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Places ${path.split("?")[0]} ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const details = (placeId: string) =>
  google(`/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=GB`, { method: "GET" }, FIELDS.join(","));

async function search(text: string): Promise<Place | null> {
  const body = {
    textQuery: text,
    languageCode: "en",
    regionCode: "GB",
    pageSize: 1,
    // Greater Manchester, roughly; a bias, not a hard limit.
    locationBias: { rectangle: { low: { latitude: 53.33, longitude: -2.73 }, high: { latitude: 53.69, longitude: -1.91 } } },
  };
  const res = await google("/places:searchText", { method: "POST", body: JSON.stringify(body) }, FIELDS.map((f) => `places.${f}`).join(","));
  return res?.places?.[0] ?? null;
}

/* ── opening hours: Google's periods to minutes after midnight ──
 * {mon: [[660, 1380]], tue: [], ...}  [] = closed that day.
 * A range that ends after midnight runs past 1440 (e.g. 5pm to 2am = [1020, 1560]).
 */
const DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function normaliseHours(h: Place | undefined): Record<string, number[][]> | null {
  const periods: Place[] | undefined = h?.periods;
  if (!Array.isArray(periods) || !periods.length) return null;
  const week: Record<string, number[][]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  // Open 24 hours: a single period that opens and never closes.
  if (periods.length === 1 && !periods[0].close) {
    for (const d of DAY) week[d] = [[0, 1440]];
    return week;
  }
  for (const p of periods) {
    if (!p.open || !p.close) continue;
    const start = (p.open.hour ?? 0) * 60 + (p.open.minute ?? 0);
    const span = ((p.close.day - p.open.day + 7) % 7) * 1440;
    const end = span + (p.close.hour ?? 0) * 60 + (p.close.minute ?? 0);
    week[DAY[p.open.day]].push([start, end]);
  }
  for (const d of DAY) week[d].sort((a, b) => a[0] - b[0]);
  return week;
}

/* ── name check for text-search results (no place ID to match on) ── */
const STOP = new Set(["the", "and", "restaurant", "cafe", "café", "manchester", "ltd", "uk"]);
function words(s: string): Set<string> {
  return new Set(
    String(s ?? "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
      .replace(/['’]/g, "").replace(/[^\p{L}\p{N} ]/gu, " ")
      .split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)),
  );
}
function sameName(a: string, b: string): boolean {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return false;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / Math.min(A.size, B.size) >= 0.5;
}

const part = (p: Place, type: string) =>
  (p.addressComponents as Place[] | undefined)?.find((c) => c.types?.includes(type))?.longText as string | undefined;

/* ── refresh one batch ── */

async function refresh(due: Due[]) {
  const ids = due.map((d) => d.venue_id);
  const [{ data: caches, error: cErr }, { data: venues, error: vErr }] = await Promise.all([
    db.from("external_place_cache").select("id, venue_id, provider, external_id, payload").in("venue_id", ids),
    db.from("venues").select("id, name, phone, website, address_line, postcode, location, google_place_id").in("id", ids),
  ]);
  if (cErr) throw cErr;
  if (vErr) throw vErr;

  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_DAYS * 864e5).toISOString();
  const unmatched: string[] = [], notFound: string[] = [], failed: string[] = [], closed: string[] = [];
  let saved = 0, withHours = 0, filled = 0, byId = 0, bySearch = 0;

  async function one(d: Due) {
    const venue = venues!.find((v) => v.id === d.venue_id);
    if (!venue) return;
    let p: Place | null = null;
    let viaSearch = false;
    try {
      if (d.place_id) { p = await details(d.place_id); byId++; }
      if (!p) { p = await search(d.search); bySearch++; viaSearch = true; }
    } catch (e) {
      failed.push(`${venue.name}: ${String((e as Error).message ?? e)}`);
      return;
    }
    if (!p) { notFound.push(venue.name); return; }
    const title = p.displayName?.text ?? "";
    if (viaSearch && !sameName(venue.name, title)) {
      unmatched.push(`${venue.name} (Maps found "${title}")`);
      return;
    }

    const hours = normaliseHours(p.regularOpeningHours);
    if (hours) withHours++;
    const permanentlyClosed = p.businessStatus === "CLOSED_PERMANENTLY";
    const temporarilyClosed = p.businessStatus === "CLOSED_TEMPORARILY";
    if (permanentlyClosed || temporarilyClosed) closed.push(venue.name);

    const facts: Record<string, unknown> = {
      hours,
      opening_hours_raw: p.regularOpeningHours?.weekdayDescriptions ?? null,
      permanently_closed: permanentlyClosed,
      temporarily_closed: temporarilyClosed,
      maps_url: p.googleMapsUri ?? null,
      hours_checked_at: now.toISOString(),
      maps_source: "google_places_api",
    };
    if (typeof p.rating === "number") facts.rating = p.rating;
    if (typeof p.userRatingCount === "number") facts.review_count = p.userRatingCount;
    if (Array.isArray(p.types) && p.types.length) facts.place_types = p.types;

    const row = caches!.find((c) => c.venue_id === venue.id && c.provider === "google") ??
      caches!.find((c) => c.venue_id === venue.id);
    const payload = { ...(row?.payload ?? {}), ...facts };
    delete payload.no_google_listing;
    delete payload.no_google_listing_note;
    const placeId: string | null = p.id ?? d.place_id;

    const { error: wErr } = row
      ? await db.from("external_place_cache").update({
        provider: "google", external_id: placeId ?? row.external_id, payload,
        fetched_at: now.toISOString(), expires_at: expires,
      }).eq("id", row.id)
      : await db.from("external_place_cache").insert({
        venue_id: venue.id, provider: "google", external_id: placeId ?? venue.id, payload,
        fetched_at: now.toISOString(), expires_at: expires,
      });
    if (wErr) { failed.push(`${venue.name}: ${wErr.message}`); return; }
    saved++;

    // Fill gaps on the venue itself. Never overwrite what we already hold.
    const patch: Record<string, unknown> = {};
    if (!venue.google_place_id && placeId) patch.google_place_id = placeId;
    if (!venue.phone && p.nationalPhoneNumber) patch.phone = p.nationalPhoneNumber;
    if (!venue.website && p.websiteUri) patch.website = p.websiteUri;
    if (!venue.address_line) {
      const street = [part(p, "street_number"), part(p, "route")].filter(Boolean).join(" ");
      if (street) patch.address_line = street;
    }
    if (!venue.postcode && part(p, "postal_code")) patch.postcode = part(p, "postal_code");
    const lat = p.location?.latitude, lng = p.location?.longitude;
    if (!venue.location && typeof lat === "number" && typeof lng === "number") {
      patch.location = `SRID=4326;POINT(${lng} ${lat})`;
    }
    if (Object.keys(patch).length) {
      const { error: pErr } = await db.from("venues").update(patch).eq("id", venue.id);
      if (pErr) failed.push(`${venue.name} (venue fields): ${pErr.message}`);
      else filled++;
    }
  }

  for (let i = 0; i < due.length; i += PARALLEL) await Promise.all(due.slice(i, i + PARALLEL).map(one));

  const result = {
    requested: due.length, by_place_id: byId, by_search: bySearch, saved, with_hours: withHours,
    venues_filled: filled, not_found: notFound, unmatched, closed_on_maps: closed, failed,
  };
  // Logged like the old Apify runs so maps_due_venues skips these for 7 days.
  await db.from("maps_refresh_runs").insert({
    kind: due.some((d) => d.place_id) ? "place_ids" : "search",
    apify_run_id: `places-api-${now.toISOString()}`,
    dataset_id: null,
    requested: due,
    status: "ingested",
    finished_at: new Date().toISOString(),
    result,
  });
  return result;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { data: ok } = await db.rpc("maps_refresh_key_ok", { p_key: req.headers.get("x-refresh-key") ?? "" });
  if (ok !== true) return json({ error: "forbidden" }, 403);
  if (!Deno.env.get("GOOGLE_PLACES_KEY")) return json({ ok: false, waiting: "GOOGLE_PLACES_KEY secret is not set yet" });

  try {
    // Older Apify runs still marked running can't be collected any more.
    await db.from("maps_refresh_runs")
      .update({ status: "failed", finished_at: new Date().toISOString(), result: { note: "left over from Apify; moved to Places API" } })
      .eq("status", "running");

    const { data: due, error: dErr } = await db.rpc("maps_due_venues", { p_limit: BATCH });
    if (dErr) throw dErr;
    if (!due?.length) return json({ ok: true, refreshed: null });
    const result = await refresh(
      (due as Array<{ venue_id: string; place_id: string | null; search_text: string }>)
        .map((d) => ({ venue_id: d.venue_id, place_id: d.place_id, search: d.search_text })),
    );
    return json({ ok: true, refreshed: result });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
