"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  ExternalLink,
  MoreHorizontal,
  X,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminListings,
  type AdminListing,
  type HalalStatus,
  type CertType,
  type ListingStatus,
} from "@/lib/admin-mock-data";
import { ListingSlidePanel } from "@/components/admin/listing-slide-panel";

// ─── Badge helpers ────────────────────────────────────────────────────────────

function HalalStatusBadge({ status }: { status: HalalStatus }) {
  const styles: Record<HalalStatus, string> = {
    Certified: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    Partial: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    "Not Halal": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    Unknown: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", styles[status])}>
      {status}
    </span>
  );
}

function CertBadge({ cert }: { cert: CertType }) {
  const styles: Record<CertType, string> = {
    HMC: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    HFA: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    "Self-Certified": "bg-secondary text-muted-foreground",
    Awaiting: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    "Not Certified": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  };
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", styles[cert])}>
      {cert}
    </span>
  );
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const styles: Record<ListingStatus, string> = {
    Active: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    Unverified: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    Closed: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    "Temporarily Closed": "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", styles[status])}>
      {status}
    </span>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  selected,
  onToggle,
  onEdit,
}: {
  listing: AdminListing;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const visible = listing.cuisines.slice(0, 2);
  const extra = listing.cuisines.length - 2;

  return (
    <tr
      className={cn(
        "group border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-100",
        selected && "bg-emerald-50/50 dark:bg-emerald-950/10"
      )}
    >
      <td className="px-4 py-4 w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border accent-emerald-600 cursor-pointer"
        />
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg shrink-0"
            style={{
              background: `linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
            }}
          />
          <div>
            <div className="text-sm font-semibold text-foreground leading-tight">
              {listing.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground font-mono">{listing.postcode}</span>
              {listing.alcoholServed && (
                <span className="text-[10px] font-semibold px-1.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  Alcohol
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
        {listing.type}
      </td>

      <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
        {listing.area}
      </td>

      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {visible.map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
            >
              {c}
            </span>
          ))}
          {extra > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{extra}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-4">
        <HalalStatusBadge status={listing.halalStatus} />
      </td>

      <td className="px-4 py-4">
        <CertBadge cert={listing.cert} />
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={listing.status} />
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
          {listing.score.toFixed(1)}
        </span>
      </td>

      <td className="px-4 py-4 w-24">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="View on site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return adminListings.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        search === "" ||
        l.name.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.cuisines.some((c) => c.toLowerCase().includes(q));
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "Closed"
          ? l.status === "Closed" || l.status === "Temporarily Closed"
          : l.status === filterStatus);
      return matchSearch && matchStatus;
    });
  }, [search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = adminListings.filter((l) => l.status === "Active").length;
  const unverifiedCount = adminListings.filter((l) => l.status === "Unverified").length;
  const closedCount = adminListings.filter(
    (l) => l.status === "Closed" || l.status === "Temporarily Closed"
  ).length;

  const allSelected = paginated.length > 0 && paginated.every((l) => selectedIds.has(l.id));
  const someSelected = paginated.some((l) => selectedIds.has(l.id));

  const toggleAll = () => {
    const ids = new Set(selectedIds);
    if (allSelected) {
      paginated.forEach((l) => ids.delete(l.id));
    } else {
      paginated.forEach((l) => ids.add(l.id));
    }
    setSelectedIds(ids);
  };

  const toggleOne = (id: string) => {
    const ids = new Set(selectedIds);
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
    setSelectedIds(ids);
  };

  const openAdd = () => {
    setEditingId(null);
    setShowPanel(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setShowPanel(true);
  };

  const STATUS_FILTERS = [
    { key: "all", label: `All (${adminListings.length})` },
    { key: "Active", label: `Active (${activeCount})` },
    { key: "Unverified", label: `Unverified (${unverifiedCount})` },
    { key: "Closed", label: `Closed (${closedCount})` },
  ];

  return (
    <>
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Listings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage all halal restaurant and food listings
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add New Listing
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search listings..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
          </button>
          <div className="ml-auto flex items-center gap-1 h-9 rounded-lg border border-border bg-white dark:bg-[#1A1A1A] p-1">
            <button className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-foreground">
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilterStatus(f.key);
                setPage(1);
              }}
              className={cn(
                "text-xs font-semibold h-7 px-3 rounded-full border transition-colors duration-150",
                filterStatus === f.key
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                  : "border-border bg-white dark:bg-[#1A1A1A] text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-border accent-emerald-600 cursor-pointer"
                    />
                  </th>
                  {[
                    "Name",
                    "Type",
                    "Area",
                    "Cuisines",
                    "Halal Status",
                    "Cert",
                    "Status",
                    "Score",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                        h === "Score" || h === "" ? "text-right" : "text-left"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      selected={selectedIds.has(listing.id)}
                      onToggle={() => toggleOne(listing.id)}
                      onEdit={() => openEdit(listing.id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                      No listings match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              {filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} listings
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-3 text-xs rounded-lg border border-border bg-secondary text-muted-foreground disabled:opacity-40 hover:bg-border transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-3 text-xs rounded-lg border border-border bg-secondary text-muted-foreground disabled:opacity-40 hover:bg-border transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 h-11 px-5 bg-[#0F172A] dark:bg-white rounded-full shadow-2xl border border-white/10 dark:border-border">
          <span className="text-sm font-semibold text-white dark:text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-4 bg-white/20 dark:bg-border" />
          <button className="text-sm font-semibold text-emerald-400 dark:text-emerald-600 hover:text-emerald-300 transition-colors">
            Verify
          </button>
          <button className="text-sm font-semibold text-blue-400 dark:text-blue-500 hover:text-blue-300 transition-colors">
            Export
          </button>
          <button className="text-sm font-semibold text-red-400 dark:text-red-500 hover:text-red-300 transition-colors">
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/50 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Slide panel */}
      <ListingSlidePanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        listingId={editingId}
        listings={adminListings}
        currentIndex={
          editingId ? adminListings.findIndex((l) => l.id === editingId) : -1
        }
        onNavigate={(id) => setEditingId(id)}
      />
    </>
  );
}
