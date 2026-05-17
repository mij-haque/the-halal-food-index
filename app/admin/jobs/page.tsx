"use client";

import { useState } from "react";
import {
  Play,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Download,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminJobs, type AdminJob, type JobStatus } from "@/lib/admin-mock-data";

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: JobStatus }) {
  if (status === "queued") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-secondary border-2 border-muted-foreground/40 animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground">Queued</span>
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="relative h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
          <span className="absolute inset-0 rounded-full bg-amber-500" />
        </span>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Running</span>
      </span>
    );
  }
  if (status === "complete") {
    return (
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Complete</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="text-xs font-semibold text-red-600 dark:text-red-400">Failed</span>
    </span>
  );
}

// ─── Job type icons ───────────────────────────────────────────────────────────

const JOB_ICONS: Record<AdminJob["type"], React.FC<{ className?: string }>> = {
  "Apify Scrape": Database,
  "Google Refresh": RefreshCw,
  "Bulk Verify": ShieldCheck,
  "Data Export": Download,
  "Chain Status Update": Link2,
};

const JOB_ICON_BG = "bg-secondary text-[#6B7280]";

// ─── Log terminal ─────────────────────────────────────────────────────────────

function LogTerminal({ lines, error }: { lines: string[]; error?: string }) {
  if (lines.length === 0 && !error) {
    return (
      <div className="rounded-lg border border-border px-3 py-2 font-mono text-xs text-muted-foreground italic bg-secondary/30">
        No log output yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border overflow-hidden font-mono text-xs leading-relaxed">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "px-3 py-1.5 text-[#0F172A] dark:text-[#E2E8F0] whitespace-pre-wrap",
            i % 2 === 0 ? "bg-[#F8FAFC] dark:bg-[#1A1A1A]" : "bg-white dark:bg-[#141414]"
          )}
        >
          {line}
        </div>
      ))}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 whitespace-pre-wrap">
          ✗ {error}
        </div>
      )}
    </div>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: AdminJob }) {
  const [expanded, setExpanded] = useState(job.status === "running");
  const Icon = JOB_ICONS[job.type];
  const iconBg = JOB_ICON_BG;

  const borderColour =
    job.status === "running"
      ? "border-amber-300 dark:border-amber-700"
      : job.status === "failed"
      ? "border-red-300 dark:border-red-800"
      : "border-border";

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#1A1A1A] rounded-xl border shadow-sm overflow-hidden transition-all",
        borderColour
      )}
    >
      {/* Card header */}
      <div
        className="flex items-start gap-4 p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Icon */}
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
            iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground leading-tight">{job.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{job.description}</div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <StatusIndicator status={job.status} />
              {(job.startedAt || job.duration) && (
                <div className="text-right hidden sm:block">
                  {job.startedAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(job.startedAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                  {job.duration && (
                    <div className="text-xs font-mono text-muted-foreground">{job.duration}</div>
                  )}
                </div>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Running progress indicator */}
          {job.status === "running" && (
            <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-amber-400 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Log output */}
      {expanded && (
        <div className="px-4 pb-4">
          <LogTerminal lines={job.log ?? []} error={job.error} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const running = adminJobs.filter((j) => j.status === "running").length;
  const failed = adminJobs.filter((j) => j.status === "failed").length;

  return (
    <div className="max-w-screen-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Pipeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Background jobs, scrape runs, and data exports
          </p>
        </div>
        <button
          className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#10B981] hover:bg-[#0ea572] shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Play className="h-4 w-4" />
          Run New Job
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: adminJobs.length, colour: "text-foreground" },
          { label: "Running", value: running, colour: "text-amber-600 dark:text-amber-400" },
          { label: "Complete", value: adminJobs.filter((j) => j.status === "complete").length, colour: "text-emerald-600 dark:text-emerald-400" },
          { label: "Failed", value: failed, colour: failed > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground" },
        ].map(({ label, value, colour }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-border p-4 text-center shadow-sm"
          >
            <div className={cn("text-2xl font-bold tabular-nums", colour)}>{value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Failed alert */}
      {failed > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
            {failed} job{failed > 1 ? "s" : ""} failed — check logs below for details
          </p>
        </div>
      )}

      {/* Job list */}
      <div className="space-y-3">
        {adminJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
