/* Small geography helpers (server only: parsePoint uses Buffer). */

export type LatLng = { lat: number; lng: number };

/** PostgREST returns PostGIS points as EWKB hex. Null for anything that isn't a point. */
export function parsePoint(hex: unknown): LatLng | null {
  if (typeof hex !== "string" || !/^[0-9a-fA-F]+$/.test(hex) || hex.length < 42) return null;
  try {
    const buf = Buffer.from(hex, "hex");
    const le = buf[0] === 1;
    const type = le ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
    const hasSrid = (type & 0x20000000) !== 0;
    if ((type & 0xff) !== 1) return null; // not a point
    const off = hasSrid ? 9 : 5;
    const x = le ? buf.readDoubleLE(off) : buf.readDoubleBE(off);
    const y = le ? buf.readDoubleLE(off + 8) : buf.readDoubleBE(off + 8);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { lat: y, lng: x };
  } catch {
    return null;
  }
}

/** Straight-line distance in metres (haversine). */
export function metresBetween(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
