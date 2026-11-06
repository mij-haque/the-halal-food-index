import { useEffect, useState } from "react";

/**
 * The time now, ticking each minute. Null on the server and on the first
 * render, so open/closed is only worked out in the browser (pages are cached).
 * Client components only.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
