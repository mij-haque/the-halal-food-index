import { cache } from "react";
import { supabaseRead } from "@/lib/supabase/server";
import { noEmDash, urls } from "@/lib/site";
import type { Area, Cuisine } from "@/lib/venues";
import type { WeekHours } from "@/lib/hours";
import { NO_FACTS, getPlaceFacts } from "@/lib/place-facts";
import { parsePoint } from "@/lib/geo";

/*
 * Data for the listing template (docs/decisions-update-listing-page.md):
 * the flagship /halal-restaurants-manchester plus area and cuisine pages that
 * reuse it with one facet locked. At current volume every page lists all of
 * its venues on one page (no pagination), and filtering happens in the browser
 * over server-rendered cards.
 */

/** A category page is indexed only once it has at least this many listings. */
export const MIN_LISTINGS_TO_INDEX = 5;

export type ListingVenue = {
  slug: string;
  name: string;
  type: string; // restaurant | cafe | takeaway | bakery
  area: { slug: string; name: string } | null;
  cuisines: Array<{ slug: string; name: string; colour_hex: string }>;
  partialScope: string | null; // set only for partial venues
  /** One short "why go" line for the card (owner-approved). */
  tagline: string | null;
  servesAlcohol: boolean | null;
  /** Google Maps facts (cached by the maps-refresh job). Null when we don't hold them. */
  rating: number | null;
  reviewCount: number | null;
  hours: WeekHours | null;
  lat: number | null;
  lng: number | null;
  publishedAt: string | null;
  /** Last change to the venue row (for sitemap lastmod). */
  updatedAt: string | null;
};

export type Facet = { slug: string; name: string; count: number };

/* ── queries ── */

type Row = {
  slug: string;
  name: string;
  venue_type: string;
  halal_status: string;
  halal_scope: string | null;
  serves_alcohol: boolean | null;
  tagline: string | null;
  location: unknown;
  published_at: string | null;
  updated_at: string | null;
  area: { slug: string; name: string } | null;
  venue_cuisines: Array<{ is_primary: boolean | null; cuisine: Cuisine | null }>;
};

/** Every published venue, ordered A to Z. Deduplicated per request. */
export const getPublishedVenues = cache(async (): Promise<ListingVenue[]> => {
  const [{ data, error }, facts] = await Promise.all([
    supabaseRead()
      .from("venues")
      .select(
        "slug, name, venue_type, halal_status, halal_scope, serves_alcohol, tagline, location, published_at, updated_at, area:areas(slug, name), venue_cuisines(is_primary, cuisine:cuisines(id, slug, name, colour_hex))",
      )
      .eq("status", "published")
      .order("name"),
    getPlaceFacts(),
  ]);
  if (error) throw new Error(`Listing query failed: ${error.message}`);

  return ((data ?? []) as unknown as Row[]).map((r) => {
    const f = facts.get(r.slug) ?? NO_FACTS;
    const point = parsePoint(r.location);
    const cuisines = (r.venue_cuisines ?? [])
      .filter((l) => l.cuisine)
      .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))
      .map((l) => ({ slug: l.cuisine!.slug, name: l.cuisine!.name, colour_hex: l.cuisine!.colour_hex }));
    return {
      slug: r.slug,
      name: r.name,
      type: r.venue_type,
      area: r.area,
      cuisines,
      partialScope: r.halal_status === "partial" && r.halal_scope ? noEmDash(r.halal_scope.trim()) : null,
      servesAlcohol: r.serves_alcohol,
      tagline: r.tagline?.trim() ? noEmDash(r.tagline.trim()) : null,
      rating: f.rating,
      reviewCount: f.reviewCount,
      hours: f.hours,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      publishedAt: r.published_at,
      updatedAt: r.updated_at,
    };
  });
});

export const getArea = cache(async (slug: string): Promise<Area | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data } = await supabaseRead().from("areas").select("id, slug, name, intro").eq("slug", slug).maybeSingle();
  return (data as Area | null) ?? null;
});

export const getCuisine = cache(async (slug: string): Promise<Cuisine | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data } = await supabaseRead().from("cuisines").select("id, slug, name, colour_hex, intro").eq("slug", slug).maybeSingle();
  return (data as Cuisine | null) ?? null;
});

/* ── facets ── */

export function areaFacets(list: ListingVenue[]): Facet[] {
  const m = new Map<string, Facet>();
  for (const v of list) {
    if (!v.area) continue;
    const f = m.get(v.area.slug) ?? { slug: v.area.slug, name: v.area.name, count: 0 };
    f.count++;
    m.set(v.area.slug, f);
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function cuisineFacets(list: ListingVenue[]): Facet[] {
  const m = new Map<string, Facet>();
  for (const v of list) {
    for (const c of v.cuisines) {
      const f = m.get(c.slug) ?? { slug: c.slug, name: c.name, count: 0 };
      f.count++;
      m.set(c.slug, f);
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/* ── category page wording ── */

// "Halal Indian Restaurants in Manchester", but "Halal Brunch in Manchester".
const CUISINE_IS_FOOD = new Set(["brunch", "burgers", "desserts", "pizza", "chicken", "grill", "chai", "fish-and-chips"]);
// A cuisine that is already a kind of place: "Halal Steakhouses in Manchester".
const CUISINE_IS_PLACE: Record<string, string> = { steakhouse: "Steakhouses" };

export function cuisineHeading(c: { slug: string; name: string }): string {
  if (CUISINE_IS_PLACE[c.slug]) return `Halal ${CUISINE_IS_PLACE[c.slug]} in Manchester`;
  return CUISINE_IS_FOOD.has(c.slug) ? `Halal ${c.name} in Manchester` : `Halal ${c.name} Restaurants in Manchester`;
}

/** Plural phrase for descriptions: "halal Indian restaurants", "places for halal brunch". */
export function cuisineDescriptor(c: { slug: string; name: string }): string {
  if (CUISINE_IS_PLACE[c.slug]) return `halal ${CUISINE_IS_PLACE[c.slug].toLowerCase()}`;
  return CUISINE_IS_FOOD.has(c.slug) ? `places for halal ${c.name.toLowerCase()}` : `halal ${c.name} restaurants`;
}

export function areaHeading(a: { slug: string; name: string }): string {
  if (a.slug === "city-centre") return "Halal Food in Manchester City Centre";
  if (a.slug === "trafford-centre") return "Halal Food at the Trafford Centre";
  return `Halal Food in ${a.name}`;
}

export type RelatedLink = { label: string; href: string; count: number };

/** Short chip wording: "Halal brunch in Manchester", "Halal Chinese in Manchester". */
function cuisineChip(c: { slug: string; name: string }): string {
  if (CUISINE_IS_PLACE[c.slug]) return `Halal ${CUISINE_IS_PLACE[c.slug].toLowerCase()} in Manchester`;
  return `Halal ${CUISINE_IS_FOOD.has(c.slug) ? c.name.toLowerCase() : c.name} in Manchester`;
}

function areaChip(a: { slug: string; name: string }): string {
  if (a.slug === "city-centre") return "Halal food in Manchester city centre";
  if (a.slug === "trafford-centre") return "Halal food at the Trafford Centre";
  return `Halal food in ${a.name}`;
}

/** Category pages worth linking to (enough listings to be indexed). */
export function relatedLinks(all: ListingVenue[], exclude?: string): RelatedLink[] {
  const cuisines = cuisineFacets(all)
    .filter((f) => f.count >= MIN_LISTINGS_TO_INDEX)
    .map((f) => ({ label: cuisineChip(f), href: urls.cuisine(f.slug), count: f.count }));
  const areas = areaFacets(all)
    .filter((f) => f.count >= MIN_LISTINGS_TO_INDEX)
    .map((f) => ({ label: areaChip(f), href: urls.area(f.slug), count: f.count }));
  return [...cuisines, ...areas].filter((l) => l.href !== exclude);
}

export function lastUpdated(list: ListingVenue[]): { label: string; iso: string } | null {
  // Latest change to any listed venue (new listing, edited write-up, hours), not just
  // the newest publish date, so the page date moves when its content does.
  const latest = list.reduce<string | null>((m, v) => {
    const d = [v.updatedAt, v.publishedAt].filter((x): x is string => Boolean(x)).sort().pop() ?? null;
    return d && (!m || d > m) ? d : m;
  }, null);
  if (!latest) return null;
  const d = new Date(latest);
  return {
    label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }),
    iso: d.toISOString().slice(0, 10),
  };
}
