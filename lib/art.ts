/**
 * The seal and the zellij placeholder art, ported from the inline scripts in
 * design/venue-baraka-kitchen.html. Everything here returns SVG markup as a
 * string built only from numbers and validated hex colours, so it is safe to
 * render with dangerouslySetInnerHTML on the server.
 */

const BRASS = "#B8924E";
const ORN = "#0B6B45";

const f = (n: number) => n.toFixed(2);

/** Accepts only #RGB or #RRGGBB, otherwise returns the fallback. */
export function safeHex(colour: string | null | undefined, fallback = "#8C8C89"): string {
  return colour && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(colour) ? colour : fallback;
}

export function starPts(cx: number, cy: number, rOuter: number, rInner: number, points: number, offset = 0) {
  const d: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI / points) * i - Math.PI / 2 + (offset * Math.PI) / 180;
    d.push(`${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`);
  }
  return d.join("L");
}

function radials(cx: number, cy: number, rIn: number, rOut: number, n: number, col: string, w: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = ((2 * Math.PI) / n) * i;
    s += `<line x1="${f(cx + rIn * Math.cos(a))}" y1="${f(cy + rIn * Math.sin(a))}" x2="${f(
      cx + rOut * Math.cos(a),
    )}" y2="${f(cy + rOut * Math.sin(a))}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}

/** The HFI seal. Sizes under 24px drop the fine radials so it stays legible. */
export function sealSvg(size: number): string {
  const reduced = size < 24;
  const tint = "#6FC79E";
  const core = "#084F33";
  let s = `<circle cx="24" cy="24" r="23.2" fill="${BRASS}"/><circle cx="24" cy="24" r="20.2" fill="${ORN}"/>`;
  if (!reduced) {
    s +=
      radials(24, 24, 8.8, 19.4, 16, tint, 2.3) +
      `<circle cx="24" cy="24" r="19.4" fill="none" stroke="${tint}" stroke-width="1.3" opacity=".6"/>` +
      `<circle cx="24" cy="24" r="8.8" fill="${core}"/>` +
      `<circle cx="24" cy="24" r="8.8" fill="none" stroke="${tint}" stroke-width="1.6" opacity=".8"/>` +
      `<path d="M${starPts(24, 24, 6.6, 2.9, 8, 22.5)}Z" fill="${BRASS}"/>`;
  } else {
    s +=
      `<circle cx="24" cy="24" r="10.4" fill="${core}"/>` +
      `<path d="M${starPts(24, 24, 8.6, 3.8, 8, 22.5)}Z" fill="${BRASS}"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${s}</svg>`;
}

/* ── zellij ── */

function polyPts(cx: number, cy: number, r: number, sides: number, rot = 0) {
  const out: string[] = [];
  const off = (rot * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2 + off;
    out.push(`${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`);
  }
  return out.join("L");
}

function radialsZ(cx: number, cy: number, r1: number, r2: number, n: number, col: string, w: number, op?: number) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    out.push(
      `<path d="M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}L${f(cx + r2 * Math.cos(a))} ${f(
        cy + r2 * Math.sin(a),
      )}" stroke="${col}" stroke-width="${w}"${op !== undefined ? ` opacity="${op}"` : ""}/>`,
    );
  }
  return out.join("");
}

export type ZellijKind = "circles" | "stars" | "strap" | "rosette";

const CORNERS = (u: number): Array<[number, number]> => [
  [0, 0],
  [u, 0],
  [0, u],
  [u, u],
];

/*
 * Each construction is split into what sits inside one grid cell ("center")
 * and what is centred on the cell's corners ("corner"). In the mockup every
 * cell drew its four corner pieces, so each corner point got four overlapping
 * copies. The SVG <pattern> below clips each tile to its cell, so the corner
 * pieces are drawn `stack` times to keep the same weight.
 */
type Construct = { center: (col: string, u: number) => string; corner?: (col: string, u: number, x: number, y: number) => string; stack: number };

const CONSTRUCT: Record<ZellijKind, Construct> = {
  circles: {
    center: (col, u) =>
      `<circle cx="${u / 2}" cy="${u / 2}" r="${u / 2}" fill="none" stroke="${col}" stroke-width="${u * 0.055}" opacity=".5"/>` +
      `<path d="M${u / 2} ${u * 0.16}L${u * 0.84} ${u / 2}L${u / 2} ${u * 0.84}L${u * 0.16} ${u / 2}Z" ` +
      `fill="none" stroke="${col}" stroke-width="${u * 0.05}" opacity=".42"/>` +
      `<rect x="${u * 0.42}" y="${u * 0.42}" width="${u * 0.16}" height="${u * 0.16}" fill="${col}" opacity=".55"/>`,
    corner: (col, u, x, y) =>
      `<circle cx="${x}" cy="${y}" r="${u / 2}" fill="none" stroke="${col}" stroke-width="${u * 0.055}" opacity=".5"/>`,
    stack: 4,
  },
  stars: {
    center: (col, u) =>
      `<path d="M${starPts(u / 2, u / 2, u * 0.42, u * 0.19, 8, 22.5)}Z" fill="${col}" opacity=".4"/>` +
      `<path d="M${starPts(u / 2, u / 2, u * 0.19, u * 0.085, 8, 22.5)}Z" fill="${col}" opacity=".62"/>`,
    corner: (col, u, x, y) =>
      `<rect x="${x - u * 0.075}" y="${y - u * 0.075}" width="${u * 0.15}" height="${u * 0.15}" fill="${col}" opacity=".5" transform="rotate(45 ${x} ${y})"/>`,
    stack: 4,
  },
  strap: {
    center: (col, u) =>
      `<path d="M${polyPts(u / 2, u / 2, u * 0.44, 8, 22.5)}Z" fill="none" stroke="${col}" ` +
      `stroke-width="${u * 0.075}" opacity=".42" stroke-linejoin="round"/>` +
      `<path d="M${polyPts(u / 2, u / 2, u * 0.44, 8, 0)}Z" fill="none" stroke="${col}" ` +
      `stroke-width="${u * 0.075}" opacity=".42" stroke-linejoin="round"/>` +
      `<path d="M${polyPts(u / 2, u / 2, u * 0.15, 8, 22.5)}Z" fill="${col}" opacity=".6"/>` +
      `<g stroke="${col}" stroke-width="${u * 0.06}" opacity=".34" stroke-linecap="round">` +
      `<path d="M0 0L${u * 0.2} ${u * 0.2}"/><path d="M${u} 0L${u * 0.8} ${u * 0.2}"/>` +
      `<path d="M0 ${u}L${u * 0.2} ${u * 0.8}"/><path d="M${u} ${u}L${u * 0.8} ${u * 0.8}"/></g>`,
    stack: 0,
  },
  rosette: {
    center: (col, u) =>
      radialsZ(u / 2, u / 2, u * 0.17, u * 0.42, 16, col, u * 0.05, 0.38) +
      `<circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.17}" fill="none" stroke="${col}" ` +
      `stroke-width="${u * 0.055}" opacity=".5"/>` +
      `<path d="M${starPts(u / 2, u / 2, u * 0.115, u * 0.05, 8, 22.5)}Z" fill="${col}" opacity=".62"/>`,
    corner: (col, u, x, y) => `<path d="M${starPts(x, y, u * 0.13, u * 0.058, 8, 22.5)}Z" fill="${col}" opacity=".45"/>`,
    stack: 4,
  },
};

function cell(kind: ZellijKind, col: string, u: number): string {
  const c = CONSTRUCT[kind];
  let s = c.center(col, u);
  if (c.corner) {
    const corners = CORNERS(u)
      .map(([x, y]) => c.corner!(col, u, x, y))
      .join("");
    s += corners.repeat(c.stack);
  }
  return s;
}

/**
 * A repeating zellij field, sized to fill its box (xMidYMid slice).
 * `id` must be unique on the page: it names the SVG pattern.
 */
export function zellijSvg(id: string, colour: string, kind: ZellijKind, unit = 60, span = 240, bgOpacity = 0.075): string {
  const col = safeHex(colour);
  const pid = `zp-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    `<svg viewBox="0 0 ${span} ${span}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
    `<defs><pattern id="${pid}" patternUnits="userSpaceOnUse" width="${unit}" height="${unit}">${cell(kind, col, unit)}</pattern></defs>` +
    `<rect width="${span}" height="${span}" fill="${col}" opacity="${bgOpacity}"/>` +
    `<rect width="${span}" height="${span}" fill="url(#${pid})"/></svg>`
  );
}

const KINDS: ZellijKind[] = ["strap", "circles", "stars", "rosette"];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable per-venue choice of construction and scale, so tiles don't all match. */
export function zellijFor(seed: string): { kind: ZellijKind; unit: number } {
  const h = hash(seed);
  return { kind: KINDS[h % KINDS.length], unit: 56 + (h % 17) };
}

// Mockup palette minus greens (green is reserved for halal/open-now signals).
const FALLBACK_ART = ["#A8501B", "#5237B8", "#B23C10", "#7B2FA0", "#B0630A", "#0C6B85", "#B32424", "#B02463"];

export type VenueArt = { key: string; col: string; kind: ZellijKind; unit: number };

/**
 * One art treatment per cuisine (colour from the cuisines table), so a list of
 * cards stays calm. Venues without a cuisine get a stable fallback by slug.
 * `key` is safe to use in an SVG id.
 */
export function venueArt(slug: string, cuisine?: { slug: string; colour_hex: string } | null): VenueArt {
  if (cuisine) {
    const { kind, unit } = zellijFor(cuisine.slug);
    return { key: `c-${cuisine.slug.replace(/[^a-z0-9-]/g, "")}`, col: safeHex(cuisine.colour_hex), kind, unit };
  }
  const h = hash(slug);
  const ci = h % FALLBACK_ART.length;
  const kind = KINDS[Math.floor(h / FALLBACK_ART.length) % KINDS.length];
  return { key: `f-${ci}-${kind}`, col: FALLBACK_ART[ci], kind, unit: 60 };
}

/** A <pattern> element for a shared sprite. Reference it with zellijFill(). */
export function zellijPattern(art: VenueArt): string {
  return `<pattern id="zp-${art.key}" patternUnits="userSpaceOnUse" width="${art.unit}" height="${art.unit}">${cell(
    art.kind,
    art.col,
    art.unit,
  )}</pattern>`;
}

/** A small SVG that fills itself with a pattern already defined on the page. */
export function zellijFill(art: VenueArt, width = 240, height = 192, bgOpacity = 0.075): string {
  return (
    `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
    `<rect width="${width}" height="${height}" fill="${art.col}" opacity="${bgOpacity}"/>` +
    `<rect width="${width}" height="${height}" fill="url(#zp-${art.key})"/></svg>`
  );
}
