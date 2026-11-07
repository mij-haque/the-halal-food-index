import type { MetadataRoute } from "next";
import { MIN_LISTINGS_TO_INDEX, areaFacets, cuisineFacets, getPublishedVenues } from "@/lib/listings";
import { absolute, urls } from "@/lib/site";
import { getPublishedChains } from "@/lib/chains";

export const revalidate = 3600;

/** Indexable pages only: the flagship, category pages with enough listings, published chains and every published venue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [all, chains] = await Promise.all([getPublishedVenues(), getPublishedChains()]);
  const latest = all.reduce<string | null>((m, v) => (v.publishedAt && (!m || v.publishedAt > m) ? v.publishedAt : m), null);
  const lastModified = latest ? new Date(latest) : new Date();

  const categories = [
    ...areaFacets(all).filter((f) => f.count >= MIN_LISTINGS_TO_INDEX).map((f) => urls.area(f.slug)),
    ...cuisineFacets(all).filter((f) => f.count >= MIN_LISTINGS_TO_INDEX).map((f) => urls.cuisine(f.slug)),
  ];

  return [
    { url: absolute(urls.flagship()), lastModified, changeFrequency: "daily", priority: 1 },
    { url: absolute(urls.about()), lastModified: new Date("2026-11-06"), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: absolute(urls.privacy()), changeFrequency: "yearly" as const, priority: 0.1 },
    ...chains.map((c) => ({
      url: absolute(urls.chain(c.slug)),
      lastModified: c.reviewedAt ? new Date(c.reviewedAt) : lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...categories.map((path) => ({ url: absolute(path), lastModified, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...all.map((v) => ({
      url: absolute(urls.venue(v.slug)),
      lastModified: new Date(v.updatedAt ?? v.publishedAt ?? lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
