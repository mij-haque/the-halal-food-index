"use client";

import Link from "next/link";
import { MapPin, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Restaurant, HalalCertification, PriceRange } from "@/types";

const PRICE_SYMBOLS: Record<PriceRange, string> = {
  1: "£",
  2: "££",
  3: "£££",
  4: "££££",
};

const CERT_LABEL: Record<HalalCertification, string> = {
  HMC: "HMC Certified",
  HFA: "HFA Certified",
  AHFA: "AHFA Certified",
  "Self-Certified": "Self-Certified",
  "Awaiting Verification": "Awaiting Verification",
};

const CERT_STYLE: Record<HalalCertification, string> = {
  HMC: "bg-primary text-white",
  HFA: "bg-blue-600 text-white",
  AHFA: "bg-purple-600 text-white",
  "Self-Certified": "bg-amber-500 text-white",
  "Awaiting Verification": "bg-gray-400 text-white",
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  return (
    <div className={cn("group", className)}>
      <Link href={`/restaurants/${restaurant.slug}`} className="block">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-video mb-3">
          {/* Gradient placeholder */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${restaurant.gradientFrom}, ${restaurant.gradientTo})`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-20">🍽️</span>
          </div>

          {/* Top-left: certification badge */}
          <div className="absolute top-3 left-3">
            {restaurant.featured ? (
              <span className="inline-flex items-center rounded-full bg-gold text-white text-xs font-semibold px-3 py-1 shadow-sm">
                ⭐ Featured
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 shadow-sm",
                  CERT_STYLE[restaurant.halalCertification]
                )}
              >
                {CERT_LABEL[restaurant.halalCertification]}
              </span>
            )}
          </div>

          {/* Top-right: action icons */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
              aria-label="Save restaurant"
            >
              <Heart className="h-3.5 w-3.5 text-gray-600" />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
              aria-label="Share restaurant"
            >
              <Share2 className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-1">
          {/* Name + score */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0F172A] text-base leading-snug group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <span className="inline-flex items-center justify-center bg-primary text-white font-bold text-sm rounded-full px-2.5 py-0.5 shrink-0 shadow-sm shadow-primary/30">
              {restaurant.score}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>
              {restaurant.area}, {restaurant.location.city}
            </span>
          </div>

          {/* Status row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            {restaurant.isOpen ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-0.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                Closed
              </span>
            )}
            <span className="text-gray-400">{restaurant.closingTime}</span>
            <span className="text-gray-300">·</span>
            <span>{PRICE_SYMBOLS[restaurant.priceRange]}</span>
            <span className="text-gray-300">·</span>
            <span>{restaurant.cuisine.name}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
