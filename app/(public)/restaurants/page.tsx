"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { CuisinePills } from "@/components/restaurants/cuisine-pills";
import { FilterPanel } from "@/components/restaurants/filter-panel";
import { restaurants } from "@/lib/mock-data";

export default function RestaurantsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-[#F3F4F6] border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-800 font-medium">Restaurants</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              <span className="text-primary">{restaurants.length}</span>{" "}
              Halal Restaurants in Manchester
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              HMC &amp; HFA certified · Verified by the community
            </p>
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:shadow-md hover:border-gray-300 transition-all shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Cuisine pills */}
        <div className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
          <Suspense>
            <CuisinePills />
          </Suspense>
        </div>

        {/* Restaurant list — stacked full-width on mobile, 2-col on sm, 3-col on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>

        {/* Pagination stub */}
        <div className="mt-12 flex items-center justify-center gap-1">
          {[1, 2, 3, "…", 8].map((p, i) => (
            <button
              key={i}
              className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                p === 1
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Filter panel */}
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => setFilterOpen(false)}
      />
    </div>
  );
}
