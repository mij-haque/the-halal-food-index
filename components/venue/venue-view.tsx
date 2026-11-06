import type { Metadata } from "next";
import Link from "next/link";
import { venueArt, zellijSvg, type ZellijKind } from "@/lib/art";
import { SITE_NAME, SITE_URL, absolute, shortCount, urls } from "@/lib/site";
import { openingHoursSpec } from "@/lib/hours";
import {
  directionsHref,
  fullAddress,
  isPartial,
  listedMonth,
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
import { HoursTable, OpenStatusPill } from "@/components/venue/venue-hours";
import { AlertIcon, CheckIcon, GlassIcon, GlobeIcon, PhoneIcon, PhotoIcon, PinIcon } from "@/components/site/icons";

/*
 * Venue page. Ported from design/venue-baraka-kitchen.html with the
 * no-certification decision applied (docs/decisions-update-no-certification.md):
 * no halal badge, no certificate proof, no "checked" dates. Partial venues get
 * the scope note. Alcohol and shared-kitchen facts show only when known.
 * Opening hours, star rating and review count come from Google Maps (the
 * maps-refresh job); the rating is shown as Google's, never in structured data.
 * Photos and the map are not in the data yet, so they are honest placeholders.
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

function metaDescription(v: Venue): string {
  const parts = [quotableAnswer(v), summaryText(v)].filter(Boolean).join(" ");
  if (parts.length <= 158) return parts;
  const cut = parts.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: "Greater Manchester's halal food guide, plus the halal status of UK restaurant chains.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
      },
      {
        "@type": placeType,
        "@id": `${url}#restaurant`,
        name: v.name,
        url,
        ...(summary ? { description: summary } : {}),
        servesCuisine: [...v.cuisines.map((c) => c.name), ...(isPartial(v) ? [] : ["Halal"])],
        ...(v.price_band ? { priceRange: v.price_band } : {}),
        ...(v.phone ? { telephone: telHref(v.phone) } : {}),
        ...(v.address_line || v.postcode
          ? {
              address: {
                "@type": "PostalAddress",
                ...(v.address_line ? { streetAddress: v.address_line } : {}),
                ...(v.area ? { addressLocality: v.area.name } : {}),
                addressRegion: "Greater Manchester",
                ...(v.postcode ? { postalCode: v.postcode } : {}),
                addressCountry: "GB",
              },
            }
          : {}),
        ...(hoursSpec ? { openingHoursSpecification: hoursSpec } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: v.area ? `${v.name}, ${v.area.name}` : v.name,
        description: metaDescription(v),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${url}#restaurant` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        ...(v.published_at ? { datePublished: v.published_at.slice(0, 10) } : {}),
        ...(v.updated_at ? { dateModified: v.updated_at.slice(0, 10) } : {}),
        inLanguage: "en-GB",
        speakable: { "@type": "SpeakableSpecification", cssSelector: [".hfi-quotable"] },
      },
    ],
  };
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
const ctaBtn =
  "inline-flex shrink-0 items-center gap-[7px] rounded-full bg-hfi-orn px-[18px] py-[11px] text-[13px] font-bold text-white transition-colors hover:bg-hfi-orn-dark max-[1040px]:w-full max-[1040px]:justify-center";
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

function SimilarTile({ t }: { t: VenueTile }) {
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

/* ── view ── */

export function VenueView({ v, similar }: { v: Venue; similar: VenueTile[] }) {
  const colour = venueArt(v.slug, v.cuisines[0]).col;
  const listed = listedMonth(v.published_at);
  const website = safeWebsite(v.website);
  const isInstagram = website ? /(^|\.)instagram\.com$/i.test(new URL(website).hostname) : false;
  const summary = summaryText(v);
  const address = fullAddress(v);
  const directions = directionsHref(v);
  const partial = isPartial(v);

  const metaBits = [...v.cuisines.slice(0, 2).map((c) => c.name), ...(v.cuisines.length ? [] : [typeLabel(v.venue_type)])];
  if (v.area) metaBits.push(v.area.name);
  if (v.price_band) metaBits.push(v.price_band);

  const subnav: SubnavLink[] = [
    { id: "overview", label: "Overview" },
    { id: "halal", label: "Halal info" },
    { id: "location", label: "Location" },
    ...(similar.length ? [{ id: "similar", label: "Similar" }] : []),
  ];

  const sourceLine =
    v.verification_tier === "third_party"
      ? "Listed in good faith, based on a trusted local halal food guide."
      : `Listed in good faith, based on what ${v.name} says about itself.`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(v)).replace(/</g, "\\u003c") }}
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

          <div className="mb-[22px] mt-3 flex flex-wrap items-center gap-2.5 text-sm text-hfi-t2">
            {metaBits.map((m, i) => (
              <span key={`${m}-${i}`} className="contents">
                {i > 0 && <span className="text-hfi-t3">·</span>}
                <span>{m}</span>
              </span>
            ))}
            {v.rating != null && (
              <span className="contents">
                {metaBits.length > 0 && <span className="text-hfi-t3">·</span>}
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
            <div className="mb-4 flex items-start justify-between gap-5 max-[1040px]:flex-col max-[1040px]:items-stretch max-[1040px]:gap-4">
              <div className="flex items-start gap-2.5">
                <span className="hfi-qmark mt-1.5 shrink-0 select-none text-[32px] leading-[.6] text-hfi-brass" aria-hidden="true">
                  &ldquo;
                </span>
                <p className="hfi-quotable m-0 text-[17px] font-medium tracking-[-.1px] text-hfi-ink max-[640px]:text-[15px]">
                  {quotableAnswer(v)}
                </p>
              </div>
              <a className={ctaBtn} href={directions} target="_blank" rel="noopener noreferrer">
                <PinIcon className="h-[13px] w-[13px]" />
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <VenueSubnav links={subnav} />

      {/* ── overview + halal info ── */}
      <section className={`${band} scroll-mt-[122px]`} id="overview">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid grid-cols-2 max-[1040px]:grid-cols-1 max-[1040px]:gap-9">
            <div className="border-r border-hfi-divider pr-12 max-[1040px]:border-r-0 max-[1040px]:pr-0">
              <div className="mb-[14px] flex flex-wrap items-center justify-between gap-4">
                <h2 className="hfi-display-md">About {v.name}</h2>
                {(v.phone || website) && (
                  <div className="flex items-center gap-[9px]">
                    {v.phone && (
                      <a
                        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-hfi-ink text-white transition-opacity hover:opacity-80"
                        href={`tel:${telHref(v.phone)}`}
                        aria-label={`Call ${v.name}`}
                      >
                        <PhoneIcon className="h-[15px] w-[15px]" />
                      </a>
                    )}
                    {website && (
                      <a
                        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-hfi-ink text-white transition-opacity hover:opacity-80"
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={isInstagram ? `See ${v.name} on Instagram` : `Visit ${v.name}'s website`}
                      >
                        <GlobeIcon className="h-[15px] w-[15px]" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <OpenStatusPill hours={v.hours} />
              {summary ? (
                <p className={secS}>{summary}</p>
              ) : (
                <p className={secS}>
                  We haven&apos;t written about {v.name} yet. Been recently?{" "}
                  <a href="#report" className="font-semibold text-hfi-link">
                    Tell us what&apos;s good
                  </a>
                  .
                </p>
              )}
              {v.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2.5">
                  {v.tags.map((t) => (
                    <Chip key={t} tone="n" icon={<CheckIcon className="h-[13px] w-[13px]" />} label={t} />
                  ))}
                </div>
              )}
            </div>

            <div className="scroll-mt-[122px] pl-12 max-[1040px]:pl-0" id="halal">
              <div className="mb-[5px] flex items-baseline justify-between gap-4">
                <h2 className="hfi-display-md">Halal info</h2>
              </div>
              <p className={secS}>{sourceLine}</p>

              {partial && v.halal_scope && (
                <p className="mb-[18px] rounded-xl bg-hfi-amber-bg px-4 py-[14px] text-base font-medium leading-normal text-[#5C3D02]">
                  <b className="font-bold text-[#3D2900]">Partly halal.</b> {v.halal_scope}
                </p>
              )}

              {(v.serves_alcohol !== null || v.shared_kitchen !== null) && (
                <div className="mb-4 flex flex-wrap gap-2.5">
                  {v.serves_alcohol === false && (
                    <Chip tone="g" icon={<CheckIcon className="h-[13px] w-[13px]" />} label="No alcohol" note="Not served" />
                  )}
                  {v.serves_alcohol === true && (
                    <Chip tone="r" icon={<GlassIcon className="h-[13px] w-[13px]" />} label="Serves alcohol" note="On the drinks menu" />
                  )}
                  {v.shared_kitchen === false && (
                    <Chip tone="g" icon={<CheckIcon className="h-[13px] w-[13px]" />} label="Nothing shared" note="Single kitchen" />
                  )}
                  {v.shared_kitchen === true && (
                    <Chip tone="r" icon={<AlertIcon className="h-[13px] w-[13px]" />} label="Shared kitchen" note="Ask staff before ordering" />
                  )}
                </div>
              )}

              <p className="text-[13px] text-hfi-t2">
                Found something different when you visited?{" "}
                <a href="#report" className="font-semibold text-hfi-link">
                  Let us know
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── location ── */}
      <section className={`${sectionPad} scroll-mt-[122px]`} id="location">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-[5px] flex items-baseline justify-between gap-4">
            <h2 className="hfi-display-md">Find {v.name}</h2>
          </div>
          <p className={secS}>
            {v.name} is {placePhrase(v.area)}.
          </p>

          <div className="grid grid-cols-2 items-start gap-9 max-[1040px]:grid-cols-1 max-[1040px]:gap-7">
            <div>
              <p className="mb-1 text-sm text-hfi-t2">
                <b className="text-hfi-ink">{v.name}</b>
              </p>
              {address && <p className="mb-1 text-sm text-hfi-t2">{address}</p>}
              {v.phone && (
                <p className="mb-1 text-sm text-hfi-t2">
                  <a href={`tel:${telHref(v.phone)}`}>{v.phone}</a>
                </p>
              )}
              {v.hours ? (
                <>
                  <HoursTable hours={v.hours} />
                  <p className="mb-[22px] text-[12.5px] text-hfi-t3">
                    Hours from Google Maps, updated monthly. Times can change, so check with the venue before a special trip.
                  </p>
                </>
              ) : (
                <p className="mb-[22px] mt-[14px] text-[13px] text-hfi-t3">Opening hours aren&apos;t listed yet. Check with the venue before you go.</p>
              )}
              <a className={ctaBtn} href={directions} target="_blank" rel="noopener noreferrer">
                <PinIcon className="h-[13px] w-[13px]" />
                Get directions
              </a>
            </div>

            <div className="relative aspect-[4/3.1] overflow-hidden rounded-2xl border border-hfi-border bg-hfi-pill shadow-[0_4px_18px_rgba(15,15,15,.07)]">
              <span className="hfi-art opacity-90" dangerouslySetInnerHTML={{ __html: zellijSvg("map", colour, "rosette", 70, 400, 0.08) }} />
              <div className="hfi-locpin" aria-hidden="true" />
              <div className={soonBadge}>
                <PhotoIcon className="h-3 w-3" />
                Map coming soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── similar + report ── */}
      <section className={`${band} scroll-mt-[122px]`} id={similar.length ? "similar" : "help"}>
        <div className="mx-auto max-w-[1180px]">
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
