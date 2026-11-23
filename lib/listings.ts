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
// Brunch reads "Breakfast & Brunch" because people search "halal breakfast" too.
// Grill reads "Grill & Kebab" because people search "halal kebab".
const CUISINE_IS_PLACE: Record<string, string> = { steakhouse: "Steakhouses", brunch: "Breakfast & Brunch", grill: "Grill & Kebab" };

export function cuisineHeading(c: { slug: string; name: string }): string {
  if (CUISINE_IS_PLACE[c.slug]) return `Halal ${CUISINE_IS_PLACE[c.slug]} in Manchester`;
  return CUISINE_IS_FOOD.has(c.slug) ? `Halal ${c.name} in Manchester` : `Halal ${c.name} Restaurants in Manchester`;
}

/** Plural phrase for descriptions: "halal Indian restaurants", "places for halal brunch". */
export function cuisineDescriptor(c: { slug: string; name: string }): string {
  if (c.slug === "brunch") return "places for halal breakfast and brunch";
  if (c.slug === "grill") return "halal grill and kebab spots";
  if (CUISINE_IS_PLACE[c.slug]) return `halal ${CUISINE_IS_PLACE[c.slug].toLowerCase()}`;
  return CUISINE_IS_FOOD.has(c.slug) ? `places for halal ${c.name.toLowerCase()}` : `halal ${c.name} restaurants`;
}

export function areaHeading(a: { slug: string; name: string }): string {
  if (a.slug === "city-centre") return "Halal Food in Manchester City Centre";
  if (a.slug === "trafford-centre") return "Halal Food at the Trafford Centre";
  return `Halal Food in ${a.name}`;
}

/**
 * Deliberately built pages for one food type in one area. Added by hand when
 * search data and enough listings justify them, never generated in bulk.
 */
export type ComboPage = {
  slug: string;
  areaSlug: string;
  cuisineSlug: string;
  heading: string;
  crumb: string;
  chip: string;
  description: (count: number) => string;
  intro: string;
};

export const COMBO_PAGES: ComboPage[] = [
  {
    slug: "halal-brunch-oldham",
    areaSlug: "oldham",
    cuisineSlug: "brunch",
    heading: "Halal Breakfast & Brunch in Oldham",
    crumb: "Breakfast & Brunch",
    chip: "Halal brunch in Oldham",
    description: (n) => `${n} places for halal breakfast and brunch in Oldham, Chadderton and Royton, with opening hours and what's on offer.`,
    intro:
      "Most of Oldham's brunch cafes are out towards Chadderton. Aura Cafe is on Victoria Street, The Baytree Cafe on Middleton Road and Bread & Butter on Chadderton Way, while Wonderlust Bistro sits on Library Lane in town. Bittersweet, in the Old Town Hall, does breakfasts as well as waffles and desserts. Khau Galli in Royton serves brunch too, and it does serve alcohol.",
  },
  {
    slug: "halal-grill-oldham",
    areaSlug: "oldham",
    cuisineSlug: "grill",
    heading: "Halal Grills & Kebabs in Oldham",
    crumb: "Grills & Kebabs",
    chip: "Halal grills in Oldham",
    description: (n) => `${n} halal grills and kebab houses in Oldham and Royton, from town centre kebab shops to sit-down steak and sizzler restaurants.`,
    intro:
      "Oldham's grills are spread right across the borough. In town, Charcoal Grill on George Street does seekh kebabs and shashlik, with BBQ'd on Union Street, Cafe East on Yorkshire Street and German Doner Kebab on High Street close by. Ashton Road has Afghan Kebab House and Friends Restaurant, and Featherstall Road has Donner HQ and Piri Desi. For a sit-down meal, Gourmet Steak & Grill on Ellen Street is known for its sizzlers, Grelhados is on Lees Road and Zaraks Grill Lounge is at Bottom o' th' Moor. Bank Grill is out in Royton.",
  },
  {
    slug: "halal-brunch-bolton",
    areaSlug: "bolton",
    cuisineSlug: "brunch",
    heading: "Halal Breakfast & Brunch in Bolton",
    crumb: "Breakfast & Brunch",
    chip: "Halal brunch in Bolton",
    description: (n) => `${n} places for halal breakfast and brunch in Bolton, with opening hours and what's on offer.`,
    intro:
      "Bolton's brunch spots sit mostly along two roads. St Helens Road has Cafe Chico and Desi Brunch a few doors apart, and Halliwell Road has RF Cafe & Patisserie and Tasty Bites. In the town centre, Kohi Coffee House is on Horsfield Street, Mi Chaii is on Derby Street, and House Of Chai on Bradshawgate serves breakfast and brunch alongside chai and desserts.",
  },
  {
    slug: "halal-desserts-oldham",
    areaSlug: "oldham",
    cuisineSlug: "desserts",
    heading: "Halal Desserts in Oldham",
    crumb: "Desserts",
    chip: "Halal desserts in Oldham",
    description: (n) => `${n} halal dessert shops, cafés and sweet centres in Oldham, from waffles and kunafa to mithai.`,
    intro:
      "Union Street is the centre of Oldham's dessert scene, with Frurt, Little Dessert Shop and Moonlight within a few doors of each other. Yorkshire Street has The Belgian Waffle Company, and Bittersweet sits in the Old Town Hall. Ashton Road covers the traditional side: Ambala for mithai and ladoo, Cake Box for egg-free cakes and Dessert Point further out. Mumtaz Chai on Featherstall Road North, Uncle's Tea Hut in Chadderton and Sweet Obsession on Manchester Street round out the list.",
  },
  {
    slug: "halal-chicken-oldham",
    areaSlug: "oldham",
    cuisineSlug: "chicken",
    heading: "Halal Chicken in Oldham",
    crumb: "Chicken",
    chip: "Halal chicken in Oldham",
    description: (n) => `${n} halal fried chicken and peri peri spots in Oldham and Royton.`,
    intro:
      "Most of Oldham's chicken shops sit in the town centre. Union Street alone has Orlando's, Virginia and Georgia Fried Chicken, with Florida Fried Chicken on Yorkshire Street and HFC on George Street. Both Oldham branches of Nando's serve halal chicken, in the Old Town Hall and at Elk Mill, though both serve alcohol. Piri Desi is on Featherstall Road South, while Bank Grill and Loaded Cartel are out in Royton.",
  },
  {
    slug: "halal-indian-oldham",
    areaSlug: "oldham",
    cuisineSlug: "indian",
    heading: "Halal Indian Restaurants in Oldham",
    crumb: "Indian",
    chip: "Halal Indian in Oldham",
    description: (n) => `${n} halal Indian restaurants in Oldham, Chadderton and Royton, from buffets to curry houses.`,
    intro:
      "From small curry houses to large sit-down venues, there is a wide spread of Indian restaurants around Oldham. The Palm in Chadderton runs a buffet of over 100 dishes, and Westwood East on Eleanor Street has an all-you-can-eat tandoori night every Wednesday. Indian Ocean has been on Featherstall Road North since 1993. Khau Galli in Royton is known for its private dining pods, and Blue Tiffin is on Higginshaw Lane. Grand Millon, Spice Grill and Afghan Kebab House complete the list.",
  },
  {
    slug: "halal-burgers-oldham",
    areaSlug: "oldham",
    cuisineSlug: "burgers",
    heading: "Halal Burgers in Oldham",
    crumb: "Burgers",
    chip: "Halal burgers in Oldham",
    description: (n) => `${n} halal burger places in Oldham and Royton, from smash burgers to loaded fries.`,
    intro:
      "Burger spots in Oldham are split between the town centre and Featherstall Road. Havana Burgers & Shakes and Sani's are on Union Street, while Hustle Burger and Lucky's Diner sit on Featherstall Road North. Burgerize, known for smash burgers, is on Waddington Street, and Burg'Zilla is on Primrose Bank. Loaded Cartel in Royton is best known for its honey garlic loaded fries.",
  },
  {
    slug: "halal-bengali-oldham",
    areaSlug: "oldham",
    cuisineSlug: "bengali",
    heading: "Halal Bengali Restaurants in Oldham",
    crumb: "Bengali",
    chip: "Halal Bengali in Oldham",
    description: (n) => `${n} halal Bengali restaurants in Oldham, most of them on Featherstall Road North.`,
    intro:
      "Featherstall Road North is the heart of Bengali food in Oldham. Kacchi Bari, named after its kacchi biryani, is at number 31, with Boithok Khana at 25, Grameen Khana at 67 and Bismillah Kitchen at 98. Old Dacca, one of the newer openings, is on Chadderton Way.",
  },
  {
    slug: "halal-desserts-bolton",
    areaSlug: "bolton",
    cuisineSlug: "desserts",
    heading: "Halal Desserts in Bolton",
    crumb: "Desserts",
    chip: "Halal desserts in Bolton",
    description: (n) => `${n} halal dessert shops, bakeries and cafes in Bolton, from hot cookie dough and waffles to mithai and cheesecake.`,
    intro:
      "Halliwell Road and St Helens Road carry most of Bolton's desserts. On Halliwell Road, Cube Desserts does hot cookie dough and waffles every Wednesday, with RF Cafe & Patisserie next door for layered cakes and afternoon tea. St Helens Road has The Belgian Waffle Company, Cafe Chico and Hamzah Sweet & Bakers for Pakistani mithai. Taste on High Street is a bakery that has been trading since 2012, and The Grumpy Baker on Wigan Road is known for its baked cheesecakes. Kaspa's and Little Dessert Shop complete the list.",
  },
  {
    slug: "halal-grill-bolton",
    areaSlug: "bolton",
    cuisineSlug: "grill",
    heading: "Halal Grills & Kebabs in Bolton",
    crumb: "Grills & Kebabs",
    chip: "Halal grills in Bolton",
    description: (n) => `${n} halal grill and steak houses in Bolton, from lamb chops and T-bones to parmos and sizzlers.`,
    intro:
      "Bolton's grills are spread across town. Halliwell Road has Tribez, known for its T-bone steaks and lamb chops, and The Steakhouse Co, which mixes steaks with Indian and Asian dishes. On St Helens Road, Barakat Grill is the one for lamb chops and mixed grills. Hooyo's Spot on Derby Street pairs grills with Somali home cooking, Grillicious on Tonge Moor Road does parmos and sizzlers, while Lahori Taste on Bridge Street and Mr BBQ on Caroline Street round off the list.",
  },
  {
    slug: "halal-burgers-bolton",
    areaSlug: "bolton",
    cuisineSlug: "burgers",
    heading: "Halal Burgers in Bolton",
    crumb: "Burgers",
    chip: "Halal burgers in Bolton",
    description: (n) => `${n} halal burger places in Bolton, from smash burgers and hot dip burgers to late-night takeaways.`,
    intro:
      "Derby Street has two of Bolton's burger spots: Players, with its Classico Smash and hot dip burgers, and Kings Castle, which stays open until nearly 3am on Fridays. Grillicious on Tonge Moor Road serves burgers alongside its parmos, Mr BBQ is on Caroline Street, and Side Street is out on Chorley Old Road.",
  },
  {
    slug: "halal-burgers-stockport",
    areaSlug: "stockport",
    cuisineSlug: "burgers",
    heading: "Halal Burgers in Stockport",
    crumb: "Burgers",
    chip: "Halal burgers in Stockport",
    description: (n) => `${n} halal burger places in Stockport, Gatley and Heald Green, from smash burgers to the Knockout Toastie.`,
    intro:
      "Gatley and Heald Green are where Stockport's burgers are. The Grubfellas in Gatley is best known for the Knockout Toastie, two smash patties between grilled cheese toasties, and Burgerism on Stonepail Road does smash burgers and wings. MLK Burgers cooks out of Brewch on Gatley Green. In Heald Green, Jims and Good Burger are both on Finney Lane, and Lucky's Diner is on Wellington Road South, nearer the town centre.",
  },
  {
    slug: "halal-middle-eastern-rusholme",
    areaSlug: "rusholme",
    cuisineSlug: "middle-eastern",
    heading: "Halal Middle Eastern Food on the Curry Mile, Rusholme",
    crumb: "Middle Eastern",
    chip: "Halal Middle Eastern in Rusholme",
    description: (n) => `${n} halal Middle Eastern restaurants on the Curry Mile (Wilmslow Road, Rusholme), from Palestinian fatayer to Yemeni mandi.`,
    intro:
      "Wilmslow Road through Rusholme is as much Middle Eastern as South Asian these days. Jafra is always busy for Palestinian fatayer and musakhan, and Jaffa at number 185 is the long-running stop for shawarma and mezze. Hadramout on Walmer Street East is known for mandi, and Al Yemen Al Saeed opens at 8am for a Yemeni breakfast. Today Restaurant on Grandale Street does Iraqi shawarma with fresh samoon, Walnut covers Persian food and Cedar Bakery serves Arabic breakfasts. For something sweet, Mr. Knafah is round the corner on Dickenson Road.",
  },
  {
    slug: "halal-indian-rusholme",
    areaSlug: "rusholme",
    cuisineSlug: "indian",
    heading: "Halal Indian Restaurants on the Curry Mile, Rusholme",
    crumb: "Indian",
    chip: "Halal Indian in Rusholme",
    description: (n) => `${n} halal Indian restaurants on the Curry Mile (Wilmslow Road, Rusholme), from family dining rooms to late-night curry houses.`,
    intro:
      "These are the curry houses the Curry Mile is named after. MyLahore at 14-18 Wilmslow Road is the big family choice, and Sanam, a sweet house and restaurant at 145-151, is one of the oldest names on the road. Al Jazeera is a long-running local favourite, and Chit 'n' Chaat does chaat and street snacks in a rickshaw-themed room. Mughli Charcoal Pit cooks Indian soul food over charcoal, and it is the one place here that serves alcohol. Saajan stays open until 4am, or 5am at weekends, for after a night out.",
  },
  {
    slug: "halal-desserts-rusholme",
    areaSlug: "rusholme",
    cuisineSlug: "desserts",
    heading: "Halal Desserts on the Curry Mile, Rusholme",
    crumb: "Desserts",
    chip: "Halal desserts in Rusholme",
    description: (n) => `${n} halal dessert places on the Curry Mile (Wilmslow Road, Rusholme), with several open until midnight.`,
    intro:
      "Desserts keep the Curry Mile busy late into the evening. Haute Dolci and Heavenly Desserts sit side by side at 25-27 Wilmslow Road, the first known for its crunch cakes and the second for cookie dough, waffles and crepes, and both stay open until midnight. Sanam sells Asian sweets alongside its restaurant, and Jilani's mixes desserts with Pakistani food and burgers. Cake Box at number 231 is the place for an eggless celebration cake, and Mr. Knafah is a short walk off the main road on Dickenson Road.",
  },
  {
    slug: "halal-pan-asian-trafford-centre",
    areaSlug: "trafford-centre",
    cuisineSlug: "pan-asian",
    heading: "Halal Pan-Asian at the Trafford Centre",
    crumb: "Pan-Asian",
    chip: "Halal Pan-Asian at the Trafford Centre",
    description: (n) => `${n} halal and partly halal Pan-Asian restaurants at the Trafford Centre, most of them in the Orient.`,
    intro:
      "Almost all of these are in the Orient, the Trafford Centre's food hall. Three are fully halal. Nichi upstairs crosses Peruvian cooking with Pan-Asian sushi, Chopstix does build-a-box noodles and rice with halal chicken, and Tru Street mixes Malaysian, Thai and Korean street food. Tampopo has a separate halal menu, so ask for it when you sit down. Hello Oriental, Thaikhun and East Street are only partly halal, and Hello Oriental also serves pork and alcohol, so read the halal note on each page before you order.",
  },
  {
    slug: "halal-burgers-trafford",
    areaSlug: "trafford",
    cuisineSlug: "burgers",
    heading: "Halal Burgers in Trafford",
    crumb: "Burgers",
    chip: "Halal burgers in Trafford",
    description: (n) => `${n} halal burger places across Trafford, from Old Trafford to Sale and Urmston.`,
    intro:
      "Old Trafford has most of these. Luckys on Seymour Grove is open until 1am every day, MLK Burgers on Stretford Road opens at 5pm and is closed on Mondays, and Fries & Guys on Chester Road does burgers and loaded fries. Archie's at Trafford Palazzo adds shakes and waffles to the burgers. Further out, Burger Stop on School Road in Sale does smash burgers and fried chicken, and Rounders on Flixton Road in Urmston does burgers, wings and chicken strips.",
  },
  {
    slug: "halal-burgers-longsight",
    areaSlug: "longsight",
    cuisineSlug: "burgers",
    heading: "Halal Burgers in Longsight and Ardwick",
    crumb: "Burgers",
    chip: "Halal burgers in Longsight",
    description: (n) => `${n} halal burger places in Longsight and Ardwick, mostly late-night delivery kitchens.`,
    intro:
      "Most of these are delivery and collection kitchens in Ardwick, so don't expect a table. So Famous is open until 4am every day for double and triple smash burgers, and The Scran Guys, on the same estate, runs until 2am from Thursday to Sunday. The Grubfellas at Ghost x Kitchens on Higher Ardwick is known for its Knockout Toastie, and 0161 Flamin Fusion is on the same road. Burger Stop cooks out of Encore Kitchen on Dark Lane, and Miami Crispy on Meldon Road does dipped chicken burgers.",
  },
  {
    slug: "halal-desserts-didsbury",
    areaSlug: "didsbury",
    cuisineSlug: "desserts",
    heading: "Halal Desserts in Didsbury",
    crumb: "Desserts",
    chip: "Halal desserts in Didsbury",
    description: (n) => `${n} halal dessert places in Didsbury, West Didsbury and Northenden.`,
    intro:
      "Didsbury village has most of these, along Wilmslow Road. Turkish Sweet Centre does baklava and Turkish breakfasts, Cake Box at number 721 does eggless cakes, and La Chouquette is further along at 812A. Caramello on Whitechapel Street is better known for brunch but serves gelato too. Velvet Whisk is on Burton Road in West Didsbury, and Creamy Croissant, on Palatine Road in Northenden, is known for filled croissants, Dubai chocolate treats and shakes.",
  },
];

export function comboVenues(page: ComboPage, all: ListingVenue[]): ListingVenue[] {
  return all.filter((v) => v.area?.slug === page.areaSlug && v.cuisines.some((c) => c.slug === page.cuisineSlug));
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
  const combos = COMBO_PAGES.map((p) => ({ label: p.chip, href: urls.combo(p.slug), count: comboVenues(p, all).length })).filter(
    (l) => l.count >= MIN_LISTINGS_TO_INDEX,
  );
  return [...cuisines, ...combos, ...areas].filter((l) => l.href !== exclude);
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
