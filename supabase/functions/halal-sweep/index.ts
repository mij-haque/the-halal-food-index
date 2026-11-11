// halal-sweep
//
// Finds halal places across Greater Manchester that are not on the site yet.
// Searches Google Maps (Apify's Google Maps Scraper) for "halal food in <area>"
// and stages every result in halal_sweep_items. Matching against venues and
// drafting happen in SQL afterwards; nothing here touches venues.
//
// POST {"start": true}  starts a sweep (refused if one is still running).
// POST {}               ingests a finished sweep, otherwise reports progress.
//
// Auth: header x-refresh-key must match the Vault secret "maps_refresh_key".
// Secrets: APIFY_TOKEN (set by the owner in the Supabase dashboard).

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ACTOR = "compass~crawler-google-places";
const APIFY = "https://api.apify.com/v2";
const PER_SEARCH = 50;
const MAX_CHARGE_USD = 15; // hard spending cap for one sweep

const AREAS = [
  "Manchester city centre", "Rusholme", "Longsight", "Levenshulme", "Cheetham Hill", "Crumpsall",
  "Fallowfield", "Withington", "Didsbury", "Chorlton", "Whalley Range", "Moss Side", "Hulme",
  "Gorton", "Ardwick", "Burnage", "Salford", "Eccles", "Stretford", "Old Trafford", "Sale",
  "Altrincham", "Urmston", "Trafford Centre", "Stockport", "Cheadle", "Oldham", "Chadderton",
  "Royton", "Middleton", "Rochdale", "Bolton", "Bury", "Prestwich", "Wigan",
  "Ashton-under-Lyne", "Hyde", "Denton",
];
const searchFor = (area: string) => `halal food in ${area}, Greater Manchester`;

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function apify(path: string, init: RequestInit = {}) {
  const res = await fetch(`${APIFY}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("APIFY_TOKEN")}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Apify ${path.split("?")[0]} ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

// deno-lint-ignore no-explicit-any
type Item = Record<string, any>;

function row(item: Item, runId: string) {
  const categories: string[] = [item.categoryName, ...(item.categories ?? [])].filter(Boolean);
  const halal = /\bhalal\b/i;
  const strong = categories.some((c) => halal.test(c)) || halal.test(String(item.title ?? ""));
  return {
    place_id: item.placeId,
    run_id: runId,
    name: String(item.title ?? "").trim(),
    categories: [...new Set(categories)],
    address: item.address ?? null,
    postcode: item.postalCode ?? null,
    phone: item.phone ?? null,
    website: item.website ?? null,
    lat: item.location?.lat ?? null,
    lng: item.location?.lng ?? null,
    rating: item.totalScore ?? null,
    review_count: item.reviewsCount ?? null,
    permanently_closed: Boolean(item.permanentlyClosed),
    search_string: item.searchString ?? null,
    signal: strong ? "strong" : "weak",
    raw: item,
  };
}

async function ingest(run: { id: string; apify_run_id: string; dataset_id: string | null }) {
  const info = await apify(`/actor-runs/${run.apify_run_id}`);
  const status = info?.data?.status;
  if (status !== "SUCCEEDED") {
    if (["FAILED", "ABORTED", "TIMED-OUT", "TIMED_OUT"].includes(status)) {
      await db.from("halal_sweep_runs").update({ status: "failed", finished_at: new Date().toISOString(), result: { apify_status: status } }).eq("id", run.id);
      return { failed: status };
    }
    return { waiting: status };
  }
  const dataset = run.dataset_id ?? info.data.defaultDatasetId;
  const rows: ReturnType<typeof row>[] = [];
  for (let offset = 0; ; offset += 500) {
    const page: Item[] = await apify(`/datasets/${dataset}/items?clean=true&offset=${offset}&limit=500`);
    for (const it of page ?? []) if (it?.placeId && it?.title) rows.push(row(it, run.id));
    if (!page || page.length < 500) break;
  }
  const unique = [...new Map(rows.map((r) => [r.place_id, r])).values()];
  for (let i = 0; i < unique.length; i += 200) {
    // keep an earlier outcome (matched/drafted/skipped) if a place is seen again
    const { error } = await db.from("halal_sweep_items").upsert(unique.slice(i, i + 200), { onConflict: "place_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  const result = { items: rows.length, unique: unique.length, strong: unique.filter((r) => r.signal === "strong").length };
  await db.from("halal_sweep_runs").update({ status: "ingested", finished_at: new Date().toISOString(), result }).eq("id", run.id);
  return result;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { data: ok } = await db.rpc("maps_refresh_key_ok", { p_key: req.headers.get("x-refresh-key") ?? "" });
  if (ok !== true) return json({ error: "forbidden" }, 403);
  if (!Deno.env.get("APIFY_TOKEN")) return json({ ok: false, waiting: "APIFY_TOKEN secret is not set" });

  try {
    const body = await req.json().catch(() => ({}));
    const { data: open, error } = await db.from("halal_sweep_runs").select("id, apify_run_id, dataset_id").eq("status", "running");
    if (error) throw error;
    if (open?.length) {
      const report: Record<string, unknown> = {};
      for (const r of open) report[r.apify_run_id] = await ingest(r);
      return json({ ok: true, ...report });
    }
    if (!body?.start) return json({ ok: true, idle: true });

    const searches = AREAS.map(searchFor);
    const input = {
      searchStringsArray: searches,
      maxCrawledPlacesPerSearch: PER_SEARCH,
      language: "en",
      countryCode: "gb",
      maxReviews: 0,
      maxImages: 0,
      scrapePlaceDetailPage: false,
    };
    const res = await apify(`/acts/${ACTOR}/runs?maxTotalChargeUsd=${MAX_CHARGE_USD}`, { method: "POST", body: JSON.stringify(input) });
    const run = res?.data;
    if (!run?.id) throw new Error("Apify did not return a run id");
    const { error: insErr } = await db.from("halal_sweep_runs").insert({ apify_run_id: run.id, dataset_id: run.defaultDatasetId ?? null, searches });
    if (insErr) throw insErr;
    return json({ ok: true, started: run.id, searches: searches.length });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
