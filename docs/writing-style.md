# Writing style: venue write-ups and page copy

Agreed with the owner on 6 November 2026. Applies to every venue write-up
(`venues.summary`), area and cuisine intros, and any other copy a visitor or
crawler sees. Run `node scripts/check-writeups.mjs <file.json>` before sending
any batch for approval.

## The goal

Copy that reads like a person who knows the place wrote it: specific, plain,
useful. Not "beat the AI detectors". Detectors are unreliable, and Google does
not penalise AI-assisted writing. It penalises lots of pages that add nothing
(scaled content abuse) and wants every fact checked. The biggest giveaway is
sameness across pages, so variety matters as much as word choice.

## Voice

- Neutral guide. No "we", no "I", no named people from The Halal Food Index.
- British spelling and plain words. Say "cafe", "takeaway", "chips".
- Confident but not salesy. "The lamb chops are what it's known for", not
  "the lamb chops are an absolute must".
- Present tense.

## What each write-up does

- 30 to 110 words. Lengths vary across a batch.
- Says something a visitor can act on: what to order (dish names from the
  menu), what it is like, when to go, how to get there.
- Every fact comes from the venue's own menu, website, Instagram or Google
  listing, or from our own data (hours, alcohol, nearest tram stop). Record the
  source for each draft. No guessing, no padding.
- Does not repeat the page's fixed answer line ("X is a halal Y in Z."). That
  line already sits at the top of the page for Google and AI tools, so the
  write-up can sound natural.
- Halal scope goes in plainly when only part of the menu is halal:
  "Chicken is halal. Beef and lamb are not."

## Vary the shape

Within any batch of 10:

- No two write-ups open with the same word, and no more than 3 open with the
  venue's name.
- Mix the openings: the food, the place, a practical fact ("Open till 2am on
  Fridays"), who it suits.
- Mix sentence lengths. Some very short. Some longer, with a detail or two.
- Not every write-up mentions the same things in the same order.

## Words we never use

nestled, vibrant, bustling, hidden gem, gem, haven, boasts, elevate, elevated,
delve, culinary journey, culinary experience, culinary adventure, gastronomic,
mouth-watering, mouthwatering, tantalising, tantalizing, indulgent, indulge,
must-visit, must-try, foodie, foodies, look no further, something for everyone,
authentic, cosy ambience, cozy ambiance, warm and welcoming, delightful,
exquisite, delectable, sumptuous, scrumptious, perfect spot, perfect place,
go-to, treat yourself, feast for the senses, symphony, tapestry, testament,
unforgettable, unparalleled, world-class, top-notch, second to none,
truly, simply, seamless, curated, elevate your, a true, offers a range of,
in the heart of, whether you're, verified, checked, certified, approved

## Patterns we never use

- "Whether you're X or Y, ..."
- "Not just X, it's Y" / "It's not X, it's Y" / "more than just"
- "From X to Y, ..." as an opener
- Lists of three in every sentence, or stacked adjectives ("fresh, fragrant
  and flavourful")
- A colon reveal ("The secret: ...", "The verdict: ...")
- Rhetorical questions ("Craving a burger?")
- Exclamation marks
- Em-dashes (a non-negotiable everywhere visitors or crawlers look)
- A tidy summary line at the end ("A must for anyone who ...", "Well worth a
  visit.", "You won't be disappointed.")
- Starting with "Located in" or "Situated in"

## Examples

Before: "Luxury dessert cafe known for its signature crunch cakes and indulgent
sweet treats."

After: "Most people come to Haute Dolci for the crunch cakes. It's a dessert
cafe in Rusholme, so expect a queue later in the evening." (Voice only: a real
write-up adds a sourced detail or two, and the queue line only stays if
Google's busy times back it up.)

Before: "Award-winning fine dining Indian restaurant on Peter Street..."

After: "Tyga is a smarter Indian place on Peter Street, three minutes from St
Peter's Square tram stop. Go for the tandoor. The lamb chops and chicken tikka
are what it's known for, with biryani and nihari if you want something slower,
and there's a private room for bigger groups."

## Process

1. Draft from sources, 10 at a time. Keep the source links with each draft.
2. Run the checker. Fix everything it flags.
3. Owner approves the batch (or edits). Edits that change the voice get added
   to this file.
4. Only then write to `venues.summary`.
