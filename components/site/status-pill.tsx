import type { OpenStatus } from "@/lib/hours";

/*
 * Open / closing soon / closed pill, as on the list cards (card style E).
 * Green is semantic here: it only ever means "open now".
 */

const TONE: Record<OpenStatus["tone"], { pill: string; dot: string }> = {
  open: { pill: "bg-hfi-green-bg text-hfi-ink", dot: "bg-hfi-green" },
  soon: { pill: "bg-hfi-amber-bg text-[#5C3D02]", dot: "bg-hfi-amber" },
  closed: { pill: "bg-hfi-pill text-hfi-t2", dot: "bg-hfi-t3" },
};

export function StatusPill({ status, size = "sm" }: { status: OpenStatus; size?: "sm" | "md" }) {
  const t = TONE[status.tone];
  const sz = size === "md" ? "py-1 pl-2.5 pr-3 text-[12.5px]" : "py-[3px] pl-2 pr-2.5 text-[11.5px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz} ${t.pill}`}>
      <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
      {status.label}
    </span>
  );
}
