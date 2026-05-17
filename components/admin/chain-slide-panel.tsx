"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ExternalLink, CheckCircle2, XCircle, AlertCircle, HelpCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminChain, HalalStatus } from "@/lib/admin-mock-data";

interface ChainSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  chain: AdminChain | null;
}

type ItemStatus = "Halal" | "Not Halal" | "Varies" | "Unknown";

interface MenuItem {
  item: string;
  status: ItemStatus;
  notes?: string;
}

function HalalStatusBadge({ status }: { status: HalalStatus }) {
  const config: Record<HalalStatus, { label: string; className: string; Icon: React.FC<{ className?: string }> }> = {
    Certified: {
      label: "Certified Halal",
      className: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
      Icon: CheckCircle2,
    },
    Partial: {
      label: "Partially Halal",
      className: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      Icon: AlertCircle,
    },
    "Not Halal": {
      label: "Not Halal",
      className: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
      Icon: XCircle,
    },
    Unknown: {
      label: "Unknown",
      className: "bg-secondary text-muted-foreground",
      Icon: HelpCircle,
    },
  };
  const { label, className, Icon } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function ItemStatusDot({ status }: { status: ItemStatus }) {
  const colours: Record<ItemStatus, string> = {
    Halal: "bg-emerald-500",
    "Not Halal": "bg-red-500",
    Varies: "bg-amber-500",
    Unknown: "bg-secondary",
  };
  const textColours: Record<ItemStatus, string> = {
    Halal: "text-emerald-700 dark:text-emerald-400",
    "Not Halal": "text-red-700 dark:text-red-400",
    Varies: "text-amber-700 dark:text-amber-400",
    Unknown: "text-muted-foreground",
  };
  return (
    <span className={cn("flex items-center gap-1.5 text-xs font-semibold", textColours[status])}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", colours[status])} />
      {status}
    </span>
  );
}

function EditableItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: MenuItem;
  onChange: (updated: MenuItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-border first:border-0">
      <input
        value={item.item}
        onChange={(e) => onChange({ ...item, item: e.target.value })}
        placeholder="Item name"
        className="flex-1 h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
      />
      <select
        value={item.status}
        onChange={(e) => onChange({ ...item, status: e.target.value as ItemStatus })}
        className="h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option>Halal</option>
        <option>Not Halal</option>
        <option>Varies</option>
        <option>Unknown</option>
      </select>
      <input
        value={item.notes ?? ""}
        onChange={(e) => onChange({ ...item, notes: e.target.value })}
        placeholder="Notes..."
        className="w-24 h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
      />
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ChainSlidePanel({ isOpen, onClose, chain }: ChainSlidePanelProps) {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setItems(chain?.menuItems ?? []);
  }, [chain]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !chain) return null;

  const domain = (() => {
    try { return new URL(chain.website).hostname; } catch { return chain.website; }
  })();

  const addItem = () => setItems([...items, { item: "", status: "Halal", notes: "" }]);
  const updateItem = (i: number, updated: MenuItem) =>
    setItems(items.map((it, idx) => (idx === i ? updated : it)));
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] z-50 flex flex-col bg-background shadow-2xl border-l border-border">
        {/* Header */}
        <div className="flex items-start gap-4 px-5 py-5 border-b border-border shrink-0">
          {/* Favicon logo */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt={chain.name}
            className="h-12 w-12 rounded-xl object-contain bg-secondary p-2 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">{chain.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                {chain.category}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <HalalStatusBadge status={chain.halalStatus} />
              <a
                href={chain.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Website
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border shrink-0">
          {[
            { label: "Halal Items", value: `${chain.halalItemCount}/${chain.totalItemCount}` },
            { label: "Last Verified", value: new Date(chain.lastVerified).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className="text-lg font-bold text-foreground tabular-nums">{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {/* Editable per-item table */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Per-item Halal Status
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add item
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No items. Click &ldquo;Add item&rdquo; to add.</p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden px-3 py-1">
                <div className="grid grid-cols-[1fr_100px_96px_32px] bg-secondary/50 -mx-3 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Item</span>
                  <span>Status</span>
                  <span>Notes</span>
                  <span />
                </div>
                {items.map((item, i) => (
                  <EditableItemRow
                    key={i}
                    item={item}
                    onChange={(updated) => updateItem(i, updated)}
                    onRemove={() => removeItem(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              FAQ — &ldquo;Is {chain.name} Halal?&rdquo;
            </h3>
            <div className="space-y-3">
              {chain.faq.map((q, i) => (
                <div key={i} className="rounded-lg bg-secondary/50 p-3.5">
                  <p className="text-xs font-semibold text-foreground mb-1">{q.question}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{q.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification info */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Verification
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Verified by</span>
                <span className="text-foreground text-xs font-medium">{chain.verifiedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Last verified</span>
                <span className="text-foreground text-xs font-medium">
                  {new Date(chain.lastVerified).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-background shrink-0">
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Close
            </button>
            <button className="h-9 px-5 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              Save Chain
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
