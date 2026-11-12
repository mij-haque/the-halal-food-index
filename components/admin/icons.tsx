/* Line icons for the admin's readiness dots. Stroke takes the state colour. */

export const DOT_PATHS: Record<string, string> = {
  halal: "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4",
  google: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z M12 8.5v3",
  area: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14",
  food: "M7 3v8 M5 3v4a2 2 0 0 0 4 0V3 M7 11v10 M17 3c-2 0-3 2-3 5s1 4 3 4v9",
  hours: "M12 7v5l3 2 M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  rating: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  alcohol: "M7 3h10l-1 7a4 4 0 0 1-8 0z M12 14v7 M8 21h8",
  contact: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  writeup: "M4 6h16 M4 10h16 M4 14h10 M4 18h7",
  live: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
};

export const STATE_COLOUR = { done: "#0B8F5A", missing: "#B06005", problem: "#C02929" } as const;
export const STATE_WORD = { done: "done", missing: "missing", problem: "problem" } as const;

export function DotIcon({ k, state, label, size = 15 }: { k: string; state: keyof typeof STATE_COLOUR; label: string; size?: number }) {
  return (
    <span title={`${label}: ${STATE_WORD[state]}`} className="inline-flex">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={STATE_COLOUR[state]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={DOT_PATHS[k]} />
      </svg>
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
