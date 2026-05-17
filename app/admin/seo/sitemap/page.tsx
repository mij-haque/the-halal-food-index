"use client";

import { useState } from "react";
import {
  RefreshCw, Send, Download, Info, CheckCircle2, AlertCircle, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { programmaticPages } from "@/lib/admin-mock-data";

// ── Derived counts ─────────────────────────────────────────────────────────────

const areaPagesLive = programmaticPages.filter((p) => p.pageType === "area" && p.status === "live").length;
const cuisinePagesLive = programmaticPages.filter((p) => (p.pageType === "cuisine" || p.pageType === "cuisine-area") && p.status === "live").length;
const chainPagesLive = programmaticPages.filter((p) => p.pageType === "chain" && p.status === "live").length;
const vibePagesLive = programmaticPages.filter((p) => (p.pageType === "vibe" || p.pageType === "feature") && p.status === "live").length;
const listingPages = 423; // simulated listing pages
const totalUrls = listingPages + areaPagesLive + cuisinePagesLive + chainPagesLive + vibePagesLive;

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const FREQS: Freq[] = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

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
        <span className="absolute left-5 top-0 z-50 w-52 rounded-lg bg-[#0F172A] text-white text-xs px-3 py-2 leading-relaxed shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

function PrioritySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground w-36 shrink-0">{label}</span>
      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-[#10B981]"
      />
      <span className="text-sm font-mono text-foreground w-8 text-right shrink-0">{value.toFixed(1)}</span>
    </div>
  );
}

function FreqSelect({ value, onChange }: { value: Freq; onChange: (v: Freq) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Freq)}
        className="h-8 pl-3 pr-8 rounded-lg border border-border bg-white dark:bg-[#111] text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-[#10B981]"
      >
        {FREQS.map((f) => (
          <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SitemapPage() {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [excludePattern, setExcludePattern] = useState("/admin/*\n/api/*");

  const [priorities, setPriorities] = useState({
    listings: 0.8,
    area: 0.7,
    cuisine: 0.7,
    chain: 0.9,
    vibe: 0.6,
  });

  const [freqs, setFreqs] = useState<Record<string, Freq>>({
    listings: "weekly",
    area: "weekly",
    cuisine: "monthly",
    chain: "monthly",
    vibe: "monthly",
  });

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastGenerated] = useState("2026-05-10");
  const [lastSubmitted] = useState("2026-05-10");

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const setFreq = (key: string, val: Freq) =>
    setFreqs((f) => ({ ...f, [key]: val }));
  const setPriority = (key: keyof typeof priorities, val: number) =>
    setPriorities((p) => ({ ...p, [key]: val }));

  const URL_TYPES = [
    { label: "Listing pages", count: listingPages, color: "bg-blue-500" },
    { label: "Area pages", count: areaPagesLive, color: "bg-emerald-500" },
    { label: "Cuisine pages", count: cuisinePagesLive, color: "bg-purple-500" },
    { label: "Chain pages", count: chainPagesLive, color: "bg-amber-500" },
    { label: "Vibe / Feature pages", count: vibePagesLive, color: "bg-pink-500" },
  ];

  return (
    <div className="max-w-screen-xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Sitemap</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure, generate, and submit your XML sitemap to Google
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── Left: settings ── */}
        <div className="space-y-5">

          {/* Auto-generate toggle */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Auto-generate on publish</div>
                <div className="text-xs text-muted-foreground mt-0.5">Regenerate sitemap whenever a page goes live or is unpublished</div>
              </div>
              <button
                onClick={() => setAutoGenerate((v) => !v)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors duration-200",
                  autoGenerate ? "bg-[#10B981]" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                    autoGenerate && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Priority sliders */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Priority</h3>
              <Tip text="Priority (0.1–1.0) hints to crawlers the relative importance of pages. It does not affect ranking — it only guides crawl budget." />
            </div>
            <div className="space-y-3">
              {(Object.keys(priorities) as Array<keyof typeof priorities>).map((k) => (
                <PrioritySlider
                  key={k}
                  label={k.charAt(0).toUpperCase() + k.slice(1) + " pages"}
                  value={priorities[k]}
                  onChange={(v) => setPriority(k, v)}
                />
              ))}
            </div>
          </div>

          {/* Change frequency */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Change Frequency</h3>
              <Tip text="Hints to crawlers how often pages change. Most crawlers ignore this, but it helps signal freshness." />
            </div>
            <div className="space-y-3">
              {Object.entries(freqs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground w-36 shrink-0 capitalize">{key} pages</span>
                  <FreqSelect value={val} onChange={(v) => setFreq(key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Exclude patterns */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Exclude Patterns</h3>
              <Tip text="One glob pattern per line. Matching pages will be excluded from the sitemap." />
            </div>
            <textarea
              value={excludePattern}
              onChange={(e) => setExcludePattern(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-[#10B981]"
            />
          </div>

          {/* Dates */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Last generated: <span className="text-foreground font-medium">{lastGenerated}</span></span>
            <span>Last submitted to Google: <span className="text-foreground font-medium">{lastSubmitted}</span></span>
          </div>
        </div>

        {/* ── Right: preview + actions ── */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Sitemap Preview</h3>

            {/* URL counts */}
            <div className="space-y-2">
              {URL_TYPES.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", t.color)} />
                    <span className="text-sm text-foreground">{t.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{t.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total URLs</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{totalUrls}</span>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="h-2 rounded-full overflow-hidden flex">
              {URL_TYPES.map((t) => (
                <div
                  key={t.label}
                  className={cn("h-full", t.color)}
                  style={{ width: `${(t.count / totalUrls) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Actions</h3>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] disabled:opacity-60 shadow-sm transition-all duration-150"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : generated ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Generated!
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Generate Sitemap
                </>
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <>
                  <Send className="h-4 w-4 animate-pulse" />
                  Submitting…
                </>
              ) : submitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Submitted to Google!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit to Google
                </>
              )}
            </button>

            <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Download className="h-4 w-4" />
              Download XML
            </button>

            <p className="text-xs text-muted-foreground text-center pt-1">
              Sitemap URL: <code className="bg-secondary px-1 rounded">/sitemap.xml</code>
            </p>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Pages with fewer than the minimum listing threshold are automatically excluded from the sitemap and set to <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">noindex</code>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
