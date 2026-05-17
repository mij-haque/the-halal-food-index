"use client";

import { useMemo } from "react";
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  Minus,
  Plus,
  Pencil,
  CheckCheck,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { activityItems, pendingVerifications } from "@/lib/admin-mock-data";
import type { ActivityItem } from "@/lib/admin-mock-data";

// Sparkline (7-day data)
const SPARKLINES = {
  totalListings: [391, 398, 401, 408, 412, 418, 423],
  verified: [349, 356, 358, 365, 369, 374, 378],
  pending: [42, 42, 43, 43, 43, 44, 45],
  cuisines: [16, 16, 17, 17, 17, 17, 18],
};

function Sparkline({ data, color = "#10B981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const H = 28;
  const W = 72;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 6) - 3}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const STATS = [
  {
    label: "TOTAL LISTINGS",
    value: "423",
    trend: "+8 this week",
    dir: "up" as const,
    data: SPARKLINES.totalListings,
    color: "#10B981",
    Icon: UtensilsCrossed,
  },
  {
    label: "VERIFIED LISTINGS",
    value: "378",
    trend: "+6 this week",
    dir: "up" as const,
    data: SPARKLINES.verified,
    color: "#10B981",
    Icon: CheckCircle2,
  },
  {
    label: "PENDING VERIFICATION",
    value: "45",
    trend: "+2 this week",
    dir: "neutral" as const,
    data: SPARKLINES.pending,
    color: "#F59E0B",
    Icon: Clock,
  },
  {
    label: "TOTAL CUISINES",
    value: "18",
    trend: "+1 this week",
    dir: "up" as const,
    data: SPARKLINES.cuisines,
    color: "#10B981",
    Icon: Layers,
  },
];

const ACTIVITY_ICON_MAP: Record<ActivityItem["type"], React.FC<{ className?: string }>> = {
  create: Plus,
  update: Pencil,
  verify: CheckCheck,
  delete: Minus,
  export: Download,
};

const ACTIVITY_COLOUR: Record<ActivityItem["type"], string> = {
  create: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600",
  update: "bg-blue-100 dark:bg-blue-950/30 text-blue-600",
  verify: "bg-purple-100 dark:bg-purple-950/30 text-purple-600",
  delete: "bg-red-100 dark:bg-red-950/30 text-red-600",
  export: "bg-secondary text-muted-foreground",
};

export default function AdminDashboardPage() {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Good {greeting}, Mij 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with The Halal Food Index today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {s.label}
              </span>
              <s.Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                  {s.value}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs mt-1",
                    s.dir === "up" ? "text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  {s.dir === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {s.trend}
                </div>
              </div>
              <Sparkline data={s.data} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {activityItems.map((item) => {
              const Icon = ACTIVITY_ICON_MAP[item.type];
              const colour = ACTIVITY_COLOUR[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className={cn(
                      "mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                      colour
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.target} · {item.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Pending Verifications</h3>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full">
              {pendingVerifications.length} pending
            </span>
          </div>
          <div className="divide-y divide-border">
            {pendingVerifications.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div
                  className="h-9 w-9 rounded-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.cuisine} · {item.addedDate}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors">
                    Verify
                  </button>
                  <button className="text-xs font-semibold px-3 py-1 rounded-lg bg-secondary text-muted-foreground hover:bg-border transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
