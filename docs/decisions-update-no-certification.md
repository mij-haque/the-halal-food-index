# Decision update: no certification (3 November 2026)

Owner's call. This supersedes anything in `decisions.md`, the earlier decision updates or the
`design/` mockups that treats certification as part of the product.

## The decision

- **Certification is not required and is not shown.** We do not collect, check or display HMC,
  HFA or any other certificate. Reasons:
  - "Halal" is in the brand name, so people arrive in good faith that a listed place is halal.
  - Comparable guides don't show certification either.
  - Tracking certificates is ongoing work the project can't carry.
- **Listings are good faith.** A venue is listed as halal when the venue itself says it is: its
  Google listing, website, menu or signage. Cuisine type alone is never enough.
- **No halal badge on venues.** Everything listed is halal, so venues don't carry a "Halal"
  pill, tag or tick. Only the exceptions get a mention.
- **Partial venues get a plain note.** If only certain dishes or meats are halal, the venue is
  `partial` and the note says what is halal (`halal_scope`). For example: "Chicken is halal.
  Beef and lamb are not." The note is the only halal marking a venue ever shows.
- **Venue names start every word with a capital letter.** "Charrd", not "CHARRD". Short acronyms
  (KFC, BBQ) and a brand's own inner capitals (EastZeast) are kept.

## What this changes in the build

**Venue page** (`design/venue-baraka-kitchen.html`):
- Remove from the "Halal verification" section:
  - the certification chips
  - the proof lines ("HFA certificate seen", "Visited in person")
  - "Next review due"
  - the certificate register link
- Remove the Halal pill from the meta row, the "Fully halal" tag on the section heading, and
  the highlighted "is fully halal" verdict in the hero. Ordinary sentences can still describe
  the venue as halal, which also helps people searching "is X halal".
- Remove the "Halal status" property from the page's structured data, so it matches what's
  visible.
- For partial venues, show the scope note using the existing `.leadcaveat` treatment. Fully
  halal venues show nothing extra.
- Alcohol and pork chips are optional facts. Show them only when known.
- Drop "checked [date]" from the kicker. Don't claim a check that didn't happen.

**Listing page** (`design/listing-manchester.html`):
- Remove the Halal pill from both card styles (compact and editorial). Partial venues keep
  their short scope line, e.g. "Halal chicken only". Fully halal venues show no halal marking.
- Remove "verified" from the stat line ("142 verified listings" becomes "142 listings").
- Rewrite the lede so it no longer says every listing is checked with a certifying body.

**Chain pages**:
- These keep their Halal / Partial / Not halal status, because answering "Is X halal?" is the
  whole point of the page.
- A chain's status comes from the chain's own published halal statement.
- Name a certifier only if the chain itself names one in that statement.
- No certificate chasing.

**Copy everywhere**:
- No "verified", "checked" or "certified" claims about venues.
- The footer line "Every listing says how we know, and when we asked" needs new wording.

**"How we verify" page**:
- No longer needed.
- Replace it with a short "About our listings" note: listings are based on what venues say
  about themselves, and readers can report anything that's wrong.

**Report a change**:
- This becomes more important, because the good-faith model relies on readers flagging errors.
- Keep it on every venue and chain page.

**Admin review queue**: the reviewer answers two questions per venue:
- Does the venue say it's halal?
- Is it fully halal, or partial with a note?

## What stays in the database

- `certification_bodies`, `certification_id`, `cert_reference`, `cert_expires_on` and
  `verification_events` stay in the schema as optional extras. No migration is needed.
- Nothing requires these fields and nothing displays them.
- `halal_status` (halal / partial / not_halal / unknown) and `halal_scope` carry the listing.
- Publishing still needs the owner's sign-off.
