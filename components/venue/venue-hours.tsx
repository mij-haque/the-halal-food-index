"use client";

import { DAYS, DAY_NAME, dayText, londonNow, openStatus, type WeekHours } from "@/lib/hours";
import { useNow } from "@/lib/use-now";

/*
 * Venue page hours (design/venue-baraka-kitchen.html: .statuspill and
 * .hourstable). The table is in the HTML on arrival; today's row and the
 * open/closed pill are worked out in the browser in UK time.
 */

export function OpenStatusPill({ hours }: { hours: WeekHours | null }) {
  const now = useNow();
  const status = now ? openStatus(hours, now) : null;
  if (!status) return null;
  const open = status.tone !== "closed";
  return (
    <div
      className={`mb-[14px] inline-flex items-center gap-[7px] rounded-full border border-hfi-border bg-hfi-surface px-[13px] py-1.5 text-[12.5px] font-semibold ${
        status.tone === "open" ? "text-hfi-green" : status.tone === "soon" ? "text-[#8A4B04]" : "text-hfi-t2"
      }`}
    >
      <span
        className={`h-[7px] w-[7px] shrink-0 rounded-full ${open ? (status.tone === "open" ? "bg-hfi-green" : "bg-hfi-amber") : "bg-hfi-t3"}`}
        aria-hidden="true"
      />
      {status.label}
    </div>
  );
}

export function HoursTable({ hours }: { hours: WeekHours }) {
  const now = useNow();
  const today = now ? londonNow(now).day : null;
  const status = now ? openStatus(hours, now) : null;
  const openNow = status?.tone === "open" || status?.tone === "soon";
  return (
    <table className="mb-2 mt-[14px] w-full border-collapse text-[13px]">
      <caption className="sr-only">Opening hours</caption>
      <tbody>
        {DAYS.map((d) => {
          const isToday = d === today;
          return (
            <tr key={d}>
              <th scope="row" className={`border-b border-hfi-divider py-[7px] text-left font-normal ${isToday ? "font-bold text-hfi-ink" : ""}`}>
                {DAY_NAME[d]}
                {isToday && <span className="sr-only"> (today)</span>}
              </th>
              <td
                className={`border-b border-hfi-divider py-[7px] text-right ${
                  isToday ? `font-bold ${openNow ? "text-hfi-green" : "text-hfi-ink"}` : "text-hfi-t2"
                }`}
              >
                {dayText(hours[d])}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
