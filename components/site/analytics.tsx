"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { GTM_ID, LIVE_HOSTS, urls } from "@/lib/site";

/*
 * Google Tag Manager (with GA4 inside it) plus a small cookie choice.
 *
 * Google Consent Mode: analytics cookies are off until someone clicks Accept.
 * Before that, Google tags only send cookieless pings. Advertising storage is
 * always denied. The choice is kept in localStorage ("hfi-consent") and can be
 * changed from "Cookie settings" in the footer.
 *
 * Nothing loads unless GTM_ID is set, and tags only load on the live domains,
 * so Vercel previews never send data. The banner still shows on previews so it
 * can be reviewed.
 */

const KEY = "hfi-consent";
const OPEN_EVENT = "hfi:cookie-settings";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function bootstrap(id: string): string {
  return `(function(){
if(${JSON.stringify(LIVE_HOSTS)}.indexOf(location.hostname)<0)return;
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
var c=null;try{c=localStorage.getItem(${JSON.stringify(KEY)});}catch(e){}
window.gtag('consent','default',{analytics_storage:c==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
window.gtag('set','ads_data_redaction',true);
window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id='+${JSON.stringify(id)};
document.head.appendChild(s);
})();`;
}

function readChoice(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function saveChoice(v: "granted" | "denied") {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    // private mode etc.: the choice just won't be remembered
  }
}

export function Analytics() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!GTM_ID) return;
    if (!readChoice()) setShow(true);
    const open = () => setShow(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (!GTM_ID) return null;

  const choose = (v: "granted" | "denied") => {
    saveChoice(v);
    window.gtag?.("consent", "update", { analytics_storage: v });
    setShow(false);
  };

  const btn =
    "min-h-11 flex-1 cursor-pointer rounded-[10px] border border-hfi-ink bg-hfi-surface px-5 text-[13.5px] font-bold text-hfi-ink transition-colors hover:bg-hfi-pill";

  return (
    <>
      <Script id="hfi-gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: bootstrap(GTM_ID) }} />
      {show && (
        <div
          role="region"
          aria-label="Cookie choice"
          className="hfi-cookie fixed bottom-4 left-4 right-4 z-[150] mx-auto max-w-[520px] rounded-[14px] border border-hfi-border bg-hfi-surface p-[18px] shadow-[0_8px_30px_rgba(15,15,15,.14)] max-[640px]:bottom-3 max-[640px]:left-3 max-[640px]:right-3"
        >
          <p className="text-[13.5px] leading-[1.6] text-hfi-t2">
            <b className="font-bold text-hfi-ink">Can we use cookies to see how the site is used?</b> We use Google Analytics to count
            visits and see which pages help. No ads, and nothing is sold.{" "}
            <Link href={urls.privacy()} className="font-semibold text-hfi-ink underline underline-offset-[3px]">
              Privacy
            </Link>
          </p>
          <div className="mt-3.5 flex gap-2.5">
            <button type="button" className={btn} onClick={() => choose("denied")}>
              No thanks
            </button>
            <button type="button" className={btn} onClick={() => choose("granted")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer link that reopens the cookie choice. Renders nothing without analytics. */
export function CookieSettingsButton() {
  if (!GTM_ID) return null;
  return (
    <button type="button" className="cursor-pointer" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie settings
    </button>
  );
}
