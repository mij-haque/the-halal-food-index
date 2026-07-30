# The Halal Food Index — locked decisions

Design system and product decisions agreed 30 July 2026.
Drop this in `/docs` in the repo, and upload it to any new conversation as context.

---

## Brand

**Mark** — a rosette seal. Dark disc, sixteen radials knocked out, eight-point star at
the centre, brass outer ring. Built from layered concentric rings in flat colour,
no gradients. Two levels of detail: full above 24px, reduced below, so the fine
radials never mush at favicon size.

**Wordmark** — "The Halal Food Index". "The" is demoted to a small kicker.
Two lockups, same components:

| Context | Behaviour |
|---|---|
| Header | Kicker lifted out of flow (`position:absolute`) so the wordmark sits on the nav line |
| Footer, menu | Kicker in normal flow as a stacked brand block |

## Colour — three tiers

The rule that keeps this working: **green is semantic, brass is ornamental.**
Green means *verified / open / halal*. The moment it becomes decorative it stops
meaning anything, and the whole trust system leans on it meaning something.

| Token | Hex | Job |
|---|---|---|
| Semantic green | `#0B8F5A` | Open now, halal tags, verified, status dots |
| Ornamental green | `#0B6B45` | Seal body, ornament |
| Brass | `#B8924E` | Ornament only — never carries information |
| Amber | `#B06005` | Partial / branch-dependent status |
| Red | `#C02929` | Not halal |
| Link | `#1F56BA` | Verification lines, links |

**Ground** — Chalk `#FCFCFC` base, white `#FFFFFF` bands, hairline `#E4E4E4`.
Cards invert inside bands (`#FAFAFA`) so they never vanish white-on-white.
Rhythm down the page: white → chalk → white → chalk → white.

## Type

| Token | Size | Face |
|---|---|---|
| `display-xl` | clamp 32–56 | Bricolage Grotesque 800, `opsz 96` |
| `display-md` | 28 (24 mobile) | Bricolage Grotesque 800, `opsz 40` |
| `display-sm` | ~15 | Bricolage Grotesque 800, `opsz 16` — tile labels |
| everything else | 10–17 | Instrument Sans |

Bricolage is the **display voice** only — headings, big figures, tile labels.
Never card titles, nav, buttons or meta rows. `opsz` is always matched to the
rendered size, which is what lets it work small.
Tabular numerals globally.

## Cuisine panels

Eleven cuisines, each owning a colour and one of four zellij constructions —
interlocking circles, eight-point star field, interlacing strapwork, rosette.
Tonal, not bold: field at ~7.5% opacity, geometry at 40–60%.
Unit size varies per cuisine so a row of tiles has rhythm.

Size rule: full pattern above 120px · 1.9× scale from 40–120px · **solid colour
below 40px**, because geometry is noise at that size.

Panels appear as: category tiles, card swatches, search result dots (solid),
and — via blur — tinting the glass mobile menu.

## Ornament

The interlocking-circle border band exists and works, but **it is off the homepage** —
it wasn't missed when removed, which is the test. `ornBand()` is kept in the JS for
chain pages, the verification page, email headers and social cards, where a rule
above a heading marks a threshold rather than decorating a gap.

---

## Homepage — built

`halal-food-index-homepage-v9.html` is the reference build. One responsive file.

- Hero: *Discover the Best Halal Food in Manchester* / *Your trusted guide to halal
  restaurants, takeaways and cafés across every borough.*
- Cuisine tiles, gradient-faded label bottom-left
- Highest rated, with an **Open now** filter chip and open/closed status on cards
- Verification band — the argument left, live figures right, counting up on scroll
- Collections as chips with counts (the occasion layer)
- Chain status grid
- Footer with email capture

**Search** — one index across venues, cuisines, areas, chains and collections. Three
things no competitor has: a **combination layer** (type an area, get area × cuisine,
only for cuisines that actually have listings there), a **lateral layer** (match a
venue, get offered its whole cuisine and area), and chain verdicts resolving inline.
Plus a persistent *Search everything for X* row. Odometer placeholder. Panel morphs
from the collapsed pill's width on open.

**Mobile** — hero search becomes a full-width sticky bottom bar once scrolled past;
palette opens as a bottom sheet; tiles two-across; 44px minimum tap targets;
glass right-drawer menu with solid fallback and `prefers-contrast` handling.

**Cookie consent** gates the sticky search bar, so the two never fight for the same
corner. Consent Mode v2 hook is marked in the JS.

---

## Verification wording

Honest tiers, stated per listing with a date:

- `Confirmed with venue · Jul 2026`
- `HMC register checked · Jul 2026`
- `HFA certificate seen · Jul 2026`
- `Visited in person · Jul 2026`

A full methodology page is owed — top-tier content, written properly, before this
scales. Don't keep the badge and bin the basis.

---

## Not yet built

1. **Repo audit** — GitHub has a Next.js app, 3 commits, last touched ~May 2026.
   Admin panel scaffolded (dashboard, listings, chains, SEO, pipeline, settings).
   Nobody has looked at it since. **This is the actual blocker.**
2. **Schema reconciliation** — `halal-food-index-schema.sql` needs diffing against
   whatever tables exist in Supabase.
3. **Category page** — `/halal-brunch-manchester` etc. Where Google traffic lands.
4. **Chain page** — `/is-nandos-halal`. Highest volume, biggest share value.
5. **Venue page**.
6. **Social cards** — five templates designed, need building at `/api/og`.
7. **Data** — 50–100 verified venues. The real bottleneck, and months of evenings.

---

## Keyword research — the short version

| Term | Volume | KD | Note |
|---|---|---|---|
| halal food near me | 280k (Mangools) | 31 | Wildly bigger than other tools showed |
| halal near me | 72.4k | 21 | Low difficulty, huge volume |
| halal restaurants manchester | 17.1k | 20 | Core term; DA 21 site ranks p3 |
| halal breakfast manchester | 694 | 28 | MVP page |
| halal brunch manchester | 506 | 20 | Easiest win |
| halal buffet manchester | 345 | 23 | MVP page |
| halal steakhouse manchester | 186 | 32 | Premium intent |
| halal food trafford centre | 142 | 28 | **Min DA to rank: 1** |
| is kfc halal (all variants) | 8.6k combined | 35 | 97% organic CTR |
| halal wedding catering manchester | 14 | 18 | 97% CTR, high value per lead |

Chain pages run 82–97% organic CTR — people are not getting answers from snippets.
SERPs across the board are Instagram profiles and DA 15 blogs.
MVP page list: brunch, breakfast, buffet, steakhouse, Trafford Centre, Chinese, pizza.
