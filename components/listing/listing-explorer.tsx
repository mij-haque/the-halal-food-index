"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { venueArt, zellijFill } from "@/lib/art";
import { openStatus } from "@/lib/hours";
import { shortCount } from "@/lib/site";
import { useNow } from "@/lib/use-now";
import type { Facet, ListingVenue } from "@/lib/listings";
import { CloseIcon, PinIcon } from "@/components/site/icons";
import { StatusPill } from "@/components/site/status-pill";

/*
 * Listing filters, sort and cards (design/listing-manchester.html, card option
 * "E + Google rating" from the 4 Nov card review).
 * Every card is rendered on the server; this component only narrows and
 * re-orders what is already in the page. Filter state is not put in the URL,
 * so filtered views never become separate indexable pages.
 *
 * Filters: a left-hand panel on desktop (open by default) and a right-hand
 * drawer on tablet and phone, both behind one "Filters" button.
 * Changes animate: cards glide to their new place and new ones fade in
 * (skipped for people who ask for reduced motion).
 *
 * Open/closed is worked out in the browser (pages are cached), so it appears
 * just after load and updates every minute.
 *
 * Card style: compact is the default (A2 from the 9 Nov card review: name, gold
 * rating chip, cuisine, "why go" tagline, open status; no placeholder tile).
 * Flip the default to "editorial" once real photos exist (listing decision).
 */

type Sort = "top" | "az" | "newest" | "distance";
type View = "compact" | "editorial";

type Props = {
  venues: ListingVenue[];
  areas: Facet[]; // empty on an area page (locked facet)
  cuisines: Facet[]; // empty on a cuisine page (locked facet)
  showScopeFilter: boolean;
};

const DESKTOP = "(min-width: 1041px)";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/*
 * "Top rated": the Google rating, pulled towards a typical 4.4 when a place has
 * few reviews (a 5.0 from 12 reviews shouldn't beat a 4.8 from 5,000).
 * Places without a rating go last.
 */
const TOP_RATING = 4.5; // the "4.5+" quick filter
const PRIOR_MEAN = 4.4;
const PRIOR_WEIGHT = 100;
function topScore(v: ListingVenue): number {
  if (v.rating == null) return -1;
  const n = v.reviewCount ?? 0;
  return (n * v.rating + PRIOR_WEIGHT * PRIOR_MEAN) / (n + PRIOR_WEIGHT);
}

const roundBtn =
  "inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-hfi-border bg-hfi-surface px-[15px] text-[13px] font-bold hover:border-hfi-t3";

export function ListingExplorer({ venues, areas, cuisines, showScopeFilter }: Props) {
  const [areaSel, setAreaSel] = useState<Set<string>>(new Set());
  const [cuisineSel, setCuisineSel] = useState<Set<string>>(new Set());
  const [scopeFull, setScopeFull] = useState(true);
  const [scopePartial, setScopePartial] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [topOnly, setTopOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("top");
  const [view, setView] = useState<View>("compact");
  const [sideOpen, setSideOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const filtBtnRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const firstPos = useRef<Map<string, { x: number; y: number }> | null>(null);
  const now = useNow();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const list = useMemo(() => {
    const out = venues.filter((v) => {
      if (areaSel.size && !(v.area && areaSel.has(v.area.slug))) return false;
      if (cuisineSel.size && !v.cuisines.some((c) => cuisineSel.has(c.slug))) return false;
      if (v.partialScope ? !scopePartial : !scopeFull) return false;
      if (topOnly && !(v.rating != null && v.rating >= TOP_RATING)) return false;
      if (openOnly && now) {
        const st = openStatus(v.hours, now);
        if (!st || st.tone === "closed") return false;
      }
      return true;
    });
    if (sort === "newest") out.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.name.localeCompare(b.name));
    else if (sort === "distance" && coords) {
      const d = (v: ListingVenue) => (v.lat != null && v.lng != null ? haversineKm(coords.lat, coords.lng, v.lat, v.lng) : Infinity);
      out.sort((a, b) => d(a) - d(b));
    } else if (sort === "top") out.sort((a, b) => topScore(b) - topScore(a) || a.name.localeCompare(b.name));
    else out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [venues, areaSel, cuisineSel, scopeFull, scopePartial, sort, coords, openOnly, topOnly, now]);

  /* ── change animation (FLIP): note where each card is, change, then glide ── */

  const snapshot = () => {
    const ul = gridRef.current;
    if (!ul) return;
    const pos = new Map<string, { x: number; y: number }>();
    for (const li of Array.from(ul.children) as HTMLElement[]) {
      if (li.dataset.slug) pos.set(li.dataset.slug, { x: li.offsetLeft, y: li.offsetTop });
    }
    firstPos.current = pos;
  };

  const change = (fn: () => void) => {
    snapshot();
    setTick((t) => t + 1);
    fn();
  };

  useIsoLayoutEffect(() => {
    const first = firstPos.current;
    firstPos.current = null;
    const ul = gridRef.current;
    if (!first || !ul || typeof ul.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ease = "cubic-bezier(.16,1,.3,1)";
    for (const li of Array.from(ul.children) as HTMLElement[]) {
      const key = li.dataset.slug;
      if (!key) continue;
      const was = first.get(key);
      const dx = was ? was.x - li.offsetLeft : 0;
      const dy = was ? was.y - li.offsetTop : 0;
      if (was && Math.abs(dy) < 700) {
        if (dx || dy) li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 300, easing: ease });
      } else {
        li.animate([{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: ease });
      }
    }
  }, [list]);

  const activeCount = areaSel.size + cuisineSel.size + (!scopeFull || !scopePartial ? 1 : 0) + (openOnly ? 1 : 0) + (topOnly ? 1 : 0);

  const clearAll = () =>
    change(() => {
      setAreaSel(new Set());
      setCuisineSel(new Set());
      setScopeFull(true);
      setScopePartial(true);
      setOpenOnly(false);
      setTopOnly(false);
    });

  const toggleIn = (set: Set<string>, key: string, setter: (s: Set<string>) => void) =>
    change(() => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setter(next);
    });

  const onSort = (value: Sort) => {
    if (value !== "distance") {
      setLocNote(null);
      change(() => setSort(value));
      return;
    }
    if (coords) {
      change(() => setSort("distance"));
      return;
    }
    if (!navigator.geolocation) {
      setLocNote("Location isn't available in this browser, so the list stays sorted by top rated.");
      setSort("top");
      return;
    }
    setLocNote("Finding you…");
    setSort("distance");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        change(() => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocNote("Sorted by distance from you.");
      },
      (err) => {
        setLocNote(
          err.code === 1
            ? "Location permission was turned down, so the list stays sorted by top rated."
            : "We couldn't get your location, so the list stays sorted by top rated.",
        );
        setSort("top");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const onFilters = () => {
    if (window.matchMedia(DESKTOP).matches) setSideOpen((o) => !o);
    else setDrawerOpen(true);
  };

  // drawer: lock scroll, Escape to close, focus the close button
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      filtBtnRef.current?.focus();
    };
  }, [drawerOpen]);

  const groups = (
    <FilterGroups
      showScopeFilter={showScopeFilter}
      scopeFull={scopeFull}
      scopePartial={scopePartial}
      setScopeFull={(b) => change(() => setScopeFull(b))}
      setScopePartial={(b) => change(() => setScopePartial(b))}
      areas={areas}
      areaSel={areaSel}
      toggleArea={(k) => toggleIn(areaSel, k, setAreaSel)}
      cuisines={cuisines}
      cuisineSel={cuisineSel}
      toggleCuisine={(k) => toggleIn(cuisineSel, k, setCuisineSel)}
    />
  );

  const gridCols =
    view === "editorial"
      ? `grid-cols-3 gap-4 max-[1040px]:grid-cols-2 max-[640px]:grid-cols-1 ${sideOpen ? "min-[1041px]:grid-cols-2" : ""}`
      : `grid-cols-4 gap-[14px] max-[1040px]:grid-cols-2 max-[640px]:grid-cols-1 ${sideOpen ? "min-[1041px]:grid-cols-3" : ""}`;

  return (
    <>
      {/* ── sticky filter bar ── */}
      <div className="sticky top-16 z-[60] border-b border-hfi-hair bg-hfi-band">
        <div className="mx-auto flex max-w-[1236px] items-center justify-between gap-2 px-7 py-[13px] max-[640px]:px-5 max-[640px]:py-3">
          <button
            ref={filtBtnRef}
            type="button"
            className={`${roundBtn} max-[640px]:flex-1 max-[640px]:justify-center ${sideOpen ? "min-[1041px]:border-hfi-ink min-[1041px]:bg-hfi-pill" : ""}`}
            aria-expanded={isDesktop ? sideOpen : drawerOpen}
            aria-controls={isDesktop ? "hfi-filterpanel" : "hfi-filters"}
            onClick={onFilters}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 6h16M8 12h8M11 18h2" />
            </svg>
            <span className="min-[1041px]:hidden">Filters</span>
            <span className="hidden min-[1041px]:inline">{sideOpen ? "Hide filters" : "Show filters"}</span>
            {activeCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-hfi-ink px-1 text-[10px] font-extrabold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 max-[640px]:flex-1">
            <label className="sr-only" htmlFor="hfi-sort">
              Sort by
            </label>
            <select
              id="hfi-sort"
              value={sort}
              onChange={(e) => onSort(e.target.value as Sort)}
              className="hfi-sortsel min-h-[38px] cursor-pointer appearance-none rounded-full border border-hfi-border bg-hfi-surface py-0 pl-[14px] pr-[30px] text-[13px] font-semibold text-hfi-ink max-[640px]:w-full"
            >
              <option value="top">Top rated</option>
              <option value="az">A to Z</option>
              <option value="newest">Newest first</option>
              <option value="distance">Nearest to me</option>
            </select>
            <div className="flex shrink-0 overflow-hidden rounded-[9px] border border-hfi-border bg-hfi-surface max-[640px]:hidden" role="group" aria-label="Card layout">
              <button
                type="button"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center ${view === "compact" ? "bg-hfi-pill text-hfi-ink" : "text-hfi-t3"}`}
                aria-pressed={view === "compact"}
                aria-label="Compact view"
                onClick={() => setView("compact")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-[15px] w-[15px]" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center border-l border-hfi-border ${view === "editorial" ? "bg-hfi-pill text-hfi-ink" : "text-hfi-t3"}`}
                aria-pressed={view === "editorial"}
                aria-label="Editorial view"
                onClick={() => setView("editorial")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-[15px] w-[15px]" aria-hidden="true">
                  <rect x="4" y="4" width="7" height="7" rx="1.4" />
                  <rect x="13" y="4" width="7" height="7" rx="1.4" />
                  <rect x="4" y="13" width="7" height="7" rx="1.4" />
                  <rect x="13" y="13" width="7" height="7" rx="1.4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {locNote && (
        <p className="mx-auto mt-2 w-full max-w-[1236px] px-7 text-[11.5px] text-hfi-t3 max-[640px]:px-5" role="status">
          {locNote}
        </p>
      )}

      {/* ── results ── */}
      <section className="px-7 py-[44px] max-[640px]:px-5 max-[640px]:py-[34px]">
        <div className="mx-auto max-w-[1180px]">
          <div
            id="hfi-pagegrid"
            className={`block min-[1041px]:grid min-[1041px]:items-start min-[1041px]:transition-[grid-template-columns,gap] min-[1041px]:duration-[400ms] min-[1041px]:ease-[cubic-bezier(.16,1,.3,1)] ${
              sideOpen ? "min-[1041px]:grid-cols-[248px_1fr] min-[1041px]:gap-9" : "min-[1041px]:grid-cols-[0px_1fr] min-[1041px]:gap-0"
            }`}
          >
            <div
              id="hfi-filterpanel"
              className={`col-start-1 row-start-1 hidden overflow-hidden min-[1041px]:sticky min-[1041px]:top-[130px] min-[1041px]:block ${
                sideOpen ? "opacity-100 transition-opacity delay-100 duration-300" : "pointer-events-none opacity-0 transition-opacity duration-200"
              }`}
            >
              {/* Only mounted while open, so hidden filters can't take keyboard focus */}
              {sideOpen && (
                <>
                  {groups}
                  {activeCount > 0 && (
                    <button type="button" className="mt-1 text-[13px] font-semibold text-hfi-ink underline underline-offset-[3px]" onClick={clearAll}>
                      Clear all filters
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="col-start-2 row-start-1 min-w-0">
              {/* Quick filters (A2 card review, 9 Nov). Selected state is ink, never green. */}
              <div className="mb-[14px] flex flex-wrap gap-2" role="group" aria-label="Quick filters">
                <QuickChip pressed={openOnly} onClick={() => change(() => setOpenOnly((b) => !b))}>
                  Open now
                </QuickChip>
                <QuickChip pressed={topOnly} onClick={() => change(() => setTopOnly((b) => !b))}>
                  Rated {TOP_RATING.toFixed(1)}+
                </QuickChip>
              </div>
              <p className="mb-[18px] text-[13.5px] text-hfi-t2" aria-live="polite">
                <b key={tick} className={`font-bold text-hfi-ink ${tick ? "hfi-tick" : ""}`}>
                  {list.length}
                </b>
                {list.length === venues.length ? ` ${list.length === 1 ? "place" : "places"}` : ` of ${venues.length} places shown`}
              </p>
              {list.length === 0 ? (
                <div className="px-5 py-[52px] text-center text-[13.5px] text-hfi-t3">
                  <b className="mb-[5px] block text-[14.5px] font-semibold text-hfi-t2">No places match those filters yet.</b>
                  Try a different area or cuisine.
                  <br />
                  <button type="button" className="font-semibold text-hfi-link" onClick={clearAll}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <ul ref={gridRef} className={`relative grid ${gridCols}`} role="list">
                  {list.map((v) => (
                    <li key={v.slug} data-slug={v.slug} className="flex">
                      {view === "editorial" ? <EditorialCard v={v} now={now} /> : <CompactCard v={v} now={now} showArea={areas.length > 0} />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── filters drawer (tablet and phone) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[210]" id="hfi-filters" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="hfi-menu-scrim absolute inset-0 bg-[rgba(15,15,15,.16)]" onClick={() => setDrawerOpen(false)} />
          <div className="hfi-drawer absolute bottom-0 right-0 top-0 flex w-[min(84%,360px)] flex-col px-[22px] pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[14px] shadow-[-8px_0_34px_rgba(15,15,15,.14)] max-[640px]:w-[min(90%,360px)]">
            <div className="mb-1 flex min-h-[52px] shrink-0 items-center gap-2.5">
              <span className="font-display text-[17px] font-extrabold tracking-[-.4px]">Filters</span>
              <button
                ref={closeRef}
                type="button"
                className="ml-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-hfi-border bg-hfi-surface text-hfi-t2"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="-mx-[22px] min-h-0 flex-1 overflow-y-auto px-[22px]">{groups}</div>
            <div className="mt-1.5 flex shrink-0 gap-2.5 border-t border-hfi-divider pt-[18px]">
              <button
                type="button"
                className="min-h-11 flex-none cursor-pointer rounded-[10px] border border-hfi-border bg-hfi-surface px-4 text-[13.5px] font-bold"
                onClick={clearAll}
              >
                Clear all
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 cursor-pointer rounded-[10px] bg-hfi-ink text-[13.5px] font-bold text-white"
                onClick={() => setDrawerOpen(false)}
              >
                Show {list.length} {list.length === 1 ? "place" : "places"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── filter groups (shared by the desktop panel and the drawer) ── */

const groupHead = "mb-1 font-display text-[17px] font-bold tracking-[-.3px] text-hfi-ink [font-variation-settings:'opsz'_20]";
const checkRow = "flex cursor-pointer items-center gap-[11px] px-0.5 py-[9px] text-base";
const checkbox = "h-[18px] w-[18px] shrink-0 accent-[#0F0F0F]";

type GroupsProps = {
  showScopeFilter: boolean;
  scopeFull: boolean;
  scopePartial: boolean;
  setScopeFull: (b: boolean) => void;
  setScopePartial: (b: boolean) => void;
  areas: Facet[];
  areaSel: Set<string>;
  toggleArea: (k: string) => void;
  cuisines: Facet[];
  cuisineSel: Set<string>;
  toggleCuisine: (k: string) => void;
};

function FilterGroups(p: GroupsProps) {
  return (
    <>
      {p.showScopeFilter && (
        <div className="py-[22px] first:pt-0">
          <h3 className={groupHead}>Halal scope</h3>
          <div>
            <label className={checkRow}>
              <input type="checkbox" className={checkbox} checked={p.scopeFull} onChange={(e) => p.setScopeFull(e.target.checked)} />
              Fully halal
            </label>
            <label className={checkRow}>
              <input type="checkbox" className={checkbox} checked={p.scopePartial} onChange={(e) => p.setScopePartial(e.target.checked)} />
              Partly halal
            </label>
          </div>
        </div>
      )}
      {p.cuisines.length > 0 && (
        <div className="py-[22px] first:pt-0">
          <h3 className={groupHead}>Cuisine</h3>
          <div>
            {p.cuisines.map((c) => (
              <label key={c.slug} className={checkRow}>
                <input type="checkbox" className={checkbox} checked={p.cuisineSel.has(c.slug)} onChange={() => p.toggleCuisine(c.slug)} />
                <span className="flex-1">{c.name}</span>
                <span className="text-[12.5px] font-semibold text-hfi-t3">{c.count}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {p.areas.length > 0 && (
        <div className="py-[22px] first:pt-0">
          <h3 className={groupHead}>Area</h3>
          <div>
            {p.areas.map((a) => (
              <label key={a.slug} className={checkRow}>
                <input type="checkbox" className={checkbox} checked={p.areaSel.has(a.slug)} onChange={() => p.toggleArea(a.slug)} />
                <span className="flex-1">{a.name}</span>
                <span className="text-[12.5px] font-semibold text-hfi-t3">{a.count}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function QuickChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-[38px] cursor-pointer items-center rounded-full border px-[15px] text-[13px] font-semibold transition-colors ${
        pressed ? "border-hfi-ink bg-hfi-ink text-white" : "border-hfi-border bg-hfi-surface text-hfi-ink hover:border-hfi-t3"
      }`}
    >
      {children}
    </button>
  );
}

/* ── cards ── */

/*
 * Google rating as a small chip, shaded by how good it is (decision 9 Nov 2026).
 * Gold, not green: green stays reserved for "open now". Bands are tight because
 * most places sit between 4.3 and 4.9.
 */
function ratingTone(r: number): string {
  if (r >= 4.8) return "border-hfi-gold bg-hfi-gold text-hfi-gold-ink";
  if (r >= 4.5) return "border-hfi-gold-line bg-hfi-gold-bg text-hfi-gold-text";
  if (r >= 4.0) return "border-hfi-pill bg-hfi-pill text-hfi-t2";
  return "border-hfi-hair bg-hfi-surface text-hfi-t3";
}

function RatingChip({ v }: { v: ListingVenue }) {
  if (v.rating == null) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {v.reviewCount != null && (
        <span className="text-[11.5px] text-hfi-t3" aria-hidden="true">
          ({shortCount(v.reviewCount)})
        </span>
      )}
      <span className={`inline-flex h-[22px] items-center rounded-md border px-[7px] text-[12.5px] font-bold leading-none ${ratingTone(v.rating)}`}>
        <span className="sr-only">Google rating </span>
        {v.rating.toFixed(1)}
        {v.reviewCount != null && <span className="sr-only">, {v.reviewCount.toLocaleString("en-GB")} reviews</span>}
      </span>
    </span>
  );
}

function Area({ v }: { v: ListingVenue }) {
  if (!v.area) return null;
  return (
    <span className="inline-flex items-center gap-[5px]">
      <PinIcon className="h-3 w-3 shrink-0" />
      {v.area.name}
    </span>
  );
}

function CompactCard({ v, now, showArea }: { v: ListingVenue; now: Date | null; showArea: boolean }) {
  const status = now ? openStatus(v.hours, now) : null;
  const kind = v.cuisines.slice(0, 2).map((c) => c.name).join(", ");
  const meta = [kind, showArea ? v.area?.name : null].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/${v.slug}`}
      prefetch={false}
      className="relative flex w-full flex-col gap-[5px] rounded-xl border border-hfi-border bg-hfi-surface px-4 py-[14px] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D8D8D8] hover:shadow-[0_3px_13px_rgba(15,15,15,.06)] motion-reduce:hover:translate-y-0"
    >
      <span className="flex items-start gap-2.5">
        <span className="min-w-0 flex-1 font-display text-[16.5px] font-bold leading-[1.22] tracking-[-.3px]">{v.name}</span>
        <RatingChip v={v} />
      </span>
      {meta && <span className="text-[13px] text-hfi-t2">{meta}</span>}
      {v.tagline && <span className="text-[14px] leading-[1.4] text-hfi-ink">{v.tagline}</span>}
      {v.partialScope && <span className="text-xs font-semibold text-hfi-t2">{v.partialScope}</span>}
      {status && (
        <span className="mt-[3px] flex">
          <StatusPill status={status} />
        </span>
      )}
    </Link>
  );
}

function EditorialCard({ v, now }: { v: ListingVenue; now: Date | null }) {
  const art = venueArt(v.slug, v.cuisines[0]);
  const status = now ? openStatus(v.hours, now) : null;
  const hasRow = Boolean(status || v.area || v.rating != null);
  return (
    <Link
      href={`/${v.slug}`}
      prefetch={false}
      className="flex w-full flex-col overflow-hidden rounded-[14px] border border-hfi-border bg-hfi-surface transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-[3px] hover:border-[#D8D8D8] hover:shadow-[0_8px_22px_rgba(15,15,15,.09)] motion-reduce:hover:translate-y-0"
    >
      <span className="relative block aspect-[4/3] overflow-hidden">
        <span className="hfi-art" dangerouslySetInnerHTML={{ __html: zellijFill(art, 240, 180, 0.11) }} />
        <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,10,.58)_0%,rgba(10,10,10,.06)_52%,rgba(10,10,10,0)_72%)]" />
        <span className="absolute bottom-0 left-0 right-0 z-[2] px-[14px] py-3">
          <b className="block text-[16.5px] font-bold tracking-[-.3px] text-white">{v.name}</b>
          {v.cuisines[0] && <span className="mt-0.5 block text-[11.5px] font-semibold text-white/[.88]">{v.cuisines[0].name}</span>}
        </span>
      </span>
      {(hasRow || v.partialScope) && (
        <span className="flex flex-col gap-[6px] px-[14px] pb-[14px] pt-3">
          {hasRow && (
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-hfi-t2">
              {status && <StatusPill status={status} />}
              <Area v={v} />
              <RatingChip v={v} />
            </span>
          )}
          {v.partialScope && <span className="text-xs font-semibold text-hfi-t2">{v.partialScope}</span>}
        </span>
      )}
    </Link>
  );
}
