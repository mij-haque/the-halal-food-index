"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveVenues, setAlcohol, skipVenues } from "@/app/admin/(console)/actions";
import type { ReviewRow } from "@/lib/admin/data";
import { DotIcon } from "@/components/admin/icons";

const ORIGINS: [ReviewRow["origin"] | "all", string][] = [
  ["all", "All"],
  ["you", "Sent by you"],
  ["sweep", "Sweep: new"],
  ["backlog", "Sweep: from backlog"],
  ["influencer", "Influencers"],
];

const chip = (on: boolean) =>
  `h-9 rounded-full border px-3.5 text-[13px] ${on ? "border-hfi-ink bg-hfi-ink font-semibold text-white" : "border-hfi-hair bg-white font-medium text-hfi-ink"}`;

function alcoholLabel(v: boolean | null) {
  return v === true ? "Serves alcohol" : v === false ? "No alcohol" : "Not checked";
}
function alcoholClass(v: boolean | null) {
  return v === true
    ? "bg-hfi-amber-bg text-[#8A4A02]"
    : v === false
      ? "bg-hfi-pill text-hfi-t2"
      : "border border-dashed border-[#CFCFCB] bg-white text-hfi-t3";
}

export function ReviewQueue({ rows }: { rows: ReviewRow[] }) {
  const router = useRouter();
  const [origin, setOrigin] = useState<ReviewRow["origin"] | "all">("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [armed, setArmed] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const count = (k: ReviewRow["origin"] | "all") => (k === "all" ? rows.length : rows.filter((r) => r.origin === k).length);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => (origin === "all" || r.origin === origin) && (!q || `${r.name} ${r.meta}`.toLowerCase().includes(q)));
  }, [rows, origin, query]);

  const say = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };
  const toggle = (id: string) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
    setArmed(false);
  };
  const allPicked = visible.length > 0 && visible.every((r) => picked.has(r.id));
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(visible.map((r) => r.id)));

  const act = (kind: "approve" | "skip") =>
    start(async () => {
      const ids = [...picked];
      const res = kind === "approve" ? await approveVenues(ids) : await skipVenues(ids);
      if (!res.ok) {
        say(res.message ?? "That didn't go through. Try again.");
        return;
      }
      setPicked(new Set());
      setArmed(false);
      say(`${kind === "approve" ? "Approved" : "Skipped"} ${res.count} ${res.count === 1 ? "place" : "places"}.`);
      router.refresh();
    });

  const pickAlcohol = (id: string, value: boolean | null) =>
    start(async () => {
      const res = await setAlcohol(id, value);
      setEditing(null);
      say(res.ok ? "Alcohol saved." : (res.message ?? "Couldn't save that."));
      router.refresh();
    });

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-hfi-hair px-4 py-5 text-hfi-t2">
        <b className="text-hfi-ink">Nothing waiting.</b> New places land here when you send them, or after a sweep or scan.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Where it came from" className="flex flex-wrap gap-2">
          {ORIGINS.filter(([k]) => k === "all" || count(k) > 0).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={origin === k}
              className={chip(origin === k)}
              onClick={() => {
                setOrigin(k);
                setPicked(new Set());
                setArmed(false);
              }}
            >
              {label} <span className="opacity-70">{count(k)}</span>
            </button>
          ))}
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-hfi-hair bg-white px-3 sm:w-[260px]">
          <span className="sr-only">Search the queue</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or area"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-hfi-hair bg-white">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[40px_minmax(0,2.2fr)_minmax(0,1.6fr)_150px_150px_56px] items-center gap-4 border-b border-hfi-divider px-5 py-3 text-[12px] text-hfi-t3">
            <input type="checkbox" aria-label="Select all shown" checked={allPicked} onChange={toggleAll} className="h-[18px] w-[18px] accent-hfi-ink" />
            <span>Place</span>
            <span>Why it&apos;s here</span>
            <span>Alcohol</span>
            <span>Ready</span>
            <span />
          </div>
          {visible.map((r) => {
            const on = picked.has(r.id);
            return (
              <div
                key={r.id}
                className={`grid grid-cols-[40px_minmax(0,2.2fr)_minmax(0,1.6fr)_150px_150px_56px] items-center gap-4 border-t border-hfi-divider px-5 py-3.5 first:border-t-0 ${on ? "bg-[#F6F6F5] shadow-[inset_3px_0_0_#0F0F0F]" : ""}`}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(r.id)} aria-label={`Select ${r.name}`} className="h-[18px] w-[18px] accent-hfi-ink" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{r.name}</span>
                  <span className="text-[13px] text-hfi-t2">{r.meta}</span>
                  {r.partial && <span className="text-[12.5px] text-hfi-t2">Partly halal: {r.partial}</span>}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px]">{r.source}</span>
                  <span className="truncate text-[12px] text-hfi-t3" title={r.evidence}>
                    {r.evidence}
                  </span>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={editing === r.id}
                    onClick={() => setEditing(editing === r.id ? null : r.id)}
                    className={`h-[30px] rounded-full px-2.5 text-[12px] font-medium ${alcoholClass(r.alcohol)}`}
                  >
                    {alcoholLabel(r.alcohol)} <span aria-hidden="true" className="text-[9px]">▾</span>
                  </button>
                  {editing === r.id && (
                    <div className="absolute left-0 top-9 z-10 flex flex-col gap-1 rounded-xl border border-hfi-hair bg-white p-2 shadow-lg">
                      {([[false, "No alcohol"], [true, "Serves alcohol"], [null, "Not sure"]] as const).map(([v, label]) => (
                        <button
                          key={label}
                          type="button"
                          disabled={busy}
                          onClick={() => pickAlcohol(r.id, v)}
                          className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13px] hover:bg-hfi-pill ${r.alcohol === v ? "font-semibold" : ""}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5" aria-label={`${r.score} of ${r.dots.length} details complete`}>
                  {r.dots.map((d) => (
                    <DotIcon key={d.key} k={d.key} state={d.state} label={d.label} />
                  ))}
                  <span className="ml-1.5 text-[12px] tabular-nums text-hfi-t2">
                    {r.score}/{r.dots.length}
                  </span>
                </div>
                {r.placeId ? (
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(r.placeId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-hfi-link"
                  >
                    Map ↗
                  </a>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
          {!visible.length && <p className="px-5 py-6 text-hfi-t2">Nothing matches that.</p>}
        </div>
      </div>

      {picked.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hfi-hair bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-6px_24px_rgba(15,15,15,.08)] md:left-[248px] md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <b>{picked.size} selected</b>{" "}
              <button type="button" className="text-hfi-link" onClick={() => setPicked(new Set())}>
                Clear
              </button>
            </span>
            <span className="flex gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={() => (armed ? act("skip") : setArmed(true))}
                className={`h-11 rounded-full border px-4 font-medium text-hfi-red ${armed ? "border-hfi-red bg-hfi-red-bg" : "border-hfi-hair bg-white"}`}
              >
                {armed ? `Tap again to skip ${picked.size}` : "Skip"}
              </button>
              <button type="button" disabled={busy} onClick={() => act("approve")} className="h-11 rounded-full bg-hfi-orn px-5 font-semibold text-white disabled:opacity-60">
                {busy ? "Saving…" : `Approve ${picked.size}`}
              </button>
            </span>
          </div>
        </div>
      )}
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-hfi-ink px-4 py-2.5 text-[14px] text-white">
          {toast}
        </div>
      )}
    </>
  );
}
