"use client";

import { useState, useMemo } from "react";
import {
  Plus, Eye, Edit2, ToggleLeft, ToggleRight, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  programmaticPages,
  type ProgrammaticPage,
  type PageStatus,
  type PageType,
} from "@/lib/admin-mock-data";
import { PageSlidePanel } from "@/components/admin/page-slide-panel";

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusPill({ page }: { page: ProgrammaticPage }) {
  if (page.status === "live")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  if (page.status === "draft")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        Draft
      </span>
    );
  if (page.status === "not-enough-listings") {
    const needed = page.minListingsRequired - page.listingsCount;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Needs {needed} more
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Needs content
    </span>
  );
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type TabKey = "all" | PageType;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "area", label: "Area" },
  { key: "cuisine", label: "Cuisine" },
  { key: "cuisine-area", label: "Cuisine+Area" },
  { key: "chain", label: "Chain" },
  { key: "feature", label: "Feature" },
  { key: "vibe", label: "Vibe" },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedPage, setSelectedPage] = useState<ProgrammaticPage | null>(null);

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? programmaticPages
        : programmaticPages.filter((p) => p.pageType === activeTab),
    [activeTab]
  );

  const counts: Record<TabKey, number> = useMemo(() => {
    const base: Partial<Record<TabKey, number>> = { all: programmaticPages.length };
    for (const tab of TABS.slice(1)) {
      base[tab.key] = programmaticPages.filter((p) => p.pageType === tab.key).length;
    }
    return base as Record<TabKey, number>;
  }, []);

  const liveCount = filtered.filter((p) => p.status === "live").length;
  const issueCount = filtered.filter((p) => p.status !== "live").length;

  return (
    <>
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Pages</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} pages &mdash; {liveCount} live, {issueCount} with issues
            </p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shrink-0">
            <Plus className="h-4 w-4" />
            New Page
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                activeTab === tab.key
                  ? "border-[#0F172A] dark:border-white text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]"
                  : "bg-secondary text-muted-foreground"
              )}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Page Title", "URL Slug", "Target Keyword", "Listings", "Status", "Last Updated", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="font-medium text-foreground">{page.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {page.slug}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground max-w-[160px] truncate">
                      {page.targetKeyword}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {page.minListingsRequired > 0 ? (
                        <span className={cn(
                          "text-sm font-semibold tabular-nums",
                          page.listingsCount >= page.minListingsRequired
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}>
                          {page.listingsCount}
                          <span className="text-xs font-normal text-muted-foreground">/{page.minListingsRequired}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill page={page} />
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {page.lastUpdated}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Preview"
                          className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => setSelectedPage(page)}
                          className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title={page.status === "live" ? "Unpublish" : "Publish"}
                          className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                        >
                          {page.status === "live" ? (
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide panel */}
      {selectedPage && (
        <PageSlidePanel page={selectedPage} onClose={() => setSelectedPage(null)} />
      )}
    </>
  );
}
