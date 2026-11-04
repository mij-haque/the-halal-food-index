// maps-refresh
//
// Keeps Google Maps facts (opening hours, star rating, review count) fresh for
// live and waiting venues, using Apify's Google Maps Scraper. Facts go into
// external_place_cache (separate from our own data, 30-day expiry), and empty
// venue fields (phone, website, address, pin, place ID) are filled, never
// overwritten. Venue status is never changed here.
//
// Called once a day by pg_cron (job "maps-refresh-daily"). Each call:
//   1. ingests any Apify run that has finished,
//   2. starts the next run if any venue is due (missing or expiring facts).
// Safe to call again at any time: nothing is fetched twice within 7 days.
//
// Auth: header x-refresh-key must match the Vault secret "maps_refresh_key".
// Secrets: APIFY_TOKEN (set by the owner in the Supabase dashboard).

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ACTOR = "compass~crawler-google-places";
const APIFY = "https://api.apify.com/v2";
const BATCH = 60; // venues per Apify run
const CACHE_DAYS = 30;
const MAX_CHARGE_USD = 1; // hard spending cap per run
const DETAIL_PAGE = false; // opening hours come with the basic place data

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

type Requested = { venue_id: string; place_id: string | null; search: string };
type Run = {
  id: string;
  kind: "place_ids" | "search";
  apify_run_id: string;
  dataset_id: string | null;
  requested: Requested[];
};
// deno-lint-ignore no-explicit-any
type Item = Record<string, any>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function apify(path: string, init: RequestInit = {}) {
  const res = await fetch(`${APIFY}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("APIFY_TOKEN")}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Apify ${path.split("?")[0]} ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

/* ── opening hours: Google's text to minutes after midnight ──
 * {mon: [[660, 1380]], tue: [], ...}  [] = closed that day, missing = unknown.
 * A range that ends after midnight runs past 1440 (e.g. 5pm to 2am = [1020, 1560]).
 */

const DAYS: Record<string, string> = {
  monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu",
  friday: "fri", saturday: "sat", sunday: "sun",
};

function meridiem(s: string | undefined): "am" | "pm" | null {
  if (!s) return null;
  return s.startsWith("a") ? "am" : "pm";
}

function minutes(t: string, mer: "am" | "pm" | null): number | null {
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h > 24 || min > 59) return null;
  if (mer) {
    if (h > 12) return null;
    h = h % 12 + (mer === "pm" ? 12 : 0);
  }
  return h * 60 + min;
}

export function parseRanges(raw: string): number[][] | null {
  const s = String(raw)
    .toLowerCase()
    .replace(/[\u202f\u00a0\u2009]/g, " ")
    .replace(/\s*[\u2013\u2014]\s*/g, " to ")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;
  if (s.includes("closed")) return [];
  if (s.includes("24 hours")) return [[0, 1440]];
  const out: number[][] = [];
  for (const part of s.split(/[,;]/)) {
    const m = part.trim().match(
      /^(\d{1,2}(?::\d{2})?)\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)?$/,
    );
    if (!m) return null; // unknown format: keep the raw text only
    const endMer = meridiem(m[4]);
    const startMer = meridiem(m[2]) ?? endMer;
    let start = minutes(m[1], startMer);
    let end = minutes(m[3], endMer);
    if (start === null || end === null) return null;
    // "11 to 2 PM" means 11am, not 11pm
    if (!m[2] && endMer === "pm" && start >= end && start - 720 >= 0) start -= 720;
    if (end <= start) end += 1440;
    out.push([start, end]);
  }
  return out;
}

function normaliseHours(list: unknown): Record<string, number[][]> | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const week: Record<string, number[][]> = {};
  for (const row of list as Array<{ day?: string; hours?: string }>) {
    const day = DAYS[String(row?.day ?? "").toLowerCase().trim()];
    if (!day || row?.hours == null) continue;
    const ranges = parseRanges(row.hours);
    if (ranges) week[day] = ranges;
  }
  return Object.keys(week).length ? week : null;
}

/* ── name check for search results (no place ID to match on) ── */

const STOP = new Set(["the", "and", "restaurant", "cafe", "café", "manchester", "ltd", "uk"]);
function words(s: string): Set<string> {
  return new Set(
    String(s ?? "")
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/['\u2019]/g, "")
      .replace(/[^\p{L}\p{N} ]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  );
}
function sameName(a: string, b: string): boolean {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return false;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / Math.min(A.size, B.size) >= 0.5;
}
const key = (s: string) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

/* ── ingest a finished run ── */

async function ingest(run: Run) {
  const items: Item[] = await apify(`/datasets/${run.dataset_id}/items?clean=true&format=json`);
  const requested = run.requested;
  const byPlace = new Map(requested.filter((r) => r.place_id).map((r) => [r.place_id!, r]));
  const bySearch = new Map(requested.map((r) => [key(r.search), r]));
  const ids = requested.map((r) => r.venue_id);

  const [{ data: caches, error: cErr }, { data: venues, error: vErr }] = await Promise.all([
    db.from("external_place_cache").select("id, venue_id, provider, external_id, payload").in("venue_id", ids),
    db.from("venues")
      .select("id, name, phone, website, address_line, postcode, location, google_place_id")
      .in("id", ids),
  ]);
  if (cErr) throw cErr;
  if (vErr) throw vErr;

  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_DAYS * 864e5).toISOString();
  const done = new Set<string>();
  const unmatched: string[] = [];
  const failed: string[] = [];
  const closed: string[] = [];
  let saved = 0, withHours = 0, filled = 0;

  for (const it of items ?? []) {
    let req = it.placeId ? byPlace.get(it.placeId) : undefined;
    if (!req && it.searchString) req = bySearch.get(key(it.searchString));
    if (!req || done.has(req.venue_id)) {
      if (!req) unmatched.push(String(it.title ?? it.placeId ?? "?"));
      continue;
    }
    done.add(req.venue_id);
    const venue = venues!.find((v) => v.id === req!.venue_id);
    if (!venue) continue;
    if (run.kind === "search" && !sameName(venue.name, it.title)) {
      unmatched.push(`${venue.name} (Maps found "${it.title}")`);
      continue;
    }

    const placeId: string | null = it.placeId ?? req.place_id;
    const hours = normaliseHours(it.openingHours);
    if (hours) withHours++;
    if (it.permanentlyClosed || it.temporarilyClosed) closed.push(venue.name);

    const facts: Record<string, unknown> = {
      hours,
      opening_hours_raw: it.openingHours ?? null,
      permanently_closed: !!it.permanentlyClosed,
      temporarily_closed: !!it.temporarilyClosed,
      maps_url: it.url ?? null,
      hours_checked_at: now.toISOString(),
      maps_source: "apify_google_maps",
    };
    if (typeof it.totalScore === "number") facts.rating = it.totalScore;
    if (typeof it.reviewsCount === "number") facts.review_count = it.reviewsCount;
    if (Array.isArray(it.categories) && it.categories.length) facts.categories = it.categories;

    const row = caches!.find((c) => c.venue_id === venue.id && c.provider === "google") ??
      caches!.find((c) => c.venue_id === venue.id);
    const payload = { ...(row?.payload ?? {}), ...facts };
    delete payload.no_google_listing;
    delete payload.no_google_listing_note;

    const write = row
      ? db.from("external_place_cache").update({
        provider: "google",
        external_id: placeId ?? row.external_id,
        payload,
        fetched_at: now.toISOString(),
        expires_at: expires,
      }).eq("id", row.id)
      : db.from("external_place_cache").insert({
        venue_id: venue.id,
        provider: "google",
        external_id: placeId ?? venue.id,
        payload,
        fetched_at: now.toISOString(),
        expires_at: expires,
      });
    const { error: wErr } = await write;
    if (wErr) {
      failed.push(`${venue.name}: ${wErr.message}`);
      continue;
    }
    saved++;

    // Fill gaps on the venue itself. Never overwrite what we already hold.
    const patch: Record<string, unknown> = {};
    if (!venue.google_place_id && placeId) patch.google_place_id = placeId;
    if (!venue.phone && (it.phone || it.phoneUnformatted)) patch.phone = it.phone ?? it.phoneUnformatted;
    if (!venue.website && it.website) patch.website = it.website;
    if (!venue.address_line && (it.street || it.address)) {
      patch.address_line = it.street ? [it.street, it.city].filter(Boolean).join(", ") : it.address;
    }
    if (!venue.postcode && it.postalCode) patch.postcode = it.postalCode;
    const lat = it.location?.lat, lng = it.location?.lng;
    if (!venue.location && typeof lat === "number" && typeof lng === "number") {
      patch.location = `SRID=4326;POINT(${lng} ${lat})`;
    }
    if (Object.keys(patch).length) {
      const { error: pErr } = await db.from("venues").update(patch).eq("id", venue.id);
      if (pErr) failed.push(`${venue.name} (venue fields): ${pErr.message}`);
      else filled++;
    }
  }

  const notFound = requested
    .filter((r) => !done.has(r.venue_id))
    .map((r) => r.search.split(",")[0]);
  const result = {
    items: items?.length ?? 0,
    saved,
    with_hours: withHours,
    venues_filled: filled,
    not_found: notFound,
    unmatched,
    closed_on_maps: closed,
    failed,
  };
  await db.from("maps_refresh_runs")
    .update({ status: "ingested", finished_at: now.toISOString(), result })
    .eq("id", run.id);
  return result;
}

/* ── start the next run ── */

async function start(due: Requested[]) {
  const withId = due.filter((d) => d.place_id);
  const kind: Run["kind"] = withId.length ? "place_ids" : "search";
  const batch = withId.length ? withId : due;
  const input = {
    language: "en",
    maxReviews: 0,
    maxImages: 0,
    scrapePlaceDetailPage: DETAIL_PAGE,
    maxCrawledPlacesPerSearch: 1,
    ...(kind === "place_ids"
      ? { placeIds: batch.map((b) => b.place_id) }
      : { searchStringsArray: batch.map((b) => b.search) }),
  };
  const res = await apify(
    `/acts/${ACTOR}/runs?maxItems=${batch.length}&maxTotalChargeUsd=${MAX_CHARGE_USD}`,
    { method: "POST", body: JSON.stringify(input) },
  );
  const run = res?.data;
  if (!run?.id) throw new Error("Apify did not return a run id");
  const { error } = await db.from("maps_refresh_runs").insert({
    kind,
    apify_run_id: run.id,
    dataset_id: run.defaultDatasetId ?? null,
    requested: batch,
  });
  if (error) throw error;
  return { run: run.id, kind, venues: batch.length };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { data: ok } = await db.rpc("maps_refresh_key_ok", {
    p_key: req.headers.get("x-refresh-key") ?? "",
  });
  if (ok !== true) return json({ error: "forbidden" }, 403);
  if (!Deno.env.get("APIFY_TOKEN")) {
    return json({ ok: false, waiting: "APIFY_TOKEN secret is not set yet" });
  }

  try {
    const report: Record<string, unknown> = {};
    const { data: open, error } = await db.from("maps_refresh_runs")
      .select("id, kind, apify_run_id, dataset_id, requested")
      .eq("status", "running")
      .order("started_at");
    if (error) throw error;

    for (const run of (open ?? []) as Run[]) {
      const info = await apify(`/actor-runs/${run.apify_run_id}`);
      const status = info?.data?.status;
      if (status === "SUCCEEDED") {
        report[run.apify_run_id] = await ingest(run);
      } else if (["FAILED", "ABORTED", "TIMED-OUT", "TIMED_OUT"].includes(status)) {
        await db.from("maps_refresh_runs").update({
          status: "failed",
          finished_at: new Date().toISOString(),
          result: { apify_status: status },
        }).eq("id", run.id);
        report[run.apify_run_id] = { failed: status };
      } else {
        return json({ ok: true, ...report, waiting_on: run.apify_run_id, status });
      }
    }

    const { data: due, error: dErr } = await db.rpc("maps_due_venues", { p_limit: BATCH });
    if (dErr) throw dErr;
    if (!due?.length) return json({ ok: true, ...report, started: null });

    const started = await start(
      (due as Array<{ venue_id: string; place_id: string | null; search_text: string }>)
        .map((d) => ({ venue_id: d.venue_id, place_id: d.place_id, search: d.search_text })),
    );
    return json({ ok: true, ...report, started });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
