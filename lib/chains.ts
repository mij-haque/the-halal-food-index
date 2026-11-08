import { cache } from "react";
import { supabaseRead } from "@/lib/supabase/server";
import { parsePoint } from "@/lib/geo";

/*
 * Chain pages ("Is KFC halal?"), design/chain-nandos-v12.html.
 *
 * A chain's status comes from the chain's own published halal statement, and a
 * branch's status from the chain's own branch page (decisions-update-no-certification).
 * A chain page is live in production only when chains.published is true (owner
 * sign-off); preview deployments show it regardless so it can be reviewed.
 */

export type ChainStatus = "halal" | "partial" | "not_halal" | "unknown";

export type ChainItem = { label: string; status: ChainStatus; note: string | null };

export type Branch = {
  id: string;
  name: string;
  status: ChainStatus;
  town: string | null;
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  sourceUrl: string | null;
};

export type Chain = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  ukStatus: ChainStatus;
  summary: string | null;
  servesAlcohol: boolean | null;
  statementUrl: string | null;
  certifier: string | null;
  /** Chain-specific line for the halal caveat box, from its own statement. */
  caveat: string | null;
  reviewedAt: string | null;
  published: boolean;
  items: ChainItem[];
  branches: Branch[];
};

type Row = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  uk_status: ChainStatus;
  status_summary: string | null;
  serves_alcohol: boolean | null;
  statement_url: string | null;
  certifier: string | null;
  caveat: string | null;
  last_reviewed_at: string | null;
  published: boolean;
  chain_items: Array<{ item_label: string; status: ChainStatus; note: string | null; sort_order: number | null }>;
  chain_branch_status: Array<{
    id: string;
    branch_name: string;
    status: ChainStatus;
    town: string | null;
    address_line: string | null;
    postcode: string | null;
    location: unknown;
    source_url: string | null;
  }>;
};

const SELECT = `id, slug, name, website, uk_status, status_summary, serves_alcohol, statement_url, certifier, caveat,
  last_reviewed_at, published,
  chain_items(item_label, status, note, sort_order),
  chain_branch_status(id, branch_name, status, town, address_line, postcode, location, source_url)`;

/** True on Vercel production only. Previews and local dev show unpublished chains. */
export const isProduction = () => process.env.VERCEL_ENV === "production";

export const getChain = cache(async (slug: string): Promise<Chain | null> => {
  const { data, error } = await supabaseRead().from("chains").select(SELECT).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const r = data as unknown as Row;
  if (!r.published && isProduction()) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    website: r.website,
    ukStatus: r.uk_status,
    summary: r.status_summary,
    servesAlcohol: r.serves_alcohol,
    statementUrl: r.statement_url,
    certifier: r.certifier,
    caveat: r.caveat,
    reviewedAt: r.last_reviewed_at,
    published: r.published,
    items: [...(r.chain_items ?? [])]
      .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
      .map((i) => ({ label: i.item_label, status: i.status, note: i.note })),
    branches: (r.chain_branch_status ?? [])
      .map((b) => {
        const p = parsePoint(b.location);
        return {
          id: b.id,
          name: b.branch_name,
          status: b.status,
          town: b.town,
          address: b.address_line,
          postcode: b.postcode,
          lat: p?.lat ?? null,
          lng: p?.lng ?? null,
          sourceUrl: b.source_url,
        };
      })
      .sort((a, b) => (a.town ?? "").localeCompare(b.town ?? "") || a.name.localeCompare(b.name)),
  };
});

/** Published chains, for the sitemap. */
export const getPublishedChains = cache(async (): Promise<Array<{ slug: string; reviewedAt: string | null }>> => {
  const { data, error } = await supabaseRead().from("chains").select("slug, last_reviewed_at").eq("published", true);
  if (error || !data) return [];
  return (data as Array<{ slug: string; last_reviewed_at: string | null }>).map((c) => ({ slug: c.slug, reviewedAt: c.last_reviewed_at }));
});

/** "partly halal", "halal", "not halal": the verdict word for the answer line. */
export function verdictWord(s: ChainStatus): string {
  return s === "halal" ? "halal" : s === "partial" ? "partly halal" : s === "not_halal" ? "not halal" : "not confirmed as halal";
}

/** Directions to a branch on Google Maps. */
export function branchDirections(chainName: string, b: Branch): string {
  const q = encodeURIComponent([`${chainName} ${b.name}`, b.address, b.postcode].filter(Boolean).join(", "));
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
