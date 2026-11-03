"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { venueArt, zellijFill } from "@/lib/art";
import type { Facet, ListingVenue } from "@/lib/listings";
import { CloseIcon } from "@/components/site/icons";

/*
 * Listing filters, sort and cards (design/listing-manchester.html).
 * Every card is rendered on the server; this component only narrows and
 * re-orders what is already in the page. Filter state is not put in the URL,
 * so filtered views never become separate indexable pages.
 *
 * Card style: compact is the default while cards use zellij placeholders.
 * Flip the default to "editorial" once real photos exist (listing decision).
 */

type Sort = "az" | "newest" | "distance";
type View = "compact" | "editorial";

const TYPE_LABEL: Record<string, string> = { restaurant: "Restaurant", cafe: "Café", takeaway: "Takeaway", bakery: "Bakery" };

type Props = {
  venues: ListingVenue[];
  types: Facet[];
  areas: Facet[]; // empty on an area page (locked facet)
  cuisines: Facet[]; // empty on a cuisine page (locked facet)
  showScopeFilter: boolean;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const chipBase =
  "inline-flex min-h-[38px] cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-full border px-[15px] text-[13px] font-semibold transition-colors";
const chipOff = "border-hfi-border bg-hfi-surface hover:border-hfi-t3";
const chipOn = "border-hfi-ink bg-hfi-pill text-hfi-ink";
const roundBtn =
  "inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-hfi-border bg-hfi-surface px-[15px] text-[13px] font-bold hover:border-hfi-t3";

export function ListingExplorer({ venues, types, areas, cuisines, showScopeFilter }: Props) {
  const [type, setType] = useState<string>("all");
  const [areaSel, setAreaSel] = useState<Set<string>>(new Set());
  const [cuisineSel, setCuisineSel] = useState<Set<string>>(new Set());
  const [scopeFull, setScopeFull] = useState(true);
  const [scopePartial, setScopePartial] = useState(true);
  const [sort, setSort] = useState<Sort>("az");
  const [view, setView] = useState<View>("compact");
  const [sideOpen, setSideOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const filtBtnRef = useRef<HTMLButtonElement>(null);

  const list = useMemo(() => {
    const out = venues.filter((v) => {
      if (type !== "all" && v.type !== type) return false;
      if (areaSel.size && !(v.area && areaSel.has(v.area.slug))) return false;
      if (cuisineSel.size && !v.cuisines.some((c) => cuisineSel.has(c.slug))) return false;
      if (v.partialScope ? !scopePartial : !scopeFull) return false;
      return true;
    });
    if (sort === "newest") out.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.name.localeCompare(b.name));
    else if (sort === "distance" && coords) {
      const d = (v: ListingVenue) => (v.lat != null && v.lng != null ? haversineKm(coords.lat, coords.lng, v.lat, v.lng) : Infinity);
      out.sort((a, b) => d(a) - d(b));
    } else out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [venues, type, areaSel, cuisineSel, scopeFull, scopePartial, sort, coords]);

  const activeCount = areaSel.size + cuisineSel.size + (type !== "all" ? 1 : 0) + (!scopeFull || !scopePartial ? 1 : 0);

  const clearAll = () => {
    setType("all");
    setAreaSel(new Set());
    setCuisineSel(new Set());
    setScopeFull(true);
    setScopePartial(true);
  };

  const toggleIn = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };

  const onSort = (value: Sort) => {
    if (value !== "distance") {
      setLocNote(null);
      setSort(value);
      return;
    }
    if (coords) {
      setSort("distance");
      return;
    }
    if (!navigator.geolocation) {
      setLocNote("Location isn't available in this browser, so the list stays A to Z.");
      setSort("az");
      return;
    }
    setLocNote("Finding you…");
    setSort("distance");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocNote("Sorted by distance from you.");
      },
      (err) => {
        setLocNote(
          err.code === 1
            ? "Location permission was turned down, so the list stays A to Z."
            : "We couldn't get your location, so the list stays A to Z.",
        );
        setSort("az");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
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
      setScopeFull={setScopeFull}
      setScopePartial={setScopePartial}
      types={types}
      type={type}
      setType={setType}
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
        <div className="mx-auto flex max-w-[1236px] flex-wrap items-center justify-between gap-[14px] px-7 py-[13px] max-[640px]:px-5 max-[640px]:py-3">
          <div className="flex flex-wrap items-center gap-2 max-[640px]:hidden" role="group" aria-label="Filter by type">
            <button type="button" className={`${chipBase} ${type === "all" ? chipOn : chipOff}`} aria-pressed={type === "all"} onClick={() => setType("all")}>
              All types
            </button>
            {types.length > 1 &&
              types.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  className={`${chipBase} ${type === t.slug ? chipOn : chipOff}`}
                  aria-pressed={type === t.slug}
                  onClick={() => setType(t.slug)}
                >
                  {t.name}
                </button>
              ))}
          </div>
          <div className="flex items-center gap-2 max-[640px]:w-full">
            <button
              type="button"
              className={`${roundBtn} hidden min-[1041px]:inline-flex ${sideOpen ? "border-hfi-ink bg-hfi-pill" : ""}`}
              aria-pressed={sideOpen}
              aria-controls="hfi-pagegrid"
              onClick={() => setSideOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Filters panel
            </button>
            <button
              ref={filtBtnRef}
              type="button"
              className={`${roundBtn} max-[640px]:flex-1 max-[640px]:justify-center`}
              aria-haspopup="dialog"
              aria-controls="hfi-filters"
              onClick={() => setDrawerOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M4 6h16M8 12h8M11 18h2" />
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-hfi-ink px-1 text-[10px] font-extrabold text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <label className="sr-only" htmlFor="hfi-sort">
              Sort by
            </label>
            <select
              id="hfi-sort"
              value={sort}
              onChange={(e) => onSort(e.target.value as Sort)}
              className="hfi-sortsel min-h-[38px] cursor-pointer appearance-none rounded-full border border-hfi-border bg-hfi-surface py-0 pl-[14px] pr-[30px] text-[13px] font-semibold text-hfi-ink max-[640px]:flex-1"
            >
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
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13.5px] text-hfi-t2" aria-live="polite">
              <b className="font-bold text-hfi-ink">{list.length}</b>
              {list.length === venues.length ? ` ${list.length === 1 ? "place" : "places"}` : ` of ${venues.length} places shown`}
            </p>
          </div>

          <div
            id="hfi-pagegrid"
            className={`block min-[1041px]:grid min-[1041px]:items-start min-[1041px]:transition-[grid-template-columns,gap] min-[1041px]:duration-[400ms] min-[1041px]:ease-[cubic-bezier(.16,1,.3,1)] ${
              sideOpen ? "min-[1041px]:grid-cols-[248px_1fr] min-[1041px]:gap-9" : "min-[1041px]:grid-cols-[0px_1fr] min-[1041px]:gap-0"
            }`}
          >
            <div
              className={`col-start-1 row-start-1 hidden overflow-hidden min-[1041px]:sticky min-[1041px]:top-[130px] min-[1041px]:block ${
                sideOpen ? "opacity-100 transition-opacity delay-100 duration-300" : "pointer-events-none opacity-0 transition-opacity duration-200"
              }`}
            >
              {/* Only mounted while open, so hidden filters can't take keyboard focus */}
              {sideOpen && groups}
            </div>

            <div className="col-start-2 row-start-1 min-w-0">
              {list.length === 0 ? (
                <div className="px-5 py-[52px] text-center text-[13.5px] text-hfi-t3">
                  <b className="mb-[5px] block text-[14.5px] font-semibold text-hfi-t2">No places match those filters yet.</b>
                  Try a different type, area or cuisine.
                  <br />
                  <button type="button" className="font-semibold text-hfi-link" onClick={clearAll}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <ul className={`grid ${gridCols}`} role="list">
                  {list.map((v) => (
                    <li key={v.slug} className="flex">
                      {view === "editorial" ? <EditorialCard v={v} /> : <CompactCard v={v} />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── filters drawer ── */}
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
            <div className="-mx-[22px] min-h-0 flex-1 overflow-y-auto px-[22px]">
              {/* Type lives in the drawer on phones, where the chip row is hidden */}
              <div className="min-[641px]:hidden">
                <FilterTypeGroup types={types} type={type} setType={setType} />
              </div>
              {groups}
            </div>
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

function FilterTypeGroup({ types, type, setType }: { types: Facet[]; type: string; setType: (t: string) => void }) {
  if (types.length < 2) return null;
  return (
    <div className="py-[22px]">
      <h3 className={groupHead}>Type</h3>
      <div>
        {[{ slug: "all", name: "All types", count: 0 }, ...types].map((t) => (
          <label key={t.slug} className={checkRow}>
            <input type="radio" name="hfi-type-drawer" className={checkbox} checked={type === t.slug} onChange={() => setType(t.slug)} />
            {t.name}
          </label>
        ))}
      </div>
    </div>
  );
}

type GroupsProps = {
  showScopeFilter: boolean;
  scopeFull: boolean;
  scopePartial: boolean;
  setScopeFull: (b: boolean) => void;
  setScopePartial: (b: boolean) => void;
  types: Facet[];
  type: string;
  setType: (t: string) => void;
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
        <div className="py-[22px]">
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
        <div className="py-[22px]">
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
        <div className="py-[22px]">
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

/* ── cards ── */

function kickerParts(v: ListingVenue) {
  const c = v.cuisines[0];
  return { lead: c ? c.name : TYPE_LABEL[v.type] ?? "Restaurant", leadColour: c ? venueArt(v.slug, c).col : undefined };
}

function metaBits(v: ListingVenue): string[] {
  const bits: string[] = [];
  if (v.cuisines[0]) bits.push(TYPE_LABEL[v.type] ?? "Restaurant");
  if (v.servesAlcohol === false) bits.push("No alcohol");
  if (v.servesAlcohol === true) bits.push("Serves alcohol");
  return bits;
}

function CompactCard({ v }: { v: ListingVenue }) {
  const art = venueArt(v.slug, v.cuisines[0]);
  const { lead, leadColour } = kickerParts(v);
  const bits = metaBits(v);
  return (
    <Link
      href={`/${v.slug}`}
      prefetch={false}
      className="relative flex min-h-[132px] w-full gap-[13px] rounded-xl border border-hfi-border bg-hfi-surface p-[17px] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D8D8D8] hover:shadow-[0_3px_13px_rgba(15,15,15,.06)] motion-reduce:hover:translate-y-0"
    >
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-[9px] [&_svg]:block [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: zellijFill(art) }} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="mb-1.5 text-[10px] font-bold uppercase tracking-[.05em]">
          <span style={leadColour ? { color: leadColour } : undefined} className={leadColour ? undefined : "text-hfi-t3"}>
            {lead}
          </span>
          {v.area && <span className="text-hfi-t3"> · {v.area.name}</span>}
        </span>
        <span className="mb-auto text-[15.5px] font-bold leading-[1.22] tracking-[-.4px]">{v.name}</span>
        {bits.length > 0 && (
          <span className="mt-2.5 flex flex-wrap items-center gap-2 text-[12.5px] text-hfi-t2">
            {bits.map((b, i) => (
              <span key={b} className="contents">
                {i > 0 && <span className="text-hfi-t3">·</span>}
                <span>{b}</span>
              </span>
            ))}
          </span>
        )}
        {v.partialScope && <span className="mt-1 text-xs font-semibold text-hfi-t2">{v.partialScope}</span>}
      </span>
    </Link>
  );
}

function EditorialCard({ v }: { v: ListingVenue }) {
  const art = venueArt(v.slug, v.cuisines[0]);
  const sub = [TYPE_LABEL[v.type] ?? "Restaurant", v.cuisines[0]?.name, v.area?.name].filter(Boolean).join(" · ");
  const bits = metaBits(v).filter((b) => b !== (TYPE_LABEL[v.type] ?? "Restaurant"));
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
          <span className="mt-0.5 block text-[11.5px] font-semibold text-white/[.88]">{sub}</span>
        </span>
      </span>
      {(bits.length > 0 || v.partialScope) && (
        <span className="flex flex-col gap-[5px] px-[14px] pb-[14px] pt-3">
          {bits.length > 0 && <span className="text-[12.5px] text-hfi-t2">{bits.join(" · ")}</span>}
          {v.partialScope && <span className="text-xs font-semibold text-hfi-t2">{v.partialScope}</span>}
        </span>
      )}
    </Link>
  );
}
