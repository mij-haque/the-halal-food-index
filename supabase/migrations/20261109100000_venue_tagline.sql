-- One short "why go" line for list cards, written from the venue's write-up and approved by the owner.
alter table public.venues add column if not exists tagline text;
alter table public.venues add constraint venues_tagline_len check (tagline is null or char_length(tagline) <= 90);
