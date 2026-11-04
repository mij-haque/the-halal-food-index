/**
 * Site-wide constants and URL builders for the rebuilt (HFI brand) pages.
 * Every public URL pattern lives here so pages built later only change one place.
 *
 * Patterns (docs/decisions.md, docs/decisions-update-listing-page.md):
 *   venue     /{slug}
 *   flagship  /halal-restaurants-manchester
 *   area      /halal-restaurants-{area}-manchester
 *   cuisine   /halal-{cuisine}-manchester
 *   chain     /is-{chain}-halal
 */

export const SITE_NAME = "The Halal Food Index";
export const SITE_URL = "https://thehalalfoodindex.co.uk";

export const urls = {
  home: () => "/",
  venue: (slug: string) => `/${slug}`,
  flagship: () => "/halal-restaurants-manchester",
  area: (areaSlug: string) => `/halal-restaurants-${areaSlug}-manchester`,
  cuisine: (cuisineSlug: string) => `/halal-${cuisineSlug}-manchester`,
  chain: (chainSlug: string) => `/is-${chainSlug}-halal`,
  about: () => "/about",
  privacy: () => "/privacy",
  // Not built yet. Nothing links here until the page exists.
  allChains: () => "/chains",
  collections: () => "/collections",
  addRestaurant: () => "/add-a-restaurant",
  reportProblem: () => "/report-a-problem",
  contact: () => "/contact",
  aboutListings: () => "/about-our-listings",
  terms: () => "/terms",
  cookies: () => "/cookies",
};

/**
 * Google Tag Manager container (GA4 is set up inside it). Null = no analytics
 * and no cookie banner. Tags only load on the live domains below, never on
 * Vercel previews.
 */
export const GTM_ID: string | null = "GTM-5J25WWLT";
export const LIVE_HOSTS = ["thehalalfoodindex.co.uk", "www.thehalalfoodindex.co.uk"];

/** Shown on the Privacy page. Null until the owner chooses a public address. */
export const CONTACT_EMAIL: string | null = null;

export const absolute = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

export const primaryNav = [
  { label: "Cuisines", href: urls.flagship() },
  { label: "Areas", href: urls.flagship() },
  { label: "About", href: urls.about() },
];

export const footerCuisines = [
  { label: "Indian", href: urls.cuisine("indian") },
  { label: "Burgers", href: urls.cuisine("burgers") },
  { label: "Desserts", href: urls.cuisine("desserts") },
  { label: "Brunch", href: urls.cuisine("brunch") },
  { label: "All cuisines", href: urls.flagship() },
];

export const footerAreas = [
  { label: "City Centre", slug: "city-centre" },
  { label: "Rusholme", slug: "rusholme" },
  { label: "Longsight", slug: "longsight" },
  { label: "Cheetham Hill", slug: "cheetham-hill" },
  { label: "Chorlton", slug: "chorlton" },
];

/** Links offered in the search palette until real search exists. */
export const paletteLinks = [
  { label: "The Halal Food Index, home", hint: "Start here", href: urls.home(), icon: "home" as const },
  { label: "Halal restaurants in Manchester", hint: "Every listing", href: urls.flagship(), icon: "dot" as const },
  ...footerAreas.map((a) => ({
    label: `Halal food in ${a.label}`,
    hint: "Area page",
    href: urls.area(a.slug),
    icon: "dot" as const,
  })),
  ...footerCuisines.slice(0, 5).map((c) => ({
    label: `Halal ${c.label.toLowerCase()}, Manchester`,
    hint: "Cuisine page",
    href: c.href,
    icon: "dot" as const,
  })),
];

/** Copy shown to users and crawlers must not contain em-dashes. */
export function noEmDash(text: string): string {
  return text.replace(/\s*—\s*/g, ", ");
}
