"use client";

import { Search, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <section className="bg-white pb-10 pt-12 sm:pt-16 px-4">
      <div className="mx-auto max-w-2xl flex flex-col items-center text-center">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0F172A]">
            Halal Food Index
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight leading-tight mb-4 text-balance">
          Discover the Best{" "}
          <span className="text-primary">Halal Restaurants</span>{" "}
          in the UK
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
          HMC and HFA certified restaurants, reviewed and verified by the Muslim
          community.
        </p>

        {/* Search pill */}
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <div className="flex items-center rounded-full border-2 border-gray-200 bg-white shadow-lg shadow-gray-100 px-5 py-3 gap-3 hover:border-primary/40 focus-within:border-primary/60 transition-colors">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants, cuisines, areas..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            />
            <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-3 text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors shrink-0">
              <MapPin className="h-4 w-4" />
              <span>Manchester</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
            <button
              type="submit"
              className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="text-xs text-gray-400">Popular:</span>
          {["Curry Mile", "Rusholme", "Northern Quarter", "City Centre", "Longsight"].map(
            (area) => (
              <a
                key={area}
                href={`/restaurants?area=${area.toLowerCase().replace(" ", "-")}`}
                className="text-xs text-gray-500 hover:text-primary border border-gray-200 rounded-full px-3 py-1 hover:border-primary/40 transition-colors"
              >
                {area}
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}
