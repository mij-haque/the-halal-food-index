"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminChains, type AdminChain, type HalalStatus } from "@/lib/admin-mock-data";
import { ChainSlidePanel } from "@/components/admin/chain-slide-panel";

function HalalStatusBadge({ status }: { status: HalalStatus }) {
  const styles: Record<HalalStatus, string> = {
    Certified: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    Partial: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    "Not Halal": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    Unknown: "bg-secondary text-muted-foreground",
  };
  const icons: Record<HalalStatus, React.FC<{ className?: string }>> = {
    Certified: CheckCircle2,
    Partial: AlertCircle,
    "Not Halal": XCircle,
    Unknown: HelpCircle,
  };
  const Icon = icons[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", styles[status])}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export default function ChainsPage() {
  const [selectedChain, setSelectedChain] = useState<AdminChain | null>(null);

  return (
    <>
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Chains</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage major UK food chains and their halal status
            </p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shrink-0">
            <Plus className="h-4 w-4" />
            Add Chain
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Chain", "Category", "Halal Status", "Items", "Last Verified", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminChains.map((chain) => {
                  const domain = (() => {
                    try { return new URL(chain.website).hostname; } catch { return chain.website; }
                  })();
                  return (
                    <tr
                      key={chain.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedChain(chain)}
                    >
                      {/* Chain name + favicon */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                            alt={chain.name}
                            className="h-9 w-9 rounded-lg object-contain bg-secondary p-1.5 shrink-0"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">{chain.name}</div>
                            <div className="text-xs text-muted-foreground">{domain}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {chain.category}
                      </td>

                      <td className="px-4 py-3">
                        <HalalStatusBadge status={chain.halalStatus} />
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                        {chain.halalItemCount}/{chain.totalItemCount}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(chain.lastVerified).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChain(chain);
                            }}
                            className="h-7 px-2.5 rounded-md border border-border bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-border transition-colors whitespace-nowrap"
                          >
                            Manage Items
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info callout */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            Chain halal status powers the &ldquo;Is X Halal?&rdquo; pages on the public site. Click any row to view full per-item status, FAQ, and verification details.
          </p>
        </div>
      </div>

      <ChainSlidePanel
        isOpen={selectedChain !== null}
        onClose={() => setSelectedChain(null)}
        chain={selectedChain}
      />
    </>
  );
}
