import Link from "next/link";
import { SearchForm } from "@/components/home/search-form";

const CUISINES = [
  "Indian",
  "Pakistani",
  "Turkish",
  "Arabic",
  "Bangladeshi",
  "Burgers",
  "Desserts",
  "Breakfast",
  "Pizza",
  "Lebanese",
];

const AREAS = [
  { name: "Rusholme", count: 84, slug: "rusholme" },
  { name: "Didsbury", count: 46, slug: "didsbury" },
  { name: "Northern Quarter", count: 38, slug: "northern-quarter" },
  { name: "City Centre", count: 67, slug: "city-centre" },
  { name: "Longsight", count: 52, slug: "longsight" },
  { name: "Chorlton", count: 29, slug: "chorlton" },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="px-4 pt-12 pb-14">
        <div className="mx-auto max-w-lg text-center">
          {/* Icon mark */}
          <div className="flex justify-center mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.svg"
              alt=""
              aria-hidden="true"
              className="h-12 w-12"
              loading="eager"
            />
          </div>

          {/* Headline */}
          <h1 className="text-[1.875rem] sm:text-[2.25rem] font-bold text-[#0F172A] leading-[1.2] tracking-tight mb-5 text-balance">
            Manchester&apos;s Trusted Halal Food Guide
          </h1>

          {/* Subtitle */}
          <p className="text-base text-[#374151] leading-relaxed mb-8 max-w-sm mx-auto">
            Your trusted guide to the best halal restaurants, caf&eacute;s and
            dining experiences in Manchester. Curated, verified and loved by the
            community.
          </p>

          {/* Search */}
          <SearchForm />
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────── */}
      <div className="h-px bg-[#E5E7EB] mx-4" />

      {/* ─── Browse by Cuisine ────────────────────────────────────── */}
      <section className="pt-10 pb-2">
        <div className="px-4 mb-5">
          <h2 className="text-lg font-bold text-[#0F172A]">Browse by Cuisine</h2>
        </div>

        {/* Horizontal scroll — full bleed so pills reach screen edges */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 pb-6">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine}
                href={`/restaurants?cuisine=${cuisine.toLowerCase()}`}
                className="shrink-0 inline-flex items-center h-11 px-5 rounded-full border border-[#E5E7EB] bg-white text-sm font-medium text-[#0F172A] hover:border-[#10B981] hover:text-[#10B981] transition-colors whitespace-nowrap"
              >
                {cuisine}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────── */}
      <div className="h-px bg-[#E5E7EB] mx-4" />

      {/* ─── Browse by Area ───────────────────────────────────────── */}
      <section className="px-4 pt-10 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#0F172A]">Browse by Area</h2>
          <Link
            href="/restaurants"
            className="text-sm font-medium text-[#10B981] hover:underline underline-offset-2"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {AREAS.map((area) => (
            <Link
              key={area.slug}
              href={`/restaurants?area=${area.slug}`}
              className="group flex flex-col justify-between p-4 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors min-h-[80px]"
            >
              <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors leading-snug">
                {area.name}
              </span>
              <span className="text-sm text-[#6B7280] mt-2">
                {area.count} restaurants
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
