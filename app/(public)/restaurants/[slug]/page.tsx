import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Heart,
  Share2,
  Navigation,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { restaurants } from "@/lib/mock-data";
import { RestaurantTabs } from "@/components/restaurants/restaurant-tabs";
import type { Metadata } from "next";
import type { PriceRange, HalalCertification } from "@/types";

interface Props {
  params: { slug: string };
}

const PRICE_SYMBOLS: Record<PriceRange, string> = {
  1: "£",
  2: "££",
  3: "£££",
  4: "££££",
};

const CERT_STYLE: Record<HalalCertification, string> = {
  HMC: "bg-primary text-white",
  HFA: "bg-blue-600 text-white",
  AHFA: "bg-purple-600 text-white",
  "Self-Certified": "bg-amber-500 text-white",
  "Awaiting Verification": "bg-gray-400 text-white",
};

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = restaurants.find((r) => r.slug === params.slug);
  if (!r) return {};
  return {
    title: r.name,
    description: r.description.slice(0, 155),
  };
}

export default function RestaurantDetailPage({ params }: Props) {
  const restaurant = restaurants.find((r) => r.slug === params.slug);
  if (!restaurant) notFound();

  return (
    <div className="bg-white min-h-screen">
      {/* Full-bleed hero image */}
      <div
        className="w-full h-56 sm:h-72 lg:h-80 relative"
        style={{
          background: `linear-gradient(135deg, ${restaurant.gradientFrom}, ${restaurant.gradientTo})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl opacity-10">🍽️</span>
        </div>
        {/* Cert badge on image */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1.5 shadow-sm ${CERT_STYLE[restaurant.halalCertification]}`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {restaurant.halalCertification}
          </span>
        </div>
        {/* Action icons on image */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
          <button className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/restaurants"
            className="hover:text-primary transition-colors"
          >
            Restaurants
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/restaurants?city=${restaurant.location.city.toLowerCase()}`}
            className="hover:text-primary transition-colors"
          >
            {restaurant.location.city}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 font-medium">{restaurant.name}</span>
        </nav>

        {/* Name + score */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">
            {restaurant.name}
          </h1>
          <span className="inline-flex items-center justify-center bg-primary text-white font-bold text-lg rounded-full px-3 py-1 shrink-0 shadow-sm shadow-primary/30 mt-0.5">
            {restaurant.score}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span>
            {restaurant.location.address}, {restaurant.area},{" "}
            {restaurant.location.city} {restaurant.location.postcode}
          </span>
        </div>

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {restaurant.isOpen ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Closed
            </span>
          )}
          <span className="text-sm text-gray-500">{restaurant.closingTime}</span>
          {restaurant.busyness && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{restaurant.busyness}</span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">
            {PRICE_SYMBOLS[restaurant.priceRange]}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">{restaurant.cuisine.name}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-8">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:shadow-md transition-all">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:shadow-md transition-all">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <div className="flex-1" />
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${restaurant.location.address}, ${restaurant.location.city}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Navigation className="h-4 w-4" />
            Go
          </a>
        </div>

        {/* Tabbed content */}
        <RestaurantTabs restaurant={restaurant} />
      </div>
    </div>
  );
}
