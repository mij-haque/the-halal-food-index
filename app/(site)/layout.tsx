import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Analytics } from "@/components/site/analytics";
import { VisitCounter } from "@/components/site/visit-counter";
import { Reveal } from "@/components/site/reveal";
import { getPublishedCount } from "@/lib/venues";
import "./site.css";

/*
 * Layout for pages rebuilt in the HFI brand (design/*.html). Pages still on
 * the retired navy/gold brand live in app/(public) until they are rebuilt.
 */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const placesCount = await getPublishedCount();
  return (
    <div className={`${bricolage.variable} ${instrument.variable} hfi-site flex min-h-screen flex-col`}>
      <a
        className="absolute -top-[60px] left-3 z-[300] rounded-[9px] bg-hfi-ink px-[18px] py-[11px] text-sm font-semibold text-white transition-[top] focus:top-3"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader placesCount={placesCount} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <Analytics />
      <VisitCounter />
      <Reveal />
    </div>
  );
}
