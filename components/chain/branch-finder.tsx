"use client";

import { useMemo, useState } from "react";
import { CloseIcon, DirectionsIcon, GlobeIcon, PinIcon } from "@/components/site/icons";

/*
 * Branch finder (design/chain-nandos-v12.html #branchfinder). Every branch is in
 * the HTML on arrival. Halal branches are always shown; the others sit behind
 * one closed line but stay in the page, so searching a name still answers
 * "not halal" instead of "no results". Distance is worked out only after the
 * visitor taps "Sort by distance" (never on load), and nothing is stored.
 */

export type FinderBranch = {
  id: string;
  name: string;
  halal: boolean;
  town: string | null;
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  directions: string;
  sourceUrl: string | null;
};

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
};

function miles(k: number): string {
  const m = k * 0.621371;
  return m < 10 ? `${m.toFixed(1)} mi` : `${Math.round(m)} mi`;
}

function Row({ b, chainName, dist }: { b: FinderBranch; chainName: string; dist: string | null }) {
  const meta = [b.town, [b.address, b.postcode].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
  if (!b.halal) {
    return (
      <li className="flex items-center gap-4 px-5 py-[11px] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-hfi-divider">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold tracking-[-.2px]">
            {chainName} · {b.name}
          </div>
          <div className="text-[12.5px] text-hfi-t3">{b.town}</div>
        </div>
        {dist && <span className="ml-auto shrink-0 text-[11px] font-semibold text-hfi-t3">{dist}</span>}
        <span
          className={`${dist ? "" : "ml-auto"} shrink-0 whitespace-nowrap rounded-full bg-hfi-red-bg px-[9px] py-1 text-[9.5px] font-extrabold uppercase tracking-[.05em] text-hfi-red`}
        >
          Not halal
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-4 px-5 py-4 max-[640px]:flex-wrap [&:not(:last-child)]:border-b [&:not(:last-child)]:border-hfi-divider">
      <div className="min-w-0">
        <div className="mb-0.5 text-[14.5px] font-bold tracking-[-.2px]">
          {chainName} · {b.name}
        </div>
        <div className="text-[12.5px] text-hfi-t3">{meta}</div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3.5 max-[640px]:ml-0 max-[640px]:w-full max-[640px]:justify-between">
        <span className="flex items-center gap-2.5">
          {dist && <span className="text-[11px] font-semibold text-hfi-t3">{dist}</span>}
          <span className="whitespace-nowrap rounded-full bg-hfi-green-bg px-[9px] py-1 text-[9.5px] font-extrabold uppercase tracking-[.05em] text-hfi-green">
            Halal
          </span>
        </span>
        <span className="flex gap-1.5">
          <a
            href={b.directions}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Directions to ${chainName} ${b.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-hfi-border text-hfi-t2 transition-colors hover:border-hfi-t3 hover:text-hfi-ink"
          >
            <DirectionsIcon className="h-[14px] w-[14px]" />
          </a>
          {b.sourceUrl && (
            <a
              href={b.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${chainName} ${b.name} on the ${chainName} website`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hfi-border text-hfi-t2 transition-colors hover:border-hfi-t3 hover:text-hfi-ink"
            >
              <GlobeIcon className="h-[14px] w-[14px]" />
            </a>
          )}
        </span>
      </div>
    </li>
  );
}

export function BranchFinder({ chainName, branches }: { chainName: string; branches: FinderBranch[] }) {
  const [q, setQ] = useState("");
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (b: FinderBranch) =>
      !needle || [chainName, b.name, b.town, b.address, b.postcode].filter(Boolean).join(" ").toLowerCase().includes(needle);
    const withDist = branches.filter(match).map((b) => ({
      b,
      d: here && b.lat != null && b.lng != null ? km(here, { lat: b.lat, lng: b.lng }) : null,
    }));
    if (here) withDist.sort((x, y) => (x.d ?? 1e9) - (y.d ?? 1e9));
    return {
      halal: withDist.filter((x) => x.b.halal),
      other: withDist.filter((x) => !x.b.halal),
      searching: needle.length > 0,
    };
  }, [q, here, branches, chainName]);

  const totalOther = branches.filter((b) => !b.halal).length;

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocNote("Your browser can't share your location. Try searching by area instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setHere({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocNote("Sorted by distance from you. Your location stays on your device.");
        setLocating(false);
      },
      () => {
        setLocNote("We couldn't get your location. Try searching by area instead.");
        setLocating(false);
      },
      { maximumAge: 300_000, timeout: 10_000 },
    );
  };

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap gap-[9px]">
        <div className="relative min-w-[200px] flex-1">
          <label className="sr-only" htmlFor="hfi-bf-q">
            Search branches by name, area or postcode
          </label>
          <input
            id="hfi-bf-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by area or postcode: Rochdale, M4, Trafford…"
            autoComplete="off"
            className="min-h-11 w-full rounded-[10px] border border-hfi-border bg-hfi-surface pl-4 pr-[42px] text-sm placeholder:text-hfi-t3"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-hfi-t3 hover:bg-hfi-pill hover:text-hfi-ink"
            >
              <CloseIcon className="h-[14px] w-[14px]" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[10px] bg-hfi-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <PinIcon className="h-[14px] w-[14px]" />
          {locating ? "Finding you…" : "Sort by distance"}
        </button>
      </div>
      {locNote && (
        <p className="-mt-2 mb-3.5 text-[12.5px] text-hfi-t2" role="status">
          {locNote}
        </p>
      )}

      <div className="mb-2.5 mt-[22px] text-[11px] font-bold uppercase tracking-[.08em] text-hfi-green">Halal branches</div>
      {view.halal.length > 0 ? (
        <ul className="m-0 list-none overflow-hidden rounded-[14px] bg-hfi-surface p-0 shadow-[0_1px_2px_rgba(15,15,15,.04),0_8px_24px_rgba(15,15,15,.06)]">
          {view.halal.map(({ b, d }) => (
            <Row key={b.id} b={b} chainName={chainName} dist={d != null ? miles(d) : null} />
          ))}
        </ul>
      ) : (
        <p className="rounded-[14px] bg-hfi-surface px-5 py-6 text-center text-[13.5px] text-hfi-t3">
          No halal branches match that search.
        </p>
      )}

      {totalOther > 0 && (
        <details
          className="hfi-report mt-3.5 overflow-hidden rounded-[14px] bg-hfi-surface shadow-[0_1px_2px_rgba(15,15,15,.04),0_8px_24px_rgba(15,15,15,.06)]"
          open={view.searching && view.other.length > 0 ? true : undefined}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 px-5 py-[15px] text-[13px] font-bold">
            <span>
              {view.searching
                ? `${view.other.length} matching branch${view.other.length === 1 ? "" : "es"}, not halal`
                : `${totalOther} other branches, not halal`}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] shrink-0 text-hfi-t3 transition-transform duration-200" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <ul className="m-0 list-none border-t border-hfi-divider p-0 opacity-[.86]">
            {view.other.map(({ b, d }) => (
              <Row key={b.id} b={b} chainName={chainName} dist={d != null ? miles(d) : null} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
