import { TRANSIT_STOPS } from "@/lib/data/transit-stops";
import { metresBetween, type LatLng } from "@/lib/geo";

/*
 * Nearest Metrolink stop and train station to a venue, with a rough walking
 * time. Worked out on the server from the venue's map point and the NaPTAN
 * stop list (lib/data/transit-stops.ts), so it costs nothing to run.
 *
 * Walking time is an estimate: straight-line distance to the nearest
 * entrance, times 1.3 for real streets, at 80 metres a minute (about 3 mph).
 */

export type NearStop = { kind: "tram" | "rail"; name: string; walkMins: number };

const DETOUR = 1.3;
const METRES_PER_MIN = 80;
/** Further than this and we don't suggest walking from it. */
export const MAX_WALK_MINS = 25;

export function walkMins(metres: number): number {
  return Math.max(1, Math.round((metres * DETOUR) / METRES_PER_MIN));
}

export function nearestStops(at: LatLng | null): { tram: NearStop | null; rail: NearStop | null } {
  const best: Record<NearStop["kind"], { name: string; m: number } | null> = { tram: null, rail: null };
  if (!at) return { tram: null, rail: null };
  for (const s of TRANSIT_STOPS) {
    let m = Infinity;
    for (const [lat, lng] of s.at) m = Math.min(m, metresBetween(at, { lat, lng }));
    const cur = best[s.kind];
    if (!cur || m < cur.m) best[s.kind] = { name: s.name, m };
  }
  const pick = (kind: NearStop["kind"]): NearStop | null => {
    const b = best[kind];
    if (!b) return null;
    const mins = walkMins(b.m);
    return mins <= MAX_WALK_MINS ? { kind, name: b.name, walkMins: mins } : null;
  };
  return { tram: pick("tram"), rail: pick("rail") };
}
