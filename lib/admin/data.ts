import type { SupabaseClient } from "@supabase/supabase-js";

/* Reads for the admin. Every query runs as the signed-in admin (RLS applies). */

export type Light = "ok" | "due" | "bad";
export type Job = { name: string; light: Light; status: string; when: string };

const HOUR = 36e5;
const fmt = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })
    : "never";

export async function getJobs(db: SupabaseClient): Promise<Job[]> {
  const [maps, ping, sweep] = await Promise.all([
    db.from("maps_refresh_runs").select("status, started_at, result").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("indexnow_pings").select("pinged_at, url_count").order("pinged_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("halal_sweep_runs").select("status, started_at, result").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const age = (iso?: string | null) => (iso ? (Date.now() - new Date(iso).getTime()) / HOUR : Infinity);

  const m = maps.data as { status: string; started_at: string; result: Record<string, unknown> | null } | null;
  const mFailed = Array.isArray(m?.result?.failed) ? (m!.result!.failed as unknown[]).length : 0;
  const mapsJob: Job = {
    name: "Google Maps refresh",
    light: !m || m.status === "failed" ? "bad" : age(m.started_at) > 30 ? "due" : mFailed ? "due" : "ok",
    status: m ? (m.status === "failed" ? "Last run failed" : `${m.result?.saved ?? 0} places updated${mFailed ? `, ${mFailed} failed` : ""}`) : "Not run yet",
    when: `Ran ${fmt(m?.started_at)}`,
  };

  const p = ping.data as { pinged_at: string; url_count: number } | null;
  const pingJob: Job = {
    name: "Search engine ping",
    light: !p ? "due" : age(p.pinged_at) > 72 ? "due" : "ok",
    status: p ? `${p.url_count} pages sent to Bing` : "Nothing sent yet",
    when: `Sent ${fmt(p?.pinged_at)}`,
  };

  const s = sweep.data as { status: string; started_at: string; result: Record<string, unknown> | null } | null;
  const sweepJob: Job = {
    name: "Halal sweep",
    light: !s ? "due" : s.status === "failed" ? "bad" : age(s.started_at) > 24 * 92 ? "due" : "ok",
    status: s ? `${s.result?.unique ?? 0} places checked` : "Not run yet",
    when: `Ran ${fmt(s?.started_at)}`,
  };

  const influencer: Job = { name: "Influencer scan", light: "due", status: "Not set up yet", when: "Coming next" };
  return [mapsJob, pingJob, sweepJob, influencer];
}

export type Dot = { key: string; label: string; state: "done" | "missing" | "problem" };
export type ReviewRow = {
  id: string;
  name: string;
  meta: string;
  area: string;
  source: string;
  evidence: string;
  origin: "you" | "sweep" | "backlog" | "influencer";
  alcohol: boolean | null;
  placeId: string | null;
  partial: string | null;
  dots: Dot[];
  score: number;
};

type Cache = { provider: string; payload: Record<string, unknown> | null };
type VenueRow = {
  id: string;
  name: string;
  venue_type: string | null;
  halal_status: string | null;
  halal_scope: string | null;
  serves_alcohol: boolean | null;
  google_place_id: string | null;
  summary: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  areas: { name: string } | null;
  venue_cuisines: { cuisines: { name: string } | null }[] | null;
  external_place_cache: Cache[] | null;
};

const TYPE: Record<string, string> = { restaurant: "Restaurant", cafe: "Cafe", takeaway: "Takeaway", bakery: "Bakery" };

export function venueDots(v: VenueRow): Dot[] {
  const caches = v.external_place_cache ?? [];
  const g = (caches.find((c) => c.provider === "google") ?? caches[0])?.payload ?? {};
  const closed = g.permanently_closed === true || g.temporarily_closed === true;
  const summaryLen = (v.summary ?? "").trim().length;
  return [
    { key: "halal", label: "Halal", state: v.halal_status === "halal" || v.halal_status === "partial" ? "done" : "missing" },
    { key: "google", label: "Google match", state: closed ? "problem" : v.google_place_id && g.hours_checked_at ? "done" : "missing" },
    { key: "food", label: "Food type", state: (v.venue_cuisines ?? []).length ? "done" : "missing" },
    { key: "hours", label: "Hours", state: g.hours ? "done" : "missing" },
    { key: "alcohol", label: "Alcohol", state: v.serves_alcohol === null ? "missing" : "done" },
    { key: "writeup", label: "Write-up", state: summaryLen >= 160 ? "done" : "missing" },
  ];
}

export async function getReviewRows(db: SupabaseClient): Promise<ReviewRow[]> {
  const { data, error } = await db
    .from("venues")
    .select(
      "id, name, venue_type, halal_status, halal_scope, serves_alcohol, google_place_id, summary, phone, website, created_at, areas(name), venue_cuisines(cuisines(name)), external_place_cache(provider, payload)",
    )
    .eq("status", "review")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as VenueRow[]).map((v) => {
    const caches = v.external_place_cache ?? [];
    const payloads = caches.map((c) => c.payload ?? {});
    const evidence = (payloads.map((p) => p.halal_evidence).find(Boolean) as string | undefined) ?? "";
    const sweep = payloads.find((p) => p.source === "halal-sweep");
    const fromInfluencer = payloads.find((p) => p.source === "influencer");
    const origin: ReviewRow["origin"] = fromInfluencer
      ? "influencer"
      : sweep
        ? new Date(v.created_at) < new Date(String(sweep.fetched ?? v.created_at))
          ? "backlog"
          : "sweep"
        : "you";
    const source =
      origin === "influencer"
        ? `Spotted by @${String(fromInfluencer?.influencer ?? "")}`
        : origin === "sweep"
          ? "Google halal label"
          : origin === "backlog"
            ? "From backlog, Google halal label"
            : "Sent by you";
    const cuisines = (v.venue_cuisines ?? []).map((c) => c.cuisines?.name).filter(Boolean).join(", ");
    const area = v.areas?.name ?? "";
    const dots = venueDots(v);
    return {
      id: v.id,
      name: v.name,
      area,
      meta: [area, cuisines || "no food type yet", TYPE[v.venue_type ?? ""] ?? ""].filter(Boolean).join(" · "),
      source,
      evidence,
      origin,
      alcohol: v.serves_alcohol,
      placeId: v.google_place_id,
      partial: v.halal_status === "partial" ? v.halal_scope : null,
      dots,
      score: dots.filter((d) => d.state === "done").length,
    };
  });
}

export async function getCounts(db: SupabaseClient) {
  const count = async (status: string) =>
    (await db.from("venues").select("id", { count: "exact", head: true }).eq("status", status)).count ?? 0;
  const [review, published, draft] = await Promise.all([count("review"), count("published"), count("draft")]);
  return { review, published, draft };
}
