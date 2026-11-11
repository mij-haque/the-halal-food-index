import type { Metadata } from "next";
import Link from "next/link";
import { TextPage, TextSection, textPageMetadata } from "@/components/site/text-page";
import { urls } from "@/lib/site";

/*
 * Seasonal guide: halal food stalls at the Manchester Christmas Markets.
 * Stalls are not venues, so they live here and nowhere else in the data.
 * Sources: stalls recommended by local halal food reviewers (Nov 2026), passed on
 * by the owner. Market dates: Manchester's Finest, 2026 announcement.
 * Update STALLS and UPDATED as more come in. Remove or rewrite after the season.
 */

const PATH = urls.christmasMarkets();
const UPDATED = "11 November 2026";

type Stall = { name: string; serves?: string; spot: string };
type Group = { market: string; savoury: Stall[]; sweet: Stall[] };

const GROUPS: Group[] = [
  {
    market: "Albert Square",
    savoury: [{ name: "Yorkshire Pudding Wrap", spot: "Albert Square" }],
    sweet: [
      { name: "Pat's Poffertjes", serves: "Dutch mini pancakes.", spot: "Albert Square" },
      { name: "Mr Crimble Crumble", spot: "Albert Square" },
      { name: "The Flat Baker", spot: "Albert Square" },
    ],
  },
  {
    market: "Exchange Square",
    savoury: [{ name: "Holy Duck", serves: "Halal duck, which is rare at the markets.", spot: "Opposite Selfridges" }],
    sweet: [],
  },
  {
    market: "King Street",
    savoury: [{ name: "Waffel Kart", spot: "King Street" }],
    sweet: [{ name: "Hong Kong French Toast", spot: "King Street" }],
  },
  {
    market: "New Cathedral Street",
    savoury: [
      { name: "La Bavette", spot: "New Cathedral Street" },
      { name: "Fusion", serves: "Katsu, Korean dishes and rice boxes.", spot: "Opposite Reiss and Harvey Nichols" },
    ],
    sweet: [],
  },
  {
    market: "Cathedral Gardens",
    savoury: [{ name: "Irish Spice Bag", spot: "Cathedral Gardens" }],
    sweet: [],
  },
  {
    market: "Market Street",
    savoury: [],
    sweet: [{ name: "Misu Tiramisu", spot: "Market Street" }],
  },
  {
    market: "Spot to be confirmed",
    savoury: [{ name: "Fuego 1987", serves: "Birria tacos.", spot: "Exact spot to follow." }],
    sweet: [],
  },
];

const TITLE = "Halal Food at the Manchester Christmas Markets 2026";
const DESCRIPTION =
  "Halal stalls at the Manchester Christmas Markets 2026, from halal duck in Exchange Square to birria tacos and Dutch mini pancakes. Where to find each one.";

export const metadata: Metadata = textPageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

function StallList({ label, stalls }: { label: string; stalls: Stall[] }) {
  if (!stalls.length) return null;
  return (
    <>
      <h3 className="mt-4 text-[12px] font-bold uppercase tracking-[.08em] text-hfi-t3">{label}</h3>
      <ul className="m-0 list-none space-y-3 p-0">
        {stalls.map((s) => (
          <li key={s.name} className="rounded-xl border border-hfi-border bg-hfi-surface px-4 py-3">
            <p className="m-0 font-semibold text-hfi-ink">{s.name}</p>
            {s.serves && <p className="m-0 text-[14.5px]">{s.serves}</p>}
            <p className="m-0 text-[13px] text-hfi-t3">{s.spot}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ChristmasMarketsPage() {
  return (
    <TextPage
      path={PATH}
      crumb="Christmas Markets"
      heading={TITLE}
      lede="The markets run from 6 November to 22 December 2026, with Albert Square and Cathedral Gardens open until 3 January. These are the stalls local halal food reviewers have picked out this year."
      updated={UPDATED}
    >
      <TextSection title="Before you order">
        <p>
          Stalls can change suppliers from one year to the next, so ask at the counter that the meat is halal before you order. Sweet
          stalls can use alcohol in sauces or toppings, so it&apos;s worth asking there too.
        </p>
      </TextSection>

      {GROUPS.map((g) => (
        <TextSection key={g.market} title={g.market}>
          <StallList label="Savoury" stalls={g.savoury} />
          <StallList label="Sweet" stalls={g.sweet} />
        </TextSection>
      ))}

      <TextSection title="After the markets">
        <p>
          For a sit-down meal nearby, see{" "}
          <Link href={urls.area("city-centre")} className="font-semibold text-hfi-link">
            halal restaurants in Manchester city centre
          </Link>{" "}
          or{" "}
          <Link href={urls.cuisine("desserts")} className="font-semibold text-hfi-link">
            halal desserts in Manchester
          </Link>
          .
        </p>
      </TextSection>
    </TextPage>
  );
}
