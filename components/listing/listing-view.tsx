import type { Metadata } from "next";
import Link from "next/link";
import { venueArt, zellijPattern } from "@/lib/art";
import { SITE_NAME, SITE_URL, absolute, urls } from "@/lib/site";
import {
  MIN_LISTINGS_TO_INDEX,
  areaFacets,
  cuisineFacets,
  lastUpdated,
  relatedLinks,
  type ListingVenue,
} from "@/lib/listings";
import { ListingExplorer } from "@/components/listing/listing-explorer";
import { GREATER_MANCHESTER, ORG_ID, WEBSITE_ID, breadcrumbNode, jsonLdHtml, organizationNode, placeNode, websiteNode } from "@/lib/schema";

/*
 * Listing template (design/listing-manchester.html). The flagship page and
 * every area/cuisine page render through this with at most one facet locked;
 * a locked facet never shows its own filter (locked-facet rule).
 * No-certification decision applied: no halal pill on cards, partial venues
 * keep their scope line, no "verified/checked" claims in the copy.
 */

export type ListingPageProps = {
  path: string; // e.g. /halal-restaurants-manchester
  heading: string; // H1
  lede: string;
  crumbs: Array<{ name: string; href: string }>; // excluding Home, last one is this page
  venues: ListingVenue[]; // venues on this page
  allVenues: ListingVenue[]; // every published venue, for related links
  locked?: "area" | "cuisine" | "both";
  /** The part of Greater Manchester this page covers, for structured data (area pages). */
  placeName?: string;
};

export function listingMetadata(p: { path: string; title: string; description: string; count: number; alwaysIndex?: boolean }): Metadata {
  const url = absolute(p.path);
  const index = p.alwaysIndex || p.count >= MIN_LISTINGS_TO_INDEX;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: p.title, description: p.description, siteName: SITE_NAME, locale: "en_GB" },
    twitter: { card: "summary", title: p.title, description: p.description },
    other: { "theme-color": "#0B6B45" },
  };
}

function jsonLd(p: ListingPageProps) {
  const url = absolute(p.path);
  const crumbs = [{ name: "Home", item: `${SITE_URL}/` }, ...p.crumbs.map((c) => ({ name: c.name, item: absolute(c.href) }))];
  const updated = lastUpdated(p.venues);
  return [
    organizationNode(),
    websiteNode(),
    breadcrumbNode(url, crumbs),
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: p.heading,
      description: p.lede,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#items` },
      spatialCoverage: p.placeName ? placeNode(p.placeName) : GREATER_MANCHESTER,
      ...(updated ? { dateModified: updated.iso } : {}),
      inLanguage: "en-GB",
    },
    {
      // Google's summary-page pattern: position + url only, every item on the page
      "@type": "ItemList",
      "@id": `${url}#items`,
      name: p.heading,
      numberOfItems: p.venues.length,
      itemListElement: p.venues.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(urls.venue(v.slug)) })),
    },
  ];
}

export function ListingView(p: ListingPageProps) {
  const updated = lastUpdated(p.venues);
  const related = relatedLinks(p.allVenues, p.path);

  // One pattern per art treatment used on the page; cards reference them by id.
  const arts = new Map<string, string>();
  for (const v of p.venues) {
    const a = venueArt(v.slug, v.cuisines[0]);
    if (!arts.has(a.key)) arts.set(a.key, zellijPattern(a));
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd(p)) }} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: `<svg width="0" height="0" focusable="false"><defs>${[...arts.values()].join("")}</defs></svg>` }}
      />

      {/* ── hero ── */}
      <section className="border-b border-hfi-hair bg-hfi-band px-7 pb-[30px] pt-[34px] max-[640px]:px-5 max-[640px]:pb-6 max-[640px]:pt-[26px]">
        <div className="mx-auto max-w-[1180px]">
          <nav className="mb-4 flex flex-wrap items-center gap-[7px] text-[12.5px] text-hfi-t3" aria-label="Breadcrumb">
            <Link href={urls.home()} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
              Home
            </Link>
            {p.crumbs.map((c, i) => (
              <span key={c.href} className="contents">
                <span aria-hidden="true">/</span>
                {i === p.crumbs.length - 1 ? (
                  <span aria-current="page" className="font-semibold text-hfi-t2">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
                    {c.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <h1 className="hfi-display-xl">{p.heading}</h1>
          <p className="mt-[14px] max-w-[640px] text-[15px] leading-[1.62] text-hfi-t2">{p.lede}</p>
          <div className="mt-[18px] flex flex-wrap items-center gap-2.5 text-[12.5px] text-hfi-t3">
            <span>
              <b className="font-bold text-hfi-ink">{p.venues.length}</b> {p.venues.length === 1 ? "listing" : "listings"}
            </span>
            {updated && (
              <>
                <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-hfi-t3" aria-hidden="true" />
                <span>
                  Last updated <time dateTime={updated.iso}>{updated.label}</time>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      <ListingExplorer
        venues={p.venues}
        areas={p.locked === "area" || p.locked === "both" ? [] : areaFacets(p.venues)}
        cuisines={p.locked === "cuisine" || p.locked === "both" ? [] : cuisineFacets(p.venues)}
        showScopeFilter={p.venues.some((v) => v.partialScope)}
      />

      {related.length > 0 && (
        <section className="hfi-band border-t border-hfi-hair bg-hfi-band px-7 py-[44px] max-[640px]:px-5 max-[640px]:py-[34px]">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="mb-[22px] font-display text-[22px] font-extrabold leading-[1.15] tracking-[-.7px] [font-variation-settings:'opsz'_28]">
              Looking for something specific?
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="inline-flex min-h-11 items-center gap-[9px] rounded-full border border-hfi-border bg-hfi-surface px-[19px] text-sm font-semibold transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-hfi-ink hover:shadow-[0_3px_10px_rgba(15,15,15,.06)] motion-reduce:hover:translate-y-0"
                >
                  {r.label}
                  <em className="text-xs font-bold not-italic text-hfi-t3">{r.count}</em>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
