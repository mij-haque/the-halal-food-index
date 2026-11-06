import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL, absolute, noEmDash, urls } from "@/lib/site";
import { ORG_ID, WEBSITE_ID, breadcrumbNode, jsonLdHtml, organizationNode, websiteNode } from "@/lib/schema";

/*
 * Plain text pages (About, Privacy). No mockup exists for these, so they reuse
 * the listing hero and the site's type scale. Server components only.
 */

export function textPageMetadata(p: { path: string; title: string; description: string }): Metadata {
  const url = absolute(p.path);
  const description = noEmDash(p.description);
  return {
    title: p.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: p.title, description, siteName: SITE_NAME, locale: "en_GB" },
    twitter: { card: "summary", title: p.title, description },
    other: { "theme-color": "#0B6B45" },
  };
}

export function TextPage(p: {
  path: string;
  crumb: string;
  heading: string;
  lede: string;
  /** Shown as "Last updated 6 November 2026". */
  updated?: string;
  /** schema.org page type: AboutPage for About, WebPage otherwise. */
  pageType?: "AboutPage" | "WebPage";
  children: ReactNode;
}) {
  const url = absolute(p.path);
  const graph = [
    organizationNode(),
    websiteNode(),
    breadcrumbNode(url, [
      { name: "Home", item: `${SITE_URL}/` },
      { name: p.crumb, item: url },
    ]),
    {
      "@type": p.pageType ?? "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: p.heading,
      description: noEmDash(p.lede),
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      ...(p.pageType === "AboutPage" ? { about: { "@id": ORG_ID } } : {}),
      inLanguage: "en-GB",
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(graph) }} />
      <section className="border-b border-hfi-hair bg-hfi-band px-7 pb-[30px] pt-[34px] max-[640px]:px-5 max-[640px]:pb-6 max-[640px]:pt-[26px]">
        <div className="mx-auto max-w-[1180px]">
          <nav className="mb-4 flex flex-wrap items-center gap-[7px] text-[12.5px] text-hfi-t3" aria-label="Breadcrumb">
            <Link href={urls.home()} className="text-hfi-t3 transition-colors hover:text-hfi-ink">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-hfi-t2">
              {p.crumb}
            </span>
          </nav>
          <h1 className="hfi-display-xl">{p.heading}</h1>
          <p className="mt-[14px] max-w-[640px] text-[15px] leading-[1.62] text-hfi-t2">{p.lede}</p>
        </div>
      </section>
      <section className="px-7 py-[44px] max-[640px]:px-5 max-[640px]:py-[34px]">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[680px]">
            {p.children}
            {p.updated && <p className="mt-10 text-[12.5px] text-hfi-t3">Last updated {p.updated}</p>}
          </div>
        </div>
      </section>
    </>
  );
}

/** One titled block of copy. */
export function TextSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-9 last:mb-0">
      <h2 className="mb-2.5 font-display text-[22px] font-extrabold leading-[1.15] tracking-[-.7px] [font-variation-settings:'opsz'_28]">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.7] text-hfi-t2">{children}</div>
    </section>
  );
}
