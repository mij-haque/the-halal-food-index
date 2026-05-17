"use client";

import { useState, useMemo } from "react";
import { Plus, Upload, Search as SearchIcon, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { seoRedirects, type SeoRedirect } from "@/lib/admin-mock-data";

type Filter = "all" | "active" | "inactive";

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<SeoRedirect[]>(seoRedirects);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newType, setNewType] = useState<"301" | "302">("301");

  const filtered = useMemo(() => {
    return redirects.filter((r) => {
      if (filter === "active" && !r.active) return false;
      if (filter === "inactive" && r.active) return false;
      if (search && !r.from.includes(search) && !r.to.includes(search)) return false;
      return true;
    });
  }, [redirects, filter, search]);

  const toggleActive = (id: string) => {
    setRedirects((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  const deleteRedirect = (id: string) => {
    setRedirects((rs) => rs.filter((r) => r.id !== id));
  };

  const addRedirect = () => {
    if (!newFrom || !newTo) return;
    const newR: SeoRedirect = {
      id: `r${Date.now()}`,
      from: newFrom.startsWith("/") ? newFrom : "/" + newFrom,
      to: newTo.startsWith("/") ? newTo : "/" + newTo,
      type: newType,
      created: new Date().toISOString().slice(0, 10),
      active: true,
    };
    setRedirects((rs) => [newR, ...rs]);
    setNewFrom("");
    setNewTo("");
    setNewType("301");
    setShowAdd(false);
  };

  const activeCount = redirects.filter((r) => r.active).length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Redirects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {redirects.length} redirects &mdash; {activeCount} active
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button
            title="Check for redirect chains and loops"
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Audit
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Redirect
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">New Redirect</h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From (path)</label>
              <input
                value={newFrom}
                onChange={(e) => setNewFrom(e.target.value)}
                placeholder="/old-path"
                className="w-full h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To (path)</label>
              <input
                value={newTo}
                onChange={(e) => setNewTo(e.target.value)}
                placeholder="/new-path"
                className="w-full h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "301" | "302")}
                className="h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#111] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              >
                <option value="301">301 — Permanent</option>
                <option value="302">302 — Temporary</option>
              </select>
            </div>
            <button
              onClick={addRedirect}
              disabled={!newFrom || !newTo}
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "active", "inactive"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-colors",
              filter === f
                ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="relative ml-auto">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search paths…"
            className="h-8 pl-8 pr-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#10B981] w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["From", "To", "Type", "Created", "Status", ""].map((h) => (
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
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-4 py-4">
                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{r.from}</code>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{r.to}</code>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      r.type === "301"
                        ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                        : "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                    )}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">{r.created}</td>
                  <td className="px-4 py-4">
                    {r.active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleActive(r.id)}
                        title={r.active ? "Deactivate" : "Activate"}
                        className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                      >
                        {r.active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteRedirect(r.id)}
                        title="Delete"
                        className="h-7 w-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No redirects match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
