"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const POPULAR_TERMS = [
  "Curry Mile",
  "Rusholme",
  "Northern Quarter",
  "City Centre",
  "Didsbury",
];

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const navigate = (q: string) => {
    router.push(q.trim() ? `/restaurants?q=${encodeURIComponent(q.trim())}` : "/restaurants");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query);
  };

  return (
    <div className="w-full">
      {/* Search bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white shadow-sm px-4 h-[52px] focus-within:border-[#10B981] focus-within:shadow-md transition-all">
          <Search
            className="h-[18px] w-[18px] text-[#9CA3AF] shrink-0"
            strokeWidth={2.5}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, areas or cuisines..."
            className="flex-1 text-base text-[#0F172A] placeholder-[#9CA3AF] bg-transparent outline-none min-w-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="shrink-0 bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white text-sm font-semibold rounded-full px-5 h-9 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Popular searches */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-sm text-[#9CA3AF] shrink-0">Popular:</span>
        {POPULAR_TERMS.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => navigate(term)}
            className="inline-flex items-center min-h-[44px] px-4 text-sm text-[#0F172A] border border-[#E5E7EB] rounded-full hover:border-[#10B981] hover:text-[#10B981] transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
