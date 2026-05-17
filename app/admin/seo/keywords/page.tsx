"use client";

import { useState, useMemo } from "react";
import { Plus, Download, Upload, Hash, ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  seoKeywords,
  type SeoKeyword,
  type KeywordStatus,
  type PageType,
} from "@/lib/admin-mock-data";

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

function StatusBadge({ status }: { status: KeywordStatus }) {
  if (status === "live")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live</span>;
  if (status === "targeting")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Targeting</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />Not Targeting</span>;
}

const ALL_STATUSES: { label: string; value: KeywordStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Live", value: "live" },
  { label: "Targeting", value: "targeting" },
  { label: "Not Targeting", value: "not-targeting" },
];

const ALL_KD = ["all", "low", "medium", "high"] as const;
const ALL_TYPES: { label: string; value: PageType | "listing" | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "Area", value: "area" },
  { label: "Cuisine", value: "cuisine" },
  { label: "Chain", value: "chain" },
  { label: "Vibe", value: "vibe" },
  { label: "Feature", value: "feature" },
  { label: "Listing", value: "listing" },
];

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-9 pl-3 pr-8 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#10B981]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function KeywordsPage() {
  const [statusFilter, setStatusFilter] = useState<KeywordStatus | "all">("all");
  const [kdFilter, setKdFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [typeFilter, setTypeFilter] = useState<PageType | "listing" | "all">("all");

  const filtered = useMemo(
    () =>
      seoKeywords.filter((k) => {
        if (statusFilter !== "all" && k.status !== statusFilter) return false;
        if (kdFilter !== "all" && k.kd !== kdFilter) return false;
        if (typeFilter !== "all" && k.pageType !== typeFilter) return false;
        return true;
      }),
    [statusFilter, kdFilter, typeFilter]
  );

  const liveCount = seoKeywords.filter((k) => k.status === "live").length;
  const targetingCount = seoKeywords.filter((k) => k.status === "targeting").length;
  const notTargetingCount = seoKeywords.filter((k) => k.status === "not-targeting").length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Keywords</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {seoKeywords.length} keywords tracked &mdash; {liveCount} live, {targetingCount} targeting, {notTargetingCount} opportunities
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Add Keyword
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={ALL_STATUSES}
        />
        <FilterSelect
          value={kdFilter}
          onChange={setKdFilter}
          options={ALL_KD.map((v) => ({ label: v === "all" ? "All KD" : "KD: " + v.charAt(0).toUpperCase() + v.slice(1), value: v }))}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={ALL_TYPES}
        />
        {(statusFilter !== "all" || kdFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setKdFilter("all"); setTypeFilter("all"); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors h-9 px-3 rounded-lg border border-border hover:bg-secondary"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Keyword", "Volume", "KD", "Page Type", "Target Page", "Status"].map((h) => (
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
              {filtered.map((kw) => (
                <tr key={kw.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="font-medium text-foreground">{kw.keyword}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{volLabel(kw.volume)}</td>
                  <td className="px-4 py-4"><KdBadge kd={kw.kd} /></td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-muted-foreground capitalize">{kw.pageType.replace("-", " ")}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{kw.targetPage}</code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={kw.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No keywords match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
