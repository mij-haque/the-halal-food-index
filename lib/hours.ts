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

export const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const ORDER = DAYS;
export const DAY_NAME: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const SHORT: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const CLOSING_SOON_MINS = 60;

const londonFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function londonNow(at: Date): { day: DayKey; mins: number } {
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

/** 24-hour clock for the hours table: 660 -> "11:00", 1440 -> "00:00". */
function hhmm(m: number): string {
  const t = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** One day's hours as shown in the table. */
export function dayText(ranges: number[][] | undefined): string {
  if (ranges === undefined) return "Not listed";
  if (ranges.length === 0) return "Closed";
  if (ranges.length === 1 && ranges[0][0] === 0 && ranges[0][1] >= 1440) return "Open 24 hours";
  return ranges.map(([s, e]) => `${hhmm(s)} \u2013 ${hhmm(e)}`).join(", ");
}

/** "9am to 9pm", "12pm to 11:30pm and 5pm to midnight", "Open 24 hours", "Closed". */
function rangesText(ranges: number[][]): string {
  if (ranges.length === 0) return "Closed";
  if (ranges.length === 1 && ranges[0][0] === 0 && ranges[0][1] >= 1440) return "Open 24 hours";
  return ranges.map(([s, e]) => `${clock(s)} to ${clock(e)}`).join(" and ");
}

/**
 * The week in as few lines as possible: days next to each other with the same
 * hours are grouped. [{ days: "Every day", hours: "9am to 9pm" }] or
 * [{ days: "Mon to Thu", ... }, { days: "Fri to Sun", ... }]. Days we don't
 * know are left out. Null when no day is known.
 */
export function weekSummary(hours: WeekHours | null | undefined): Array<{ days: string; hours: string }> | null {
  if (!hours) return null;
  const groups: Array<{ from: DayKey; to: DayKey; n: number; key: string; text: string }> = [];
  for (const d of DAYS) {
    const r = hours[d];
    if (r === undefined) continue;
    const key = JSON.stringify(r);
    const last = groups[groups.length - 1];
    if (last && last.key === key && DAYS.indexOf(last.to) === DAYS.indexOf(d) - 1) {
      last.to = d;
      last.n++;
    } else {
      groups.push({ from: d, to: d, n: 1, key, text: rangesText(r) });
    }
  }
  if (!groups.length) return null;
  return groups.map((g) => ({
    days: g.n === 7 ? "Every day" : g.n === 1 ? SHORT[g.from] : `${SHORT[g.from]} to ${SHORT[g.to]}`,
    hours: g.text,
  }));
}

/**
 * schema.org openingHoursSpecification, only when all seven days are known
 * (so it never claims more than the table shows). Days with the same hours
 * are grouped.
 */
export function openingHoursSpec(hours: WeekHours | null | undefined) {
  if (!hours || DAYS.some((d) => hours[d] === undefined)) return null;
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>();
  for (const d of DAYS) {
    for (const [s, e] of hours[d] ?? []) {
      const allDay = s === 0 && e >= 1440;
      const opens = hhmm(s);
      const closes = allDay ? "23:59" : hhmm(e);
      const key = `${opens}-${closes}`;
      const g = groups.get(key) ?? { opens, closes, days: [] };
      g.days.push(DAY_NAME[d]);
      groups.set(key, g);
    }
  }
  if (!groups.size) return null;
  return [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days,
    opens: g.opens,
    closes: g.closes,
  }));
}
