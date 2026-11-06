import { cache } from "react";
import { supabaseRead } from "@/lib/supabase/server";
import { asWeekHours, type WeekHours } from "@/lib/hours";

/*
 * Google Maps facts (star rating, review count, opening hours) for published
 * venues, kept fresh by the maps-refresh job and read through
 * venue_place_facts(). Optional by design: if the call fails, pages still
 * render, just without hours and ratings.
 */

export type PlaceFacts = { rating: number | null; reviewCount: number | null; hours: WeekHours | null };

type Row = { slug: string; rating: number | null; review_count: number | null; hours: unknown };

export const NO_FACTS: PlaceFacts = { rating: null, reviewCount: null, hours: null };

export const getPlaceFacts = cache(async (): Promise<Map<string, PlaceFacts>> => {
  const { data, error } = await supabaseRead().rpc("venue_place_facts");
  if (error || !Array.isArray(data)) return new Map();
  return new Map(
    (data as Row[]).map((f) => {
      const rating = f.rating != null ? Number(f.rating) : NaN;
      return [
        f.slug,
        {
          rating: Number.isFinite(rating) && rating > 0 ? Math.round(rating * 10) / 10 : null,
          reviewCount: f.review_count != null && f.review_count > 0 ? f.review_count : null,
          hours: asWeekHours(f.hours),
        },
      ];
    }),
  );
});
