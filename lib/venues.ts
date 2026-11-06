import { cache } from "react";
import { supabaseRead } from "@/lib/supabase/server";
import { noEmDash } from "@/lib/site";
import type { WeekHours } from "@/lib/hours";
import { NO_FACTS, getPlaceFacts } from "@/lib/place-facts";
import { parsePoint, type LatLng } from "@/lib/geo";

/* ── types ── */

export type Cuisine = { id: string; slug: string; name: string; colour_hex: string };
export type Area = { id: string; slug: string; name: string };

export type Venue = {
  id: string;
  slug: string;
  name: string;
  venue_type: string;
  address_line: string | null;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  price_band: string | null;
  halal_status: string;
  halal_scope: string | null;
  serves_alcohol: boolean | null;
  shared_kitchen: boolean | null;
  verification_tier: string;
  tags: string[];
  summary: string | null;
  google_place_id: string | null;
  published_at: string | null;
  updated_at: string | null;
  area: Area | null;
  cuisines: Cuisine[]; // primary first
  /** Map point, when we hold one. */
  point: LatLng | null;
  /** Google Maps facts (maps-refresh job). Null when we don't hold them. */
  rating: number | null;
  reviewCount: number | null;
  hours: WeekHours | null;
};

export type VenueTile = {
  slug: string;
  name: string;
  areaName: string | null;
  cuisine: Cuisine | null;
};

/* ── queries (anon key, RLS: published venues only) ── */

const VENUE_SELECT = `
  id, slug, name, venue_type, address_line, postcode, phone, website, price_band,
  halal_status, halal_scope, serves_alcohol, shared_kitchen, verification_tier, tags,
  summary, google_place_id, published_at, updated_at, location,
  area:areas(id, slug, name),
  venue_cuisines(is_primary, cuisine:cuisines(id, slug, name, colour_hex))
`;

const TILE_SELECT = `
  id, slug, name,
  area:areas(name),
  venue_cuisines(is_primary, cuisine:cuisines(id, slug, name, colour_hex))
`;

type CuisineLink = { is_primary: boolean | null; cuisine: Cuisine | null };

function orderedCuisines(links: CuisineLink[] | null | undefined): Cuisine[] {
  return (links ?? [])
    .filter((l): l is { is_primary: boolean | null; cuisine: Cuisine } => Boolean(l.cuisine))
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))
    .map((l) => l.cuisine);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** One published venue by slug, or null. Deduplicated per request. */
export const getVenue = cache(async (slug: string): Promise<Venue | null> => {
  if (!SLUG_RE.test(slug) || slug.length > 120) return null;
  const [{ data, error }, facts] = await Promise.all([
    supabaseRead().from("venues").select(VENUE_SELECT).eq("slug", slug).eq("status", "published").maybeSingle(),
    getPlaceFacts(),
  ]);
  if (error) throw new Error(`Venue query failed: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as Omit<Venue, "cuisines" | "point" | "rating" | "reviewCount" | "hours"> & {
    venue_cuisines: CuisineLink[];
    location: unknown;
  };
  const { venue_cuisines, location, ...rest } = row;
  return {
    ...rest,
    tags: rest.tags ?? [],
    cuisines: orderedCuisines(venue_cuisines),
    point: parsePoint(location),
    ...(facts.get(rest.slug) ?? NO_FACTS),
  };
});

type TileRow = { id: string; slug: string; name: string; area: { name: string } | null; venue_cuisines: CuisineLink[] };

function toTile(r: TileRow): VenueTile {
  return { slug: r.slug, name: r.name, areaName: r.area?.name ?? null, cuisine: orderedCuisines(r.venue_cuisines)[0] ?? null };
}

/**
 * Up to `limit` similar published venues: same area first (same cuisine at the
 * top), then the same cuisine elsewhere.
 */
export const getSimilarVenues = cache(async (venue: Venue, limit = 8): Promise<VenueTile[]> => {
  const sb = supabaseRead();
  const primary = venue.cuisines[0] ?? null;

  const [sameArea, sameCuisine] = await Promise.all([
    venue.area
      ? sb
          .from("venues")
          .select(TILE_SELECT)
          .eq("status", "published")
          .eq("area_id", venue.area.id)
          .neq("id", venue.id)
          .order("name")
          .limit(24)
      : Promise.resolve({ data: [] as unknown[], error: null }),
    primary
      ? sb
          .from("venues")
          .select(`${TILE_SELECT}, vc:venue_cuisines!inner(cuisine_id)`)
          .eq("status", "published")
          .eq("vc.cuisine_id", primary.id)
          .neq("id", venue.id)
          .order("name")
          .limit(24)
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ]);

  const areaRows = ((sameArea.data ?? []) as unknown as TileRow[]).map(toTile);
  const cuisineRows = ((sameCuisine.data ?? []) as unknown as TileRow[]).map(toTile);

  const sameBoth = primary ? areaRows.filter((t) => t.cuisine?.id === primary.id) : [];
  const ordered = [...sameBoth, ...areaRows, ...cuisineRows];

  const seen = new Set<string>();
  const out: VenueTile[] = [];
  for (const t of ordered) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    out.push(t);
    if (out.length === limit) break;
  }
  return out;
});

/** Number of published venues, for the menu footer. */
export const getPublishedCount = cache(async (): Promise<number | null> => {
  try {
    const { count, error } = await supabaseRead()
      .from("venues")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    return error ? null : count;
  } catch {
    return null;
  }
});

/* ── copy helpers (plain English, no em-dashes, no "verified/checked/certified") ── */

const TYPE_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  takeaway: "Takeaway",
  bakery: "Bakery",
  dessert: "Dessert shop",
};

export function typeLabel(venueType: string): string {
  return TYPE_LABEL[venueType] ?? "Restaurant";
}

// "a halal burger takeaway", not "a halal burgers takeaway"
const CUISINE_ADJECTIVE: Record<string, string> = { burgers: "burger", desserts: "dessert" };

export function cuisineAdjective(c: Cuisine | null | undefined): string | null {
  if (!c) return null;
  return CUISINE_ADJECTIVE[c.slug] ?? c.name;
}

/** "in Rusholme", "in Manchester city centre", "at the Trafford Centre". */
export function placePhrase(area: Area | null): string {
  if (!area) return "in Greater Manchester";
  if (area.slug === "city-centre") return "in Manchester city centre";
  if (area.slug === "trafford-centre") return "at the Trafford Centre";
  return `in ${area.name}`;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

export function isPartial(v: Venue): boolean {
  return v.halal_status === "partial";
}

/** The hero sentence. Describes the venue as halal in ordinary words, no badge. */
export function quotableAnswer(v: Venue): string {
  const kind = [cuisineAdjective(v.cuisines[0]), typeLabel(v.venue_type).toLowerCase()].filter(Boolean).join(" ");
  const place = placePhrase(v.area);
  let s = isPartial(v)
    ? `${v.name} is ${article(kind)} ${kind} ${place}.${v.halal_scope ? ` ${v.halal_scope.trim()}` : ""}`
    : `${v.name} is a halal ${kind} ${place}.`;
  if (v.serves_alcohol === true) s += " It serves alcohol.";
  if (v.serves_alcohol === false) s += " No alcohol is served.";
  return noEmDash(s.replace(/\.\./g, "."));
}

export function summaryText(v: Venue): string | null {
  return v.summary ? noEmDash(v.summary.trim()) : null;
}

/** UK numbers to E.164 for tel: links and JSON-LD. */
export function telHref(phone: string): string {
  const raw = phone.replace(/[^\d+]/g, "");
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("44")) return `+${raw}`;
  if (raw.startsWith("0")) return `+44${raw.slice(1)}`;
  return raw;
}

export function fullAddress(v: Venue): string {
  return [v.address_line, v.postcode].filter(Boolean).join(", ");
}

/** Google Maps directions to the venue. `mode` picks the travel mode (Google's default otherwise). */
export function directionsHref(v: Venue, mode?: "transit" | "walking" | "driving"): string {
  const dest = encodeURIComponent([v.name, v.address_line, v.postcode].filter(Boolean).join(", "));
  const pid = v.google_place_id ? `&destination_place_id=${encodeURIComponent(v.google_place_id)}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${pid}${mode ? `&travelmode=${mode}` : ""}`;
}

/** The venue on Google Maps (its own place page when we hold the place ID). */
export function mapsHref(v: Venue): string {
  const q = encodeURIComponent([v.name, v.address_line, v.postcode].filter(Boolean).join(", "));
  const pid = v.google_place_id ? `&query_place_id=${encodeURIComponent(v.google_place_id)}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${q}${pid}`;
}

export function listedMonth(iso: string | null): { label: string; iso: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" }),
    iso: d.toISOString().slice(0, 10),
  };
}

/** Only real http(s) links are rendered. */
export function safeWebsite(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
