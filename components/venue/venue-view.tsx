import type { Metadata } from "next";
import Link from "next/link";
import { venueArt, zellijSvg, type ZellijKind } from "@/lib/art";
import { SITE_NAME, SITE_URL, absolute, shortCount, urls } from "@/lib/site";
import { ORG_ID, WEBSITE_ID, breadcrumbNode, jsonLdHtml, organizationNode, placeNode, websiteNode } from "@/lib/schema";
import { openingHoursSpec, weekSummary } from "@/lib/hours";
import {
  directionsHref,
  isPartial,
  listedMonth,
  mapsHref,
  splitAddress,
  placePhrase,
  quotableAnswer,
  safeWebsite,
  summaryText,
  telHref,
  typeLabel,
  type Venue,
  type VenueTile,
} from "@/lib/venues";
import { VenueSubnav, type SubnavLink } from "@/components/venue/venue-subnav";
import { ReportChange } from "@/components/venue/report-change";
import { LiveStatus, LiveStatusLine } from "@/components/venue/venue-hours";
import { ShareButton } from "@/components/venue/share-button";
import { nearestStops, type NearStop } from "@/lib/transit";
import {
  CheckIcon,
  ClockIcon,
  DirectionsIcon,
  GlassIcon,
  GlobeIcon,
  NoAlcoholIcon,
  PhoneIcon,
  PhotoIcon,
  PinIcon,
} from "@/components/site/icons";

/*
 * Venue page. Ported from design/venue-baraka-kitchen.html with the
 * no-certification decision applied (docs/decisions-update-no-certification.md):
 * no halal badge, no certificate proof, no "checked" dates. Partial venues get
 * the scope note. Alcohol and shared-kitchen facts show only when known.
 * Opening hours, star rating and review count come from Google Maps (the
 * maps-refresh job); the rating is shown as Google's, never in structured data.
 * No embedded map (BestDubai style): the address opens Google Maps, and
 * "Getting there" names the nearest tram stop and train station (lib/transit.ts).
 * Photos are not in the data yet, so the gallery is an honest placeholder.
 */

/* ── helpers ── */

const GALLERY: Array<{ kind: ZellijKind; unit: number; bg: number }> = [
  { kind: "rosette", unit: 60, bg: 0.11 },
  { kind: "strap", unit: 50, bg: 0.09 },
  { kind: "circles", unit: 46, bg: 0.09 },
  { kind: "stars", unit: 52, bg: 0.09 },
  { kind: "rosette", unit: 44, bg: 0.09 },
];

function pageTitle(v: Venue): string {
  const kind = [isPartial(v) ? null : "Halal", v.cuisines[0]?.name, typeLabel(v.venue_type)].filter(Boolean).join(" ");
  return v.area ? `${v.name}, ${v.area.name}: ${kind}` : `${v.name}: ${kind}`;
}

const META_MAX = 158;

/** Answer line plus as many whole write-up sentences as fit, so the snippet
 * never stops mid-sentence. Only a single over-long sentence gets cut. */
function metaDescription(v: Venue): string {
  const sentences = [quotableAnswer(v), summaryText(v)]
    .filter((s): s is string => Boolean(s))
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > META_MAX) break;
    out = next;
  }
  if (out) return out;
  const cut = sentences[0].slice(0, META_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

function jsonLd(v: Venue) {
  const url = absolute(urls.venue(v.slug));
  const crumbs = [
    { name: "Home", item: `${SITE_URL}/` },
    ...(v.area ? [{ name: v.area.name, item: absolute(urls.area(v.area.slug)) }] : []),
    { name: v.name, item: url },
  ];
  const placeType = v.venue_type === "cafe" ? "CafeOrCoffeeShop" : v.venue_type === "bakery" ? "Bakery" : "Restaurant";
  const summary = summaryText(v);
  const hoursSpec = openingHoursSpec(v.hours);
  const website = safeWebsite(v.website);
  const { street, town } = splitAddress(v.address_line);

  // facts shown as chips on the page (Halal info)
  const features = [
    ...(v.serves_alcohol !== null ? [{ "@type": "LocationFeatureSpecification", name: "Alcohol served", value: v.serves_alcohol }] : []),
    ...(v.shared_kitchen !== null ? [{ "@type": "LocationFeatureSpecification", name: "Shared kitchen", value: v.shared_kitchen }] : []),
  ];

  return [
    organizationNode(),
    websiteNode(),
    breadcrumbNode(url, crumbs),
    {
      "@type": placeType,
      "@id": `${url}#restaurant`,
      name: v.name,
      url,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      description: summary ?? quotableAnswer(v),
      servesCuisine: [...v.cuisines.map((c) => c.name), ...(isPartial(v) ? [] : ["Halal"])],
      ...(v.price_band ? { priceRange: v.price_band } : {}),
      ...(v.phone ? { telephone: telHref(v.phone) } : {}),
      ...(street || v.postcode
        ? {
            address: {
              "@type": "PostalAddress",
              ...(street ? { streetAddress: street } : {}),
              ...(town ? { addressLocality: town } : {}),
              addressRegion: "Greater Manchester",
              ...(v.postcode ? { postalCode: v.postcode } : {}),
              addressCountry: "GB",
            },
          }
        : {}),
      ...(v.point ? { geo: { "@type": "GeoCoordinates", latitude: round6(v.point.lat), longitude: round6(v.point.lng) } } : {}),
      hasMap: mapsHref(v),
      ...(v.area ? { containedInPlace: placeNode(v.area.slug === "city-centre" ? "Manchester city centre" : v.area.name) } : {}),
      ...(website ? { sameAs: [website] } : {}),
      ...(hoursSpec ? { openingHoursSpecification: hoursSpec } : {}),
      ...(features.length ? { amenityFeature: features } : {}),
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: v.area ? `${v.name}, ${v.area.name}` : v.name,
      description: metaDescription(v),
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
      about: { "@id": `${url}#restaurant` },
      mainEntity: { "@id": `${url}#restaurant` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      ...(v.published_at ? { datePublished: v.published_at.slice(0, 10) } : {}),
      ...(v.updated_at ? { dateModified: v.updated_at.slice(0, 10) } : {}),
      inLanguage: "en-GB",
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".hfi-quotable"] },
    },
  ];
}

/* ── metadata (used by app/(site)/[slug]/page.tsx) ── */

export function venueMetadata(v: Venue): Metadata {
  const url = absolute(urls.venue(v.slug));
  const description = metaDescription(v);
  const shortTitle = v.area ? `${v.name}, ${v.area.name}` : v.name;
  return {
    title: pageTitle(v),
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: shortTitle, description, siteName: SITE_NAME, locale: "en_GB" },
    twitter: { card: "summary", title: shortTitle, description },
    other: { "theme-color": "#0B6B45" },
  };
}

/* ── shared class strings ── */

const sectionPad = "px-7 py-[52px] max-[640px]:px-5 max-[640px]:py-[38px]";
const band = `hfi-band border-t border-hfi-hair bg-hfi-band ${sectionPad}`;
const secS = "mb-[26px] max-w-[560px] text-[14.5px] text-hfi-t2";
const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-[7px] rounded-full px-[17px] py-[10px] text-[13px] font-bold transition-[background-color,border-color,transform] duration-150 active:scale-[.97] motion-reduce:active:scale-100";
const ctaBtn = `${btnBase} bg-hfi-orn text-white hover:bg-hfi-orn-dark`;
const ghostBtn = `${btnBase} border border-hfi-border bg-hfi-surface text-hfi-ink hover:border-hfi-ink`;
const soonBadge =
  "absolute left-[14px] top-[14px] z-[2] inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,15,15,.55)] px-3 py-[7px] text-[11px] font-bold text-white backdrop-blur-[6px]";

type ChipTone = "g" | "r" | "n";
const chipTone: Record<ChipTone, string> = {
  g: "bg-hfi-green-bg text-hfi-green",
  r: "bg-hfi-red-bg text-hfi-red",
  n: "bg-hfi-pill text-hfi-t3",
};

function Chip({ tone, icon, label, note }: { tone: ChipTone; icon: React.ReactNode; label: string; note?: string }) {
  return (
    <span className="inline-flex items-center gap-[9px] rounded-full border border-hfi-border bg-hfi-surface py-1.5 pl-1.5 pr-[15px]">
      <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${chipTone[tone]}`}>{icon}</span>
      <span className="flex flex-col leading-[1.25]">
        <span className="text-[12.5px] font-bold tracking-[-.1px]">{label}</span>
        {note && <span className="text-[10.5px] text-hfi-t3">{note}</span>}
      </span>
    </span>
  );
}

export function SimilarTile({ t }: { t: VenueTile }) {
  const art = venueArt(t.slug, t.cuisine);
  const col = art.col;
  const sub = [t.cuisine?.name, t.areaName].filter(Boolean).join(" · ");
  return (
    <Link
      href={urls.venue(t.slug)}
      aria-label={[t.name, sub].filter(Boolean).join(" · ")}
      className="relative block aspect-[5/4] max-w-[175px] flex-[1_1_130px] overflow-hidden rounded-[9px] transition-[transform,box-shadow] duration-[180ms] ease-[cubic-bezier(.2,.7,.3,1)] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(15,15,15,.09)]"
      style={{ background: `${col}12` }}
    >
      <span className="hfi-art hfi-tile-art" dangerouslySetInnerHTML={{ __html: zellijSvg(`sim-${t.slug}`, art.col, art.kind, art.unit, 240, 0.075) }} />
      <span className="absolute bottom-0 left-0 right-0 px-[9px] py-2">
        <b className="block truncate text-[11.5px] leading-[1.15] max-[640px]:text-[12.5px]" style={{ color: col }}>
          {t.name}
        </b>
        {sub && (
          <span className="mt-px block truncate text-[9.5px] font-semibold text-hfi-t2 max-[640px]:text-[10.5px]">{sub}</span>
        )}
      </span>
    </Link>
  );
}

/** "1 min walk from Exchange Square tram stop", "4 min walk from Manchester Victoria station". */
function stopLine(s: NearStop): string {
  const place = s.kind === "tram" ? `${s.name} tram stop` : /station$/i.test(s.name) ? s.name : `${s.name} station`;
  return `${s.walkMins} min walk from ${place}`;
}

const darkBtn =
  "inline-flex shrink-0 items-center justify-center gap-[7px] rounded-full border border-[#3A3A38] px-5 py-[13px] text-sm font-bold text-white transition-colors hover:border-white active:scale-[.97] motion-reduce:active:scale-100";

/* ── view ── */

export function VenueView({
  v,
  similar,
  linkedCuisines = [],
}: {
  v: Venue;
  similar: VenueTile[];
  /** Cuisine slugs whose listing page is indexable; those cuisines link to it. */
  linkedCuisines?: string[];
}) {
  const colour = venueArt(v.slug, v.cuisines[0]).col;
  const listed = listedMonth(v.published_at);
  const website = safeWebsite(v.website);
  const isInstagram = website ? /(^|\.)instagram\.com$/i.test(new URL(website).hostname) : false;
  const summary = summaryText(v);
  const directions = directionsHref(v);
  const partial = isPartial(v);
  const stops = nearestStops(v.point);
  const nearest = [stops.tram, stops.rail].filter((s): s is NearStop => s !== null).sort((a, b) => a.walkMins - b.walkMins)[0] ?? null;
  const week = weekSummary(v.hours);
  const { street, town } = splitAddress(v.address_line);
  const addrRest = [town, v.postcode].filter(Boolean).join(", ");

  const metaBits: Array<{ label: string; href?: string }> = [
    ...v.cuisines.slice(0, 2).map((c) => ({
      label: c.name,
      href: linkedCuisines.includes(c.slug) ? urls.cuisine(c.slug) : undefined,
    })),
    ...(v.cuisines.length ? [] : [{ label: typeLabel(v.venue_type) }]),
  ];
  if (v.area) metaBits.push({ label: v.area.name, href: urls.area(v.area.slug) });
  if (v.price_band) metaBits.push({ label: v.price_band });

  const subnav: SubnavLink[] = [
    { id: "overview", label: "Overview" },
    { id: "halal", label: "Halal info" },
    { id: "location", label: "Location" },
    ...(similar.length ? [{ id: "similar", label: "Similar" }] : []),
  ];

  const sourceBasis =
    v.verification_tier === "third_party" ? "a trusted local halal food guide" : `what ${v.name} says about itself`;
  // Answers "is X halal?" in plain words. A sentence, not a badge: see CLAUDE.md.
  const answerLine = `${v.name} is listed as halal, based on ${sourceBasis}.`;
  const sourceLine = partial ? `Listed in good faith, based on ${sourceBasis}.` : "Listed in good faith.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd(v)) }}
      />

      {/* ── hero ── */}
      <section className="relative overflow-hidden border-b border-hfi-hair bg-hfi-band px-7 pb-0 pt-[52px] max-[640px]:px-5 max-[640px]:pt-[38px]">
        <div className="mx-auto max-w-[1180px]">
          <nav className="mb-[18px] flex flex-wrap items-center gap-[7px] text-[12.5px] text-hfi-t3" aria-label="Breadcrumb">
            <Link href={urls.home()} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            {v.area && (
              <>
                <Link href={urls.area(v.area.slug)} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
                  {v.area.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span aria-current="page" className="font-semibold text-hfi-t2">
              {v.name}
            </span>
          </nav>

          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.1em] text-hfi-t3">
            {typeLabel(v.venue_type)}
            {listed && (
              <>
                {" · Listed "}
                <time dateTime={listed.iso}>{listed.label}</time>
              </>
            )}
          </div>
          <h1 className="hfi-display-xl">{v.name}</h1>

          {/* two groups so a separator dot never dangles at a line end; on phones
              the rating and open/closed pill always get their own line */}
          <div className="mb-[22px] mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-hfi-t2">
            {metaBits.length > 0 && (
              <span className="flex flex-wrap items-center gap-2.5">
                {metaBits.map((m, i) => (
                  <span key={`${m.label}-${i}`} className="contents">
                    {i > 0 && <span className="text-hfi-t3">·</span>}
                    {m.href ? (
                      <Link href={m.href} className="underline decoration-hfi-border underline-offset-[3px] transition-colors hover:text-hfi-ink hover:decoration-hfi-ink">
                        {m.label}
                      </Link>
                    ) : (
                      <span>{m.label}</span>
                    )}
                  </span>
                ))}
              </span>
            )}
            {metaBits.length > 0 && v.rating != null && (
              <span className="text-hfi-t3 max-[640px]:hidden" aria-hidden="true">
                ·
              </span>
            )}
            <span className="flex flex-wrap items-center gap-2.5 empty:hidden max-[640px]:basis-full">
              {v.rating != null && (
                <span className="contents">
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[13px] w-[13px] text-hfi-ink" aria-hidden="true">
                      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4-5.7-3.1-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
                    </svg>
                    <b className="font-semibold text-hfi-ink">{v.rating.toFixed(1)}</b>
                    {v.reviewCount != null ? (
                      <span>
                        ({shortCount(v.reviewCount)} Google review{v.reviewCount === 1 ? "" : "s"})
                      </span>
                    ) : (
                      <span>on Google</span>
                    )}
                  </span>
                </span>
              )}
              <LiveStatus hours={v.hours} />
            </span>
          </div>

          {/* phones: one row of equal tiles, icon over label (BestDubai / Maps style) */}
          <div className="mb-[26px] flex flex-wrap gap-2 max-[640px]:grid max-[640px]:auto-cols-fr max-[640px]:grid-flow-col max-[640px]:[&>*]:flex-col max-[640px]:[&>*]:gap-1 max-[640px]:[&>*]:rounded-[14px] max-[640px]:[&>*]:px-2 max-[640px]:[&>*]:py-[11px] max-[640px]:[&>*]:text-[12px]">
            <a className={ctaBtn} href={directions} target="_blank" rel="noopener noreferrer">
              <DirectionsIcon className="h-[13px] w-[13px]" />
              Directions
            </a>
            {v.phone && (
              <a className={ghostBtn} href={`tel:${telHref(v.phone)}`} aria-label={`Call ${v.name}`}>
                <PhoneIcon className="h-[14px] w-[14px]" />
                Call
              </a>
            )}
            {website && (
              <a
                className={ghostBtn}
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isInstagram ? `See ${v.name} on Instagram` : `Visit ${v.name}'s website`}
              >
                <GlobeIcon className="h-[14px] w-[14px]" />
                {isInstagram ? "Instagram" : "Website"}
              </a>
            )}
            <ShareButton title={v.name} url={absolute(urls.venue(v.slug))} className={ghostBtn} />
          </div>

          <div className="relative mb-[26px]">
            <div className={soonBadge}>
              <PhotoIcon className="h-3 w-3" />
              Photos coming soon
            </div>
            <div className="flex gap-2 overflow-x-auto rounded-2xl pb-0.5 [scrollbar-width:thin]">
              {GALLERY.map((g, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] w-[270px] flex-none overflow-hidden rounded-[14px] bg-hfi-pill max-[640px]:w-[200px]"
                >
                  <span className="hfi-art" dangerouslySetInnerHTML={{ __html: zellijSvg(`gal-${i}`, colour, g.kind, g.unit, 270, g.bg) }} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-hfi-brass px-0.5 pb-4 pt-[22px]">
            <div className="mb-4 flex items-start gap-2.5">
              <span className="hfi-qmark mt-1.5 shrink-0 select-none text-[32px] leading-[.6] text-hfi-brass" aria-hidden="true">
                &ldquo;
              </span>
              <p className="hfi-quotable m-0 text-[17px] font-medium tracking-[-.1px] text-hfi-ink max-[640px]:text-[15px]">
                {quotableAnswer(v)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <VenueSubnav links={subnav} />

      {/* ── about + know before you go (option E3, 6 Nov 2026) ── */}
      <section className={`${band} scroll-mt-[122px]`} id="overview">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-10 max-[640px]:gap-8" data-reveal>
          <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-10 max-[1040px]:grid-cols-1 max-[1040px]:gap-4">
            <h2 className="hfi-display-md">About {v.name}</h2>
            <div>
              {summary ? (
                <p className="m-0 max-w-[820px] font-display text-[22px] font-bold leading-[1.45] tracking-[-.4px] text-[#1A1A19] [font-variation-settings:'opsz'_28] max-[640px]:text-[18px]">
                  {summary}
                </p>
              ) : (
                <p className="m-0 max-w-[560px] text-[15px] text-hfi-t2">
                  We haven&apos;t written about {v.name} yet. Been recently?{" "}
                  <a href="#report" className="font-semibold text-hfi-link">
                    Tell us what&apos;s good
                  </a>
                  .
                </p>
              )}
              {v.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {v.tags.map((t) => (
                    <Chip key={t} tone="n" icon={<CheckIcon className="h-[13px] w-[13px]" />} label={t} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-10 max-[1040px]:grid-cols-1 max-[1040px]:gap-3">
            <h2 className="mt-1 text-[12px] font-bold uppercase tracking-[.1em] text-hfi-t2">Know before you go</h2>
            <div className="grid grid-cols-3 border-t border-hfi-border max-[1040px]:grid-cols-1">
              {/* hours */}
              <div className="flex flex-col gap-2 pb-1 pr-6 pt-5 max-[1040px]:pr-0">
                <h3 className="sr-only">Opening hours</h3>
                <ClockIcon className="h-5 w-5" />
                {week ? (
                  <dl className="m-0 flex flex-col gap-0.5 text-[15px]">
                    {week.map((w) => (
                      <div key={w.days} className="flex flex-wrap gap-x-1.5">
                        <dt className="font-bold">{w.days},</dt>
                        <dd className="m-0 font-bold">{w.hours}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <b className="text-[15px]">Hours not listed yet</b>
                )}
                {week ? (
                  <LiveStatus hours={v.hours} />
                ) : (
                  <span className="text-[13px] text-hfi-t2">Check with the venue before you go.</span>
                )}
              </div>

              {/* address */}
              <div
                className="flex scroll-mt-[122px] flex-col gap-2 border-l border-hfi-divider px-6 pb-1 pt-5 max-[1040px]:border-l-0 max-[1040px]:border-t max-[1040px]:px-0"
                id="location"
              >
                <h3 className="sr-only">Address</h3>
                <PinIcon className="h-5 w-5" />
                {street || addrRest ? (
                  <a
                    href={mapsHref(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-0.5 text-hfi-ink no-underline"
                  >
                    {street && <b className="text-[15px]">{street}</b>}
                    {addrRest && (
                      <span className="text-[13px] underline decoration-hfi-border underline-offset-[3px] transition-colors group-hover:decoration-hfi-ink">
                        {addrRest}
                      </span>
                    )}
                    <span className="sr-only"> (opens Google Maps)</span>
                  </a>
                ) : (
                  <b className="text-[15px]">{v.area?.name ?? "Greater Manchester"}</b>
                )}
                {nearest && <span className="text-[12.5px] text-hfi-t2">{stopLine(nearest)}</span>}
                {v.phone && (
                  <a href={`tel:${telHref(v.phone)}`} className="text-[13px] text-hfi-t2 no-underline hover:text-hfi-ink">
                    {v.phone}
                  </a>
                )}
              </div>

              {/* halal info */}
              <div
                className="flex scroll-mt-[122px] flex-col gap-2 border-l border-hfi-divider pb-1 pl-6 pt-5 max-[1040px]:border-l-0 max-[1040px]:border-t max-[1040px]:pl-0"
                id="halal"
              >
                <h3 className="sr-only">Halal info</h3>
                {!partial && <p className="m-0 text-[15px] font-semibold leading-[1.45] text-hfi-ink">{answerLine}</p>}
                {v.serves_alcohol === true ? <GlassIcon className="h-5 w-5" /> : <NoAlcoholIcon className="h-5 w-5" />}
                <b className="text-[15px]">
                  {v.serves_alcohol === false ? "No alcohol" : v.serves_alcohol === true ? "Serves alcohol" : "Alcohol not confirmed"}
                </b>
                {partial && v.halal_scope && (
                  <p className="m-0 rounded-lg bg-hfi-amber-bg px-3 py-2 text-[13px] font-medium text-[#5C3D02]">
                    <b className="font-bold text-[#3D2900]">Partly halal.</b> {v.halal_scope}
                  </p>
                )}
                {v.shared_kitchen !== null && (
                  <span className="text-[13px] text-hfi-t2">
                    {v.shared_kitchen ? "Shared kitchen, so ask staff before ordering." : "Nothing shared in the kitchen."}
                  </span>
                )}
                <span className="text-[13px] text-hfi-t2">
                  {sourceLine}{" "}
                  <a href="#report" className="font-semibold text-hfi-link">
                    Spotted a change?
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-7 rounded-[22px] bg-hfi-ink px-[34px] py-[30px] text-white max-[1040px]:flex-col max-[1040px]:items-stretch max-[640px]:px-5 max-[640px]:py-6">
            <div className="flex flex-col gap-1">
              <p className="m-0 font-display text-[24px] font-extrabold tracking-[-.8px] text-white max-[640px]:text-[20px]">
                Heading to {v.name}?
              </p>
              <p className="m-0 text-sm text-[#BDBDB8]">
                <LiveStatusLine hours={v.hours} fallback={`${v.name} is ${placePhrase(v.area)}.`} />
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 max-[640px]:grid max-[640px]:grid-cols-2">
              <a className={`${ctaBtn} px-[22px] py-[13px] text-sm`} href={directions} target="_blank" rel="noopener noreferrer">
                <DirectionsIcon className="h-[13px] w-[13px]" />
                Get directions
              </a>
              {v.phone && (
                <a className={darkBtn} href={`tel:${telHref(v.phone)}`} aria-label={`Call ${v.name}`}>
                  <PhoneIcon className="h-[14px] w-[14px]" />
                  Call
                </a>
              )}
              {website && (
                <a className={darkBtn} href={website} target="_blank" rel="noopener noreferrer">
                  <GlobeIcon className="h-[14px] w-[14px]" />
                  {isInstagram ? "Instagram" : "Website"}
                </a>
              )}
              <ShareButton title={v.name} url={absolute(urls.venue(v.slug))} className={darkBtn} />
            </div>
          </div>
          <p className="-mt-6 text-[12px] text-hfi-t2">
            {v.hours ? "Hours from Google Maps, updated monthly. " : ""}
            {nearest ? "Walk time is an estimate. " : ""}
            {v.rating != null ? `★ ${v.rating.toFixed(1)} from ${v.reviewCount != null ? `${shortCount(v.reviewCount)} ` : ""}Google reviews.` : ""}
          </p>
        </div>
      </section>

      {/* ── similar + report ── */}
      <section className={`${band} scroll-mt-[122px]`} id={similar.length ? "similar" : "help"}>
        <div className="mx-auto max-w-[1180px]" data-reveal>
          {similar.length > 0 && (
            <>
              <div className="mb-[5px] flex items-baseline justify-between gap-4">
                <h2 className="hfi-display-md">Similar spots nearby</h2>
                {v.area && (
                  <Link href={urls.area(v.area.slug)} className="whitespace-nowrap text-[13.5px] font-semibold text-hfi-link">
                    All {v.area.name} places →
                  </Link>
                )}
              </div>
              <p className={secS}>More halal places {v.area ? `in and around ${v.area.name}` : "close by"}.</p>
              <div className="flex flex-wrap justify-center gap-2.5 max-[640px]:gap-2">
                {similar.map((t) => (
                  <SimilarTile key={t.slug} t={t} />
                ))}
              </div>
            </>
          )}

          <div
            className={`mb-[5px] flex scroll-mt-[122px] items-baseline justify-between gap-4 ${similar.length ? "mt-12" : ""}`}
            id="report"
          >
            <h2 className="hfi-display-md">Help keep this accurate</h2>
          </div>
          <p className={secS}>This page is only as good as what people tell us.</p>
          <ReportChange venueId={v.id} />
        </div>
      </section>
    </>
  );
}
