import type { Metadata } from "next";
import { TextPage, TextSection, textPageMetadata } from "@/components/site/text-page";
import { CONTACT_EMAIL, GTM_ID, urls } from "@/lib/site";

// Copy switches automatically when analytics (GTM_ID) is turned on.
const ANALYTICS = Boolean(GTM_ID);

const DESCRIPTION = ANALYTICS
  ? "The Halal Food Index only sets analytics cookies if you say yes, never uses advertising cookies, and doesn't ask for your name or email."
  : "The Halal Food Index doesn't use cookies or tracking and doesn't ask for your name or email. Here is what we keep and why.";

export const metadata: Metadata = textPageMetadata({ path: urls.privacy(), title: "Privacy", description: DESCRIPTION });

export default function PrivacyPage() {
  return (
    <TextPage
      path={urls.privacy()}
      crumb="Privacy"
      heading="Privacy"
      lede={
        ANALYTICS
          ? "The short version: no advertising, no analytics cookies unless you say yes, and we never ask for your name or email."
          : "The short version: no cookies, no tracking, and we never ask for your name or email."
      }
      updated="4 November 2026"
    >
      <TextSection title="What we keep">
        <p>
          If you use &ldquo;Report a change&rdquo; on a venue page, we keep what you type into the form so we can look into it. The form
          doesn&apos;t ask for your name or email, so please don&apos;t include personal details in your message.
        </p>
      </TextSection>

      <TextSection title="Your location">
        <p>
          &ldquo;Nearest to me&rdquo; asks your browser for your location so it can sort the list. Your location stays on your device. It is
          never sent to us or stored.
        </p>
      </TextSection>

      {ANALYTICS ? (
        <TextSection title="Cookies and analytics">
          <p>
            We use Google Analytics, through Google Tag Manager, to count visits and see which pages are useful. It only sets cookies if you
            click &ldquo;Accept&rdquo; on our cookie message.
          </p>
          <p>
            If you click &ldquo;No thanks&rdquo;, or don&apos;t choose, no analytics cookies are set. Google Analytics then only receives basic
            signals without cookies, such as that a page was viewed.
          </p>
          <p>
            You can change your choice at any time with &ldquo;Cookie settings&rdquo; at the bottom of every page. We don&apos;t use advertising
            cookies, and we don&apos;t sell or share data for advertising. Your choice is remembered in your browser, not by us.
          </p>
        </TextSection>
      ) : (
        <TextSection title="Cookies and tracking">
          <p>We don&apos;t set cookies, and we don&apos;t use analytics, advertising or tracking scripts.</p>
        </TextSection>
      )}

      <TextSection title="Who runs the site for us">
        <p>
          The site is hosted by Vercel, and our listings and any reports you send are stored with Supabase in London.
          {ANALYTICS && " Visit statistics are processed by Google Analytics."} Like any website, their servers keep short-lived technical
          logs, such as IP addresses, to keep the service running and secure.
        </p>
      </TextSection>

      <TextSection title="Questions">
        {CONTACT_EMAIL ? (
          <p>
            To ask about anything you&apos;ve sent us, or to have it deleted, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-hfi-link">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        ) : (
          <p>
            To ask about anything you&apos;ve sent us, or to have it deleted, use &ldquo;Report a change&rdquo; on any venue page and tell us
            what it&apos;s about.
          </p>
        )}
      </TextSection>
    </TextPage>
  );
}
