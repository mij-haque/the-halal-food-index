"use client";

import { DAYS, DAY_NAME, dayText, londonNow, openStatus, type WeekHours } from "@/lib/hours";
import { useNow } from "@/lib/use-now";
import { StatusPill } from "@/components/site/status-pill";

/*
 * Venue page hours (design/venue-baraka-kitchen.html: .hourstable). The table
 * is in the HTML on arrival; today's row and the open/closed pill are worked
 * out in the browser in UK time (pages are cached).
 */

/** Open/closed pill for the hero meta row, same look as the list cards. */
export function LiveStatus({ hours }: { hours: WeekHours | null }) {
  const now = useNow();
  const status = now ? openStatus(hours, now) : null;
  if (!status) return null;
  return (
    <span className="hfi-status-in inline-flex">
      <StatusPill status={status} size="md" />
    </span>
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
