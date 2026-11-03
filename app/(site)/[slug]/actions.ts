"use server";

import { supabaseWrite } from "@/lib/supabase/server";

export type ReportState = { status: "idle" | "sent" | "error"; message?: string };

// `certification` exists in the schema but is no longer offered (no-certification decision).
const ISSUE_TYPES = new Set(["halal_status", "closed", "wrong_details", "other"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "Report a change" on a venue page. Inserts into `corrections` (insert-only under RLS). */
export async function reportVenueChange(_prev: ReportState, form: FormData): Promise<ReportState> {
  // Honeypot: real people never fill this hidden field.
  if (String(form.get("website_url") ?? "").trim()) return { status: "sent" };

  const venueId = String(form.get("venue_id") ?? "");
  const issueType = String(form.get("issue_type") ?? "other");
  const detail = String(form.get("detail") ?? "").trim();

  if (!UUID_RE.test(venueId) || !ISSUE_TYPES.has(issueType)) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if (detail.length < 3) {
    return { status: "error", message: "Tell us a little about what you found." };
  }
  if (detail.length > 2000) {
    return { status: "error", message: "That's a bit long. Please keep it under 2,000 characters." };
  }

  try {
    const { error } = await supabaseWrite()
      .from("corrections")
      .insert({ venue_id: venueId, issue_type: issueType, detail });
    if (error) throw error;
    return { status: "sent" };
  } catch {
    return { status: "error", message: "We couldn't send that just now. Please try again in a minute." };
  }
}
