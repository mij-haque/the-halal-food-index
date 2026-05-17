"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { X, Info, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgrammaticPage, PageType } from "@/lib/admin-mock-data";

// ── Helpers ──────────────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <Info
        className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute left-5 top-0 z-50 w-56 rounded-lg bg-[#0F172A] text-white text-xs px-3 py-2 leading-relaxed shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const pct = Math.min(len / max, 1);
  const color =
    len === 0 ? "bg-border" :
    pct < 0.75 ? "bg-emerald-500" :
    pct < 1 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className={cn("text-xs tabular-nums", len > max ? "text-red-500 font-semibold" : "text-muted-foreground")}>
        {len}/{max}
      </span>
    </div>
  );
}

const SCHEMA_OPTIONS: { label: string; value: string }[] = [
  { label: "Restaurant", value: "Restaurant" },
  { label: "LocalBusiness", value: "LocalBusiness" },
  { label: "FAQPage", value: "FAQPage" },
  { label: "ItemList", value: "ItemList" },
  { label: "WebPage", value: "WebPage" },
];

// Mock intro paragraph generation
const INTRO_TEMPLATES = [
  (p: ProgrammaticPage) =>
    `Looking for halal food in ${p.title.replace(/^Halal .*? in /, "")}? We've verified ${p.listingsCount} halal-certified restaurants so you can eat with confidence.`,
  (p: ProgrammaticPage) =>
    `${p.title} — find HMC and HFA certified halal restaurants with verified menus, real reviews, and up-to-date opening hours.`,
  (p: ProgrammaticPage) =>
    `Discover the best ${p.targetKeyword} options with Halal Food Index. All listings are independently verified for halal certification.`,
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  page: ProgrammaticPage | null;
  onClose: () => void;
}

export function PageSlidePanel({ page, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [h1, setH1] = useState("");
  const [intro, setIntro] = useState("");
  const [schemaType, setSchemaType] = useState("LocalBusiness");
  const [regenMetaDesc, setRegenMetaDesc] = useState(false);
  const [regenIntro, setRegenIntro] = useState(false);
  const [regenMetaError, setRegenMetaError] = useState(false);
  const [regenIntroError, setRegenIntroError] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset state when panel opens with new page
  useEffect(() => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setTargetKeyword(page.targetKeyword);
    setMetaTitle(page.metaTitle ?? "");
    setMetaDesc(page.metaDescription ?? "");
    setH1(page.h1 ?? page.title);
    setIntro("");
    setSchemaType(
      page.pageType === "chain" ? "FAQPage" :
      page.pageType === "area" || page.pageType === "cuisine" ? "ItemList" : "LocalBusiness"
    );
    setRegenMetaError(false);
    setRegenIntroError(false);
    setSaved(false);
  }, [page]);

  const autoMetaTitle = useMemo(
    () => title ? `${title} | Halal Food Index` : "",
    [title]
  );

  const regenerateMeta = useCallback(async () => {
    if (!page) return;
    setRegenMetaDesc(true);
    setRegenMetaError(false);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const templates = [
        `Find the best ${page.targetKeyword} with verified halal certification. ${page.listingsCount > 0 ? page.listingsCount + " restaurants reviewed." : "HMC & HFA certified."}`,
        `Halal Food Index lists verified ${page.targetKeyword} restaurants. HMC, HFA, and self-certified options with real reviews.`,
        `Looking for ${page.targetKeyword}? We've independently verified halal certification so you can eat with confidence.`,
      ];
      setMetaDesc(templates[Math.floor(Math.random() * templates.length)].slice(0, 155));
    } catch {
      setRegenMetaError(true);
    } finally {
      setRegenMetaDesc(false);
    }
  }, [page]);

  const regenerateIntro = useCallback(async () => {
    if (!page) return;
    setRegenIntro(true);
    setRegenIntroError(false);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const fn = INTRO_TEMPLATES[Math.floor(Math.random() * INTRO_TEMPLATES.length)];
      setIntro(fn(page));
    } catch {
      setRegenIntroError(true);
    } finally {
      setRegenIntro(false);
    }
  }, [page]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!page) return null;

  const qualifyingListings = Array.from({ length: page.listingsCount }, (_, i) => ({
    id: `ql-${i}`,
    name: `Listing ${i + 1}`,
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-[540px] bg-white dark:bg-[#1A1A1A] border-l border-border shadow-2xl z-50 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Edit Page</h2>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{page.pageType.replace("-", " ")} page</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Basic fields */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Details</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white dark:bg-[#111] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                URL Slug <Tip text="The path that appears in the browser. Changing this will break existing links unless you add a redirect." />
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Target Keyword</label>
              <input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white dark:bg-[#111] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
          </section>

          {/* Meta */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta / SEO</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                Meta Title <Tip text="Appears as the blue link in Google results. Keep under 60 chars. Defaults to: page title + ' | Halal Food Index'" />
              </label>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={autoMetaTitle}
                className="w-full h-9 rounded-lg border border-border bg-white dark:bg-[#111] px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
              <CharCounter value={metaTitle || autoMetaTitle} max={60} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                Meta Description <Tip text="Shown below the title in search results. Aim for 140–155 chars. Avoid repeating the title." />
              </label>
              {regenMetaDesc ? (
                <div className="w-full h-20 rounded-lg border border-border bg-secondary/50 animate-pulse" />
              ) : (
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-white dark:bg-[#111] px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              )}
              <CharCounter value={metaDesc} max={155} />
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={regenerateMeta}
                  disabled={regenMetaDesc}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", regenMetaDesc && "animate-spin")} />
                  {regenMetaDesc ? "Generating…" : regenMetaError ? "Retry" : "AI Regenerate"}
                </button>
                {regenMetaError && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" /> Failed — try again
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                H1 <Tip text="The main heading shown on the page. Should contain the target keyword." />
              </label>
              <input
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-white dark:bg-[#111] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                Intro Paragraph <Tip text="Opening paragraph shown at the top of the page. Should mention location, certification type, and review count." />
              </label>
              {regenIntro ? (
                <div className="w-full h-20 rounded-lg border border-border bg-secondary/50 animate-pulse" />
              ) : (
                <textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={3}
                  placeholder="Write an intro or use AI to generate one…"
                  className="w-full rounded-lg border border-border bg-white dark:bg-[#111] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              )}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={regenerateIntro}
                  disabled={regenIntro}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", regenIntro && "animate-spin")} />
                  {regenIntro ? "Generating…" : regenIntroError ? "Retry" : "AI Generate"}
                </button>
                {regenIntroError && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" /> Failed — try again
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Schema */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schema</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                Schema Type <Tip text="The structured data type for this page. Chain pages use FAQPage; list pages use ItemList." />
              </label>
              <div className="relative">
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-white dark:bg-[#111] text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                >
                  {SCHEMA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </section>

          {/* Qualifying listings */}
          {page.listingsCount > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Qualifying Listings ({page.listingsCount})
              </h3>
              <div className="space-y-1.5">
                {qualifyingListings.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/30 text-sm text-foreground">
                    <span className="h-4 w-4 rounded-sm border border-border bg-emerald-500 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {l.name}
                  </div>
                ))}
              </div>
              {page.listingsCount < page.minListingsRequired && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Needs {page.minListingsRequired - page.listingsCount} more listing{page.minListingsRequired - page.listingsCount > 1 ? "s" : ""} to go live.
                </p>
              )}
            </section>
          )}

          {/* Internal links placeholder */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Links</h3>
            <div className="text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-3">
              No internal links configured. Add links to related pages to improve crawlability.
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            {saved ? "Saved!" : "Save Page"}
          </button>
        </div>
      </aside>
    </>
  );
}
