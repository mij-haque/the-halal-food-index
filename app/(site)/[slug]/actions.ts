"use server";

import { supabaseWrite } from "@/lib/supabase/server";

export type ReportState = { status: "idle" | "sent" | "error"; message?: string };

// `certification` exists in the schema but is no longer offered (no-certification decision).
const ISSUE_TYPES = new Set(["halal_status", "closed", "wrong_details", "other"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "Report a change" on a venue or chain page. Inserts into `corrections` (insert-only under RLS). */
export async function reportVenueChange(_prev: ReportState, form: FormData): Promise<ReportState> {
  // Honeypot: real people never fill this hidden field.
  if (String(form.get("website_url") ?? "").trim()) return { status: "sent" };
  // Time trap: sent less than 3 seconds after the form appeared. Pretend it worked.
  const shownAt = Number(form.get("shown_at") ?? "");
  if (shownAt && Date.now() - shownAt < 3000) return { status: "sent" };

  const venueId = String(form.get("venue_id") ?? "");
  const chainId = String(form.get("chain_id") ?? "");
  const issueType = String(form.get("issue_type") ?? "other");
  const detail = String(form.get("detail") ?? "").trim();

  if (!(UUID_RE.test(venueId) || UUID_RE.test(chainId)) || !ISSUE_TYPES.has(issueType)) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if (detail.length < 3) {
    return { status: "error", message: "Tell us a little about what you found." };
  }
  if ((detail.match(/https?:\/\/|www\./gi) ?? []).length > 2) {
    return { status: "error", message: "Please leave out links. Just tell us what changed." };
  }
  if (detail.length > 2000) {
    return { status: "error", message: "That's a bit long. Please keep it under 2,000 characters." };
  }

  try {
    const { error } = await supabaseWrite()
      .from("corrections")
      .insert(UUID_RE.test(venueId) ? { venue_id: venueId, issue_type: issueType, detail } : { chain_id: chainId, issue_type: issueType, detail });
    if (error) throw error;
    return { status: "sent" };
  } catch (e) {
    // The database turns away floods and repeats (see migration corrections_rate_limit).
    if (String((e as { message?: string })?.message ?? "").includes("hfi_rate_limited")) {
      return { status: "error", message: "We've had a lot of reports just now. Please try again later." };
    }
    return { status: "error", message: "We couldn't send that just now. Please try again in a minute." };
  }
}
