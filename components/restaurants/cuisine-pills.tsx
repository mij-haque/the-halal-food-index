"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { cuisines } from "@/lib/mock-data";

export function CuisinePills() {
  const searchParams = useSearchParams();
  const active = searchParams.get("cuisine");

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-1">
      <div className="flex gap-2.5 min-w-max px-4 sm:px-0 sm:min-w-0 sm:flex-wrap">
        <Link
          href="/restaurants"
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all shrink-0",
            !active
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
              : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
          )}
        >
          <span>🍽️</span>
          <span>All</span>
        </Link>
        {cuisines.map((cuisine) => (
          <Link
            key={cuisine.id}
            href={`/restaurants?cuisine=${cuisine.slug}`}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all shrink-0",
              active === cuisine.slug
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
            )}
          >
            <span>{cuisine.emoji}</span>
            <span>{cuisine.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
