# The Halal Food Index

Manchester-first halal restaurant directory with evidence-led verification, plus national
"Is X halal?" chain pages. It is a data product: the directory is the public interface.

Built as a side project by one person. **Low operational overhead beats cleverness.** If a
feature needs daily babysitting, it is the wrong design.

Stack: Next.js 14 App Router, TypeScript, Tailwind, Supabase (Postgres 17 + PostGIS), Vercel.

---

## Current state (read this first)

- **The public site reads live from Supabase** (anon key, RLS). Rebuilt pages live in the
  `app/(site)` route group with the HFI brand (`hfi-*` Tailwind tokens, `app/(site)/site.css`).
  The old navy/gold mock pages, mock data and admin mock-up have been removed.
- **Routes** (patterns in `lib/site.ts`):
  - `/halal-restaurants-manchester`: flagship listing, `app/(site)/halal-restaurants-manchester`
  - `/{slug}`: one route (`app/(site)/[slug]`) that serves area listings
    (`/halal-restaurants-{area}-manchester`), cuisine listings (`/halal-{cuisine}-manchester`)
    and venue pages, in that order. Unknown or unpublished slugs 404.
  - `/` redirects (temporary) to the flagship until the homepage is built.
  - `sitemap.xml` and `robots.txt` are generated (`app/sitemap.ts`, `app/robots.ts`).
- Category pages with fewer than 5 listings render but are `noindex, follow`
  (`MIN_LISTINGS_TO_INDEX` in `lib/listings.ts`) and are left out of the sitemap.
- Venues are added as `draft`, moved to `review`, and only become `published` with the
  owner's sign-off. Only published venues appear anywhere on the site.
- Not in the data yet: photos, map, price. Pages show honest placeholders or leave those
  parts out. Filters exist only for facets with data.
- **Google Maps facts** (opening hours, star rating, review count) come from Apify's Google
  Maps Scraper via the `maps-refresh` Edge Function (`supabase/functions/maps-refresh/`),
  run daily by pg_cron. They live in `external_place_cache` (30-day expiry, refreshed
  before it lapses) and the site reads them through `venue_place_facts()`. If that call
  fails the site still works, just without hours and ratings. List cards show the rating
  and an open/closed pill worked out in the browser (UK time, `lib/hours.ts`).
  `APIFY_TOKEN` is a Supabase Edge Function secret set by the owner; never ask for it.
- **Certification is not part of the product** (decision 3 Nov 2026, see
  `docs/decisions-update-no-certification.md`). Ignore the certification and "certificate seen"
  parts of the venue and chain mockups.
- **IndexNow:** `indexnow_ping()` (pg_cron `indexnow-daily`, 04:41) sends venue, category and chain pages changed in the last
  48 hours to Bing and friends. The key file is `public/9fd61dfc8540fbe191bdddee1b7905c8.txt`; keep both in step.
- Old pre-v1 tables live in the `legacy` schema, locked from the API. Leave them alone.

## Source of truth

| What | Where |
|---|---|
| Visual design, per page | `design/*.html` (open in a browser) |
| Design tokens, voice rules | `design/design-system.html` |
| Product and SEO decisions | `docs/decisions.md`, then `docs/decisions-update-*.md` (newer wins) |
| Database schema | `supabase/migrations/` (applied, in order) |
| DB types | `types/supabase.ts` (generated, do not hand-edit) |
| Photo pipeline (separate, Apps Script) | `docs/photo-pipeline-phase1-brief.md` |
| Write-up and copy style (no AI-sounding text) | `docs/writing-style.md`, checked by `scripts/check-writeups.mjs` |

Reference pages in `design/`:
- `homepage-v10.html`
- `listing-manchester.html`: flagship template for every listing/category page
- `venue-baraka-kitchen.html`: venue detail page
- `chain-nandos-v12.html`: chain status page
- `admin-hybrid.html`: admin / review queue
- `social-cards.html`: OG image designs

When rebuilding a page, port the mockup faithfully into React server components with Tailwind.
Do not redesign. If something in a mockup conflicts with a decisions doc, the decisions doc wins.

## Database

- Supabase project ref: `wsrcyxbtoaizhzxrmfaa`
- Regenerate types after any schema change:
  `npx supabase gen types typescript --project-id wsrcyxbtoaizhzxrmfaa > types/supabase.ts`
- Env vars (in `.env.local`, never committed): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The service role key is server-only and must never reach
  the client bundle.
- RLS is on for every table. Anonymous users can read reference data, chains, and
  **published** venues and their children. `submissions` and `corrections` are insert-only.
  `external_place_cache` and the `review_queue` view are not exposed at all.
- `verification_events` is append-only (a trigger blocks updates). Record a new event; never
  edit an old one. Inserting one updates `venues.last_verified_at` automatically.
- Schema changes go in a new timestamped file in `supabase/migrations/`. Never edit an
  applied migration.

## Non-negotiables

- **Server-side rendering.** Venue, listing and chain content must be in the HTML on arrival.
  No client-side fetching for indexable content.
- **No em-dashes in anything a user or crawler sees**: copy, meta tags, JSON-LD. Code comments
  are fine.
- **Colour discipline.**
  - Semantic green `#0B8F5A` only for genuine halal-status or open-now signals.
  - Ornamental green `#0B6B45` for the seal and primary CTAs.
  - Brass `#B8924E` is decorative only.
  - Selected/active UI states are ink `#0F0F0F`, never green.
  - Link blue `#1F56BA` only for real navigation.
- **Fonts:** Bricolage Grotesque (display) + Instrument Sans (body). No other families.
- **Structured data must match visible text.** No FAQPage schema (no longer earns rich
  results). ItemList entries carry `position` + `url` only.
  Shared Organization/WebSite nodes live in `lib/schema.ts` (same `@id` on every page).
  Name only The Halal Food Index: no founder or personal names, no aggregateRating from Google.
- **Filtered/faceted URLs are not indexable.** Canonical them to the clean base URL. Only
  deliberately built category pages get their own indexed URL.
- A category page never shows a filter for the facet that defines it (locked-facet rule).
- **Prefix state classes** (`.pg-open`, not `.open`), and keep every `id` unique. Both have
  caused silent bugs before.

## Data guardrails

- **No certification required.** Listings are good faith: a venue is listed as halal when the
  venue itself says it is (its Google listing, website, menu or signage). Never mark a venue
  halal from its cuisine type alone. Scrapers create `draft` venues with
  `halal_status = 'unknown'`.
- **No halal badge on venues.** Everything listed is halal, so venue cards and venue pages show
  no "Halal" pill, tag or tick. Chain pages keep their Halal / Partial / Not halal status.
- **Partial venues say what is halal.** If only some items are halal, use
  `halal_status = 'partial'` and put the plain-English note in `halal_scope`
  (e.g. "Chicken is halal. Beef and lamb are not.").
- Certification fields (`certification_id`, `cert_reference`, `cert_expires_on`,
  `certification_bodies`) and `verification_events` stay in the schema as optional extras.
  Nothing should require them and no page should display them.
- Nothing is published (`status = 'published'`) without the owner's sign-off.
- **Venue names use a capital letter at the start of every word** ("Charrd", not "CHARRD").
  Keep short acronyms (KFC, BBQ) and a brand's own inner capitals (EastZeast).
- Never use Google, TripAdvisor or other third-party photos. Only own photos or photos with
  written permission (`venue_photos.source`).
- Never commit secrets. Never print keys in logs or PR descriptions.

## Build order

1. ~~Supabase client and typed queries~~ (`lib/supabase/server.ts`, `lib/venues.ts`, `lib/listings.ts`)
2. ~~Venue page~~ (`components/venue/venue-view.tsx`)
3. ~~Listing page + area and cuisine pages~~ (`components/listing/`)
4. Chain pages: KFC live at `/is-kfc-halal` (`components/chain/`, `lib/chains.ts`). Next chains reuse it; set
   `chains.published` only with owner sign-off. Original spec: `design/chain-nandos-v12.html` (`chains`, `chain_items`,
   `chain_branch_status`).
5. Homepage from `design/homepage-v10.html` (then drop the `/` redirect in `next.config.mjs`).

Work on a branch and open a PR. Do not push to `main`.
