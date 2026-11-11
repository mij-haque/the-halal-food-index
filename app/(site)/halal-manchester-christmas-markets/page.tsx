import type { Metadata } from "next";
import Link from "next/link";
import { TextPage, TextSection, textPageMetadata } from "@/components/site/text-page";
import { urls } from "@/lib/site";

/*
 * Seasonal guide: halal food stalls at the Manchester Christmas Markets.
 * Stalls are not venues, so they live here and nowhere else in the data.
 * Sources: stalls recommended by local halal food reviewers (Nov 2026), passed on
 * by the owner, and The Wandering Quinn's 2026 markets guide (facts only, own wording). Market dates: Manchester's Finest, 2026 announcement.
 * Update STALLS and UPDATED as more come in. Remove or rewrite after the season.
 */

const PATH = urls.christmasMarkets();
const UPDATED = "11 November 2026";

type Stall = {
  name: string;
  serves?: string;
  /** Only when part of the menu is halal: which items are. */
  halal?: string;
  /** Dish worth ordering, where a reviewer picked one out. */
  order?: string;
  spot: string;
};
type Group = { market: string; note?: string; savoury: Stall[]; sweet: Stall[] };

const GROUPS: Group[] = [
  {
    market: "Lincoln Square",
    note: "New this year and the best spot for halal choice, with covered seating.",
    savoury: [
      { name: "Dine With Saira", serves: "South Asian food. A halal, Muslim-owned business.", spot: "Lincoln Square, with a second stall in Exchange Square" },
      { name: "Falafel King", serves: "Falafel.", spot: "Lincoln Square" },
      { name: "Chen's Happy House", serves: "Halal Chinese food.", spot: "Lincoln Square" },
      {
        name: "BangGa BangGa",
        serves: "Korean corn dogs and coin bbang.",
        halal: "The sausage and cheese corn dogs are halal. The coin bbang is vegetarian.",
        order: "Cheesy corn dog",
        spot: "Lincoln Square, and St Ann's Square",
      },
    ],
    sweet: [],
  },
  {
    market: "Albert Square",
    savoury: [
      { name: "Rita's Reign", serves: "Caribbean food: jerk chicken, curry goat and rice boxes. All halal.", order: "Boneless jerk chicken", spot: "Albert Square" },
      { name: "Eat Greek", serves: "Gyros, chicken pittas, halloumi fries and loaded fries. Halal sign on the stall.", order: "Chicken pitta with halloumi fries", spot: "Albert Square, and King Street" },
      { name: "Yorkshire Pudding Wrap", halal: "The chicken and beef wraps are halal.", spot: "Albert Square" },
      { name: "Grilled Cheese Toastie", halal: "Only the hot honey fried chicken toastie is halal. The Christmas melt has pigs in blankets.", spot: "Albert Square" },
    ],
    sweet: [
      { name: "Pat's Poffertjes", serves: "Dutch mini pancakes.", spot: "Albert Square" },
      { name: "Mr Crimble Crumble", spot: "Albert Square" },
      { name: "The Flat Baker", spot: "Albert Square" },
    ],
  },
  {
    market: "Exchange Square",
    savoury: [
      { name: "Holy Duck", serves: "Duck wraps and duck burgers. Halal duck is rare at the markets.", spot: "Opposite Selfridges, next to Dine With Saira" },
      { name: "Fuego 1987", serves: "Birria tacos and birria ramen.", order: "Birria tacos", spot: "Exchange Square" },
      { name: "La Bavette", serves: "Steak and fries under melted raclette.", halal: "The steak is halal.", spot: "Near Harvey Nichols" },
      { name: "Fusion", serves: "Katsu, Korean dishes and rice boxes.", spot: "Opposite Reiss and Harvey Nichols" },
    ],
    sweet: [],
  },
  {
    market: "King Street",
    savoury: [
      {
        name: "Waffle Kart",
        serves: "Fried chicken on waffles, Szechuan chicken and loaded waffles.",
        halal: "The fried chicken is halal.",
        order: "Pickle-brined fried chicken on a waffle",
        spot: "King Street",
      },
    ],
    sweet: [{ name: "Hong Kong French Toast", spot: "King Street" }],
  },
  {
    market: "St Ann's Square",
    savoury: [{ name: "Yard & Coop", serves: "Fried chicken and fries. The chicken is halal and there's no pork.", spot: "St Ann's Square" }],
    sweet: [],
  },
  {
    market: "Cathedral Gardens",
    savoury: [
      { name: "Irish Spice Bag", serves: "Crispy chicken, chips, peppers and onions in a spice mix. Halal sign inside the stall.", spot: "Cathedral Gardens" },
      { name: "Fondue", serves: "Cheese fondue in a sourdough bowl.", halal: "The hot honey chicken fondue is halal. The duck is not.", spot: "Cathedral Gardens" },
    ],
    sweet: [],
  },
  {
    market: "Market Street",
    savoury: [],
    sweet: [{ name: "Misu", serves: "Tiramisu boxes in a dozen flavours.", order: "Salted caramel pretzel", spot: "Opposite Tesco Express, next to the Arndale" }],
  },
];

const TITLE = "Halal Food at the Manchester Christmas Markets 2026";
const DESCRIPTION =
  "21 halal stalls at the Manchester Christmas Markets 2026, from jerk chicken in Albert Square to halal duck in Exchange Square, with what's halal at each one.";

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
            {s.halal && <p className="m-0 text-[14.5px] font-medium text-hfi-ink">{s.halal}</p>}
            {s.order && <p className="m-0 text-[14.5px]">Try: {s.order}</p>}
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
      lede="The markets run from 6 November to 22 December 2026, with Albert Square and Cathedral Gardens open until 3 January. These are the halal stalls local halal food reviewers have picked out this year, grouped by market."
      updated={UPDATED}
    >
      <TextSection title="Before you order">
        <p>
          Look for a halal sign on the stall. If there isn&apos;t one, ask, because stalls can change suppliers from one year to the
          next. Several stalls only have some halal items, and those are spelled out below. Sweet stalls can use alcohol in sauces or
          toppings, so it&apos;s worth asking there too.
        </p>
        <p>
          Not every Yorkshire pudding stall is the same: the Porky Pig wraps on Exchange Square are pork. Stalls open at 10am, and weekday
          lunchtimes have the shortest queues.
        </p>
      </TextSection>

      {GROUPS.map((g) => (
        <TextSection key={g.market} title={g.market}>
          {g.note && <p>{g.note}</p>}
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
