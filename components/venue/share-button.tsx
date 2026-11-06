"use client";

import { useEffect, useRef, useState } from "react";
import { ShareIcon } from "@/components/site/icons";

/*
 * Share this venue. Opens the phone's share sheet where there is one,
 * otherwise copies the link and says so.
 */
export function ShareButton({ title, url, className }: { title: string; url: string; className: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // closed the share sheet: nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard blocked: the address bar still has the link
    }
  };

  return (
    <button type="button" onClick={share} className={className} aria-label={`Share ${title}`}>
      <ShareIcon className="h-[14px] w-[14px]" />
      {copied ? (
        <span key="c" className="hfi-pop" role="status">
          Link copied
        </span>
      ) : (
        <span key="s">Share</span>
      )}
    </button>
  );
}
