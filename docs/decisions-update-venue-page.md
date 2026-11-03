# Session update — venue detail page (append to decisions.md)

Everything below is new since the last update. Where it corrects or
supersedes something already in `decisions.md`, that's called out
explicitly.

---

## Venue detail page — locked

First venue page built under the current brand (the only prior version
existed under the fully-retired navy/gold direction and was confirmed
unusable — this was a from-scratch build, not a port). Pilot venue is
fictional: **Baraka Kitchen**, independent Moroccan, Chorlton, fully halal
with no caveats — same placeholder-data approach as the Nando's chain page.

**Section order, final:** breadcrumb → kicker (checked date + methodology
link) → H1 → meta row (cuisine/area/price/status pill) → gallery → quote +
CTA (hero action zone) → sticky subnav → Overview + Halal Verification
(merged, two columns) → Location → Similar Spots → report-a-change (folded
into Similar Spots, not its own section — see "Deprioritised" below).

**Gallery — filmstrip, not a fixed grid.** Went through three rounds: a
big-tile-plus-three-small grid, a full-width single banner, and a
horizontal filmstrip. Filmstrip won deliberately over the grid — it scales
to any real photo count once the pipeline exists (2 photos or 15, it just
scrolls) instead of needing a fixed number to look right, and it reuses the
exact same tile component as Similar Spots below rather than introducing a
second photo-grid pattern on one page. "Photos coming soon" badge (reused
verbatim on the map placeholder too) stays until the real pipeline lands.

**Overview + Halal Verification share one section, 50/50 split, desktop
only.** Were two separate full-width stacked sections; each was far
narrower than the 1180px container, leaving dead space on one or both
sides. A hairline divider between columns, no card/shadow — the fix for
"page feels wide" was filling the width honestly, not adding visual
weight to compensate. Stacks to one column under 1040px.

**Halal verification section is deliberately light** — no enclosing card,
no heavy colour fill, same register as the chain page's "What's halal"
chips. This was an explicit walk-back from an earlier heavier "verification
card" treatment (bordered, shadowed, big badge) that read as too dominant
for the page — chips and evidence lines do the work instead.

**Hero action zone — brass rule + editorial quote mark.** The
quote-and-CTA strip plus the call/website/status row used to be two thin,
low-contrast rows (outlined icon buttons, plain status text) sandwiched
between the gallery and the two-column section — the flattest, least
"premium" moment on the page despite carrying the core claim and the
primary CTA. Fixed with: a 2px brass top rule (echoes the seal's ring), a
decorative Bricolage Grotesque quote mark, solid ink-filled circular icon
buttons instead of outlined ghost buttons, and a status pill matching the
weight of the Halal tag elsewhere. None of this adds a card — same
no-card discipline as Verification.

**Call/website/status row moved out of the hero entirely, into Overview.**
On mobile specifically, the hero's own trough (gallery → quote+CTA → a
second row of icons+status → subnav → About) read as dead space before any
real content started. Fixed by removing that second row from the hero
altogether — hero now ends right after the CTA button, straight into the
subnav — and folding call/website icons inline beside the "About Baraka
Kitchen" heading itself (same row, space-between), with the status pill on
its own line just below. Zero new vertical space added; existing space
reused. Two other placements (a utility strip above the heading; a closing
line below the amenity chips) were designed and rejected in favour of this
one specifically because it added no new row at all.

**Location section — refined, not reinvented.** Three structurally
different options were designed (map-forward with a floating info card;
the refined split that shipped; a quick-facts bar with a full-width map
below), grounded in a real finding: location/hours findability is
consistently the top driver of restaurant-site UX in usability research,
ahead of almost everything else. Shipped version keeps the existing
address/hours-left, map-right split but gives the map a real border,
shadow, and a drop-pin marker instead of a flat pattern box, and bolds/
tints the current day's row in the hours table — genuinely, not just
today's row in green regardless of status (see bug below).

**Menu section — cut entirely, not deferred quietly.** There's no reliable
way to source and keep menu items/prices current for every venue without
either manual entry (doesn't scale) or a scraping-plus-recurring-review
pipeline that doesn't exist yet (Apify is already the identified tool for
this, per the existing roadmap, but isn't built). A stale menu actively
undermines the "dated, evidence-led" trust the whole site depends on more
than an absent one does. Revisit once that pipeline exists — don't rebuild
it from placeholder dish data in the meantime.

**Partial / caveat status — pattern established, not yet used live.**
Baraka Kitchen has nothing to caveat, so the pattern exists in the
template's CSS (a `.leadcaveat` treatment) but isn't triggered by any
shipped content. When a venue *does* have a caveat (e.g. halal meat but a
licensed bar), the single most decision-relevant fact leads as a styled
statement before the chip row — not buried as just another same-weight
chip. Chosen over keeping the caveat flat-equal with the chips because
labelling/allergen-warning research is explicit that important exceptions
need real typographic weight, not to be shrunk to match everything else.

**This should be carried back to the Nando's chain page.** Its own "What's
halal" section currently buries its caveats (e.g. "Alcohol served") inside
the same mixed chip row the Partial pattern above was designed to move
away from. Worth a small follow-up pass so the two pages agree — the
research finding behind this decision only holds if it's applied
consistently, not just on new pages.

**Deprioritised, not solved:** the report-a-change action is functionally
present (folded into the Similar Spots section) but hasn't had a dedicated
visual treatment — explicitly parked this session ("forget report a
change") rather than built out.

---

## Bugs hit this session — additions to Build discipline

- **CSS Grid placement relying on `:first-child` broke when a non-content
  element (an absolutely-positioned badge) preceded the intended first grid
  cell in the DOM.** `:first-child` reflects raw DOM order regardless of
  CSS `position`, so it silently matched the wrong element and the intended
  "big tile" span never applied. Same bug class already logged from the
  listing page session, same fix — explicit `grid-column`/`grid-row` per
  cell, never DOM-order assumptions.
- **Duplicate `id` attribute silently broke the mobile menu.** A content
  section and the slide-out drawer both used `id="menu"`;
  `document.getElementById('menu')` always returns the first match in
  document order, so the open/close JS was toggling a class on the wrong
  element and the drawer never actually opened. No console error — just a
  dead button. Worth a habit: grep for an `id` before reusing one, the same
  discipline already logged for class names.
- **A status-independent CSS rule coloured content by position, not by
  meaning.** The hours table coloured *any* "today" row's time green,
  regardless of whether that day was actually open — so "Monday · Closed"
  rendered in the same green used for "open now" elsewhere on the page.
  Green must track the actual state (open/closed, or halal/not), never
  just "this row happens to be highlighted."
- **A chained `.replace()` call bound to the wrong operand.** Intended to
  strip a redundant transform from a generated SVG string; the method
  actually bound to the last string literal in the concatenation, not the
  full result, so it silently did nothing and the pattern rendered
  off-canvas at essentially zero opacity. Looked like a "just too subtle to
  see" opacity issue until the actual DOM output was inspected directly —
  worth remembering that a visually "faint" result and a genuinely broken
  one can look identical from a screenshot alone; check the underlying
  markup when a subtle effect isn't showing at all, not just when it looks
  wrong.
- **A parent section's generic padding rule silently added ~52px of dead
  space** on top of a child element's own already-sufficient padding — the
  hero section never overrode the sitewide `section{padding:52px 28px}`
  default, so its bottom padding stacked with the hero action zone's own
  padding below the actual content. Same category as the earlier
  "layout math accumulates invisibly across nested boxes" lesson — check
  computed spacing, don't assume a component's own padding is the only
  padding in play.

---

## Still owed

- **"How we verify" methodology page** — every venue and chain page now
  links to one; it still doesn't exist. Increasingly the most-referenced
  missing page on the site.
- **Nando's chain page caveat retrofit** — bring the leading-caveat
  treatment back to "What's halal" for consistency (see above).
- **Report-a-change, dedicated treatment** — functional, not designed.
- **Category pages** — brunch, breakfast, buffet, steakhouse, Trafford
  Centre. Cheap now that both reference templates (listing, venue) exist.
- **Data** — still the real bottleneck. 50–100 verified Manchester venues.
