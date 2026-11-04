import type { Metadata } from "next";
import { TextPage, TextSection, textPageMetadata } from "@/components/site/text-page";
import { CONTACT_EMAIL, urls } from "@/lib/site";

const DESCRIPTION =
  "The Halal Food Index doesn't use cookies or tracking and doesn't ask for your name or email. Here is what we keep and why.";

export const metadata: Metadata = textPageMetadata({ path: urls.privacy(), title: "Privacy", description: DESCRIPTION });

export default function PrivacyPage() {
  return (
    <TextPage
      path={urls.privacy()}
      crumb="Privacy"
      heading="Privacy"
      lede="The short version: no cookies, no tracking, and we never ask for your name or email."
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

      <TextSection title="Cookies and tracking">
        <p>We don&apos;t set cookies, and we don&apos;t use analytics, advertising or tracking scripts.</p>
      </TextSection>

      <TextSection title="Who runs the site for us">
        <p>
          The site is hosted by Vercel, and our listings and any reports you send are stored with Supabase in London. Like any website, their
          servers keep short-lived technical logs, such as IP addresses, to keep the service running and secure.
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
