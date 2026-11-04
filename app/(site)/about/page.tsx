import type { Metadata } from "next";
import Link from "next/link";
import { TextPage, TextSection, textPageMetadata } from "@/components/site/text-page";
import { urls } from "@/lib/site";

const TITLE = "About our listings";
const DESCRIPTION =
  "How The Halal Food Index lists places: in good faith, from what each venue says about its own food, with alcohol, opening hours and ratings where we have them.";

export const metadata: Metadata = textPageMetadata({ path: urls.about(), title: TITLE, description: DESCRIPTION });

export default function AboutPage() {
  return (
    <TextPage
      path={urls.about()}
      crumb={TITLE}
      heading="About our listings"
      lede="The Halal Food Index is a guide to halal food in Greater Manchester. Every place listed says it serves halal food."
      updated="4 November 2026"
    >
      <TextSection title="How a place gets listed">
        <p>
          We list a place when the venue itself says its food is halal: on its Google listing, its website, its menu or its signs. Some
          places are listed because a trusted local halal food guide features them.
        </p>
        <p>We never list a place just because of the kind of food it serves.</p>
      </TextSection>

      <TextSection title="When only some of the menu is halal">
        <p>The listing says which parts are halal, for example &ldquo;Chicken is halal. Beef and lamb are not.&rdquo;</p>
      </TextSection>

      <TextSection title="What we don't do">
        <p>
          We don&apos;t ask to see halal certificates, and we don&apos;t judge how strict a place is. If certification or how the meat is
          prepared matters to you, ask the venue before you order.
        </p>
      </TextSection>

      <TextSection title="Alcohol">
        <p>
          Where we can, we say whether a place serves alcohol. We take this from the venue&apos;s own menu or a reliable halal food guide.
          If we&apos;re not sure, we leave it out.
        </p>
      </TextSection>

      <TextSection title="Opening hours and ratings">
        <p>
          Opening hours, star ratings and review counts come from Google Maps and are refreshed every month. Times can change, so check with
          the venue before a special trip.
        </p>
      </TextSection>

      <TextSection title="Spotted something wrong?">
        <p>
          Every venue page has a &ldquo;Report a change&rdquo; button. Tell us if a place has closed, changed what&apos;s halal, or has the
          wrong details, and we&apos;ll look into it.
        </p>
        <p>
          <Link href={urls.flagship()} className="font-semibold text-hfi-link">
            Browse halal restaurants in Manchester
          </Link>
        </p>
      </TextSection>
    </TextPage>
  );
}
