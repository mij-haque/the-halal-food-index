/*
 * Opening hours, as stored by the maps-refresh Edge Function:
 *   { mon: [[660, 1380]], tue: [], ... }
 * Each range is [start, end] in minutes after midnight, UK time. A range that
 * runs past midnight ends after 1440 (5pm to 2am = [1020, 1560]). An empty
 * list means closed that day; a missing day means we don't know.
 *
 * Status is worked out in the browser at view time (pages are cached), always
 * in Europe/London time.
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type WeekHours = Partial<Record<DayKey, number[][]>>;
export type OpenStatus = { tone: "open" | "soon" | "closed"; label: string };

const ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SHORT: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const CLOSING_SOON_MINS = 60;

const londonFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function londonNow(at: Date): { day: DayKey; mins: number } {
  const parts = londonFmt.formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday").slice(0, 3).toLowerCase() as DayKey;
  return { day: ORDER.includes(day) ? day : "mon", mins: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** 660 -> "11am", 690 -> "11:30am", 0 -> "midnight", 720 -> "12pm". */
export function clock(m: number): string {
  const t = ((m % 1440) + 1440) % 1440;
  if (t === 0) return "midnight";
  const h = Math.floor(t / 60);
  const mm = t % 60;
  const h12 = h % 12 || 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
}

/** Validates hours coming from the database (shape only). */
export function asWeekHours(raw: unknown): WeekHours | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: WeekHours = {};
  for (const d of ORDER) {
    const ranges = (raw as Record<string, unknown>)[d];
    if (!Array.isArray(ranges)) continue;
    const ok = ranges.filter(
      (r): r is number[] => Array.isArray(r) && r.length === 2 && r.every((n) => typeof n === "number" && Number.isFinite(n)),
    );
    if (ok.length === ranges.length) out[d] = ok.map((r) => [r[0], r[1]]).sort((a, b) => a[0] - b[0]);
  }
  return Object.keys(out).length ? out : null;
}

function openUntil(end: number, mins: number, allDay: boolean): OpenStatus {
  if (allDay) return { tone: "open", label: "Open 24 hours" };
  if (end - mins <= CLOSING_SOON_MINS) return { tone: "soon", label: `Closes at ${clock(end)}` };
  return { tone: "open", label: `Open until ${clock(end)}` };
}

/** Open, closing soon or closed right now. Null when we don't know. */
export function openStatus(hours: WeekHours | null | undefined, at: Date): OpenStatus | null {
  if (!hours) return null;
  const { day, mins } = londonNow(at);
  const i = ORDER.indexOf(day);

  // still open from last night
  for (const [, e] of hours[ORDER[(i + 6) % 7]] ?? []) {
    if (e > 1440 && mins < e - 1440) return openUntil(e - 1440, mins, false);
  }

  const today = hours[day];
  if (today === undefined) return null;
  for (const [s, e] of today) {
    if (mins >= s && mins < e) return openUntil(e, mins, s === 0 && e >= 1440);
  }

  for (const [s] of today) if (s > mins) return { tone: "closed", label: `Closed · opens ${clock(s)}` };
  for (let k = 1; k <= 7; k++) {
    const d = ORDER[(i + k) % 7];
    const ranges = hours[d];
    if (ranges === undefined) break;
    if (ranges.length) {
      return { tone: "closed", label: `Closed · opens ${k === 1 ? "tomorrow" : SHORT[d]} ${clock(ranges[0][0])}` };
    }
  }
  return { tone: "closed", label: "Closed" };
}
