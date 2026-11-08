import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { VenueView, venueMetadata } from "@/components/venue/venue-view";
import { ListingView, listingMetadata } from "@/components/listing/listing-view";
import { getSimilarVenues, getVenue } from "@/lib/venues";
import {
  MIN_LISTINGS_TO_INDEX,
  areaHeading,
  cuisineDescriptor,
  cuisineFacets,
  cuisineHeading,
  getArea,
  getCuisine,
  getPublishedVenues,
} from "@/lib/listings";
import { urls } from "@/lib/site";
import { ChainView, chainMetadata } from "@/components/chain/chain-view";
import { getChain } from "@/lib/chains";
import type { VenueTile } from "@/lib/venues";

/*
 * One flat route for three kinds of page (URL patterns in lib/site.ts):
 *   /halal-restaurants-{area}-manchester   area listing
 *   /halal-{cuisine}-manchester            cuisine listing
 *   /is-{chain}-halal                      chain status page (published only on production)
 *   /{venue-slug}                          venue page (published only)
 * Anything else is a 404.
 */

export const revalidate = 600;

// No pages are built ahead of time, but returning a list (even an empty one)
// makes Next.js cache each page after its first visit and refresh it every
// `revalidate` seconds (ISR). Without this the route renders on every request.
export const dynamicParams = true;
export async function generateStaticParams(): Promise<Props["params"][]> {
  return [];
}

type Props = { params: { slug: string } };

const AREA_RE = /^halal-restaurants-([a-z0-9-]+)-manchester$/;
const CUISINE_RE = /^halal-([a-z0-9-]+)-manchester$/;
const CHAIN_RE = /^is-([a-z0-9-]+)-halal$/;

const resolve = cache(async (slug: string) => {
  const am = AREA_RE.exec(slug);
  if (am) {
    const area = await getArea(am[1]);
    if (area) {
      const all = await getPublishedVenues();
      const venues = all.filter((v) => v.area?.slug === area.slug);
      if (venues.length) return { kind: "area" as const, area, venues, all };
    }
  }
  const cm = CUISINE_RE.exec(slug);
  if (cm) {
    const cuisine = await getCuisine(cm[1]);
    if (cuisine) {
      const all = await getPublishedVenues();
      const venues = all.filter((v) => v.cuisines.some((c) => c.slug === cuisine.slug));
      if (venues.length) return { kind: "cuisine" as const, cuisine, venues, all };
    }
  }
  const chm = CHAIN_RE.exec(slug);
  if (chm) {
    const chain = await getChain(chm[1]);
    if (chain) return { kind: "chain" as const, chain };
  }
  const venue = await getVenue(slug);
  return venue ? { kind: "venue" as const, venue } : null;
});

function areaLede(name: string) {
  return `Halal restaurants, cafés and takeaways in ${name}. Every place here says it serves halal food, or is featured by a trusted local halal food guide.`;
}

function cuisineLede(c: { slug: string; name: string }) {
  const d = cuisineDescriptor(c);
  return `${d.charAt(0).toUpperCase()}${d.slice(1)} across Greater Manchester. Every place here says it serves halal food, or is featured by a trusted local halal food guide.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params.slug);
  if (!r) return { title: "Page not found", robots: { index: false, follow: true } };
  if (r.kind === "venue") return venueMetadata(r.venue);
  if (r.kind === "chain") return chainMetadata(r.chain);
  if (r.kind === "area") {
    const heading = areaHeading(r.area);
    return listingMetadata({
      path: urls.area(r.area.slug),
      title: heading,
      description: `${r.venues.length} halal ${r.venues.length === 1 ? "place" : "places"} in ${r.area.name}: restaurants, cafés and takeaways that say they serve halal food.`,
      count: r.venues.length,
    });
  }
  const heading = cuisineHeading(r.cuisine);
  return listingMetadata({
    path: urls.cuisine(r.cuisine.slug),
    title: heading,
    description: `${r.venues.length} ${cuisineDescriptor(r.cuisine)} across Greater Manchester. Every place says it serves halal food, or is featured by a trusted local halal guide.`,
    count: r.venues.length,
  });
}

export default async function SlugPage({ params }: Props) {
  const r = await resolve(params.slug);
  if (!r) notFound();

  if (r.kind === "venue") {
    const [similar, all] = await Promise.all([getSimilarVenues(r.venue), getPublishedVenues()]);
    // Link a cuisine only when its listing page is indexable (enough listings).
    const linkedCuisines = cuisineFacets(all)
      .filter((f) => f.count >= MIN_LISTINGS_TO_INDEX)
      .map((f) => f.slug);
    return <VenueView v={r.venue} similar={similar} linkedCuisines={linkedCuisines} />;
  }

  if (r.kind === "chain") {
    // Halal burger and chicken places whose whole menu is halal, as alternatives.
    const all = await getPublishedVenues();
    const similar: VenueTile[] = all
      .filter((v) => !v.partialScope && v.cuisines.some((c) => c.slug === "burgers"))
      .slice(0, 8)
      .map((v) => ({
        slug: v.slug,
        name: v.name,
        areaName: v.area?.name ?? null,
        cuisine: v.cuisines[0] ? { id: v.cuisines[0].slug, ...v.cuisines[0] } : null,
      }));
    return <ChainView c={r.chain} similar={similar} />;
  }

  const flagship = { name: "Halal Restaurants in Manchester", href: urls.flagship() };

  if (r.kind === "area") {
    const heading = areaHeading(r.area);
    return (
      <ListingView
        path={urls.area(r.area.slug)}
        heading={heading}
        lede={r.area.intro?.trim() || areaLede(r.area.name)}
        crumbs={[flagship, { name: r.area.name, href: urls.area(r.area.slug) }]}
        venues={r.venues}
        allVenues={r.all}
        locked="area"
        placeName={r.area.slug === "city-centre" ? "Manchester city centre" : r.area.name}
      />
    );
  }

  const heading = cuisineHeading(r.cuisine);
  return (
    <ListingView
      path={urls.cuisine(r.cuisine.slug)}
      heading={heading}
      lede={r.cuisine.intro?.trim() || cuisineLede(r.cuisine)}
      crumbs={[flagship, { name: r.cuisine.name, href: urls.cuisine(r.cuisine.slug) }]}
      venues={r.venues}
      allVenues={r.all}
      locked="cuisine"
    />
  );
}
