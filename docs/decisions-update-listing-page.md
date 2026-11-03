# Session update — listing/category page (append to decisions.md)

Everything below is new since the last update. Where it corrects or supersedes
something already in `decisions.md`, that's called out explicitly.

---

## Listing page — locked

`/halal-restaurants-manchester` is the flagship template. Every future category
page (brunch, breakfast, buffet, steakhouse, Trafford Centre, Chinese, pizza)
inherits this same template with one facet pre-locked, not a fresh design.

**Filters, final list:** Type, Cuisine, Area, Price, Minimum rating, Meals,
Collections. Halal scope stays as a default-inclusive toggle (both boxes
ticked), not a real narrowing filter.

**Verification-tier filter — dropped.** The Halal/Partial pill on every card
stays; the "Certificate seen only" checkbox does not. Reasoning: checked
against Zabihah's actual site — their list pages show no certification detail
at all, only their own trust score. Certification detail lives on the venue's
own page, not the list. Card verification lines ("HFA certificate seen ·
[date]") were removed entirely from list cards for the same reason — the
scope note (e.g. "Halal menu section") stays, since that's information a
customer needs, not a verification claim.

**Card style:** compact and editorial both built behind a toggle. Default is
**compact** while cards use zellij-pattern placeholders. Flip the default to
**editorial** once real photos exist — that style earns its keep with actual
photography, not patterns. This is a tracked decision, written directly into
the code as a comment so it isn't lost.

**Desktop layout:** toggleable sidebar, closed by default (full-width grid,
identical to today unless a user asks for it). Chosen over BestDubai's
always-on persistent sidebar specifically because it doesn't force the layout
change on everyone by default. Grid drops from 4 to 3 columns only while open.
Mobile is unaffected either way — confirmed BestDubai only does the sidebar
treatment at desktop widths too, mobile is the same overlay-button pattern
regardless.

**Mobile filter bar:** condensed to Sort + Filters only (matches BestDubai's
own mobile pattern). Type chips, Open now, and the view toggle move into the
Filters drawer instead of cluttering the top bar.

**Colour discipline, restated and tightened:** black is the primary colour for
names and text. Green is reserved *only* for genuine halal-status signals —
the pill, the "Open now" status dot. Blue (`#1F56BA`, already established) is
for genuine navigational links only, used moderately — Collections list items
qualify, general filter/chip active-states do not. Selected/active UI states
(type chips, Open now, price and rating pills) are **black**, not green —
being selected is a UI state, not a halal signal, and conflating the two
was a real bug this session (see below).

**Locked-facet rule (new, general):** a category page never shows a filter
for the facet that already defines it. A cuisine page hides the Cuisine
filter, an area page hides Area, a meal-collection page hides Meal. Applies
across the whole family, not just cuisine — write this into whatever
component/template generates category pages, not per-page.

**Combine-vs-split rule (already in the master prompt, re-surfaced because it
directly settled this session's Type-filter-vs-separate-pages question):**
compare the top 10 organic results for each term. 5+ shared URLs → combine
into one page. 3 or fewer shared → separate pages. 4 → judgement call using
inventory and intent. This is the actual test to run before splitting
Restaurants/Cafés/Takeaways into their own URLs — not a fixed venue count.

**Schema gap, confirmed still open:** `venue_type` (restaurant/cafe/takeaway/
bakery) does not exist in `venues`. Needed before the Type filter is real.
Needs an enum column or a small lookup table matching the `cuisines`/`areas`
pattern.

---

## SEO — technical requirements confirmed this session

- **Server-side rendering is non-negotiable, not a nice-to-have.** Confirmed
  by directly fetching bestdubai.com without executing JavaScript and getting
  back every venue's full details — proof their speed comes from content
  already being in the page on arrival, not client-side JS building it after
  load. Whatever renders this page for real must do the same.
- **ItemList JSON-LD corrected** to Google's actual documented pattern for a
  summary page: each `ListItem` carries only `position` and `url`, no nested
  object, and the list must include every item actually on the page (not a
  sample).
- **FAQPage schema won't earn rich results** — restricted to government/health
  sites since 2023. The original master-prompt spec assumed otherwise; don't
  build for it.
- **Pagination:** real numbered pages when it's needed, self-referencing
  canonical per page, never canonical-back-to-page-1. Not needed yet —
  trigger is when a single page gets heavy enough to hurt load speed, not a
  fixed venue count. At current/near-term volume, one page is simpler and
  better for SEO than pagination built too early.
- **Filter/facet URLs must not be independently indexable.** Canonical every
  filtered state back to the clean base URL; use GSC parameter handling or
  noindex,follow on query params. Only the deliberately-built category pages
  (the ones gated by the combine/split rule above) get to be real indexed
  URLs.

---

## Keyword data — cross-checked via Mangools/KWFinder

New pull, separate tool from the original DataForSEO/Semrush research —
numbers largely confirm the existing table, one correction worth logging:

| Term | Mangools volume | KD | Note |
|---|---|---|---|
| halal restaurant manchester | 16,500 | 22 ("Still Easy") | Matches the 17.1k figure already on file — two-tool consensus on the core term |
| halal brunch manchester | 1,000 | 28 ("Still Easy") | **Higher than the 506 previously recorded** — different tools estimate differently, don't fully anchor on either number, but this only strengthens brunch as an early-win page, doesn't weaken it |

Both terms trending down year-over-year (-23%, -25%) — not alarming alone,
worth monitoring rather than ignoring.

---

## Bugs hit this session — worth remembering for every page built from here

Adds to the existing "Build discipline" section, same lessons, new concrete
examples:

- **Generic state-toggle class names collide with existing semantic classes.**
  Naming a sidebar's open/closed state class `.open` collided with an
  existing `.open{color:green}` rule (used for "venue is currently open"
  status text). Since colour inherits, the entire sidebar and every card
  inside it silently turned green. No error, no warning — just a broken
  page. Prefix state-toggle classes (`.pg-open`, not `.open`) to avoid this
  category of bug entirely.
- **A sticky footer inside a scrolling panel will always fight with content**
  scrolled near the bottom of the visible area — this isn't really fixable
  with padding tricks. The real fix is structural: split the panel into a
  fixed header, an independently-scrolling middle region, and a fixed
  (non-sticky) footer as a genuine layout sibling. Applies to any drawer or
  modal with pinned action buttons, not just this one.
- **CSS Grid auto-placement can misbehave** when combined with
  `position:sticky` and a toggled `display` value — don't rely on DOM source
  order to determine column placement in this situation; set
  `grid-column`/`grid-row` explicitly.
- **`display:none` cannot be transitioned.** For a smooth open/close reveal,
  animate `grid-template-columns` (0 → target width) and opacity instead of
  toggling display directly.

---

## Data

`seed-real-venues-manchester.sql` — 12 real Manchester venues (Rusholme/
Longsight cluster), drafted this session, not yet run. Every row is
deliberately `status = 'draft'` and `halal_status = 'unknown'` — these are
leads to verify, not verified listings. Run in Supabase, then verify each one
for real before publishing.

---

## Still owed, getting more overdue each time it's mentioned

- **"How we verify" methodology page.** Cards now point outward to
  verification detail instead of stating it inline — there's nowhere for
  that pointer to land yet.
- **Venue detail page.** Confirmed this session it was never built under the
  current brand — an old version exists under the fully-retired navy/gold
  direction and isn't reusable. This is the next build, starting fresh.

---

## Build queue, in order

1. **Venue detail page** — the actual next build. Reference material exists
   (bestdubai venue-page teardown) but nothing has been built under the
   current brand.
2. **Category pages** (brunch, breakfast, buffet, steakhouse, Trafford
   Centre) — cheap once the venue page exists, same listing template with one
   locked facet each.
3. **"How we verify" page** — increasingly overdue.
4. **Features as a filter** (prayer space, women-only seating, etc.) —
   the one facet BestDubai's model can't offer HFI's audience. Worth building
   once the venue page defines what venue-level data actually looks like.
