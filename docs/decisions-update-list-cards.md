# Decisions update: list cards (9 Nov 2026)

Owner sign-off on the A2 card from the 9 Nov card review (canvas "HFI list card options").

## Card
- No placeholder tile and no coloured cuisine label. The name leads.
- Google rating is a small chip beside the name, smaller than the name, with the review count next to it.
- Second line: up to two cuisines, plus the area except on area pages (locked facet).
- Third line: a short "why go" tagline (`venues.tagline`, max 90 characters). Written from the venue's
  own write-up, checked against `docs/writing-style.md`, approved by the owner in batches. Cards
  without one simply leave the line out.
- Open status pill and partial-halal note as before.

## Rating colour (changes the colour rules)
- Ratings use a warm gold from the brass family, never green. Green stays reserved for halal status
  and open now.
- Bands: 4.8 and up solid gold (`hfi-gold`), 4.5 to 4.7 pale gold (`hfi-gold-bg`), 4.0 to 4.4 grey,
  under 4.0 outlined. Tight bands because most listed places score 4.3 to 4.9.
- Brass `#B8924E` stays decorative; the gold tokens are for the rating chip only.

## Sort
- Default sort is Top rated: the Google rating weighted by review count (pulled towards 4.4 with a
  weight of 100 reviews), unrated places last. A to Z, Newest and Nearest stay as options.

## Quick filters (approved 9 Nov 2026)
- Two chips above the results: "Open now" (needs hours; places without hours drop out while it's on) and
  "Rated 4.5+". Selected state is ink. They are client-side only and never change the URL, so filtered
  views stay unindexable.
