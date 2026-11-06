import { SITE_NAME, SITE_URL, SOCIAL_PROFILES, absolute } from "@/lib/site";

/*
 * Shared JSON-LD nodes. Every page carries the same Organization and WebSite
 * nodes (same @id), so Google and AI tools see one consistent entity.
 *
 * Rules (CLAUDE.md, docs/decisions.md):
 * - Structured data only says what the page shows.
 * - No FAQPage (Google stopped showing FAQ results in May 2026), no
 *   aggregateRating from Google reviews, no founder or personal names.
 * - ItemList entries carry position + url only.
 */

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;

export const SITE_DESCRIPTION = "A guide to halal restaurants, cafes and takeaways across Greater Manchester.";

export const GREATER_MANCHESTER = { "@type": "AdministrativeArea", name: "Greater Manchester" } as const;

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: "thehalalfoodindex.co.uk",
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", "@id": LOGO_ID, url: absolute("/logo.png"), contentUrl: absolute("/logo.png"), width: 512, height: 512, caption: SITE_NAME },
    image: { "@id": LOGO_ID },
    description: SITE_DESCRIPTION,
    areaServed: GREATER_MANCHESTER,
    knowsAbout: ["Halal food", "Halal restaurants in Greater Manchester"],
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: "thehalalfoodindex.co.uk",
    description: SITE_DESCRIPTION,
    inLanguage: "en-GB",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbNode(pageUrl: string, crumbs: Array<{ name: string; item: string }>) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  };
}

/** A named part of Greater Manchester ("Rusholme", "Manchester city centre"). */
export function placeNode(name: string) {
  return { "@type": "Place", name, containedInPlace: GREATER_MANCHESTER };
}

/** Safe to drop into a <script type="application/ld+json">. */
export function jsonLdHtml(graph: object[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
