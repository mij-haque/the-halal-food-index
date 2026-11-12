"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { reportVenueChange, type ReportState } from "@/app/(site)/[slug]/actions";
import { ChevronDownIcon } from "@/components/site/icons";

const field =
  "mb-2.5 w-full rounded-[10px] border border-hfi-border bg-hfi-bg text-[13.5px] text-hfi-ink placeholder:text-hfi-t3";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 cursor-pointer rounded-[10px] bg-hfi-ink px-5 text-[13.5px] font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send report"}
    </button>
  );
}

export function ReportChange({ venueId, chainId }: { venueId?: string; chainId?: string }) {
  const [state, action] = useFormState<ReportState, FormData>(reportVenueChange, { status: "idle" });
  // When the form appeared in the browser. Bots tend to submit within a second or two.
  const [shownAt, setShownAt] = useState("");
  useEffect(() => setShownAt(String(Date.now())), []);

  return (
    <div className="overflow-hidden rounded-[14px] border border-hfi-border bg-hfi-surface">
      <details className="hfi-report">
        <summary className="flex cursor-pointer items-center justify-between gap-2.5 px-5 py-4 text-[13.5px] font-bold">
          <span>Spotted a change? Report it</span>
          <ChevronDownIcon className="h-[15px] w-[15px] shrink-0 text-hfi-t3 transition-transform duration-200" />
        </summary>
        {state.status === "sent" ? (
          <p className="px-5 pb-[18px] text-[12.5px] font-semibold text-hfi-ink">Thanks, we&apos;ll look into this and update the page.</p>
        ) : (
          <form action={action} className="px-5 pb-[18px]">
            {venueId && <input type="hidden" name="venue_id" value={venueId} />}
            {chainId && <input type="hidden" name="chain_id" value={chainId} />}
            <input type="hidden" name="shown_at" value={shownAt} />
            <div className="hidden" aria-hidden="true">
              <label>
                Leave this empty
                <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="sr-only" htmlFor="hfi-report-type">
              What kind of change?
            </label>
            <select id="hfi-report-type" name="issue_type" defaultValue="other" className={`${field} min-h-11 px-[14px]`}>
              <option value="halal_status">The halal information is wrong</option>
              <option value="closed">It has closed</option>
              <option value="wrong_details">Address, phone or other details are wrong</option>
              <option value="other">Something else</option>
            </select>
            <label className="sr-only" htmlFor="hfi-report-detail">
              What did you find?
            </label>
            <textarea
              id="hfi-report-detail"
              name="detail"
              required
              maxLength={2000}
              placeholder="What did you find, and when?"
              className={`${field} min-h-[76px] resize-y px-[14px] py-3 font-[inherit]`}
            />
            <SubmitButton />
            {state.status === "error" && <p className="mt-2.5 text-[12.5px] font-semibold text-hfi-red">{state.message}</p>}
          </form>
        )}
      </details>
    </div>
  );
}
