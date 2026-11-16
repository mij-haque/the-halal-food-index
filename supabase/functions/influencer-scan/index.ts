// influencer-scan
//
// Reads recent Instagram posts from trusted halal food accounts
// (influencer_sources), records every account they tagged, mentioned or
// co-posted with (influencer_finds), then fetches those accounts' profiles
// (influencer_accounts: name, bio, website, category). Nothing here touches
// venues. The Sunday "HFI weekly new places check" task researches new finds
// and adds real places to the review queue for Mij's OK.
//
// Each call advances one step, so pg_cron can call it a few times:
//   POST {"start": true}  start a posts run (refused if something is running)
//   POST {}               collect any finished run; otherwise start a profiles
//                         run for tagged accounts we haven't looked up yet
//
// Cost: Apify pay-per-result. Hard cap per run below; ~£1-2 a month expected.
// Auth: header x-refresh-key must match the Vault secret "maps_refresh_key".
// Secrets: APIFY_TOKEN.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const APIFY = "https://api.apify.com/v2";
const POSTS_ACTOR = "apify~instagram-post-scraper";
const PROFILE_ACTOR = "apify~instagram-profile-scraper";
const POSTS_PER_ACCOUNT = 30;
const PROFILES_PER_RUN = 80;
const MAX_CHARGE_USD = 0.5; // per Apify run
const FIRST_LOOKBACK = "30 days";

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

const clean = (h: unknown) => String(h ?? "").trim().replace(/^@/, "").toLowerCase();

async function items(datasetId: string): Promise<Item[]> {
  const out: Item[] = [];
  for (let offset = 0; ; offset += 500) {
    const page: Item[] = await apify(`/datasets/${datasetId}/items?clean=true&offset=${offset}&limit=500`);
    out.push(...(page ?? []));
    if (!page || page.length < 500) break;
  }
  return out;
}

async function ingestPosts(run: Item, posts: Item[]) {
  const { data: sources } = await db.from("influencer_sources").select("handle");
  const ours = new Set((sources ?? []).map((s) => s.handle));
  const rows = new Map<string, Item>();
  let postsSeen = 0;
  for (const p of posts) {
    const source = clean(p.ownerUsername);
    if (!ours.has(source) || !p.url) continue;
    postsSeen++;
    const add = (h: unknown, kind: string) => {
      const handle = clean(h);
      if (!handle || ours.has(handle)) return;
      const key = `${handle}|${p.url}`;
      if (!rows.has(key)) {
        rows.set(key, {
          handle, source_handle: source, post_url: p.url,
          post_caption: p.caption ? String(p.caption).slice(0, 2000) : null,
          posted_at: p.timestamp ?? null, location_name: p.locationName ?? null, kind,
        });
      }
    };
    for (const t of p.taggedUsers ?? []) add(t?.username ?? t, "tagged");
    for (const c of p.coauthorProducers ?? []) add(c?.username ?? c, "coauthor");
    for (const m of p.mentions ?? []) add(m, "mention");
  }
  const list = [...rows.values()];
  for (let i = 0; i < list.length; i += 200) {
    const { error } = await db.from("influencer_finds")
      .upsert(list.slice(i, i + 200), { onConflict: "handle,post_url", ignoreDuplicates: true });
    if (error) throw error;
  }
  return { posts: postsSeen, finds: list.length, accounts: new Set(list.map((r) => r.handle)).size };
}

async function ingestProfiles(profiles: Item[]) {
  const rows = profiles.filter((p) => p?.username).map((p) => ({
    handle: clean(p.username),
    full_name: p.fullName ?? null,
    biography: p.biography ?? null,
    external_url: p.externalUrl ?? null,
    category: p.businessCategoryName ?? null,
    is_business: typeof p.isBusinessAccount === "boolean" ? p.isBusinessAccount : null,
    followers: typeof p.followersCount === "number" ? p.followersCount : null,
    profile: {
      address: p.businessAddress ?? null, city: p.city ?? null, zip: p.zip ?? null,
      phone: p.businessPhoneNumber ?? p.contactPhoneNumber ?? null,
      email: p.businessEmail ?? null, private: p.private ?? null, verified: p.verified ?? null,
    },
    fetched_at: new Date().toISOString(),
  }));
  if (rows.length) {
    const { error } = await db.from("influencer_accounts").upsert(rows, { onConflict: "handle" });
    if (error) throw error;
  }
  return { profiles: rows.length };
}

async function collect(run: Item) {
  const info = await apify(`/actor-runs/${run.apify_run_id}`);
  const status = info?.data?.status;
  if (status !== "SUCCEEDED" && status !== "ABORTED") {
    if (["FAILED", "TIMED-OUT", "TIMED_OUT"].includes(status)) {
      await db.from("influencer_scan_runs").update({ status: "failed", finished_at: new Date().toISOString(), result: { apify_status: status } }).eq("id", run.id);
      return { failed: status };
    }
    return { waiting: status };
  }
  const data = await items(run.dataset_id ?? info.data.defaultDatasetId);
  const result = run.kind === "posts" ? await ingestPosts(run, data) : await ingestProfiles(data);
  await db.from("influencer_scan_runs").update({ status: "ingested", finished_at: new Date().toISOString(), result }).eq("id", run.id);
  return { kind: run.kind, ...result };
}

async function startRun(kind: "posts" | "profiles", actor: string, input: unknown, requested: unknown) {
  const res = await apify(`/acts/${actor}/runs?maxTotalChargeUsd=${MAX_CHARGE_USD}`, { method: "POST", body: JSON.stringify(input) });
  const run = res?.data;
  if (!run?.id) throw new Error("Apify did not return a run id");
  const { error } = await db.from("influencer_scan_runs").insert({ kind, apify_run_id: run.id, dataset_id: run.defaultDatasetId ?? null, requested });
  if (error) throw error;
  return { started: kind, run: run.id };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { data: ok } = await db.rpc("maps_refresh_key_ok", { p_key: req.headers.get("x-refresh-key") ?? "" });
  if (ok !== true) return json({ error: "forbidden" }, 403);
  if (!Deno.env.get("APIFY_TOKEN")) return json({ ok: false, waiting: "APIFY_TOKEN secret is not set" });

  try {
    const body = await req.json().catch(() => ({}));

    // 1. Collect anything that is still marked running.
    const { data: open, error } = await db.from("influencer_scan_runs").select("*").eq("status", "running");
    if (error) throw error;
    if (open?.length) {
      const report = [];
      for (const r of open) report.push(await collect(r));
      return json({ ok: true, collected: report });
    }

    // 2. Start a posts run when asked.
    if (body?.start) {
      const { data: sources } = await db.from("influencer_sources").select("handle").eq("active", true).eq("platform", "instagram");
      const handles = (sources ?? []).map((s) => s.handle);
      if (!handles.length) return json({ ok: true, idle: "no active Instagram sources" });
      const { data: last } = await db.from("influencer_scan_runs").select("started_at")
        .eq("kind", "posts").eq("status", "ingested").order("started_at", { ascending: false }).limit(1);
      const since = last?.[0]
        ? new Date(new Date(last[0].started_at).getTime() - 864e5).toISOString().slice(0, 10)
        : FIRST_LOOKBACK;
      const input = { username: handles, resultsLimit: POSTS_PER_ACCOUNT, onlyPostsNewerThan: since, skipPinnedPosts: true };
      return json({ ok: true, ...(await startRun("posts", POSTS_ACTOR, input, { handles, since })) });
    }

    // 3. Otherwise look up profiles for tagged accounts we haven't seen.
    const { data: todo, error: tErr } = await db.rpc("influencer_profiles_due", { p_limit: PROFILES_PER_RUN });
    if (tErr) throw tErr;
    const handles = (todo ?? []).map((t: { handle: string }) => t.handle);
    if (!handles.length) return json({ ok: true, idle: true });
    return json({ ok: true, ...(await startRun("profiles", PROFILE_ACTOR, { usernames: handles }, { handles })) });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message ?? e) }, 500);
  }
});
