# HFI Photo Pipeline — Phase 1 Build Brief (for Claude Code)

**Goal:** Drop phone photos into a Google Drive folder and get studio-quality house-style versions back automatically, with no copy-pasting prompts. Phase 1 is **Drive in → Gemini API → Drive out**. Nothing on the website changes in this phase.

**Design rule (from the project brief):** this must be low operational overhead and safe to delegate. If it ever needs daily babysitting, it has failed.

---

## 1. What to build

| Component | Purpose |
|---|---|
| Google Drive folder structure | Where photos are dropped, processed, archived |
| Config Google Sheet | Looks, prompts, model choices, cuisine mapping, run log |
| Google Apps Script (bound to the Sheet) | Runs every 10 minutes, calls Gemini, saves outputs |
| Master reference images | One per studio look, so every output matches the house style |

---

## 2. Drive folder structure

```
HFI Photo Pipeline/
├── 01 Drop/
│   └── <venue-slug>/                 e.g. baraka-kitchen/
│       ├── photo.jpg                 → look chosen automatically
│       └── <look-key>/photo.jpg      → optional override, e.g. dark-ember/ or after-dark/
├── 02 Processed/
│   └── <venue-slug>/                 outputs land here
├── 03 Originals/
│   └── <venue-slug>/                 originals moved here after success (never deleted)
├── 04 Failed/
│   └── <venue-slug>/                 anything that errored, with the reason in the Log tab
└── _References/
    ├── travertine-sun.jpg
    ├── bold-colour.jpg
    ├── colour-block.jpg
    └── dark-ember.jpg
```

- The venue slug must match the slug used on the site (`venues.slug` in Supabase) so Phase 2 can attach photos to venues without renaming anything.
- Phase 1 assumes **every dropped photo is Mij's own**. Restaurant-supplied photos (with written permission) are handled in Phase 2.

---

## 3. Config Sheet — "HFI Photo Config"

### Tab: `Looks`

| look_key | kind | model | uses_reference | reference_file_id | aspect_ratio | resolution | active | prompt |
|---|---|---|---|---|---|---|---|---|
| as-served | as_served | *(cheaper model, see §5)* | FALSE | | 3:4 | 2K | TRUE | *(see §6)* |
| after-dark | as_served | *(cheaper model)* | FALSE | | 3:4 | 2K | TRUE | *(see §6)* |
| travertine-sun | styled | *(top-quality model)* | TRUE | *(Drive file ID)* | 3:4 | 2K | TRUE | *(see §6)* |
| bold-colour | styled | *(top-quality model)* | TRUE | | 3:4 | 2K | FALSE until reference exists | |
| colour-block | styled | *(top-quality model)* | TRUE | | 3:4 | 2K | FALSE until reference exists | |
| dark-ember | styled | *(top-quality model)* | TRUE | | 3:4 | 2K | FALSE until reference exists | |

Prompts live in the Sheet, not in code, so they can be tuned from a phone.

### Tab: `CuisineMap`

| cuisine_slug | default_look |
|---|---|
| brunch | travertine-sun |
| desserts | travertine-sun |
| lebanese | travertine-sun |
| burgers | bold-colour |
| pizza | bold-colour |
| turkish | bold-colour |
| indian | colour-block |
| pakistani | colour-block |
| chinese | dark-ember |
| japanese | dark-ember |
| korean | dark-ember |

Slugs match the `cuisines` seed in `halal-food-index-schema.sql`. If a mapped look is inactive, fall back to `as-served` only.

### Tab: `Venues` (Phase 1 only — replaced by Supabase in Phase 2)

| venue_slug | primary_cuisine | look_override |
|---|---|---|

### Tab: `Settings`

| key | value |
|---|---|
| max_photos_per_run | 3 |
| daily_image_cap | 40 |
| summary_email | *(Mij's email)* |
| default_real_look | as-served |

### Tab: `Log` (append-only, written by the script)

`timestamp | venue_slug | original_file | look_key | kind | model | status | output_file_id | est_cost_usd | attempts | error`

---

## 4. Script behaviour

**Trigger:** time-driven, every 10 minutes.

For each run:

1. Take a script lock (`LockService`) so two runs never overlap. If locked, exit.
2. Check today's image count in `Log` against `daily_image_cap`. If reached, exit and include it in the daily summary.
3. Find new image files in `01 Drop/<venue-slug>/` (and override subfolders). Accept JPEG, PNG, HEIC/HEIF, WEBP. Process at most `max_photos_per_run`, oldest first; the rest wait for the next run.
4. For each photo, decide the outputs:
   - **Always:** one real-look output — `after-dark` if dropped in an `after-dark/` subfolder, otherwise `as-served`.
   - **Plus one styled output:** subfolder override → `Venues.look_override` → `CuisineMap` default for the venue's primary cuisine. Skip if the look is inactive or no venue/cuisine is found.
5. Call the Gemini API for each output:
   - Styled looks send **two images**: Image 1 = the look's master reference, Image 2 = the original photo, then the prompt.
   - Real looks send the original photo and the prompt only.
   - Request image output at the look's aspect ratio and resolution.
6. Save outputs to `02 Processed/<venue-slug>/` as `<venue-slug>__<original-name>__<look-key>.png`.
7. On success: move the original to `03 Originals/<venue-slug>/`, write a `Log` row per output.
8. On failure: retry once. If it fails again, move the original to `04 Failed/<venue-slug>/` and log the error. Never delete anything.
9. Once a day (separate trigger, ~8am): email a short summary — processed, failed, images used vs cap, estimated spend.

**Constraints Claude Code must handle:**
- Apps Script has a ~6-minute execution limit — keep batches small and stop cleanly before the limit.
- Gemini requests have a size limit for inline images — if a phone photo is too large, downscale it first (e.g. fetch a ~2048px version via the Drive thumbnail link) and note this in the log.
- Store `GEMINI_API_KEY` in **Script Properties**. Never in code, never in the Sheet.

**Before writing any API code:** check Google's current Gemini API docs for the exact image model IDs, the request schema for image output (aspect ratio, resolution), supported input MIME types, and current pricing. Put the model IDs in the `Looks` tab rather than hardcoding them.

---

## 5. Models and cost

- **Styled looks:** Nano Banana Pro (Gemini 3 Pro Image) — best quality and prompt adherence.
- **Real looks (as-served, after-dark):** Nano Banana 2 (Gemini 3.1 Flash Image) — cheaper, good enough for enhancement.
- Approximate third-party pricing (Aug 2026, verify on Google's pricing page): Pro ~$0.134 per 1K/2K image; Nano Banana 2 ~$0.07–0.10. Batch mode is ~50% cheaper — a possible Phase 1.5 optimisation since outputs don't need to be instant.
- Rough budget: ~£0.18 per dropped photo (one Pro + one Flash output). 500 photos ≈ £75–90 standard.
- The `daily_image_cap` setting is the guard against a runaway bill.

---

## 6. Prompts (initial values for the `Looks` tab)

**Shared ending for every prompt:**
> Keep the food, portion, plating, garnish and serveware exactly as they are. Do not add or remove any food. Photorealistic, premium magazine quality.

**as-served**
> Enhance this photo as if a professional photographer shot it in the restaurant. Keep the table, plates, setting and food exactly as they are. Balance to soft natural window light, correct the white balance, lift shadows, remove clutter such as phones, receipts and plastic cups, sharpen detail and add a gentle shallow depth of field. No added props.

**after-dark**
> Enhance this photo as if a professional photographer shot it in the restaurant at night. Keep the table, plate, food, glass and cutlery exactly as they are, removing only clutter such as phones and receipts. Warm the light into a soft tungsten glow pooling on the dish from above, let the background fall into deep shadow, remove noise and grain, recover detail in the plate highlights and sharpen the food texture. Natural and moody.

**travertine-sun**
> Image 1 is the house-style reference: warm sand-beige seamless backdrop, travertine stone plinth, hard directional sunlight casting crisp long shadows, matte ceramics, muted natural palette. Image 2 is the dish. Restyle image 2 in the style of image 1, shot at a 45-degree angle with light from the left and the dish filling most of the frame.

**bold-colour**
> Image 1 is the house-style reference: a saturated seamless colour backdrop with a contrasting surface, the dish on an olive-wood board, bright hard daylight with a crisp shadow. Image 2 is the dish. Restyle image 2 in the style of image 1, shot slightly low so the layers of the dish show.

**colour-block**
> Image 1 is the house-style reference: deep emerald green backdrop, terracotta block, hammered brass serveware, folded grey linen napkin, soft directional daylight from the left with gentle shadows, rich warm colours. Image 2 is the dish. Restyle image 2 in the style of image 1 at a 45-degree angle.

**dark-ember**
> Image 1 is the house-style reference: deep black backdrop, dark wooden board, a single low-key beam of side light that makes char and glaze glisten. Image 2 is the dish. Restyle image 2 in the style of image 1 at a 45-degree angle.

**Optional add-on line for any styled look:** "Add soft dappled leaf shadows falling across the backdrop."

---

## 7. Master reference images

- **travertine-sun:** ready — the travertine pancake shot already produced in Gemini.
- **bold-colour, colour-block, dark-ember:** still to make. Generate each once in the Gemini app from a real phone photo using the single-photo version of the prompt, pick the best result, save it to `_References/`, paste its file ID into the `Looks` tab and set `active` to TRUE.
- Phase 1 can go live with `as-served`, `after-dark` and `travertine-sun` only.

---

## 8. Acceptance tests

1. Drop the original pancake photo into `01 Drop/test-cafe/` (with `test-cafe` mapped to `brunch` in `Venues`). Within ~10 minutes: two outputs in `02 Processed/test-cafe/` (as-served + travertine-sun), original in `03 Originals/test-cafe/`, two `Log` rows.
2. Drop a photo into `01 Drop/test-cafe/after-dark/` → only an after-dark output plus the brunch styled look.
3. Drop a non-image or corrupt file → moved to `04 Failed/`, error logged, no crash.
4. Drop 6 photos at once with `max_photos_per_run = 3` → processed across two runs, nothing processed twice.
5. Set `daily_image_cap` to 2 → run stops at the cap and the summary email says so.
6. Remove the API key → clean failure, logged, originals untouched.

---

## 9. Out of scope for Phase 1 (Phase 2, once venue pages are live)

- Upload approved outputs to Supabase Storage and add a `venue_photos` table (venue_id, original_path, output_path, look_key, kind `as_served|styled`, source `own|restaurant_permission`, status `pending|approved|rejected`, alt_text, created_at).
- Photo approval queue in the admin panel: original beside output, approve / reject / regenerate. Nothing goes public without approval.
- "Styled" tag on styled images on venue pages.
- Auto-crops (1:1, 4:5, 9:16) into a `Ready for socials` folder.
- Alt text and captions generated per approved image.
- Feast flat-lays (multiple dishes composed into one overhead shot).
- Restaurant-supplied photos with permission tracking.

---

## 10. Guardrails (non-negotiable)

- Never add or remove food. Styled looks may change backdrop, surface and serveware; they must never change what was served.
- Real looks (as-served, after-dark) are enhancement only and are the default for listings.
- Never delete originals.
- No Google, TripAdvisor or other third-party photos go into the pipeline.
