import Script from "next/script";

/*
 * Vercel Web Analytics: a cookieless visit count, so people who ignore or
 * decline the cookie choice still show up in the totals. Separate from GA4 and
 * not tied to consent. Loaded as a plain script because it needs no package.
 *
 * Vercel may serve the script from a project-specific path, which it passes in
 * at build time. The fallback is its standard path.
 */
const BASE = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH || "/_vercel";

export function VisitCounter() {
  return <Script id="hfi-visits" src={`${BASE}/insights/script.js`} strategy="afterInteractive" />;
}
