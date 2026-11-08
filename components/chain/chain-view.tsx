import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL, absolute, urls } from "@/lib/site";
import { ORG_ID, WEBSITE_ID, breadcrumbNode, jsonLdHtml, organizationNode, websiteNode, GREATER_MANCHESTER } from "@/lib/schema";
import { branchDirections, verdictWord, type Chain, type ChainStatus } from "@/lib/chains";
import type { VenueTile } from "@/lib/venues";
import { BranchFinder, type FinderBranch } from "@/components/chain/branch-finder";
import { VenueSubnav } from "@/components/venue/venue-subnav";
import { ReportChange } from "@/components/venue/report-change";
import { SimilarTile } from "@/components/venue/venue-view";
import { AlertIcon } from "@/components/site/icons";

/*
 * Chain status page, ported from design/chain-nandos-v12.html with the
 * no-certification decision applied: the verdict comes from the chain's own
 * halal statement and each branch's status from the chain's own branch page.
 * A certifier is named only because the chain's statement names it.
 * Cut on purpose (decisions.md): change log, FAQ, status alerts, "verified by" byline.
 */

const sectionPad = "px-7 py-[52px] max-[640px]:px-5 max-[640px]:py-[38px]";
const band = `hfi-band border-t border-hfi-hair bg-hfi-band ${sectionPad}`;
const secS = "mb-[26px] max-w-[560px] text-[14.5px] text-hfi-t2";

/** "KFC's", but "Nando's" stays as it is (no "Nando's's"). */
function possessive(name: string): string {
  return /['’]s$/i.test(name) ? name : `${name}'s`;
}

function longDate(iso: string | null): { label: string; iso: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(d),
    iso: iso.slice(0, 10),
  };
}

function counts(c: Chain) {
  const halal = c.branches.filter((b) => b.status === "halal").length;
  return { halal, total: c.branches.length };
}

/** The one sentence built to be quoted whole. */
function answerParts(c: Chain) {
  const { halal, total } = counts(c);
  const lead = `${c.name} UK is `;
  const verdict = verdictWord(c.ukStatus);
  const tail =
    total > 0
      ? `. In Greater Manchester, ${halal} of ${total} branches are halal, according to ${possessive(c.name)} own website.`
      : ".";
  return { lead, verdict, tail, text: `${lead}${verdict}${tail}` };
}

function metaDescription(c: Chain): string {
  const { halal, total } = counts(c);
  const base = `${c.name} UK is ${verdictWord(c.ukStatus)}.`;
  return total
    ? `${base} ${halal} of ${total} Greater Manchester branches serve halal food, according to ${possessive(c.name)} own website. Find the nearest one.`
    : base;
}

export function chainMetadata(c: Chain): Metadata {
  const url = absolute(urls.chain(c.slug));
  const { halal } = counts(c);
  const title = halal ? `Is ${c.name} Halal? The ${halal} Halal ${c.name} Branches in Manchester` : `Is ${c.name} Halal?`;
  const description = metaDescription(c);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: c.published ? undefined : { index: false, follow: true },
    openGraph: { type: "website", url, title: `Is ${c.name} halal?`, description, siteName: SITE_NAME, locale: "en_GB" },
    twitter: { card: "summary", title: `Is ${c.name} halal?`, description },
    other: { "theme-color": "#0B6B45" },
  };
}

function jsonLd(c: Chain) {
  const url = absolute(urls.chain(c.slug));
  const reviewed = longDate(c.reviewedAt);
  return [
    organizationNode(),
    websiteNode(),
    breadcrumbNode(url, [
      { name: "Home", item: `${SITE_URL}/` },
      { name: `Is ${c.name} halal?`, item: url },
    ]),
    {
      "@type": "Brand",
      "@id": `${url}#brand`,
      name: c.name,
      ...(c.website ? { url: c.website } : {}),
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: `Is ${c.name} halal?`,
      description: metaDescription(c),
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
      about: { "@id": `${url}#brand` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      spatialCoverage: GREATER_MANCHESTER,
      ...(reviewed ? { dateModified: reviewed.iso } : {}),
      inLanguage: "en-GB",
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".hfi-quotable"] },
    },
  ];
}

/* ── chips: icon carries the verdict, colour the sentiment, label the fact ── */

const CHIP: Record<ChainStatus, { box: string; path: JSX.Element }> = {
  halal: { box: "bg-hfi-green-bg text-hfi-green", path: <path d="M5 12.5l4.5 4.5L19 7.5" /> },
  partial: {
    box: "bg-hfi-amber-bg text-hfi-amber",
    path: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16" />
      </>
    ),
  },
  not_halal: { box: "bg-hfi-red-bg text-hfi-red", path: <path d="M6 6l12 12M18 6 6 18" /> },
  unknown: { box: "bg-hfi-pill text-hfi-t3", path: <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01" /> },
};

function Chip({ label, note, status }: { label: string; note: string | null; status: ChainStatus }) {
  const c = CHIP[status];
  return (
    <span className="inline-flex items-center gap-[9px] rounded-full border border-hfi-border bg-hfi-surface py-1.5 pl-1.5 pr-[15px]">
      <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${c.box}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-[13px] w-[13px]" aria-hidden="true">
          {c.path}
        </svg>
      </span>
      <span className="flex flex-col leading-[1.25]">
        <span className="text-[12.5px] font-bold tracking-[-.1px]">{label}</span>
        {note && <span className="text-[10.5px] text-hfi-t3">{note}</span>}
      </span>
    </span>
  );
}

/* ── view ── */

export function ChainView({ c, similar }: { c: Chain; similar: VenueTile[] }) {
  const reviewed = longDate(c.reviewedAt);
  const { halal, total } = counts(c);
  const answer = answerParts(c);
  const finder: FinderBranch[] = c.branches.map((b) => ({
    id: b.id,
    name: b.name,
    halal: b.status === "halal",
    town: b.town,
    address: b.address,
    postcode: b.postcode,
    lat: b.lat,
    lng: b.lng,
    directions: branchDirections(c.name, b),
    sourceUrl: b.sourceUrl,
  }));

  const subnav = [
    { id: "branches", label: "Branches" },
    { id: "whats-halal", label: "What's halal" },
    ...(similar.length ? [{ id: "similar", label: "Similar" }] : []),
    { id: "report", label: "Report" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd(c)) }} />

      {/* ── hero ── */}
      <section className="relative overflow-hidden border-b border-hfi-hair bg-hfi-band px-7 pb-[40px] pt-[52px] max-[640px]:px-5 max-[640px]:pt-[38px]">
        <div className="mx-auto max-w-[1180px]">
          <nav className="mb-[18px] flex flex-wrap items-center gap-[7px] text-[12.5px] text-hfi-t3" aria-label="Breadcrumb">
            <Link href={urls.home()} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-hfi-t2">
              Is {c.name} halal?
            </span>
          </nav>

          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.1em] text-hfi-t3">
            Chain status
            {reviewed && (
              <>
                {" · Updated "}
                <time dateTime={reviewed.iso}>{reviewed.label}</time>
              </>
            )}
            {" · "}
            <Link href={urls.about()} className="text-hfi-link">
              How we list
            </Link>
          </div>
          <h1 className="hfi-display-xl mb-[22px]">Is {c.name} halal?</h1>

          <div className="flex items-center justify-between gap-5 border-y border-hfi-divider px-0.5 py-[18px] max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3.5">
            <p className="hfi-quotable m-0 text-base text-hfi-ink max-[640px]:text-[15px]">
              {answer.lead}
              <mark className="relative z-0 inline-block bg-transparent px-[1px] pl-[3px] font-bold text-hfi-ink">
                <svg
                  viewBox="0 0 100 34"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute -left-1 top-px -z-[1] h-[calc(100%+4px)] w-[calc(100%+8px)]"
                >
                  <path d="M2 20C15 8 55 4 98 14C60 26 20 28 3 24Z" fill="#F6D48B" opacity=".8" />
                </svg>
                {answer.verdict}
              </mark>
              {answer.tail}
            </p>
            {halal > 0 && (
              <a
                href="#branches"
                className="inline-flex shrink-0 items-center justify-center gap-[7px] rounded-full bg-hfi-orn px-[18px] py-[11px] text-[13px] font-bold text-white no-underline transition-colors hover:bg-hfi-orn-dark"
              >
                See the halal branches
                <span className="rounded-full bg-white/25 px-[7px] py-0.5 text-[11px]">{halal}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-[13px] w-[13px]" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </section>

      <VenueSubnav links={subnav} />

      {/* ── branch finder ── */}
      <section className={`${sectionPad} scroll-mt-[122px]`} id="branches">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-[5px] flex items-baseline justify-between gap-4">
            <h2 className="hfi-display-md">Find a halal {c.name} near you</h2>
          </div>
          <p className={secS}>
            {total
              ? `${halal} of ${total} Greater Manchester branches serve halal food. The ones you'd guess aren't always right, so check the list.`
              : "Branches are being added."}
          </p>
          {total > 0 && <BranchFinder chainName={c.name} branches={finder} />}
          <p className="mt-3.5 rounded-xl border border-dashed border-hfi-border bg-hfi-bg px-[19px] py-[15px] text-[13px] text-hfi-t2">
            Each branch&apos;s status comes from the {c.name} website
            {reviewed ? `, read on ${reviewed.label}` : ""}. Branches can change, so check the {c.name} app before a special trip. Only
            Greater Manchester branches are listed for now.
          </p>
        </div>
      </section>

      {/* ── what's halal ── */}
      <section className={`${band} scroll-mt-[122px]`} id="whats-halal">
        <div className="mx-auto max-w-[1180px]" data-reveal>
          <div className="mb-[5px] flex items-baseline justify-between gap-4">
            <h2 className="hfi-display-md">What&apos;s halal at {c.name}</h2>
          </div>
          <p className={secS}>From {possessive(c.name)} own halal statement.</p>
          {c.items.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2.5">
              {c.items.map((i) => (
                <Chip key={i.label} label={i.label} note={i.note} status={i.status} />
              ))}
            </div>
          )}
          {c.ukStatus === "partial" && (
            <div className="mb-[18px] flex gap-[13px] rounded-xl border border-[#EBD8B4] bg-hfi-amber-bg px-[19px] py-[17px] text-[13.5px] leading-[1.6] text-[#6B4A08]">
              <AlertIcon className="mt-px h-[18px] w-[18px] shrink-0 text-hfi-amber" />
              <span>
                <b className="text-[#4A3106]">Only branches {c.name} marks as halal serve halal food.</b> At every other branch the
                chicken is not halal, so check the branch before you order.
                {c.caveat ? ` ${c.caveat}` : ""}
                {c.certifier ? ` ${c.name} names the ${c.certifier} as its certifier.` : ""}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-[18px] px-0.5 text-[13px]">
            {c.statementUrl && (
              <a href={c.statementUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-hfi-link">
                {possessive(c.name)} halal statement
              </a>
            )}
            {c.website && (
              <a href={c.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-hfi-link">
                {c.name} website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── similar + report ── */}
      <section className={`${sectionPad} scroll-mt-[122px]`} id={similar.length ? "similar" : "help"}>
        <div className="mx-auto max-w-[1180px]" data-reveal>
          {similar.length > 0 && (
            <>
              <div className="mb-[5px] flex items-baseline justify-between gap-4">
                <h2 className="hfi-display-md">Halal chicken and burgers instead</h2>
                <Link href={urls.cuisine("chicken")} className="whitespace-nowrap text-[13.5px] font-semibold text-hfi-link">
                  All halal chicken →
                </Link>
              </div>
              <p className={secS}>Independent places in Greater Manchester that say their whole menu is halal.</p>
              <div className="flex flex-wrap justify-center gap-2.5 max-[640px]:gap-2">
                {similar.map((t) => (
                  <SimilarTile key={t.slug} t={t} />
                ))}
              </div>
            </>
          )}

          <div className={`mb-[5px] flex scroll-mt-[122px] items-baseline justify-between gap-4 ${similar.length ? "mt-12" : ""}`} id="report">
            <h2 className="hfi-display-md">Help keep this accurate</h2>
          </div>
          <p className={secS}>Found a branch that&apos;s changed? Tell us which one and what you saw.</p>
          <ReportChange chainId={c.id} />
        </div>
      </section>
    </>
  );
}
