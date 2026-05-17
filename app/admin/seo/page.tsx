"use client";

import { useState } from "react";
import {
  FileText, AlertTriangle, CheckCircle2, AlertCircle, TrendingUp,
  Info, ArrowRight, Zap, BookOpen, Link2, Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { seoKeywords, programmaticPages } from "@/lib/admin-mock-data";

// ── Derived stats ─────────────────────────────────────────────────────────────
const totalPages = programmaticPages.length;
const livePages = programmaticPages.filter((p) => p.status === "live").length;
const issuePages = programmaticPages.filter((p) => p.status !== "live").length;
const missingMeta = programmaticPages.filter((p) => !p.metaDescription).length;
const hasSchema = programmaticPages.filter((p) => p.pageType === "chain" || p.pageType === "area").length;
const schemaCoverage = Math.round((hasSchema / totalPages) * 100);

const STAT_CARDS = [
  {
    label: "Pages Indexed",
    value: livePages,
    sub: `of ${totalPages} total`,
    icon: FileText,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Pages with Issues",
    value: issuePages,
    sub: "not-enough-listings or needs-content",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    label: "Missing Meta Descriptions",
    value: missingMeta,
    sub: "pages without meta description",
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    label: "Schema Coverage",
    value: `${schemaCoverage}%`,
    sub: `${hasSchema} pages with structured data`,
    icon: CheckCircle2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
];

type QuickWin = {
  title: string;
  description: string;
  type: "warning" | "info" | "success";
  action: string;
};

const QUICK_WINS: QuickWin[] = [
  {
    title: "Add meta descriptions to 17 pages",
    description: "Most programmatic pages are missing meta descriptions. These directly affect click-through rates in search results.",
    type: "warning",
    action: "Go to Pages",
  },
  {
    title: "Fallowfield page needs 1 more listing",
    description: "The /fallowfield page is set to noindex with 2 listings. Add 1 more halal restaurant in Fallowfield to make it live.",
    type: "info",
    action: "Add Listing",
  },
  {
    title: "Target 'halal mocktails manchester' (320/mo)",
    description: "This keyword has no page yet. Create a vibe page for halal mocktails — low competition, growing search volume.",
    type: "info",
    action: "Create Page",
  },
  {
    title: "4 redirect chains detected",
    description: "Some redirects point to pages that themselves redirect. Consolidate to direct 301s to avoid crawl budget waste.",
    type: "warning",
    action: "View Redirects",
  },
  {
    title: "3 area pages are now live",
    description: "Rusholme, City Centre, and Northern Quarter pages all meet the 3-listing threshold and are indexed.",
    type: "success",
    action: "View Pages",
  },
  {
    title: "Submit updated sitemap to Google",
    description: "7 new pages were added in the last 30 days. Resubmit your sitemap to speed up indexing.",
    type: "info",
    action: "Go to Sitemap",
  },
];

// Top keyword opportunities (not-targeting or targeting with high volume)
const opportunities = seoKeywords
  .filter((k) => k.status !== "live")
  .slice(0, 8);

function volLabel(v: string | number) {
  if (typeof v === "number") return v.toLocaleString();
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function KdBadge({ kd }: { kd: string }) {
  const s =
    kd === "low"
      ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
      : kd === "medium"
      ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
      : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400";
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", s)}>
      {kd.charAt(0).toUpperCase() + kd.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "live")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">Live</span>;
  if (status === "targeting")
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">Targeting</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Not Targeting</span>;
}

export default function SeoOverviewPage() {
  const [expandedWin, setExpandedWin] = useState<number | null>(null);

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">SEO Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Health score, quick wins, and keyword opportunities
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", card.bg)}>
                  <Icon className={cn("h-4 w-4", card.color)} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Wins */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Quick Wins</h3>
          </div>
          <div className="divide-y divide-border">
            {QUICK_WINS.map((win, i) => {
              const Icon =
                win.type === "warning"
                  ? AlertTriangle
                  : win.type === "success"
                  ? CheckCircle2
                  : Info;
              const iconColor =
                win.type === "warning"
                  ? "text-amber-500"
                  : win.type === "success"
                  ? "text-emerald-500"
                  : "text-blue-500";
              const isOpen = expandedWin === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedWin(isOpen ? null : i)}
                  className="w-full text-left px-5 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", iconColor)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground leading-snug">{win.title}</div>
                      {isOpen && (
                        <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                          {win.description}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyword Opportunities */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-foreground">Keyword Opportunities</h3>
            </div>
            <a href="/admin/seo/keywords" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Keyword", "Volume", "KD", "Target Page", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {opportunities.map((kw) => (
                  <tr key={kw.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[180px]">{kw.keyword}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{volLabel(kw.volume)}</td>
                    <td className="px-4 py-3"><KdBadge kd={kw.kd} /></td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{kw.targetPage}</code>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={kw.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
