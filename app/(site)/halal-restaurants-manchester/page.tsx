import type { Metadata } from "next";
import { ListingView, listingMetadata } from "@/components/listing/listing-view";
import { getPublishedVenues } from "@/lib/listings";
import { urls } from "@/lib/site";

export const revalidate = 600;

const HEADING = "Halal Restaurants, Cafés & Takeaways in Manchester";
const LEDE =
  "Every place here says it serves halal food, on its own menu, website or signage, or is featured by a trusted local halal food guide. Filter by area or cuisine to find somewhere near you.";

export async function generateMetadata(): Promise<Metadata> {
  const all = await getPublishedVenues();
  return listingMetadata({
    path: urls.flagship(),
    title: HEADING,
    description: `${all.length} halal restaurants, cafés and takeaways across Greater Manchester. Every place says it serves halal food, or is featured by a trusted local halal guide.`,
    count: all.length,
    alwaysIndex: true,
  });
}

export default async function ManchesterListingPage() {
  const all = await getPublishedVenues();
  return (
    <ListingView
      path={urls.flagship()}
      heading={HEADING}
      lede={LEDE}
      crumbs={[{ name: "Halal Restaurants in Manchester", href: urls.flagship() }]}
      venues={all}
      allVenues={all}
    />
  );
}
