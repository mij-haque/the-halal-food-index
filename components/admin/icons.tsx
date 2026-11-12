/* Readiness badges for the admin: a filled circle per check, coloured by state. */

export const DOT_PATHS: Record<string, string> = {
  google: "M12 21s-6.5-5.6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z",
  area: "M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z M9 4v13.5 M15 6.5V20",
  food: "M7 3v8 M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3 M7 11v10 M17.5 3c-2.2 0-3.5 2.4-3.5 5.5s1.3 4.5 3.5 4.5v8",
  hours: "M12 7.5V12l3 2 M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  rating: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z",
  alcohol: "M7 3h10l-1 7a4 4 0 0 1-8 0z M12 14v7 M8.5 21h7",
  contact: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  writeup: "M5 6h14 M5 10h14 M5 14h9 M5 18h6",
  live: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
};

const STYLE = {
  done: { bg: "#0B8F5A", fg: "#FFFFFF", ring: "#0B8F5A" },
  missing: { bg: "#FBF0E0", fg: "#B06005", ring: "#E8C99A" },
  problem: { bg: "#C02929", fg: "#FFFFFF", ring: "#C02929" },
} as const;
export const STATE_COLOUR = { done: STYLE.done.bg, missing: STYLE.missing.fg, problem: STYLE.problem.bg } as const;
const WORD = { done: "done", missing: "missing", problem: "problem" } as const;

export function DotIcon({ k, state, label, size = 24 }: { k: string; state: keyof typeof STYLE; label: string; size?: number }) {
  const s = STYLE[state];
  return (
    <span
      title={`${label}: ${WORD[state]}`}
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: s.bg, boxShadow: `inset 0 0 0 1px ${s.ring}` }}
    >
      {k === "halal" ? (
        // The word halal (حلال), as on halal signage.
        <svg width={size * 0.82} height={size * 0.82} viewBox="0 0 24 24" aria-hidden="true">
          <text x="12" y="15.6" textAnchor="middle" fontSize="11" fontWeight="700" fill={s.fg} style={{ fontFamily: "'Noto Naskh Arabic','Geeza Pro','Arial',sans-serif" }}>
            حلال
          </text>
        </svg>
      ) : (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke={s.fg} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={DOT_PATHS[k]} />
        </svg>
      )}
    </span>
  );
}

export function Seal({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" fill="none" stroke="#B8924E" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="10.5" fill="#0B6B45" />
      <path d="M17 10.5l1.8 4.2 4.5.4-3.4 3 1 4.4-3.9-2.3-3.9 2.3 1-4.4-3.4-3 4.5-.4z" fill="#FCFCFC" />
    </svg>
  );
}
